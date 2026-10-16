/**
 * useUniverse — Universe state hook with Supabase sync
 *
 * Load priority:  Supabase (remote) → localStorage (local)
 * Save strategy:
 *   • localStorage  immediately   (instant, works offline)
 *   • Supabase      debounced 2.5s (cross-device persistence)
 *   • Flush         on page unload (catches any pending debounce)
 *   • Pending queue on save failure (retried on next page load)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  loadState, saveState, updateVisit,
  checkTimeBasedAchievements, UniverseState,
} from '@/lib/persistence';
import {
  loadUniverseFromDB,
  saveUniverseToDB,
  debouncedSaveUniverse,
  flushPendingWrites,
  flushDebouncedSaves,
} from '@/lib/sync';

export const useUniverse = () => {
  const [state, setState]     = useState<UniverseState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const stateRef = useRef<UniverseState | null>(null); // keep ref for unload flush

  useEffect(() => {
    const init = async () => {
      // ── Step 1: Show local data immediately so UI renders fast ──
      const local = loadState();
      setState(local);
      stateRef.current = local;
      setIsLoading(false);
      const visitResult = updateVisit();
      checkTimeBasedAchievements();
      
      // Show daily reward notification if earned
      if (visitResult.dailyReward && visitResult.coinsEarned > 0) {
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('dailyReward', { 
              detail: { coins: visitResult.coinsEarned } 
            });
            window.dispatchEvent(event);
          }
        }, 2000); // Show after 2 seconds
      }

      // ── Step 2: Flush any writes that failed in a previous session ──
      await flushPendingWrites();

      // ── Step 3: Load fresher data from Supabase ──────────────────
      try {
        const remote = await loadUniverseFromDB();
        if (remote) {
          const localTime  = new Date(local.lastVisitDate  || 0).getTime();
          const remoteTime = new Date((remote.lastVisitDate as string) || 0).getTime();

          if (remoteTime >= localTime) {
            // Remote is newer — use it and write back to localStorage
            const merged = { ...local, ...remote };
            setState(merged);
            stateRef.current = merged;
            saveState(merged);
          } else {
            // Local is newer — push local data up to Supabase
            await saveUniverseToDB(local);
          }
        } else {
          // No remote record yet — create it now
          await saveUniverseToDB(local);
        }
      } catch {
        // Supabase unreachable — localStorage is source of truth,
        // pending writes queue handles the retry next session
      }
    };

    init();

    // ── Flush debounced saves before the tab closes ───────────────
    const handleUnload = () => {
      if (stateRef.current) {
        flushDebouncedSaves(stateRef.current, undefined);
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateState = useCallback((updates: Partial<UniverseState>) => {
    setState(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      stateRef.current = next;

      // Always save to localStorage instantly
      saveState(updates);

      // For critical fields (intro gate, birthday) → save to DB immediately
      const isCritical = 'birthdayIntroCompleted' in updates
        || 'birthdayVisited' in updates
        || 'unlockedAchievements' in updates;

      if (isCritical) {
        saveUniverseToDB(next);   // fire-and-forget, error handling inside
      } else {
        debouncedSaveUniverse(next);
      }

      return next;
    });
  }, []);

  return { state, isLoading, updateState };
};
