import { Item } from '../types';
import { ItemRow } from './ItemRow';

interface ItemListProps {
  items: Item[];
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string, price: number) => void;
  updatingItemId?: string | null;
}

export function ItemList({ items, onToggle, onDelete, onUpdate, updatingItemId }: ItemListProps) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 text-sm">No items yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
          isUpdating={updatingItemId === item.id}
        />
      ))}
    </div>
  );
}
