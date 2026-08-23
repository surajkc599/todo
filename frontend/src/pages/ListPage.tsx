import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { List, Item } from '../types';
import { api } from '../utils/api';
import { AddGroupForm as AddCategoryForm } from '../components/AddGroupForm';
import { GroupList } from '../components/GroupList';
import { Toast } from '../components/Toast';

export function ListPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [list, setList] = useState<List | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [showToast, setShowToast] = useState(false);
  const [newlyCreatedGroupId, setNewlyCreatedGroupId] = useState<string | null>(null);
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);

  // Fetch list data
  useEffect(() => {
    if (!id) return;

    const fetchList = async () => {
      try {
        setIsLoadingList(true);
        const data = await api.getList(id);
        setList(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load list';
        setToastMessage(message);
        setToastType('error');
        setShowToast(true);
      } finally {
        setIsLoadingList(false);
      }
    };

    fetchList();
  }, [id]);

  // Refetch the list
  const refreshList = async () => {
    if (!id) return;
    try {
      const data = await api.getList(id);
      setList(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh list';
      setToastMessage(message);
      setToastType('error');
      setShowToast(true);
    }
  };

  // Long polling: refresh list every 5 seconds for eventual consistency
  useEffect(() => {
    if (!id) return;

    const interval = setInterval(() => {
      refreshList();
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  // Listen for slow request events
  useEffect(() => {
    const handleSlowRequest = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.endpoint?.includes('/lists') && customEvent.detail?.isSlowRequest) {
        setToastMessage('⏳ Server is starting up (free tier). This might take a few extra seconds. Thanks for your patience!');
        setToastType('warning');
        setShowToast(true);
      }
    };

    window.addEventListener('slowRequest', handleSlowRequest);
    return () => window.removeEventListener('slowRequest', handleSlowRequest);
  }, []);

  const handleToggleItem = async (itemId: string, done: boolean) => {
    if (!id || !list) return;

    try {
      await api.updateItem(id, itemId, { done });
      // Optimistically update the UI
      const updatedList = updateItemInList(list, itemId, { done });
      setList(updatedList);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update item';
      setToastMessage(message);
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!id || !list) return;

    try {
      await api.deleteItem(id, itemId);
      // Remove from list (handles both groups and sub-items via cascade)
      const updatedList = deleteItemFromList(list, itemId);
      setList(updatedList);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete item';
      setToastMessage(message);
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleUpdateItem = async (itemId: string, text: string, price: number) => {
    if (!id || !list) return;

    try {
      setUpdatingItemId(itemId);
      await api.updateItem(id, itemId, { text, price });
      const updatedList = updateItemInList(list, itemId, { text, price });
      setList(updatedList);
      setToastMessage('Item updated');
      setToastType('success');
      setShowToast(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update item';
      setToastMessage(message);
      setToastType('error');
      setShowToast(true);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleAddGroup = async (newGroup: Item) => {
    if (!list) return;
    setList({
      ...list,
      items: [...list.items, newGroup],
    });
    setNewlyCreatedGroupId(newGroup.id);
    // Clear the flag after a delay so the form auto-opens briefly
    setTimeout(() => setNewlyCreatedGroupId(null), 2000);
    setToastMessage('Group created');
    setToastType('success');
    setShowToast(true);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/list/${id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setToastMessage('Link copied to clipboard!');
        setToastType('success');
        setShowToast(true);
      })
      .catch(() => {
        setToastMessage(`Share this link: ${url}`);
        setToastType('error');
        setShowToast(true);
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

  // Calculate totals (recursive for hierarchical items)
  // Only count sub-task costs, not group budgets
  // Groups = items with children (have items array)
  // Sub-tasks = items without children
  const calculateTotalCost = (items: Item[]): number => {
    return items.reduce((sum, item) => {
      // Only count price if this is a sub-task (has no items array)
      const itemCost = !item.items ? (item.price || 0) : 0;
      // Recursively sum children (sub-tasks)
      const childrenCost = item.items ? calculateTotalCost(item.items) : 0;
      return sum + itemCost + childrenCost;
    }, 0);
  };

  // Only count sub-tasks (items without children) for progress
  const calculateCompletedItems = (items: Item[]): number => {
    return items.reduce((count, item) => {
      // Only count if this is a sub-task (has no items array)
      const itemCompleted = !item.items && item.done ? 1 : 0;
      // Recursively count children
      const childrenCompleted = item.items ? calculateCompletedItems(item.items) : 0;
      return count + itemCompleted + childrenCompleted;
    }, 0);
  };

  // Only count sub-tasks (items without children) for total
  const countAllItems = (items: Item[]): number => {
    return items.reduce((count, item) => {
      // Only count if this is a sub-task (has no items array)
      const itemCount = !item.items ? 1 : 0;
      // Recursively count children
      const childrenCount = item.items ? countAllItems(item.items) : 0;
      return count + itemCount + childrenCount;
    }, 0);
  };

  const totalCost = calculateTotalCost(list.items);
  const completedItems = calculateCompletedItems(list.items);
  const totalItems = countAllItems(list.items);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 font-medium text-base mb-4 transition-colors"
          >
            ← Back
          </button>
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-5xl font-bold text-slate-900 mb-2">Shopping List</h1>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              {list.items.length > 0 && (
                <button
                  onClick={() => setShowAddGroupForm(!showAddGroupForm)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-3 px-6 rounded transition-colors whitespace-nowrap"
                >
                  + Add Category
                </button>
              )}
              <button
                onClick={handleShare}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded transition-colors whitespace-nowrap"
              >
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Add Category Form or Categories List */}
        {list.items.length === 0 ? (
          <AddCategoryForm
            onSuccess={handleAddGroup}
            onError={(message) => {
              setToastMessage(message);
              setToastType('error');
              setShowToast(true);
            }}
          />
        ) : (
          <>
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Categories ({list.items.length})
              </h2>
              <GroupList
                groups={list.items}
                onAddSubTask={() => {}}
                onToggleItem={handleToggleItem}
                onDeleteItem={handleDeleteItem}
                onUpdateItem={handleUpdateItem}
                onRefresh={refreshList}
                updatingItemId={updatingItemId}
                newlyCreatedGroupId={newlyCreatedGroupId}
              />
            </div>

            {/* Add Group Form (shown when button clicked) */}
            {showAddGroupForm && (
              <div className="mb-10">
                <AddCategoryForm
                  onSuccess={(newGroup) => {
                    handleAddGroup(newGroup);
                    setShowAddGroupForm(false);
                  }}
                  onError={(message) => {
                    setToastMessage(message);
                    setToastType('error');
                    setShowToast(true);
                  }}
                  onCancel={() => setShowAddGroupForm(false)}
                  showCancel={true}
                />
              </div>
            )}
          </>
        )}

        {/* Total Cost and Progress */}
        {list.items.length > 0 && (
          <div className="bg-white rounded border border-slate-200 p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-base font-semibold text-slate-700">Total Cost</span>
                <span className="text-4xl font-bold text-blue-600">€{totalCost.toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-slate-700">Progress</span>
                  <span className="text-sm text-slate-600">
                    {completedItems} of {totalItems}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

// Helper functions to update nested item structure
function updateItemInList(list: List, itemId: string, updates: Partial<Item>): List {
  return {
    ...list,
    items: list.items.map((item) =>
      item.id === itemId
        ? { ...item, ...updates }
        : item.items
          ? { ...item, items: updateItemInItems(item.items, itemId, updates) }
          : item
    ),
  };
}

function updateItemInItems(items: Item[], itemId: string, updates: Partial<Item>): Item[] {
  return items.map((item) =>
    item.id === itemId
      ? { ...item, ...updates }
      : item.items
        ? { ...item, items: updateItemInItems(item.items, itemId, updates) }
        : item
  );
}

function deleteItemFromList(list: List, itemId: string): List {
  return {
    ...list,
    items: list.items
      .filter((item) => item.id !== itemId)
      .map((item) =>
        item.items ? { ...item, items: deleteItemFromItems(item.items, itemId) } : item
      ),
  };
}

function deleteItemFromItems(items: Item[], itemId: string): Item[] {
  return items
    .filter((item) => item.id !== itemId)
    .map((item) =>
      item.items ? { ...item, items: deleteItemFromItems(item.items, itemId) } : item
    );
}
