import { useState } from 'react';
import { SubTask } from '../types';

interface SubTaskItemProps {
  item: SubTask;
  onToggle: (itemId: string, done: boolean) => void;
  onDelete: (itemId: string) => void;
  onUpdate: (itemId: string, text: string, price: number) => void;
  isUpdating: boolean;
}

export function SubTaskItem({
  item,
  onToggle,
  onDelete,
  onUpdate,
  isUpdating,
}: SubTaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [editPrice, setEditPrice] = useState(item.price || 0);

  const validateInput = (): boolean => {
    if (!editText.trim()) {
      return false;
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(editText)) {
      return false;
    }
    if (editText.length > 500) {
      return false;
    }
    if (editPrice < 0) {
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (validateInput()) {
      onUpdate(item.id, editText, editPrice);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-end gap-3 px-4 py-3 bg-white border-b border-slate-100">
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          placeholder="Item name"
          className="flex-1 px-3 py-2 border border-slate-200 rounded text-sm"
          autoFocus
        />
        <input
          type="number"
          value={editPrice}
          onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          step="0.01"
          className="w-24 px-3 py-2 border border-slate-200 rounded text-sm"
        />
        <button
          onClick={handleSave}
          disabled={isUpdating || !validateInput()}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:bg-slate-400"
        >
          Save
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="px-4 py-2 bg-slate-200 text-slate-700 rounded text-sm font-medium hover:bg-slate-300"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 px-5 py-3 border-b transition-colors ${
      item.done
        ? 'bg-green-50 border-green-100 hover:bg-green-100'
        : 'bg-white border-slate-100 hover:bg-slate-50'
    }`}>
      <input
        type="checkbox"
        checked={item.done}
        onChange={(e) => onToggle(item.id, e.target.checked)}
        className={`w-5 h-5 cursor-pointer rounded transition-all ${
          item.done
            ? 'border-green-500 bg-green-500 accent-green-600'
            : 'border-slate-300 accent-blue-600'
        }`}
      />
      <div className="flex-1">
        <span className={`text-sm font-medium ${
          item.done
            ? 'line-through text-slate-400'
            : 'text-slate-900'
        }`}>
          {item.text}
        </span>
      </div>
      <span className={`text-sm font-bold min-w-14 text-right ${
        item.done
          ? 'text-green-600'
          : 'text-blue-600'
      }`}>
        €{(item.price || 0).toFixed(2)}
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="px-2 py-1 text-slate-500 hover:text-slate-900 text-sm"
        title="Edit"
      >
        ✎
      </button>
      <button
        onClick={() => onDelete(item.id)}
        className="px-2 py-1 text-slate-500 hover:text-red-600 text-sm"
        title="Delete"
      >
        ✕
      </button>
    </div>
  );
}
