import { queue } from './offlineQueue';
import { Task } from '../types';

export async function getMergedTasks(serverTasks: Task[]): Promise<Task[]> {
  const pending = await queue.getPending();
  const tasks = [...serverTasks];

  // Apply pending PATCH_SUBTASK operations
  for (const op of pending) {
    if (op.type === 'PATCH_SUBTASK') {
      const task = tasks.find(t => t.subtasks?.some(s => s.id === op.subTaskId));
      if (task && task.subtasks) {
        const subtask = task.subtasks.find(s => s.id === op.subTaskId);
        if (subtask) {
          Object.assign(subtask, op.data);
        }
      }
    }
  }

  // Filter out REMOVE_SUBTASK operations
  const subTasksToRemove = new Set(
    pending
      .filter(op => op.type === 'REMOVE_SUBTASK')
      .map(op => op.subTaskId)
  );

  for (const task of tasks) {
    if (task.subtasks) {
      task.subtasks = task.subtasks.filter(st => !subTasksToRemove.has(st.id));
    }
  }

  // Filter out REMOVE_TASK operations
  const tasksToRemove = new Set(
    pending
      .filter(op => op.type === 'REMOVE_TASK')
      .map(op => op.taskId)
  );

  return tasks.filter(t => !tasksToRemove.has(t.id));
}
