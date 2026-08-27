import { useCallback } from 'react';
import { List, Task } from '../../../shared/types';
import { api } from '../../../shared/utils/api';
import { getMergedTasks } from '../../../shared/services/offline/offlineDisplay';
import { DEFAULT_PAGE_SIZE } from '../../../shared/constants';

interface UseTaskHandlersProps {
  id: string | undefined;
  list: List | null;
  setList: (list: List) => void;
  setAllTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setToastMessage: (msg: string) => void;
  setToastType: (type: 'success' | 'error' | 'warning') => void;
  setShowToast: (show: boolean) => void;
  setUpdatingItemId: (id: string | null) => void;
  loadedOffsetRef: React.MutableRefObject<number>;
  totalCountRef: React.MutableRefObject<number>;
}

export function useTaskHandlers({
  id,
  list,
  setList,
  setAllTasks,
  setToastMessage,
  setToastType,
  setShowToast,
  setUpdatingItemId,
  loadedOffsetRef,
  totalCountRef,
}: UseTaskHandlersProps) {
  const handleToggleSubTask = useCallback(
    async (subTaskId: string, done: boolean) => {
      if (!id || !list) return;

      try {
        await api.updateSubTask(id, subTaskId, { done });

        setAllTasks((prev: Task[]) =>
          prev.map(task => ({
            ...task,
            subtasks: task.subtasks?.map(st =>
              st.id === subTaskId ? { ...st, done } : st
            ) || []
          }))
        );

        const updatedList = updateSubTaskInList(list, subTaskId, { done });
        setList(updatedList);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update subtask';
        setToastMessage(message);
        setToastType('error');
        setShowToast(true);
      }
    },
    [id, list, setList, setAllTasks, setToastMessage, setToastType, setShowToast]
  );

  const handleDeleteSubTask = useCallback(
    async (subTaskId: string) => {
      if (!id || !list) return;

      try {
        await api.deleteSubTask(id, subTaskId);
        const updatedList = deleteSubTaskFromList(list, subTaskId);
        setList(updatedList);

        setAllTasks((prev: Task[]) =>
          prev.map(task => ({
            ...task,
            subtasks: task.subtasks?.filter(st => st.id !== subTaskId) || []
          }))
        );

        setToastMessage('Item deleted');
        setToastType('success');
        setShowToast(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete subtask';
        setToastMessage(message);
        setToastType('error');
        setShowToast(true);
      }
    },
    [id, list, setList, setAllTasks, setToastMessage, setToastType, setShowToast]
  );

  const handleUpdateSubTask = useCallback(
    async (subTaskId: string, text: string, price: number) => {
      if (!id || !list) return;

      try {
        setUpdatingItemId(subTaskId);
        await api.updateSubTask(id, subTaskId, { text, price });

        setAllTasks((prev: Task[]) =>
          prev.map(task => ({
            ...task,
            subtasks: task.subtasks?.map(st =>
              st.id === subTaskId ? { ...st, text, price } : st
            ) || []
          }))
        );

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
    },
    [id, list, setList, setAllTasks, setToastMessage, setToastType, setShowToast, setUpdatingItemId]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      if (!id || !list) return;

      try {
        await api.deleteTask(id, taskId);

        if (navigator.onLine) {
          setAllTasks((prev: Task[]) => prev.filter(t => t.id !== taskId));
        } else {
          const mergedTasks = await getMergedTasks(list.tasks || []);
          setAllTasks(mergedTasks);
        }

        setToastMessage('Category deleted');
        setToastType('success');
        setShowToast(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete category';
        setToastMessage(message);
        setToastType('error');
        setShowToast(true);
      }
    },
    [id, list, setAllTasks, setToastMessage, setToastType, setShowToast]
  );

  const handleAddTask = useCallback(
    async () => {
      if (!list || !id) return;
      try {
        const data = await api.getList(id, DEFAULT_PAGE_SIZE, 0);
        setList(data.list);
        const mergedTasks = await getMergedTasks(data.list.tasks);
        setAllTasks(mergedTasks);
        loadedOffsetRef.current = DEFAULT_PAGE_SIZE;
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
    },
    [id, list, setList, setAllTasks, setToastMessage, setToastType, setShowToast, loadedOffsetRef, totalCountRef]
  );

  const handleShare = useCallback(() => {
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
  }, [id, setToastMessage, setToastType, setShowToast]);

  return {
    handleToggleSubTask,
    handleDeleteSubTask,
    handleUpdateSubTask,
    handleDeleteTask,
    handleAddTask,
    handleShare,
  };
}

function updateSubTaskInList(list: List, subTaskId: string, updates: Partial<any>): List {
  return {
    ...list,
    tasks: list.tasks?.map(task => ({
      ...task,
      subtasks: task.subtasks?.map(st =>
        st.id === subTaskId ? { ...st, ...updates } : st
      ) || []
    })) || []
  };
}

function deleteSubTaskFromList(list: List, subTaskId: string): List {
  return {
    ...list,
    tasks: list.tasks?.map(task => ({
      ...task,
      subtasks: task.subtasks?.filter(st => st.id !== subTaskId) || []
    })) || []
  };
}
