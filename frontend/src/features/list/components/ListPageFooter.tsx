import { List } from '../../../shared/types';

interface ListPageFooterProps {
  list: List;
  isLoadingMore: boolean;
  loadedCount: number;
  totalCount: number;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

export function ListPageFooter({
  list,
  isLoadingMore,
  loadedCount,
  totalCount,
  scrollContainerRef,
}: ListPageFooterProps) {
  if ((list.tasks?.length || 0) === 0) {
    return null;
  }

  return (
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
            <span>Loaded {loadedCount}/{totalCount} tasks</span>
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
  );
}
