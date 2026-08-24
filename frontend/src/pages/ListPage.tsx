import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { List, Task, SubTask } from '../types';
import { api } from '../utils/api';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { AddCategoryModal } from '../components/AddCategoryModal';
import { GroupList } from '../components/GroupList';
import { Toast } from '../components/Toast';
import { OnlineStatus } from '../components/OnlineStatus';

export function ListPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [list, setList] = useState<List | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [showToast, setShowToast] = useState(false);
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = DEFAULT_PAGE_SIZE; // 5 tasks per page
  const [totalTasks, setTotalTasks] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Fetch list data with pagination
  useEffect(() => {
    if (!id) return;

    const fetchList = async () => {
      try {
        setIsLoadingList(true);
        const offset = currentPage * pageSize;
        const data = await api.getList(id, pageSize, offset);
        setList(data.list);
        setTotalTasks(data.pagination.total);
        setHasMore(data.pagination.hasMore);
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
  }, [id, currentPage, pageSize]);

  // Refetch the current page
  const refreshList = async () => {
    if (!id) return;
    try {
      const offset = currentPage * pageSize;
      const data = await api.getList(id, pageSize, offset);
      setList(data.list);
      setTotalTasks(data.pagination.total);
      setHasMore(data.pagination.hasMore);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh list';
      setToastMessage(message);
      setToastType('error');
      setShowToast(true);
    }
  };

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

  const handleToggleSubTask = async (subTaskId: string, done: boolean) => {
    if (!id || !list) return;

    try {
      await api.updateSubTask(id, subTaskId, { done });
      const updatedList = updateSubTaskInList(list, subTaskId, { done });
      setList(updatedList);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update subtask';
      setToastMessage(message);
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleDeleteSubTask = async (subTaskId: string) => {
    if (!id || !list) return;

    try {
      await api.deleteSubTask(id, subTaskId);
      const updatedList = deleteSubTaskFromList(list, subTaskId);
      setList(updatedList);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete subtask';
      setToastMessage(message);
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleUpdateSubTask = async (subTaskId: string, text: string, price: number) => {
    if (!id || !list) return;

    try {
      setUpdatingItemId(subTaskId);
      await api.updateSubTask(id, subTaskId, { text, price });
      const updatedList = updateSubTaskInList(list, subTaskId, { text, price });
      setList(updatedList);
      setToastMessage('Item updated');
      setToastType('success');
      setShowToast(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update subtask';
      setToastMessage(message);
      setToastType('error');
      setShowToast(true);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleAddTask = async () => {
    if (!list || !id) return;
    try {
      const data = await api.getList(id, pageSize, 0);
      setList(data.list);
      setTotalTasks(data.pagination.total);
      setHasMore(data.pagination.hasMore);
      setCurrentPage(0);
      setToastMessage('Category created');
      setToastType('success');
      setShowToast(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add category';
      setToastMessage(message);
      setToastType('error');
      setShowToast(true);
    }
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

  // Calculate totals from tasks and subtasks
  const calculateTotalCost = (tasks: Task[]): number => {
    return tasks.reduce((sum, task) => {
      const subtaskCosts = (task.subtasks || []).reduce((acc, subtask) => acc + (subtask.price || 0), 0);
      return sum + subtaskCosts;
    }, 0);
  };

  const calculateCompletedItems = (tasks: Task[]): number => {
    return tasks.reduce((count, task) => {
      const completedSubTasks = (task.subtasks || []).filter((st) => st.done).length;
      return count + completedSubTasks;
    }, 0);
  };

  const countAllItems = (tasks: Task[]): number => {
    return tasks.reduce((count, task) => {
      return count + (task.subtasks || []).length;
    }, 0);
  };

  const totalCost = calculateTotalCost(list.tasks || []);
  const completedItems = calculateCompletedItems(list.tasks || []);
  const totalItems = countAllItems(list.tasks || []);

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col overflow-hidden">
      {/* Header - Sticky at top */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 font-medium text-base mb-4 transition-colors"
          >
            ← Back
          </button>
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-5xl font-bold text-slate-900">Shopping List</h1>
            </div>
            <div className="flex gap-3 flex-shrink-0 items-center">
              {list.tasks.length > 0 && (
                <button
                  onClick={() => setShowAddGroupForm(true)}
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
              <OnlineStatus />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Card - Sticky, doesn't scroll */}
      {list.tasks.length > 0 && (
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Total Budget</p>
                  <p className="text-3xl font-bold text-slate-900">€{(list.tasks || []).reduce((sum, task) => sum + (task.price || 0), 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Total Spent</p>
                  <p className="text-3xl font-bold text-blue-600">€{totalCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Progress</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{completedItems}/{totalItems}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Scrollable (Categories only) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-8">
        <div className="max-w-4xl mx-auto">

        {/* Add Category Modal */}
        <AddCategoryModal
          isOpen={showAddGroupForm}
          onClose={() => setShowAddGroupForm(false)}
          onSuccess={handleAddTask}
          onError={(message) => {
            setToastMessage(message);
            setToastType('error');
            setShowToast(true);
          }}
        />

        {/* Categories List */}
        {(list.tasks?.length || 0) === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg mb-4">No categories yet</p>
            <button
              onClick={() => setShowAddGroupForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded font-medium hover:bg-blue-700"
            >
              + Create First Category
            </button>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Categories ({list.tasks.length} of {totalTasks})
              </h2>
              <GroupList
                tasks={list.tasks || []}
                onToggleSubTask={handleToggleSubTask}
                onDeleteSubTask={handleDeleteSubTask}
                onUpdateSubTask={handleUpdateSubTask}
                onRefresh={refreshList}
                updatingItemId={updatingItemId}
              />
            </div>

          </>
        )}
        </div>
      </div>

      {/* Footer - Sticky at bottom */}
      <div className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Showing {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, totalTasks)} of{' '}
            <span className="font-semibold text-slate-900">{totalTasks}</span> categories
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded font-medium hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ◄ Previous
            </button>

            <div className="text-sm font-semibold text-slate-700">
              Page {currentPage + 1} of {Math.ceil(totalTasks / pageSize)}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!hasMore}
              className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next ►
            </button>
          </div>
        </div>
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

// Helper functions to update subtasks within tasks
function updateSubTaskInList(list: List, subTaskId: string, updates: Partial<SubTask>): List {
  return {
    ...list,
    tasks: (list.tasks || []).map((task) => ({
      ...task,
      subtasks: (task.subtasks || []).map((subtask) =>
        subtask.id === subTaskId ? { ...subtask, ...updates } : subtask
      ),
    })),
  };
}

function deleteSubTaskFromList(list: List, subTaskId: string): List {
  return {
    ...list,
    tasks: (list.tasks || []).map((task) => ({
      ...task,
      subtasks: (task.subtasks || []).filter((subtask) => subtask.id !== subTaskId),
    })),
  };
}
