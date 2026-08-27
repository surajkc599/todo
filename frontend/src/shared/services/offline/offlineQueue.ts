import Dexie, { Table } from 'dexie';

export type OperationType = 'REMOVE_TASK' | 'REMOVE_SUBTASK' | 'PATCH_SUBTASK';

export interface PendingOp {
  id: string;
  type: OperationType;
  listId: string;
  taskId?: string;
  subTaskId?: string;
  data: any;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
  retries: number;
}

export class OfflineQueueDB extends Dexie {
  pending_ops!: Table<PendingOp>;

  constructor() {
    super('TodoApp');
    this.version(1).stores({
      pending_ops: '++id, status, listId',
    });
  }
}

const db = new OfflineQueueDB();

export class OfflineQueue {
  async addOp(op: Omit<PendingOp, 'id' | 'timestamp' | 'status' | 'retries'>) {
    const operation: PendingOp = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      status: 'pending',
      retries: 0,
      ...op,
    };

    await db.pending_ops.add(operation);
    return operation;
  }

  async getPending(): Promise<PendingOp[]> {
    return await db.pending_ops.where('status').equals('pending').toArray();
  }

  async markSynced(opId: string) {
    await db.pending_ops.update(opId, { status: 'synced' });
  }

  async markFailed(opId: string) {
    const op = await db.pending_ops.get(opId);
    if (op) {
      await db.pending_ops.update(opId, {
        status: 'failed',
        retries: op.retries + 1
      });
    }
  }

  async getPendingCount(): Promise<number> {
    return await db.pending_ops.where('status').equals('pending').count();
  }

  async clearSynced() {
    await db.pending_ops.where('status').equals('synced').delete();
  }

  async clear() {
    await db.pending_ops.clear();
  }
}

export const queue = new OfflineQueue();
