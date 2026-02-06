import { useRef, useCallback } from 'react';

export function useDebouncedSave<T extends (...args: any[]) => void>(fn: T, delay = 500) {
  const timer = useRef<number | null>(null);

  return useCallback((...args: Parameters<T>) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(() => {
      fn(...(args as any));
    }, delay) as unknown as number;
  }, [fn, delay]);
}
