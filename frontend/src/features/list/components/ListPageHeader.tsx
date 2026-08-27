import { useNavigate } from 'react-router-dom';
import { List } from '../../../shared/types';

interface ListPageHeaderProps {
  list: List;
  onShare: () => void;
  onAddTask: () => void;
}

export function ListPageHeader({ list, onShare, onAddTask }: ListPageHeaderProps) {
  const navigate = useNavigate();

  return (
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
                onClick={onAddTask}
                className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-3 px-6 rounded transition-colors whitespace-nowrap"
              >
                + Add Task
              </button>
            )}
            <button
              onClick={onShare}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded transition-colors whitespace-nowrap"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
