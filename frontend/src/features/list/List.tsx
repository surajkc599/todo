import { useParams } from 'react-router-dom';
import { useState, useRef, useCallback } from 'react';
import { Toast } from '../../shared/ui/Toast';
import { useListData } from '../../shared/hooks/useListData';
import { useTaskHandlers } from './hooks/useTaskHandlers';
import { useInfiniteScroll } from './hooks/useInfiniteScroll';
import { useSlowRequestListener } from './hooks/useSlowRequestListener';
import { useTaskStats } from './hooks/useTaskStats';
import { LoadingState, NotFoundState } from './components/ListPageStates';
import { ListPageHeader } from './components/ListPageHeader';
import { ListPageSummary } from './components/ListPageSummary';
import { ViewModeToggle } from './components/ViewModeToggle';
import { ListPageContent } from './components/ListPageContent';
import { ListPageFooter } from './components/ListPageFooter';

export function List() {
  const { id } = useParams<{ id: string }>();
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
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
  } = useListData(id);

  const {
    handleToggleSubTask,
    handleDeleteSubTask,
    handleUpdateSubTask,
    handleDeleteTask,
    handleAddTask,
    handleShare,
  } = useTaskHandlers({
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
  });

  const { filteredTasks, totalCost, completedItems, totalItems, activeTasks, completedTasks } =
    useTaskStats({ allTasks, viewMode });

  useInfiniteScroll({
    scrollContainerRef,
    sentinelRef,
    isLoadingRef,
    loadedOffsetRef,
    totalCountRef,
    onLoadMore: loadMoreTasks,
  });

  useSlowRequestListener({
    onSlowRequest: useCallback(() => {
      setToastMessage('⏳ Server is starting up (free tier). This might take a few extra seconds. Thanks for your patience!');
      setToastType('warning');
      setShowToast(true);
    }, [setToastMessage, setToastType, setShowToast]),
  });

  const handleAddFormSuccess = useCallback(() => {
    setShowAddGroupForm(false);
    handleAddTask();
  }, [handleAddTask]);

  const handleAddFormError = useCallback(
    (message: string) => {
      setToastMessage(message);
      setToastType('error');
      setShowToast(true);
    },
    [setToastMessage, setToastType, setShowToast]
  );

  if (isLoadingList) {
    return <LoadingState />;
  }

  if (!list) {
    return <NotFoundState />;
  }

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col overflow-hidden">
      <ListPageHeader
        list={list}
        onShare={handleShare}
        onAddTask={() => setShowAddGroupForm(true)}
      />

      <ListPageSummary
        list={list}
        totalCost={totalCost}
        completedItems={completedItems}
        totalItems={totalItems}
      />

      <ViewModeToggle
        allTasks={allTasks}
        filteredTasks={filteredTasks}
        viewMode={viewMode}
        activeTasks={activeTasks}
        completedTasks={completedTasks}
        totalCount={totalCountRef.current}
        onViewModeChange={setViewMode}
      />

      <ListPageContent
        list={list}
        filteredTasks={filteredTasks}
        viewMode={viewMode}
        completedTasks={completedTasks}
        showAddForm={showAddGroupForm}
        updatingItemId={updatingItemId}
        sentinelRef={sentinelRef}
        scrollContainerRef={scrollContainerRef}
        onToggleSubTask={handleToggleSubTask}
        onDeleteSubTask={handleDeleteSubTask}
        onDeleteTask={handleDeleteTask}
        onUpdateSubTask={handleUpdateSubTask}
        onRefresh={refreshList}
        onAddTaskClick={() => setShowAddGroupForm(true)}
        onAddTaskClose={() => setShowAddGroupForm(false)}
        onAddTaskSuccess={handleAddFormSuccess}
        onAddTaskError={handleAddFormError}
        onViewModeChange={setViewMode}
      />

      <ListPageFooter
        list={list}
        isLoadingMore={isLoadingMore}
        loadedCount={allTasks.length}
        totalCount={totalCountRef.current}
        scrollContainerRef={scrollContainerRef}
      />

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
