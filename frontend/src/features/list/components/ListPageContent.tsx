import { List, Task } from '../../../shared/types';
import { GroupList } from './GroupList';
import { AddCategoryModal } from './AddCategoryModal';

interface ListPageContentProps {
  list: List;
  filteredTasks: Task[];
  viewMode: 'active' | 'completed';
  completedTasks: number;
  showAddForm: boolean;
  updatingItemId: string | null;
  sentinelRef: React.RefObject<HTMLDivElement>;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  onToggleSubTask: (subTaskId: string, done: boolean) => void;
  onDeleteSubTask: (subTaskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateSubTask: (subTaskId: string, text: string, price: number) => void;
  onRefresh: () => void;
  onAddTaskClick: () => void;
  onAddTaskClose: () => void;
  onAddTaskSuccess: () => void;
  onAddTaskError: (message: string) => void;
  onViewModeChange: (mode: 'active' | 'completed') => void;
}

export function ListPageContent({
  list,
  filteredTasks,
  viewMode,
  completedTasks,
  showAddForm,
  updatingItemId,
  sentinelRef,
  scrollContainerRef,
  onToggleSubTask,
  onDeleteSubTask,
  onDeleteTask,
  onUpdateSubTask,
  onRefresh,
  onAddTaskClick,
  onAddTaskClose,
  onAddTaskSuccess,
  onAddTaskError,
  onViewModeChange,
}: ListPageContentProps) {
  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <AddCategoryModal
          isOpen={showAddForm}
          onClose={onAddTaskClose}
          onSuccess={onAddTaskSuccess}
          onError={onAddTaskError}
        />

        {(list.tasks?.length || 0) === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg mb-4">No tasks yet</p>
            <button
              onClick={onAddTaskClick}
              className="bg-blue-600 text-white px-6 py-3 rounded font-medium hover:bg-blue-700"
            >
              + Create First Task
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20 px-6">
            <p className="text-slate-500 text-lg mb-6">
              {viewMode === 'active' ? '✓ All tasks completed!' : 'No completed tasks yet'}
            </p>
            {viewMode === 'active' && completedTasks > 0 && (
              <button
                onClick={() => onViewModeChange('completed')}
                className="bg-green-600 text-white px-6 py-3 rounded font-medium hover:bg-green-700"
              >
                View {completedTasks} Completed Task{completedTasks !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        ) : (
          <GroupList
            tasks={filteredTasks}
            onToggleSubTask={onToggleSubTask}
            onDeleteSubTask={onDeleteSubTask}
            onDeleteTask={onDeleteTask}
            onUpdateSubTask={onUpdateSubTask}
            onRefresh={onRefresh}
            updatingItemId={updatingItemId}
          />
        )}

        <div ref={sentinelRef} className="h-1" />
      </div>
    </div>
  );
}
