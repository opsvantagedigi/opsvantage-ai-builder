import { useRef, useCallback } from 'react';

export function useDebouncedSave<T extends (...args: unknown[]) => void>(fn: T, delay = 500) {
  const timer = useRef<number | undefined>(undefined);

  return useCallback((...args: Parameters<T>) => {
    if (timer.current !== undefined) {
      clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(() => {
      fn(...args);
    }, delay) as unknown as number;
  }, [fn, delay]);
}
