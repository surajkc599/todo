import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';

interface AddGroupFormProps {
  onSuccess: (newGroup: any) => void;
  onError?: (message: string) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  showCancel?: boolean;
}

export function AddGroupForm({ onSuccess, onError, onCancel, isLoading: externalLoading, showCancel = false }: AddGroupFormProps) {
  const { id: listId } = useParams<{ id: string }>();
  const [text, setText] = useState('');
  const [price, setPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const validateInput = (): string | null => {
    if (!text.trim()) {
      return 'Category name is required';
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(text)) {
      return 'Only letters, numbers, and spaces allowed';
    }
    if (text.length > 500) {
      return 'Category name must not exceed 500 characters';
    }
    if (price < 0) {
      return 'Budget cannot be negative';
    }
    return null;
  };

  const handleTextChange = (value: string) => {
    setText(value);
    setInputError(validateInput());
  };

  const handleSubmit = async () => {
    const error = validateInput();
    if (error) {
      onError?.(error);
      return;
    }

    if (!listId) return;

    try {
      setIsLoading(true);
      const newGroup = await api.createItem({
        text,
        price: price || null,
        listId,
      });
      setText('');
      setPrice(0);
      onSuccess(newGroup);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create group';
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 mb-10">
      <p className="text-slate-600 text-sm mb-6 text-center">
        Your list is empty. Start by creating a category.
      </p>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-xs font-semibold text-slate-600 block mb-2">Category name</label>
          <input
            type="text"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="e.g., Groceries Hardware Utilities"
            className={`w-full px-3 py-3 border rounded text-sm ${
              inputError ? 'border-red-400 bg-red-50' : 'border-slate-300'
            }`}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
            disabled={isLoading || externalLoading}
          />
          {inputError && <p className="text-xs text-red-600 mt-1">{inputError}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-2">Budget (€)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-32 px-3 py-3 border border-slate-300 rounded text-sm"
            disabled={isLoading || externalLoading}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading || externalLoading || !text.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
        >
          {isLoading || externalLoading ? 'Creating...' : 'Add'}
        </button>
        {showCancel && (
          <button
            onClick={onCancel}
            disabled={isLoading || externalLoading}
            className="px-6 py-3 bg-slate-300 text-slate-700 rounded text-sm font-medium hover:bg-slate-400 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
