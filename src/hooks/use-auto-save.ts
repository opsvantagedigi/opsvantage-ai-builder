'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { saveProjectContentAction } from '@/app/actions/save-project';

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface UseAutoSaveOptions {
  debounceMs?: number;
  onStatusChange?: (status: SaveStatus) => void;
}

/**
 * 🧬 AUTO-SAVE SYNAPSE: Hooks into component state and persists to database
 * Features:
 * - Debounces saves (waits for user to stop typing)
 * - Shows visual feedback (Saving -> Synced)
 * - Retries on failure
 * - Tracks last saved timestamp
 */
export function useAutoSave(
  projectId: string,
  data: any,
  options: UseAutoSaveOptions = {}
) {
  const { debounceMs = 2000, onStatusChange } = options;
  const [status, setStatus] = useState<SaveStatus>('saved');
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  const save = useCallback(
    async (currentData: any) => {
      setStatus('saving');
      onStatusChange?.('saving');

      try {
        const result = await saveProjectContentAction(projectId, currentData);

        if (result.success) {
          setStatus('saved');
          setLastSaved(new Date());
          setError(null);
          retryCountRef.current = 0;
          onStatusChange?.('saved');
        } else {
          throw new Error(result.error || 'Save failed');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);

        // Retry logic
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current += 1;
          setStatus('unsaved');
          onStatusChange?.('unsaved');

          // Retry after 1 second
          setTimeout(() => save(currentData), 1000);
        } else {
          setStatus('error');
          onStatusChange?.('error');
        }
      }
    },
    [projectId, onStatusChange]
  );

  // Debounce Logic: Wait for data to stabilize before saving
  useEffect(() => {
    // If data hasn't changed, don't mark as unsaved
    if (status === 'saved') {
      setStatus('unsaved');
      onStatusChange?.('unsaved');
    }

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(() => {
      save(data);
    }, debounceMs);

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, save, debounceMs, onStatusChange, status]);

  return { status, lastSaved, error };
}
