import fs from 'fs/promises';
import path from 'path';
import { VAULT_PATH } from './config.js';
export async function ensureDir(dirPath) {
    const absolutePath = path.isAbsolute(dirPath) ? dirPath : path.join(VAULT_PATH, dirPath);
    await fs.mkdir(absolutePath, { recursive: true });
}
export async function writeNote(relativePath, content) {
    const fullPath = path.join(VAULT_PATH, relativePath);
    await ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content, 'utf8');
}
export async function readNote(relativePath) {
    const fullPath = path.join(VAULT_PATH, relativePath);
    return await fs.readFile(fullPath, 'utf8');
}
export async function appendNote(relativePath, content) {
    const fullPath = path.join(VAULT_PATH, relativePath);
    await ensureDir(path.dirname(fullPath));
    let prefix = '\n\n';
    try {
        const stat = await fs.stat(fullPath);
        if (stat.size === 0)
            prefix = '';
    }
    catch (e) {
        prefix = '';
    }
    await fs.appendFile(fullPath, `${prefix}${content}`, 'utf8');
}
export async function listNotes(subfolder = '') {
    const dirPath = path.join(VAULT_PATH, subfolder);
    try {
        const files = await fs.readdir(dirPath, { recursive: true });
        return files.filter(f => f.endsWith('.md'));
    }
    catch (error) {
        return [];
    }
}
export async function listDirectories(subfolder = '') {
    const dirPath = path.join(VAULT_PATH, subfolder);
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true, recursive: true });
        return entries
            .filter(entry => entry.isDirectory())
            .map(entry => {
            const fullPath = path.join(entry.path, entry.name);
            return path.relative(VAULT_PATH, fullPath);
        });
    }
    catch (error) {
        return [];
    }
}
export async function searchNotes(query) {
    const notes = await listNotes();
    const results = [];
    for (const note of notes) {
        const content = await readNote(note);
        if (content.toLowerCase().includes(query.toLowerCase())) {
            const index = content.toLowerCase().indexOf(query.toLowerCase());
            const excerpt = content.substring(Math.max(0, index - 50), Math.min(content.length, index + 50));
            results.push({ path: note, excerpt: `...${excerpt}...` });
        }
        if (results.length >= 10)
            break;
    }
    return results;
}
