import dotenv from 'dotenv';
import path from 'path';
import os from 'os';

dotenv.config({ path: path.join(process.cwd(), '../.env') });

const expandPath = (filePath: string): string => {
  if (filePath.startsWith('~/')) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return path.resolve(filePath);
};

export const VAULT_PATH = expandPath(process.env.VAULT_PATH || '~/Documentos/obsidian');

if (!VAULT_PATH) {
  console.error("Error: VAULT_PATH environment variable is not set.");
  process.exit(1);
}
