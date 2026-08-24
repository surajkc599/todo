/**
 * TypeScript type definitions for Todo App v1
 */

/**
 * Represents a Todo List
 */
export interface List {
  id: string;
  createdAt: Date;
  tasks?: Task[];
}

/**
 * Represents a Task (top-level category)
 * Examples: Groceries, Hardware, Medicine
 */
export interface Task {
  id: string;
  listId: string;
  text: string;
  description?: string | null;
  price?: number | null;
  subtasks?: SubTask[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents a SubTask (item within a Task)
 * Examples: Milk (under Groceries), Screws (under Hardware)
 */
export interface SubTask {
  id: string;
  taskId: string;
  text: string;
  price?: number | null;
  done: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Request/Response DTOs
 */

/**
 * DTO for creating a new list
 * Lists are created without requiring any input - ID and timestamps are auto-generated
 */
export type CreateListRequest = Record<string, never>;

/**
 * DTO for creating a new task
 */
export interface CreateTaskRequest {
  text: string;
  description?: string;
  price?: number;
}

/**
 * DTO for creating a new subtask
 */
export interface CreateSubTaskRequest {
  text: string;
  price?: number;
  taskId: string;
}

/**
 * DTO for updating a task
 */
export interface UpdateTaskRequest {
  text?: string;
  description?: string;
  price?: number;
}

/**
 * DTO for updating a subtask
 */
export interface UpdateSubTaskRequest {
  text?: string;
  done?: boolean;
  price?: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

/**
 * Paginated list response with tasks
 */
export interface PaginatedListResponse {
  list: List;
  pagination: PaginationMeta;
}

/**
 * Standard API Response wrapper
 * Success/failure determined by HTTP status code
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Backward compatibility alias
 * Task is used for both categories and items in the old Item model
 */
export type Item = Task;
