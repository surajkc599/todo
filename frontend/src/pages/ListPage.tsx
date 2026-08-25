import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
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

  // Virtual scroll state - infinite scroll instead of pagination
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadedOffsetRef = useRef(0);
  const totalCountRef = useRef(0);
  const pageSize = DEFAULT_PAGE_SIZE;

  // View state - Active or Completed tasks
  const [viewMode, setViewMode] = useState<'active' | 'completed'>('active');

  // Load more tasks function
  const isLoadingRef = useRef(false);

  const loadMoreTasks = useCallback(async () => {
    if (!id || isLoadingRef.current || loadedOffsetRef.current >= totalCountRef.current) return;

    isLoadingRef.current = true;
    setIsLoadingMore(true);

    try {
      const data = await api.getList(id, pageSize, loadedOffsetRef.current);
      setAllTasks(prev => [...prev, ...data.list.tasks]);
      loadedOffsetRef.current += pageSize;
      totalCountRef.current = data.pagination.total;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load more tasks';
      setToastMessage(message);
      setToastType('error');
      setShowToast(true);
    } finally {
      isLoadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [id, pageSize]);

  // Initial load with auto-load until page is scrollable or all tasks loaded
  useEffect(() => {
    if (!id) return;

    const fetchInitialList = async () => {
      try {
        setIsLoadingList(true);
        let allLoadedTasks: Task[] = [];
        let offset = 0;
        let total = 0;

        // Load initial batch
        const data = await api.getList(id, pageSize, offset);
        allLoadedTasks = data.list.tasks;
        total = data.pagination.total;
        offset = pageSize;

        // Auto-load more batches if we haven't loaded all tasks
        // This ensures there's enough content to make the page scrollable
        while (offset < total && allLoadedTasks.length < pageSize * 2) {
          const nextData = await api.getList(id, pageSize, offset);
          allLoadedTasks = [...allLoadedTasks, ...nextData.list.tasks];
          offset += pageSize;
          total = nextData.pagination.total;
        }

        setList(data.list);
        setAllTasks(allLoadedTasks);
        loadedOffsetRef.current = offset;
        totalCountRef.current = total;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load list';
        setToastMessage(message);
        setToastType('error');
        setShowToast(true);
      } finally {
        setIsLoadingList(false);
      }
    };

    fetchInitialList();
  }, [id, pageSize]);

  // Infinite scroll sentinel observer
  useEffect(() => {
    const setupScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) {
        requestAnimationFrame(setupScroll);
        return;
      }

      const abortController = new AbortController();

      const handleScroll = () => {
        if (!sentinelRef.current || isLoadingRef.current || loadedOffsetRef.current >= totalCountRef.current) {
          return;
        }

        const sentinel = sentinelRef.current!;
        const containerRect = container.getBoundingClientRect();
        const sentinelRect = sentinel.getBoundingClientRect();

        const isNearBottom = sentinelRect.top - containerRect.bottom < 100;

        if (isNearBottom) {
          loadMoreTasks();
        }
      };

      container.addEventListener('scroll', handleScroll, { passive: true, signal: abortController.signal });

      return () => {
        abortController.abort();
      };
    };

    const cleanup = setupScroll();
    return () => cleanup?.();
  }, [loadMoreTasks]);

  // Refresh by reloading from start
  const refreshList = async () => {
    if (!id) return;
    try {
      setIsLoadingList(true);
      let allLoadedTasks: Task[] = [];
      let offset = 0;
      let total = 0;

      // Load initial batch
      const data = await api.getList(id, pageSize, offset);
      allLoadedTasks = data.list.tasks;
      total = data.pagination.total;
      offset = pageSize;

      // Auto-load more batches to make page scrollable
      while (offset < total && allLoadedTasks.length < pageSize * 2) {
        const nextData = await api.getList(id, pageSize, offset);
        allLoadedTasks = [...allLoadedTasks, ...nextData.list.tasks];
        offset += pageSize;
        total = nextData.pagination.total;
      }

      setList(data.list);
      setAllTasks(allLoadedTasks);
      loadedOffsetRef.current = offset;
      totalCountRef.current = total;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh list';
      setToastMessage(message);
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoadingList(false);
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
      setAllTasks(data.list.tasks);
      loadedOffsetRef.current = pageSize;
      totalCountRef.current = data.pagination.total;
      setToastMessage('Task created');
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

  // Filter tasks based on view mode (active or completed)
  const isTaskCompleted = (task: Task): boolean => {
    const subTasks = task.subtasks || [];
    return subTasks.length > 0 && subTasks.every(st => st.done);
  };

  const filteredTasks = allTasks.filter(task =>
    viewMode === 'active' ? !isTaskCompleted(task) : isTaskCompleted(task)
  );

  const totalCost = calculateTotalCost(filteredTasks);
  const completedItems = calculateCompletedItems(filteredTasks);
  const totalItems = countAllItems(filteredTasks);

  // Count active and completed tasks
  const activeTasks = allTasks.filter(t => !isTaskCompleted(t)).length;
  const completedTasks = allTasks.filter(t => isTaskCompleted(t)).length;

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
                  + Add Task
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

      {/* Sticky header with Tasks count and toggle */}
      {(list.tasks?.length || 0) > 0 && filteredTasks.length > 0 && (
        <div className="sticky top-0 bg-white border-b border-slate-200 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Tasks <span className="text-slate-500 text-sm">({totalCountRef.current})</span>
              </h2>
              <div className="flex items-center bg-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('active')}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    viewMode === 'active'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Active ({activeTasks})
                </button>
                <button
                  onClick={() => setViewMode('completed')}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    viewMode === 'completed'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Completed ({completedTasks})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Scrollable (Categories only) */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-8">
        <div className="max-w-4xl mx-auto">

        {/* Add Task Modal */}
        <AddCategoryModal
          isOpen={showAddGroupForm}
          onClose={() => setShowAddGroupForm(false)}
          onSuccess={handleAddTask}
          onError={(message: string) => {
            setToastMessage(message);
            setToastType('error');
            setShowToast(true);
          }}
        />

        {/* Tasks List */}
        {(list.tasks?.length || 0) === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg mb-4">No tasks yet</p>
            <button
              onClick={() => setShowAddGroupForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded font-medium hover:bg-blue-700"
            >
              + Create First Task
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg mb-4">
              {viewMode === 'active' ? 'No active tasks' : 'No completed tasks'}
            </p>
          </div>
        ) : (
          <GroupList
            tasks={filteredTasks}
            onToggleSubTask={handleToggleSubTask}
            onDeleteSubTask={handleDeleteSubTask}
            onUpdateSubTask={handleUpdateSubTask}
            onRefresh={refreshList}
            updatingItemId={updatingItemId}
          />
        )}

        {/* Infinite scroll sentinel - MUST be inside scrollable container */}
        <div ref={sentinelRef} className="h-1" />
        </div>
      </div>

      {/* Sticky footer with loading status and scroll-to-top */}
      {(list.tasks?.length || 0) > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {isLoadingMore ? (
                <span className="flex items-center gap-3">
                  <svg className="w-4 h-4 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading more tasks...
                </span>
              ) : (
                <span>Loaded {allTasks.length}/{totalCountRef.current} tasks</span>
              )}
            </div>
            <button
              onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
            >
              ↑ Scroll to top
            </button>
          </div>
        </div>
      )}

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
