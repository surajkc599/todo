import { SubTask } from '../types';
import { useState } from 'react';

interface ItemRowProps {
  item: SubTask;
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string, price: number) => void;
  isUpdating?: boolean;
}

export function ItemRow({ item, onToggle, onDelete, onUpdate, isUpdating = false }: ItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [editPrice, setEditPrice] = useState(item.price ? item.price.toString() : '0.00');

  const handleSave = () => {
    const priceNum = parseFloat(editPrice) || 0;
    if (editText.trim()) {
      onUpdate(item.id, editText.trim(), priceNum);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(item.text);
    setEditPrice(item.price ? item.price.toString() : '0.00');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-3 p-4 bg-white border border-blue-300 rounded">
        <input
          type="checkbox"
          checked={item.done}
          onChange={(e) => onToggle(item.id, e.target.checked)}
          className="w-5 h-5 text-blue-600 rounded cursor-pointer flex-shrink-0"
          disabled={isUpdating}
        />
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Name"
          disabled={isUpdating}
        />
        <input
          type="number"
          step="0.01"
          min="0"
          value={editPrice}
          onChange={(e) => setEditPrice(e.target.value)}
          className="w-24 px-3 py-2 border border-slate-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.00"
          disabled={isUpdating}
        />
        <button
          onClick={handleSave}
          disabled={isUpdating}
          className="px-3 py-2 text-sm font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex-shrink-0 disabled:bg-slate-400"
        >
          Save
        </button>
        <button
          onClick={handleCancel}
          disabled={isUpdating}
          className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded transition-colors flex-shrink-0 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded hover:shadow transition-shadow">
      <input
        type="checkbox"
        checked={item.done}
        onChange={(e) => onToggle(item.id, e.target.checked)}
        className="w-5 h-5 text-blue-600 rounded cursor-pointer flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-base font-medium truncate ${
            item.done ? 'line-through text-slate-400' : 'text-slate-900'
          }`}
        >
          {item.text}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-base font-semibold ${item.done ? 'text-slate-400' : 'text-slate-900'}`}>
          €{item.price ? item.price.toFixed(2) : '0.00'}
        </p>
      </div>
      <button
        onClick={() => setIsEditing(true)}
        className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(item.id)}
        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
      >
        Delete
      </button>
    </div>
  );
}
