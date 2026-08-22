export interface Item {
  id: string;
  text: string;
  price: number | null;
  done: boolean;
  listId: string;
  createdAt: string;
  updatedAt: string;
}

export interface List {
  id: string;
  items: Item[];
  createdAt: string;
}

export interface CreateItemRequest {
  text: string;
  price?: number | null;
  done?: boolean;
}

export interface UpdateItemRequest {
  text?: string;
  price?: number | null;
  done?: boolean;
}

// Lists are created without requiring any input - ID and timestamp are auto-generated
export type CreateListRequest = Record<string, never>;
