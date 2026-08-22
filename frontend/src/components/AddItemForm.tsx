import { FormEvent, useState } from 'react';

interface AddItemFormProps {
  onSubmit: (name: string, price: number) => void;
  onError?: (message: string) => void;
  isLoading?: boolean;
}

export function AddItemForm({ onSubmit, onError, isLoading = false }: AddItemFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !price.trim()) {
      onError?.('Please fill in all fields');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      onError?.('Please enter a valid price');
      return;
    }

    onSubmit(name.trim(), priceNum);
    setName('');
    setPrice('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded border border-slate-300 flex gap-3 items-end"
    >
      <div className="flex-1 min-w-0">
        <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">
          Item Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Milk"
          className="w-full px-3 py-2 border border-slate-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
          disabled={isLoading}
        />
      </div>

      <div className="w-32 flex-shrink-0">
        <label htmlFor="price" className="block text-sm font-semibold text-slate-900 mb-2">
          Price
        </label>
        <input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          className="w-full px-3 py-2 border border-slate-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 text-white py-2 px-5 rounded text-base font-semibold transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex-shrink-0"
      >
        {isLoading ? 'Adding...' : 'Add'}
      </button>
    </form>
  );
}
