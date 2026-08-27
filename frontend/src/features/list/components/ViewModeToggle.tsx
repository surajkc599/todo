import { Task } from '../../../shared/types';

interface ViewModeToggleProps {
  allTasks: Task[];
  filteredTasks: Task[];
  viewMode: 'active' | 'completed';
  activeTasks: number;
  completedTasks: number;
  totalCount: number;
  onViewModeChange: (mode: 'active' | 'completed') => void;
}

export function ViewModeToggle({
  allTasks,
  filteredTasks,
  viewMode,
  activeTasks,
  completedTasks,
  totalCount,
  onViewModeChange,
}: ViewModeToggleProps) {
  if ((allTasks?.length || 0) === 0 || filteredTasks.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-0 bg-white border-b border-slate-200 z-10">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Tasks <span className="text-slate-500 text-sm">({totalCount})</span>
          </h2>
          <div className="flex items-center bg-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('active')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                viewMode === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              Active ({activeTasks})
            </button>
            <button
              onClick={() => onViewModeChange('completed')}
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
  );
}
