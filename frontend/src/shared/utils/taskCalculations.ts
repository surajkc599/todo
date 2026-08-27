import { Task } from '../types';

export function calculateTotalCost(tasks: Task[]): number {
  return tasks.reduce((sum, task) => {
    const subtaskCosts = (task.subtasks || []).reduce((acc, subtask) => acc + (subtask.price || 0), 0);
    return sum + subtaskCosts;
  }, 0);
}

export function calculateCompletedItems(tasks: Task[]): number {
  return tasks.reduce((count, task) => {
    const completedSubTasks = (task.subtasks || []).filter((st) => st.done).length;
    return count + completedSubTasks;
  }, 0);
}

export function countAllItems(tasks: Task[]): number {
  return tasks.reduce((count, task) => {
    return count + (task.subtasks || []).length;
  }, 0);
}

export function isTaskCompleted(task: Task): boolean {
  const subTasks = task.subtasks || [];
  return subTasks.length > 0 && subTasks.every(st => st.done);
}

export function filterTasksByViewMode(tasks: Task[], viewMode: 'active' | 'completed'): Task[] {
  return tasks.filter(task =>
    viewMode === 'active' ? !isTaskCompleted(task) : isTaskCompleted(task)
  );
}
