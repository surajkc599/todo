import { List } from '../../../shared/types';

interface ListPageSummaryProps {
  list: List;
  totalCost: number;
  completedItems: number;
  totalItems: number;
}

export function ListPageSummary({
  list,
  totalCost,
  completedItems,
  totalItems,
}: ListPageSummaryProps) {
  if (list.tasks.length === 0) {
    return null;
  }

  const totalBudget = (list.tasks || []).reduce((sum, task) => sum + (task.price || 0), 0);
  const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Total Budget</p>
              <p className="text-3xl font-bold text-slate-900">€{totalBudget.toFixed(2)}</p>
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
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-slate-700">{completedItems}/{totalItems}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
