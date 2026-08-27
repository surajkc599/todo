import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../../shared/utils/api';
import { validateTaskInput } from '../../../shared/utils/validators';

interface AddSubTaskFormProps {
  taskId: string;
  onSubmit: () => void;
  onCancel: () => void;
  onError?: (message: string) => void;
}

export function AddSubTaskForm({ taskId, onSubmit, onCancel, onError }: AddSubTaskFormProps) {
  const { id: listId } = useParams<{ id: string }>();
  const [text, setText] = useState('');
  const [price, setPrice] = useState(0);
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
      await api.createSubTask(listId, {
        text,
        price: price || null,
        taskId,
      });
      setText('');
      setPrice(0);
      onSubmit();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add sub-task';
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold text-slate-600 block">Add Subtask</label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Name"
            className={`flex-1 px-3 py-2 border rounded text-sm ${
              inputError ? 'border-red-400 bg-red-50' : 'border-slate-300'
            }`}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            placeholder="€ Price"
            step="0.01"
            min="0"
            className="w-24 px-3 py-2 border border-slate-300 rounded text-sm"
          />
        </div>
        {inputError && <p className="text-xs text-red-600">{inputError}</p>}
      </div>
      <div className="flex gap-2 justify-end items-center">
        {!navigator.onLine && (
          <p className="text-xs text-amber-600 font-medium">
            ⚠️ Adding items not supported offline
          </p>
        )}
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-slate-200 text-slate-700 rounded text-sm font-medium hover:bg-slate-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !text.trim() || !navigator.onLine}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Adding...' : 'Add'}
        </button>
      </div>
    </div>
  );
}
