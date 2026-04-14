import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { writeNote, readNote, appendNote, listNotes, searchNotes, ensureDir, listDirectories } from "./vault.js";
import { gitSync } from "./tools/git.js";
const server = new Server({
    name: "obsidian-mcp-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "note_create",
                description: "Creates a new note in the vault",
                inputSchema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        content: { type: "string" },
                        folder: { type: "string", description: "Optional folder relative to vault root" },
                    },
                    required: ["title", "content"],
                },
            },
            {
                name: "note_read",
                description: "Reads a note from the vault",
                inputSchema: {
                    type: "object",
                    properties: {
                        path: { type: "string", description: "Relative path to the note (e.g., 'folder/note.md')" },
                    },
                    required: ["path"],
                },
            },
            {
                name: "note_append",
                description: "Appends content to an existing note",
                inputSchema: {
                    type: "object",
                    properties: {
                        path: { type: "string" },
                        content: { type: "string" },
                    },
                    required: ["path", "content"],
                },
            },
            {
                name: "note_list",
                description: "Lists notes in a folder",
                inputSchema: {
                    type: "object",
                    properties: {
                        folder: { type: "string", default: "" },
                    },
                },
            },
            {
                name: "note_search",
                description: "Searches for notes containing specific text",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: { type: "string" },
                    },
                    required: ["query"],
                },
            },
            {
                name: "daily_note_read",
                description: "Reads the daily note for today",
                inputSchema: { type: "object", properties: {} },
            },
            {
                name: "daily_note_append",
                description: "Appends an event or text to today's daily note",
                inputSchema: {
                    type: "object",
                    properties: {
                        content: { type: "string" },
                    },
                    required: ["content"],
                },
            },
            {
                name: "directory_create",
                description: "Creates a new directory in the vault (recursive)",
                inputSchema: {
                    type: "object",
                    properties: {
                        path: { type: "string", description: "Path to the directory to create" },
                    },
                    required: ["path"],
                },
            },
            {
                name: "directory_list",
                description: "Lists subdirectories in a folder",
                inputSchema: {
                    type: "object",
                    properties: {
                        folder: { type: "string", default: "", description: "Relative path to list directories from" },
                    },
                },
            },
            {
                name: "git_sync",
                description: "Stages, commits and pushes all vault changes to GitHub",
                inputSchema: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                    },
                },
            },
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "note_create": {
                const { title, content, folder = "" } = args;
                const fileName = title.endsWith(".md") ? title : `${title}.md`;
                const relativePath = folder ? `${folder}/${fileName}` : fileName;
                await writeNote(relativePath, content);
                const sync = await gitSync(`Create note: ${relativePath}`);
                const syncMsg = sync.success ? " (Synced to GitHub)" : ` (Local save OK, Sync failed: ${sync.message})`;
                return { content: [{ type: "text", text: `Note '${relativePath}' created.${syncMsg}` }] };
            }
            case "note_read": {
                const { path } = args;
                const content = await readNote(path);
                return { content: [{ type: "text", text: content }] };
            }
            case "note_append": {
                const { path, content } = args;
                await appendNote(path, content);
                const sync = await gitSync(`Append to note: ${path}`);
                const syncMsg = sync.success ? " (Synced to GitHub)" : ` (Local save OK, Sync failed: ${sync.message})`;
                return { content: [{ type: "text", text: `Content appended to '${path}'.${syncMsg}` }] };
            }
            case "note_list": {
                const { folder = "" } = args;
                const notes = await listNotes(folder);
                return { content: [{ type: "text", text: notes.join("\n") }] };
            }
            case "note_search": {
                const { query } = args;
                const results = await searchNotes(query);
                return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
            }
            case "daily_note_read": {
                const today = new Date().toISOString().split("T")[0];
                const path = `Daily/${today}.md`;
                const content = await readNote(path);
                return { content: [{ type: "text", text: content }] };
            }
            case "daily_note_append": {
                const today = new Date().toISOString().split("T")[0];
                const path = `Daily/${today}.md`;
                const { content } = args;
                await appendNote(path, content);
                const sync = await gitSync(`Update daily note: ${path}`);
                const syncMsg = sync.success ? " (Synced to GitHub)" : ` (Local save OK, Sync failed: ${sync.message})`;
                return { content: [{ type: "text", text: `Added to daily note: ${path}${syncMsg}` }] };
            }
            case "git_sync": {
                const { message } = args;
                const result = await gitSync(message);
                return { content: [{ type: "text", text: JSON.stringify(result) }] };
            }
            case "directory_create": {
                const { path } = args;
                await ensureDir(path);
                const sync = await gitSync(`Create directory: ${path}`);
                const syncMsg = sync.success ? " (Synced to GitHub)" : ` (Local save OK, Sync failed: ${sync.message})`;
                return { content: [{ type: "text", text: `Directory '${path}' created.${syncMsg}` }] };
            }
            case "directory_list": {
                const { folder = "" } = args;
                const dirs = await listDirectories(folder);
                return { content: [{ type: "text", text: dirs.join("\n") }] };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `Error: ${error.message}` }],
            isError: true,
        };
    }
});
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Obsidian MCP Server running on stdio");
}
runServer().catch(console.error);
