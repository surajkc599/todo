import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../../shared/utils/api';
import { Task } from '../../../shared/types';
import { validateTaskInput } from '../../../shared/utils/validators';

interface AddGroupFormProps {
  onSuccess: (newTask: Task) => void;
  onError?: (message: string) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  showCancel?: boolean;
}

export function AddGroupForm({ onSuccess, onError, onCancel, isLoading: externalLoading, showCancel = false }: AddGroupFormProps) {
  const { id: listId } = useParams<{ id: string }>();
  const [text, setText] = useState('');
  const [price, setPrice] = useState<number | ''>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const validateInput = (): string | null => {
    const validation = validateTaskInput(text, price);
    return validation.isValid ? null : validation.message || null;
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
      const newTask = await api.createTask(listId, {
        text,
        price: price === '' ? null : price,
      });
      setText('');
      setPrice(0);
      onSuccess(newTask);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create group';
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 mb-10">
      {!showCancel && (
        <p className="text-slate-600 text-sm mb-6 text-center">
          Your list is empty. Start by creating a category.
        </p>
      )}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-2">Category name *</label>
          <input
            type="text"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="e.g., Groceries"
            className={`w-full px-4 py-3 border rounded-lg text-base font-medium ${
              inputError ? 'border-red-400 bg-red-50' : 'border-slate-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
            disabled={isLoading || externalLoading}
          />
          {inputError && <p className="text-xs text-red-600 mt-1.5">{inputError}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-2">Budget (€)</label>
          <input
            type="text"
            value={price}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                setPrice('');
              } else {
                const num = parseFloat(val);
                setPrice(isNaN(num) ? '' : Math.max(0, num));
              }
            }}
            placeholder="0.00"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading || externalLoading}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={isLoading || externalLoading || !text.trim()}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg text-base font-semibold hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
          >
            {isLoading || externalLoading ? 'Creating...' : 'Create Category'}
          </button>
          {showCancel && (
            <button
              onClick={onCancel}
              disabled={isLoading || externalLoading}
              className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-lg text-base font-semibold hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
