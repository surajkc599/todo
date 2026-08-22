import { List, Item } from '../types';

// @ts-expect-error - Vite env variable not typed
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface FetchOptions {
  method?: string;
  body?: Record<string, unknown>;
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

  const response = await fetch(url, config);

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
}

export const api = {
  // Lists
  createList: (): Promise<List> => apiFetch('/lists', { method: 'POST', body: {} }),
  getList: (id: string): Promise<List> => apiFetch(`/lists/${id}`),

  // Items
  createItem: (data: { text: string; price?: number | null; listId: string }): Promise<Item> =>
    apiFetch(`/lists/${data.listId}/items`, {
      method: 'POST',
      body: { text: data.text, price: data.price },
    }),
  updateItem: (
    listId: string,
    itemId: string,
    data: { text?: string; price?: number | null; done?: boolean }
  ): Promise<Item> => apiFetch(`/lists/${listId}/items/${itemId}`, { method: 'PATCH', body: data }),
  deleteItem: (listId: string, itemId: string): Promise<null> =>
    apiFetch(`/lists/${listId}/items/${itemId}`, { method: 'DELETE' }),
};
