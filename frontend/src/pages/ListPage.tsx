import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { List } from '../types';
import { api } from '../utils/api';
import { AddItemForm } from '../components/AddItemForm';
import { ItemList } from '../components/ItemList';
import { Toast } from '../components/Toast';

export function ListPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [list, setList] = useState<List | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Fetch list data
  useEffect(() => {
    if (!id) return;

    const fetchList = async () => {
      try {
        setIsLoadingList(true);
        setError(null);
        const data = await api.getList(id);
        setList(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load list');
      } finally {
        setIsLoadingList(false);
      }
    };

    fetchList();
  }, [id]);

  const handleAddItem = async (text: string, price: number) => {
    if (!id || !list) return;

    try {
      setIsAddingItem(true);
      setError(null);
      const newItem = await api.createItem({ text, price, listId: id });
      setList({
        ...list,
        items: [...list.items, newItem],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleToggleItem = async (itemId: string, done: boolean) => {
    if (!id || !list) return;

    try {
      setError(null);
      await api.updateItem(id, itemId, { done });
      setList({
        ...list,
        items: list.items.map((item) => (item.id === itemId ? { ...item, done } : item)),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!id || !list) return;

    try {
      setError(null);
      await api.deleteItem(id, itemId);
      setList({
        ...list,
        items: list.items.filter((item) => item.id !== itemId),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  const handleUpdateItem = async (itemId: string, text: string, price: number) => {
    if (!id || !list) return;

    try {
      setUpdatingItemId(itemId);
      setError(null);
      await api.updateItem(id, itemId, { text, price });
      setList({
        ...list,
        items: list.items.map((item) => (item.id === itemId ? { ...item, text, price } : item)),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/list/${id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setShowToast(true);
      })
      .catch(() => {
        setError(`Share this link: ${url}`);
      });
  };

  if (isLoadingList) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 text-base">Loading...</div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-700 font-semibold text-lg mb-6">List not found</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const totalCost = list.items.reduce((sum, item) => sum + (item.price || 0), 0);
  const completedItems = list.items.filter((item) => item.done).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Share Button */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 font-medium text-base mb-4 transition-colors"
          >
            ← Back
          </button>
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-5xl font-bold text-slate-900 mb-2">Your List</h1>
              <p className="text-slate-600 text-sm">
                List ID: <span className="font-mono text-xs">{id}</span>
              </p>
            </div>
            <button
              onClick={handleShare}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded transition-colors whitespace-nowrap flex-shrink-0"
            >
              Share
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700 font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Add Item Form */}
        <div className="mb-10">
          <AddItemForm onSubmit={handleAddItem} isLoading={isAddingItem} />
        </div>

        {/* Items List */}
        <div className="mb-10">
          {list.items.length > 0 && (
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Items ({list.items.length})
            </h2>
          )}
          <ItemList
            items={list.items}
            onToggle={handleToggleItem}
            onDelete={handleDeleteItem}
            onUpdate={handleUpdateItem}
            updatingItemId={updatingItemId}
          />
        </div>

        {/* Total Cost and Progress - Bottom Section */}
        <div className="bg-white rounded border border-slate-200 p-6">
          <div className="space-y-6">
            {/* Total Cost */}
            <div className="flex justify-between items-end">
              <span className="text-base font-semibold text-slate-700">Total Cost</span>
              <span className="text-4xl font-bold text-blue-600">€{totalCost.toFixed(2)}</span>
            </div>

            {/* Progress Indicator */}
            {list.items.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-slate-700">Progress</span>
                  <span className="text-sm text-slate-600">
                    {completedItems} of {list.items.length}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${list.items.length > 0 ? (completedItems / list.items.length) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast
        message="Link copied to clipboard!"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
