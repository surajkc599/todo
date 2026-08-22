/**
 * TypeScript type definitions for Todo App v1
 */

/**
 * Represents a Todo List
 */
export interface List {
  id: string;
  createdAt: Date;
  items?: Item[];
}

/**
 * Represents a Todo Item within a List
 */
export interface Item {
  id: string;
  listId: string;
  text: string;
  done: boolean;
  price?: number | null;
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
 * DTO for creating a new item
 */
export interface CreateItemRequest {
  text: string;
  price?: number;
  done?: boolean;
}

/**
 * DTO for updating an item
 */
export interface UpdateItemRequest {
  text?: string;
  done?: boolean;
  price?: number;
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
