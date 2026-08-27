import { queue, PendingOp } from './offlineQueue';
import { api } from '../../utils/api';

export class SyncEngine {
  private isSyncing = false;

  async syncAll() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const pending = await queue.getPending();

      if (pending.length === 0) {
        this.isSyncing = false;
        return;
      }

      console.log(`[Sync] Processing ${pending.length} operations...`);

      for (const op of pending) {
        try {
          await this.applyOp(op);
          await queue.markSynced(op.id);
          console.log(`[Sync] ✓ ${op.type}`);
        } catch (err) {
          if (op.retries < 3) {
            await queue.markFailed(op.id);
            console.log(`[Sync] ✗ Retry: ${op.type} (attempt ${op.retries + 1})`);
          } else {
            console.error(`[Sync] ✗ Failed permanently: ${op.type}`, err);
          }
        }
      }

      // Cleanup old synced operations
      await queue.clearSynced();
      console.log('[Sync] Complete');
    } finally {
      this.isSyncing = false;
    }
  }

  private async applyOp(op: PendingOp) {
    switch (op.type) {
      case 'REMOVE_TASK':
        return await api.deleteTask(op.listId, op.taskId!);

      case 'REMOVE_SUBTASK':
        return await api.deleteSubTask(op.listId, op.subTaskId!);

      case 'PATCH_SUBTASK':
        return await api.updateSubTask(op.listId, op.subTaskId!, op.data);

      default:
        throw new Error(`Unknown operation type: ${op.type}`);
    }
  }
}

export const syncEngine = new SyncEngine();

// Auto-sync when online
window.addEventListener('online', () => {
  console.log('[Sync] Connection restored, syncing...');
  syncEngine.syncAll();
});
