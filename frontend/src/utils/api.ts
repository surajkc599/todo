import { List, Task, SubTask, CreateTaskRequest, CreateSubTaskRequest, UpdateSubTaskRequest } from '../types';

// @ts-expect-error - Vite env variable not typed
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface FetchOptions {
  method?: string;
  body?: unknown;
}

interface ErrorResponse {
  message?: string;
  error?: string;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    method: options.method,
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  // Create a timeout that tracks slow requests (for cold-start detection)
  let slowRequestTimeout: ReturnType<typeof setTimeout> | null = null;
  slowRequestTimeout = setTimeout(() => {
    // After 3 seconds, consider it a slow request (potential cold start)
    window.dispatchEvent(
      new CustomEvent('slowRequest', {
        detail: { endpoint, isSlowRequest: true },
      })
    );
  }, 3000);

  try {
    const response = await fetch(url, config);

    // Clear the timeout since we got a response
    if (slowRequestTimeout) clearTimeout(slowRequestTimeout);

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as ErrorResponse;
      const errorMessage =
        error.message ||
        error.error ||
        (response.status === 500 ? 'Server error. Please try again later.' : `Request failed: ${response.statusText}`);
      throw new Error(errorMessage);
    }

    const result: ApiResponse<T> = await response.json();
    return result.data as T;
  } finally {
    if (slowRequestTimeout) clearTimeout(slowRequestTimeout);
  }
}

export interface PaginatedListResponse {
  list: List;
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export const api = {
  // Lists
  createList: (): Promise<List> => apiFetch('/lists', { method: 'POST', body: {} }),
  getList: (id: string, limit: number = 5, offset: number = 0): Promise<PaginatedListResponse> =>
    apiFetch(`/lists/${id}?limit=${limit}&offset=${offset}`),
  deleteList: (id: string): Promise<null> => apiFetch(`/lists/${id}`, { method: 'DELETE' }),

  // Tasks
  createTask: (listId: string, data: CreateTaskRequest): Promise<Task> =>
    apiFetch(`/lists/${listId}/tasks`, {
      method: 'POST',
      body: data,
    }),
  updateTask: (listId: string, taskId: string, data: Partial<CreateTaskRequest>): Promise<Task> =>
    apiFetch(`/lists/${listId}/tasks/${taskId}`, { method: 'PATCH', body: data }),
  deleteTask: (listId: string, taskId: string): Promise<null> =>
    apiFetch(`/lists/${listId}/tasks/${taskId}`, { method: 'DELETE' }),

  // SubTasks
  createSubTask: (listId: string, data: CreateSubTaskRequest): Promise<SubTask> =>
    apiFetch(`/lists/${listId}/subtasks`, {
      method: 'POST',
      body: data,
    }),
  updateSubTask: (listId: string, subTaskId: string, data: UpdateSubTaskRequest): Promise<SubTask> =>
    apiFetch(`/lists/${listId}/subtasks/${subTaskId}`, { method: 'PATCH', body: data }),
  deleteSubTask: (listId: string, subTaskId: string): Promise<null> =>
    apiFetch(`/lists/${listId}/subtasks/${subTaskId}`, { method: 'DELETE' }),

  // Keep old API methods for backward compatibility (will remove after component refactor)
  createItem: (data: any) => api.createTask(data.listId, { text: data.text, price: data.price }),
  updateItem: (listId: string, itemId: string, data: any) => api.updateTask(listId, itemId, data),
  deleteItem: (listId: string, itemId: string) => api.deleteTask(listId, itemId),
};
