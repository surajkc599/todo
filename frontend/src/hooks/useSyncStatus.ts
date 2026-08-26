import { useState, useEffect } from 'react';
import { queue } from '../utils/offlineQueue';

export interface SyncStatus {
  isOnline: boolean;
  pendingCount: number;
  showIndicator: boolean;
  message: string;
}

export function useSyncStatus(): SyncStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Initial check
    const checkPending = async () => {
      const count = await queue.getPendingCount();
      setPendingCount(count);
    };
    checkPending();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Poll pending count every 2 seconds
    const interval = setInterval(checkPending, 2000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const showIndicator = !isOnline || pendingCount > 0;
  const message = !isOnline
    ? `📱 Offline • ${pendingCount} pending`
    : pendingCount > 0
    ? `⏳ Syncing ${pendingCount} changes...`
    : '✓ All synced';

  return {
    isOnline,
    pendingCount,
    showIndicator,
    message,
  };
}
