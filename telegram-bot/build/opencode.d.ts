export declare class OpenCodeService {
    private client;
    private sessionId;
    constructor();
    private getSession;
    sendMessage(text: string, onUpdate?: (chunk: string) => void): Promise<string>;
    private waitForIdle;
}
