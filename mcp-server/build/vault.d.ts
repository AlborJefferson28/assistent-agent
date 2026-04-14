export declare function ensureDir(dirPath: string): Promise<void>;
export declare function writeNote(relativePath: string, content: string): Promise<void>;
export declare function readNote(relativePath: string): Promise<string>;
export declare function appendNote(relativePath: string, content: string): Promise<void>;
export declare function listNotes(subfolder?: string): Promise<string[]>;
export declare function listDirectories(subfolder?: string): Promise<string[]>;
export declare function searchNotes(query: string): Promise<Array<{
    path: string;
    excerpt: string;
}>>;
