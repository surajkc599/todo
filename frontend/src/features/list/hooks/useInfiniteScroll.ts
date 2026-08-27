import { useEffect } from 'react';

interface UseInfiniteScrollProps {
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  sentinelRef: React.RefObject<HTMLDivElement>;
  isLoadingRef: React.MutableRefObject<boolean>;
  loadedOffsetRef: React.MutableRefObject<number>;
  totalCountRef: React.MutableRefObject<number>;
  onLoadMore: () => void;
}

export function useInfiniteScroll({
  scrollContainerRef,
  sentinelRef,
  isLoadingRef,
  loadedOffsetRef,
  totalCountRef,
  onLoadMore,
}: UseInfiniteScrollProps) {
  useEffect(() => {
    let rafId: number | null = null;
    let abortController: AbortController | null = null;

    const setupScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) {
        rafId = requestAnimationFrame(setupScroll);
        return;
      }

      abortController = new AbortController();

      const handleScroll = () => {
        if (!sentinelRef.current || isLoadingRef.current || loadedOffsetRef.current >= totalCountRef.current) {
          return;
        }

        const sentinel = sentinelRef.current!;
        const containerRect = container.getBoundingClientRect();
        const sentinelRect = sentinel.getBoundingClientRect();

        const isNearBottom = sentinelRect.top - containerRect.bottom < 100;

        if (isNearBottom) {
          onLoadMore();
        }
      };

      container.addEventListener('scroll', handleScroll, { passive: true, signal: abortController.signal });
    };

    setupScroll();

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      abortController?.abort();
    };
  }, [scrollContainerRef, sentinelRef, isLoadingRef, loadedOffsetRef, totalCountRef, onLoadMore]);
}
