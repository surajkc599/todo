export interface Task {
  id: string;
  listId: string;
  text: string;
  description?: string | null;
  price?: number | null;
  subtasks?: SubTask[];
  createdAt: string;
  updatedAt: string;
}

export interface SubTask {
  id: string;
  taskId: string;
  text: string;
  price?: number | null;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface List {
  id: string;
  tasks: Task[];
  createdAt: string;
}

export interface CreateTaskRequest {
  text: string;
  description?: string;
  price?: number | null;
}

export interface CreateSubTaskRequest {
  text: string;
  price?: number | null;
  taskId: string;
}

export interface UpdateTaskRequest {
  text?: string;
  description?: string;
  price?: number | null;
}

export interface UpdateSubTaskRequest {
  text?: string;
  done?: boolean;
  price?: number | null;
}

// Lists are created without requiring any input - ID and timestamp are auto-generated
export type CreateListRequest = Record<string, never>;

// Keep Item as alias for backward compatibility with older code (will be removed after refactor)
export type Item = Task;
