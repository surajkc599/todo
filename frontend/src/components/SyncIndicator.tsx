import { useSyncStatus } from '../hooks/useSyncStatus';

export function SyncIndicator() {
  const { showIndicator, message } = useSyncStatus();

  if (!showIndicator) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
      {message}
    </div>
  );
}
