import { useRef, useCallback } from 'react';

export function useDebouncedSave<T extends (...args: unknown[]) => void>(fn: T, delay = 500) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  return useCallback((...args: Parameters<T>) => {
    if (timer.current !== undefined) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      fn(...args);
    }, delay);
  }, [fn, delay]);
}
