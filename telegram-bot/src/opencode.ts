import { createOpencodeClient } from "@opencode-ai/sdk";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '../.env') });

const port = parseInt(process.env.OPENCODE_PORT || '4096');
const VAULT_PATH = process.env.VAULT_PATH;

export class OpenCodeService {
  private client: ReturnType<typeof createOpencodeClient>;
  private sessionId: string | null = null;

  constructor() {
    this.client = createOpencodeClient({
      baseUrl: `http://localhost:${port}`,
    });
  }

  private async getSession(): Promise<string> {
    if (this.sessionId) return this.sessionId;
    const res = await this.client.session.create({ query: { directory: VAULT_PATH } });
    if (!res.data) throw new Error('Failed to create session');
    this.sessionId = res.data.id;
    console.log(`[OpenCode] Session created: ${this.sessionId}`);
    return this.sessionId;
  }

  async sendMessage(text: string, onUpdate?: (chunk: string) => void): Promise<string> {
    try {
      const sessionId = await this.getSession();

      // 1. Subscribe to SSE BEFORE sending the prompt so we don't miss session.idle
      const ssePromise = this.waitForIdle(sessionId, onUpdate);

      // Small yield so the SSE connection is established
      await new Promise(r => setTimeout(r, 300));

      // 2. Send the prompt
      await this.client.session.prompt({
        path: { id: sessionId },
        body: { parts: [{ type: 'text', text }] },
        query: { directory: VAULT_PATH },
      });

      console.log(`[OpenCode] Prompt sent, waiting for response…`);

      // 3. Wait for the agent to finish
      return await ssePromise;

    } catch (error: any) {
      console.error("OpenCode Error:", error);
      this.sessionId = null; // reset so next call creates a fresh session
      throw new Error(`Agent unavailable: ${error.message}`);
    }
  }

  private waitForIdle(sessionId: string, onUpdate?: (chunk: string) => void): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('OpenCode timed out after 120 seconds'));
      }, 120_000);

      try {
        let partBuffer = '';

        // The SDK returns { stream: AsyncGenerator }
        const { stream } = await this.client.event.subscribe();

        console.log(`[OpenCode] SSE stream open, waiting for session.idle on ${sessionId}`);

        for await (const ev of stream) {
          const event = ev as any;
          if (!event?.type) continue;

          console.log(`[OpenCode] Event: ${event.type}`);

          // Stream text deltas in real-time
          if (event.type === 'message.part.updated') {
            const delta: string | undefined = event.properties?.delta;
            if (delta) {
              partBuffer += delta;
              onUpdate?.(delta);
            }
          }

          // Session done processing
          if (event.type === 'session.idle') {
            const eventSessionId: string | undefined = event.properties?.sessionID;
            if (eventSessionId && eventSessionId !== sessionId) continue; // different session

            clearTimeout(timeout);

            if (partBuffer.trim()) {
              resolve(partBuffer.trim());
              return;
            }

            // Fallback: fetch messages from API
            try {
              const msgs = await this.client.session.messages({ path: { id: sessionId } });
              const parts = (msgs.data ?? []) as any[];

              let reply = '';
              for (let i = parts.length - 1; i >= 0; i--) {
                const msg = parts[i];
                if (msg?.info?.role === 'assistant') {
                  const textPart = (msg.parts ?? []).find((p: any) => p.type === 'text');
                  if (textPart?.text) { reply = textPart.text; break; }
                }
              }
              resolve(reply || '(Sin respuesta del agente)');
            } catch (fetchErr) {
              resolve(partBuffer || '(Sin respuesta del agente)');
            }
            return;
          }

          // Session error
          if (event.type === 'session.error') {
            const eventSessionId: string | undefined = event.properties?.sessionID;
            if (!eventSessionId || eventSessionId === sessionId) {
              clearTimeout(timeout);
              reject(new Error(String(event.properties?.error ?? 'Session error')));
              return;
            }
          }
        }
      } catch (err: any) {
        clearTimeout(timeout);
        reject(err);
      }
    });
  }
}
