import { useEffect } from 'react';

interface UseSlowRequestListenerProps {
  onSlowRequest: () => void;
}

export function useSlowRequestListener({ onSlowRequest }: UseSlowRequestListenerProps) {
  useEffect(() => {
    const handleSlowRequest = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.endpoint?.includes('/lists') && customEvent.detail?.isSlowRequest) {
        onSlowRequest();
      }
    };

    window.addEventListener('slowRequest', handleSlowRequest);
    return () => window.removeEventListener('slowRequest', handleSlowRequest);
  }, [onSlowRequest]);
}
