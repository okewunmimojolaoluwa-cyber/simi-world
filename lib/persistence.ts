// LOCAL STORAGE MANAGEMENT
// Handles all persistent data for the universe

const STORAGE_KEY = 'roqeebat_universe';

export interface UniverseState {
  // Visit tracking
  firstVisitDate: string;
  lastVisitDate: string;
  totalVisits: number;
  visitStreak: number;
  lastDailyRewardDate: string; // Track daily coin rewards
  
  // Daily content
  lastDailySurpriseDate: string;
  dailySurpriseIndex: number;
  
  // Pet progress
  petName: string | null;
  petHappiness: number;
  petEnergy: number;
  petLove: number;
  petXP: number;
  petCoins: number; // Pet coins
  petLastFed: string | null;
  petLastPlayed: string | null;
  
  // Game scores
  gameScores: {
    [gameId: string]: number;
  };
  
  // Achievements
  unlockedAchievements: string[];
  
  // Discoveries
  discoveredSecrets: string[];
  exploredAreas: string[];
  viewedMemories: string[];
  
  // Interactions
  smileClicks: number;
  openedEnvelopes: string[];
  
  // Preferences
  selectedMood: string | null;
  musicEnabled: boolean;
  currentSong: number;
  
  // Birthday
  birthdayVisited: boolean;
  birthdayYear: number | null;
  birthdayIntroCompleted?: boolean;
}

const DEFAULT_STATE: UniverseState = {
  firstVisitDate: new Date().toISOString(),
  lastVisitDate: new Date().toISOString(),
  totalVisits: 0,
  visitStreak: 0, // Start from 0, will count from Oct 25
  lastDailyRewardDate: '',
  
  lastDailySurpriseDate: '',
  dailySurpriseIndex: 0,
  
  petName: 'Olajuwon',
  petHappiness: 80,
  petEnergy: 100,
  petLove: 50,
  petXP: 0,
  petCoins: 100, // Start with 100 coins
  petLastFed: null,
  petLastPlayed: null,
  
  gameScores: {},
  
  unlockedAchievements: ['first-visit'],
  
  discoveredSecrets: [],
  exploredAreas: [],
  viewedMemories: [],
  
  smileClicks: 0,
  openedEnvelopes: [],
  
  selectedMood: null,
  musicEnabled: false,
  currentSong: 0,
  
  birthdayVisited: false,
  birthdayYear: null,
  birthdayIntroCompleted: false
};

export const loadState = (): UniverseState => {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_STATE;
    
    const state = JSON.parse(saved);
    // Always update petName to Olajuwon if it's null or was 'Luna'
    if (!state.petName || state.petName === 'Luna') {
      state.petName = 'Olajuwon';
    }
    return { ...DEFAULT_STATE, ...state };
  } catch (error) {
    console.error('Failed to load state:', error);
    return DEFAULT_STATE;
  }
};

export const saveState = (state: Partial<UniverseState>): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const current = loadState();
    const updated = { ...current, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
};

export const updateVisit = (): { dailyReward: boolean; coinsEarned: number } => {
  const state = loadState();
  const now = new Date();
  const lastVisit = new Date(state.lastVisitDate);
  
  // Birthday start date: October 25, 2026
  const birthdayStart = new Date(2026, 9, 25); // Month is 0-indexed (9 = October)
  
  // Calculate days since birthday
  const daysSinceBirthday = Math.floor((now.getTime() - birthdayStart.getTime()) / (1000 * 60 * 60 * 24));
  
  // Only count streak if we're past the birthday
  let newStreak = 0;
  if (daysSinceBirthday >= 0) {
    const daysSinceLastVisit = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    
    if (state.visitStreak === 0 || daysSinceLastVisit === 1) {
      // First visit or consecutive day
      newStreak = state.visitStreak + 1;
    } else if (daysSinceLastVisit === 0) {
      // Same day, keep streak
      newStreak = state.visitStreak;
    } else {
      // Missed a day, reset to 1
      newStreak = 1;
    }
  }
  
  // Check if daily reward is due (once per day)
  const today = now.toDateString();
  const lastRewardDate = state.lastDailyRewardDate;
  const isDailyReward = lastRewardDate !== today;
  const coinsEarned = isDailyReward ? 100 : 0;
  
  // Update state
  const updates: Partial<UniverseState> = {
    lastVisitDate: now.toISOString(),
    totalVisits: state.totalVisits + 1,
    visitStreak: newStreak,
  };
  
  if (isDailyReward) {
    updates.lastDailyRewardDate = today;
    updates.petCoins = (state.petCoins || 0) + coinsEarned;
  }
  
  saveState(updates);
  
  // Check for streak achievements
  if (newStreak >= 7) {
    unlockAchievement('loyal-visitor');
  }
  
  return { dailyReward: isDailyReward, coinsEarned };
};

export const unlockAchievement = (achievementId: string): boolean => {
  const state = loadState();
  if (state.unlockedAchievements.includes(achievementId)) {
    return false; // Already unlocked
  }
  
  saveState({
    unlockedAchievements: [...state.unlockedAchievements, achievementId]
  });
  
  return true; // Newly unlocked
};

export const discoverSecret = (secretId: string): boolean => {
  const state = loadState();
  if (state.discoveredSecrets.includes(secretId)) {
    return false;
  }
  
  saveState({
    discoveredSecrets: [...state.discoveredSecrets, secretId]
  });
  
  unlockAchievement('secret-finder');
  return true;
};

export const exploreArea = (areaId: string): void => {
  const state = loadState();
  if (!state.exploredAreas.includes(areaId)) {
    const explored = [...state.exploredAreas, areaId];
    saveState({ exploredAreas: explored });
    
    if (explored.length >= 5) {
      unlockAchievement('explorer');
    }
  }
};

export const updateGameScore = (gameId: string, score: number): void => {
  const state = loadState();
  const currentBest = state.gameScores[gameId] || 0;
  
  if (score > currentBest) {
    saveState({
      gameScores: {
        ...state.gameScores,
        [gameId]: score
      }
    });
    
    if (score >= 100) {
      unlockAchievement('high-scorer');
    }
  }
};

export const getTodaysSurprise = (totalSurprises: number): { index: number; isNew: boolean } => {
  const state = loadState();
  const today = new Date().toDateString();
  
  if (state.lastDailySurpriseDate === today) {
    return { index: state.dailySurpriseIndex, isNew: false };
  }
  
  // New day, new surprise
  const newIndex = Math.floor(Math.random() * totalSurprises);
  
  saveState({
    lastDailySurpriseDate: today,
    dailySurpriseIndex: newIndex
  });
  
  return { index: newIndex, isNew: true };
};

export const isBirthday = (month: number, day: number): boolean => {
  const now = new Date();
  return now.getMonth() + 1 === month && now.getDate() === day;
};

export const checkTimeBasedAchievements = (): void => {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 0 && hour < 6) {
    unlockAchievement('early-bird');
  }
  
  if (hour >= 0 && hour < 5) {
    unlockAchievement('night-owl');
  }
};

export const incrementSmileClicks = (): void => {
  const state = loadState();
  const newCount = state.smileClicks + 1;
  
  saveState({ smileClicks: newCount });
  
  if (newCount >= 100) {
    unlockAchievement('hundred-smiles');
  }
};


// Reset streak and coins (for testing/resetting)
export const resetStreakAndCoins = (): void => {
  const state = loadState();
  saveState({
    visitStreak: 0,
    petCoins: 100,
    lastDailyRewardDate: '',
  });
};
