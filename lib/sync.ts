/**
 * SYNC LAYER — Supabase + localStorage
 *
 * Strategy:
 *  1. localStorage  → instant read/write, always works offline
 *  2. Supabase      → cross-device persistence, debounced writes
 *  3. Retry queue   → if a save fails it is queued and retried on the
 *                     next successful network activity
 *  4. Merge logic   → on load, take whichever record has the more
 *                     recent `last_visit` timestamp
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type { UniverseState } from './persistence';
import type { PetSaveData } from './petPersistence';

// ─── Pending-write queue (survives transient network hiccups) ─────
const PENDING_KEY = 'sync_pending_writes';

type PendingWrite = { type: 'universe' | 'pet'; payload: object; ts: number };

function enqueuePending(w: PendingWrite) {
  if (typeof window === 'undefined') return;
  try {
    const raw  = localStorage.getItem(PENDING_KEY);
    const list: PendingWrite[] = raw ? JSON.parse(raw) : [];
    list.push(w);
    // Keep only the last 5 per type to avoid stale bloat
    const kept = list.slice(-10);
    localStorage.setItem(PENDING_KEY, JSON.stringify(kept));
  } catch { /* ignore */ }
}

function dequeuePending() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return [];
    const list: PendingWrite[] = JSON.parse(raw);
    localStorage.removeItem(PENDING_KEY);
    return list;
  } catch { return []; }
}

/** Call this on app init to flush any writes that failed last session */
export async function flushPendingWrites(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  const pending = dequeuePending();
  for (const w of pending) {
    try {
      if (w.type === 'universe') await _saveUniverseToDB(w.payload as Partial<UniverseState>);
      if (w.type === 'pet')      await _savePetToDB(w.payload as PetSaveData);
    } catch {
      // still failing — re-queue just this one and stop
      enqueuePending(w);
      break;
    }
  }
}

// ─── UNIVERSE STATE ───────────────────────────────────────────────

export async function loadUniverseFromDB(): Promise<Partial<UniverseState> | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('universe_state')
      .select('*')
      .eq('id', 'roqeebat')
      .maybeSingle();   // maybeSingle doesn't throw when row is missing
    if (error || !data) return null;

    return {
      firstVisitDate:         data.first_visit,
      lastVisitDate:          data.last_visit,
      totalVisits:            data.total_visits         ?? 0,
      visitStreak:            data.visit_streak         ?? 1,
      lastDailySurpriseDate:  data.last_daily_surprise_date ?? '',
      dailySurpriseIndex:     data.daily_surprise_index ?? 0,
      selectedMood:           data.selected_mood        ?? null,
      musicEnabled:           data.music_enabled        ?? false,
      currentSong:            data.current_song         ?? 0,
      birthdayVisited:        data.birthday_visited     ?? false,
      birthdayYear:           data.birthday_year        ?? null,
      birthdayIntroCompleted: data.birthday_intro_completed ?? false,
      unlockedAchievements:   data.unlocked_achievements ?? ['first-visit'],
      discoveredSecrets:      data.discovered_secrets   ?? [],
      exploredAreas:          data.explored_areas       ?? [],
      viewedMemories:         data.viewed_memories      ?? [],
      smileClicks:            data.smile_clicks         ?? 0,
      openedEnvelopes:        data.opened_envelopes     ?? [],
      gameScores:             data.game_scores          ?? {},
    };
  } catch (e) {
    console.warn('[sync] loadUniverseFromDB failed:', e);
    return null;
  }
}

async function _saveUniverseToDB(state: Partial<UniverseState>): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  const { error } = await supabase.from('universe_state').upsert(
    {
      id:                       'roqeebat',
      first_visit:              state.firstVisitDate,
      last_visit:               state.lastVisitDate  || new Date().toISOString(),
      total_visits:             state.totalVisits    ?? 0,
      visit_streak:             state.visitStreak    ?? 1,
      last_daily_surprise_date: state.lastDailySurpriseDate ?? '',
      daily_surprise_index:     state.dailySurpriseIndex    ?? 0,
      selected_mood:            state.selectedMood   ?? null,
      music_enabled:            state.musicEnabled   ?? false,
      current_song:             state.currentSong    ?? 0,
      birthday_visited:         state.birthdayVisited         ?? false,
      birthday_year:            state.birthdayYear             ?? null,
      birthday_intro_completed: state.birthdayIntroCompleted  ?? false,
      unlocked_achievements:    state.unlockedAchievements    ?? ['first-visit'],
      discovered_secrets:       state.discoveredSecrets       ?? [],
      explored_areas:           state.exploredAreas           ?? [],
      viewed_memories:          state.viewedMemories          ?? [],
      smile_clicks:             state.smileClicks             ?? 0,
      opened_envelopes:         state.openedEnvelopes         ?? [],
      game_scores:              state.gameScores              ?? {},
    },
    { onConflict: 'id' }
  );
  if (error) throw error;
}

export async function saveUniverseToDB(state: Partial<UniverseState>): Promise<void> {
  try {
    await _saveUniverseToDB(state);
  } catch (e) {
    console.warn('[sync] saveUniverseToDB failed — queuing for retry:', e);
    enqueuePending({ type: 'universe', payload: state, ts: Date.now() });
  }
}

// ─── PET STATE ─────────────────────────────────────────────────────

