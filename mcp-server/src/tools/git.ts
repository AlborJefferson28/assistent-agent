import { exec } from 'child_process';
import { promisify } from 'util';
import { VAULT_PATH } from '../config.js';

const execAsync = promisify(exec);

export async function gitSync(message: string = 'Auto-sync from Personal Assistant') {
  try {
    await execAsync('git add -A', { cwd: VAULT_PATH });
    await execAsync(`git commit -m "${message}"`, { cwd: VAULT_PATH });
    await execAsync('git push', { cwd: VAULT_PATH });
    return { success: true, message: 'Vault synced successfully' };
  } catch (error: any) {
    if (error.stdout?.includes('nothing to commit')) {
      return { success: true, message: 'Nothing to sync' };
    }
    throw new Error(`Git sync failed: ${error.message}`);
  }
}
