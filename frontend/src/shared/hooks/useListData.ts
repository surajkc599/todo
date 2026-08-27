import { useState, useEffect, useRef, useCallback } from 'react';
import { List, Task } from '../types';
import { api } from '../utils/api';
import { getMergedTasks } from '../services/offline/offlineDisplay';
import { DEFAULT_PAGE_SIZE } from '../constants';

export function useListData(listId: string | undefined) {
  const [list, setList] = useState<List | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<'active' | 'completed'>('active');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [showToast, setShowToast] = useState(false);

  const loadedOffsetRef = useRef(0);
  const totalCountRef = useRef(0);
  const isLoadingRef = useRef(false);

  const loadMoreTasks = useCallback(async () => {
    if (!listId || isLoadingRef.current || loadedOffsetRef.current >= totalCountRef.current) return;

    isLoadingRef.current = true;
    setIsLoadingMore(true);

    try {
      const data = await api.getList(listId, DEFAULT_PAGE_SIZE, loadedOffsetRef.current);
      setAllTasks(prev => [...prev, ...data.list.tasks]);
      loadedOffsetRef.current += DEFAULT_PAGE_SIZE;
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
  }, [listId]);

  const loadInitialBatch = useCallback(async (errorMessage: string) => {
    if (!listId) return null;

    try {
      setIsLoadingList(true);
      let allLoadedTasks: Task[] = [];
      let offset = 0;
      let total = 0;

      const data = await api.getList(listId, DEFAULT_PAGE_SIZE, offset);
      allLoadedTasks = data.list.tasks;
      total = data.pagination.total;
      offset = DEFAULT_PAGE_SIZE;

      while (offset < total && allLoadedTasks.length < DEFAULT_PAGE_SIZE * 2) {
        const nextData = await api.getList(listId, DEFAULT_PAGE_SIZE, offset);
        allLoadedTasks = [...allLoadedTasks, ...nextData.list.tasks];
        offset += DEFAULT_PAGE_SIZE;
        total = nextData.pagination.total;
      }

      setList(data.list);
      const mergedTasks = await getMergedTasks(allLoadedTasks);
      setAllTasks(mergedTasks);
      loadedOffsetRef.current = offset;
      totalCountRef.current = total;
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : errorMessage;
      setToastMessage(message);
      setToastType('error');
      setShowToast(true);
      return false;
    } finally {
      setIsLoadingList(false);
    }
  }, [listId]);

  const loadInitialList = useCallback(async () => {
    await loadInitialBatch('Failed to load list');
  }, [loadInitialBatch]);

  const refreshList = useCallback(async () => {
    await loadInitialBatch('Failed to refresh list');
  }, [loadInitialBatch]);

  useEffect(() => {
    loadInitialList();
  }, [listId, loadInitialList]);

  return {
    list,
    setList,
    allTasks,
    setAllTasks,
    isLoadingList,
    isLoadingMore,
    viewMode,
    setViewMode,
    toastMessage,
    setToastMessage,
    toastType,
    setToastType,
    showToast,
    setShowToast,
    loadedOffsetRef,
    totalCountRef,
    isLoadingRef,
    loadMoreTasks,
    refreshList,
  };
}