export async function loadPetFromDB(): Promise<Partial<PetSaveData> | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('pet_state')
      .select('*')
      .eq('id', 'olajuwon')
      .maybeSingle();
    if (error || !data) return null;

    return {
      name:             data.name             ?? 'Olajuwon',
      level:            data.level            ?? 1,
      xp:               data.xp               ?? 0,
      xpToNext:         data.xp_to_next       ?? 100,
      bondLevel:        data.bond_level       ?? 1,
      bondXp:           data.bond_xp          ?? 0,
      hunger:           Number(data.hunger    ?? 80),
      thirst:           Number(data.thirst    ?? 80),
      happiness:        Number(data.happiness ?? 75),
      energy:           Number(data.energy    ?? 90),
      hygiene:          Number(data.hygiene   ?? 85),
      health:           Number(data.health    ?? 100),
      affection:        Number(data.affection ?? 60),
      isSleeping:       data.is_sleeping       ?? false,
      sleepStartTime:   data.sleep_start_time  ?? null,
      equippedClothing: data.equipped_clothing ?? {},
      unlockedClothing: data.unlocked_clothing ?? [],
      lastVisit:        data.last_visit,
      streak:           data.streak            ?? 1,
      longestStreak:    data.longest_streak    ?? 1,
      totalDaysVisited: data.total_days        ?? 1,
      lastFed:          data.last_fed          ?? null,
      lastGroomed:      data.last_groomed      ?? null,
      lastPlayed:       data.last_played       ?? null,
      foodInventory:    data.food_inventory    ?? {},
      unlockedToys:     data.unlocked_toys     ?? [],
      coins:            data.coins             ?? 50,
      roomLevel:        data.room_level        ?? 1,
      unlockedItems:    data.unlocked_items    ?? [],
      achievements:     data.achievements      ?? [],
      lastDailyReward:  data.last_daily_reward ?? '',
      dailyRewardDay:   data.daily_reward_day  ?? 0,
    };
  } catch (e) {
    console.warn('[sync] loadPetFromDB failed:', e);
    return null;
  }
}

async function _savePetToDB(pet: PetSaveData): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  const { error } = await supabase.from('pet_state').upsert(
    {
      id:                'olajuwon',
      name:              pet.name,
      level:             pet.level,
      xp:                pet.xp,
      xp_to_next:        pet.xpToNext,
      bond_level:        pet.bondLevel,
      bond_xp:           pet.bondXp,
      hunger:            pet.hunger,
      thirst:            pet.thirst,
      happiness:         pet.happiness,
      energy:            pet.energy,
      hygiene:           pet.hygiene,
      health:            pet.health,
      affection:         pet.affection,
      is_sleeping:       pet.isSleeping,
      sleep_start_time:  pet.sleepStartTime,
      equipped_clothing: pet.equippedClothing ?? {},
      unlocked_clothing: pet.unlockedClothing ?? [],
      last_visit:        pet.lastVisit || new Date().toISOString(),
      streak:            pet.streak,
      longest_streak:    pet.longestStreak,
      total_days:        pet.totalDaysVisited,
      last_fed:          pet.lastFed,
      last_groomed:      pet.lastGroomed,
      last_played:       pet.lastPlayed,
      food_inventory:    pet.foodInventory    ?? {},
      unlocked_toys:     pet.unlockedToys     ?? [],
      coins:             pet.coins,
      room_level:        pet.roomLevel,
      unlocked_items:    pet.unlockedItems    ?? [],
      achievements:      pet.achievements     ?? [],
      last_daily_reward: pet.lastDailyReward  ?? '',
      daily_reward_day:  pet.dailyRewardDay   ?? 0,
    },
    { onConflict: 'id' }
  );
  if (error) throw error;
}

export async function savePetToDB(pet: PetSaveData): Promise<void> {
  try {
    await _savePetToDB(pet);
  } catch (e) {
    console.warn('[sync] savePetToDB failed — queuing for retry:', e);
    enqueuePending({ type: 'pet', payload: pet, ts: Date.now() });
  }
}

// ─── DEBOUNCED SAVES ────────────────────────────────────────────────
// Prevents hammering the DB on every state change

let petSaveTimer: ReturnType<typeof setTimeout> | null = null;
let universeSaveTimer: ReturnType<typeof setTimeout> | null = null;

export function debouncedSavePet(pet: PetSaveData, delay = 2500): void {
  if (petSaveTimer) clearTimeout(petSaveTimer);
  petSaveTimer = setTimeout(() => savePetToDB(pet), delay);
}

export function debouncedSaveUniverse(state: Partial<UniverseState>, delay = 2500): void {
  if (universeSaveTimer) clearTimeout(universeSaveTimer);
  universeSaveTimer = setTimeout(() => saveUniverseToDB(state), delay);
}

/** Immediately flush any pending debounced saves (call on page unload) */
export function flushDebouncedSaves(
  universeState?: Partial<UniverseState>,
  petState?: PetSaveData
): void {
  if (universeSaveTimer) {
    clearTimeout(universeSaveTimer);
    universeSaveTimer = null;
    if (universeState) saveUniverseToDB(universeState);
  }
  if (petSaveTimer) {
    clearTimeout(petSaveTimer);
    petSaveTimer = null;
    if (petState) savePetToDB(petState);
  }
}
