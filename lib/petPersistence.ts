// PET GAME PERSISTENCE
// Complete save/load system for Olajuwon's virtual pet game

const PET_KEY = 'olajuwon_pet_v1';

export type PetState =
  | 'idle' | 'walking' | 'eating' | 'drinking' | 'playing'
  | 'sleeping' | 'grooming' | 'happy' | 'sad' | 'hungry'
  | 'tired' | 'excited' | 'bored';

export type ClothingSlot = 'hat' | 'shirt' | 'collar' | 'accessory' | 'special';

export interface ClothingItem {
  id: string;
  name: string;
  slot: ClothingSlot;
  emoji: string;
  unlockLevel: number;
  color?: string;
}

export interface PetSaveData {
  // Identity
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  bondLevel: number;
  bondXp: number;

  // Needs (0-100)
  hunger: number;
  thirst: number;
  happiness: number;
  energy: number;
  hygiene: number;
  health: number;
  affection: number;

  // Position in room (%)
  posX: number;
  posY: number;

  // State
  currentState: PetState;
  isSleeping: boolean;
  sleepStartTime: string | null;

  // Clothing
  equippedClothing: Partial<Record<ClothingSlot, string>>;
  unlockedClothing: string[];

  // Progress
  lastVisit: string;
  streak: number;
  longestStreak: number;
  totalDaysVisited: number;
  lastFed: string | null;
  lastGroomed: string | null;
  lastPlayed: string | null;

  // Inventory
  foodInventory: Record<string, number>;
  unlockedToys: string[];
  coins: number;

  // Room upgrades
  roomLevel: number;
  unlockedItems: string[];

  // Achievements
  achievements: string[];

  // Daily reward
  lastDailyReward: string;
  dailyRewardDay: number;
}

export const ALL_CLOTHING: ClothingItem[] = [
  // ── HATS ───────────────────────────────────
  { id: 'bow',          name: 'Pink Bow',        slot: 'hat',       emoji: '🎀', unlockLevel: 1,  color: '#ff6b9d' },
  { id: 'crown',        name: 'Gold Crown',      slot: 'hat',       emoji: '👑', unlockLevel: 8,  color: '#ffd700' },
  { id: 'party_hat',    name: 'Party Hat',        slot: 'hat',       emoji: '🎉', unlockLevel: 2,  color: '#ff6b9d' },
  { id: 'flower_crown', name: 'Flower Crown',     slot: 'hat',       emoji: '🌸', unlockLevel: 3,  color: '#ffc1e0' },
  { id: 'cap',          name: 'Cute Cap',         slot: 'hat',       emoji: '🧢', unlockLevel: 2,  color: '#9b7ede' },
  { id: 'witch_hat',    name: 'Witch Hat',        slot: 'hat',       emoji: '🔮', unlockLevel: 10, color: '#4a2f5c' },
  { id: 'top_hat',      name: 'Top Hat',          slot: 'hat',       emoji: '🎩', unlockLevel: 6,  color: '#1a1a1a' },
  { id: 'beret',        name: 'Beret',            slot: 'hat',       emoji: '🎨', unlockLevel: 4,  color: '#c8503c' },
  { id: 'cowboy',       name: 'Cowboy Hat',       slot: 'hat',       emoji: '🤠', unlockLevel: 5,  color: '#8b4513' },
  { id: 'santa_hat',    name: 'Santa Hat',        slot: 'hat',       emoji: '🎅', unlockLevel: 7,  color: '#cc0000' },
  // ── COLLARS ────────────────────────────────
  { id: 'pink_collar',  name: 'Pink Collar',      slot: 'collar',    emoji: '💕', unlockLevel: 1,  color: '#ff6b9d' },
  { id: 'gold_collar',  name: 'Gold Collar',      slot: 'collar',    emoji: '✨', unlockLevel: 5,  color: '#ffd700' },
  { id: 'bell_collar',  name: 'Bell Collar',      slot: 'collar',    emoji: '🔔', unlockLevel: 2,  color: '#ffc1e0' },
  { id: 'red_collar',   name: 'Red Collar',       slot: 'collar',    emoji: '❤️', unlockLevel: 1,  color: '#e03040' },
  { id: 'diamond',      name: 'Diamond Collar',   slot: 'collar',    emoji: '💎', unlockLevel: 9,  color: '#a8e0f0' },
  { id: 'ribbon',       name: 'Silk Ribbon',      slot: 'collar',    emoji: '🎗️', unlockLevel: 3,  color: '#ff9eb7' },
  // ── SHIRTS / OUTFITS ───────────────────────
  { id: 'hoodie',       name: 'Pink Hoodie',      slot: 'shirt',     emoji: '🧥', unlockLevel: 4,  color: '#ffc1e0' },
  { id: 'school',       name: 'School Outfit',    slot: 'shirt',     emoji: '🎒', unlockLevel: 5,  color: '#9b7ede' },
  { id: 'royal',        name: 'Royal Robe',       slot: 'shirt',     emoji: '👘', unlockLevel: 8,  color: '#ffd700' },
  { id: 'pajamas',      name: 'Cozy Pajamas',     slot: 'shirt',     emoji: '😴', unlockLevel: 2,  color: '#d4a5d4' },
  { id: 'tshirt',       name: 'Cute T-Shirt',     slot: 'shirt',     emoji: '👕', unlockLevel: 1,  color: '#80c8f0' },
  { id: 'dress',        name: 'Party Dress',      slot: 'shirt',     emoji: '👗', unlockLevel: 6,  color: '#ff9eb7' },
  { id: 'jacket',       name: 'Leather Jacket',   slot: 'shirt',     emoji: '🧶', unlockLevel: 7,  color: '#2a2420' },
  { id: 'sweater',      name: 'Wool Sweater',     slot: 'shirt',     emoji: '🧣', unlockLevel: 3,  color: '#a06040' },
  { id: 'tuxedo',       name: 'Tuxedo',           slot: 'shirt',     emoji: '🤵', unlockLevel: 10, color: '#1a1a1a' },
  { id: 'chef',         name: 'Chef Coat',        slot: 'shirt',     emoji: '👨‍🍳', unlockLevel: 4,  color: '#f0ece4' },
  // ── ACCESSORIES ────────────────────────────
  { id: 'sunglasses',   name: 'Sunglasses',       slot: 'accessory', emoji: '🕶️', unlockLevel: 3,  color: '#4a2f5c' },
  { id: 'bow_tie',      name: 'Bow Tie',          slot: 'accessory', emoji: '🪅', unlockLevel: 2,  color: '#ff6b9d' },
  { id: 'necklace',     name: 'Pearl Necklace',   slot: 'accessory', emoji: '📿', unlockLevel: 6,  color: '#ffc1e0' },
  { id: 'scarf',        name: 'Cozy Scarf',       slot: 'accessory', emoji: '🧣', unlockLevel: 1,  color: '#ff9eb7' },
  { id: 'earrings',     name: 'Star Earrings',    slot: 'accessory', emoji: '⭐', unlockLevel: 4,  color: '#ffd700' },
  { id: 'watch',        name: 'Gold Watch',       slot: 'accessory', emoji: '⌚', unlockLevel: 7,  color: '#c8a830' },
  { id: 'bag',          name: 'Mini Handbag',     slot: 'accessory', emoji: '👜', unlockLevel: 5,  color: '#c8603c' },
  // ── SPECIAL ────────────────────────────────
  { id: 'birthday',     name: 'Birthday Outfit',  slot: 'special',   emoji: '🎂', unlockLevel: 1,  color: '#ff6b9d' },
  { id: 'angel',        name: 'Angel Wings',      slot: 'special',   emoji: '👼', unlockLevel: 12, color: '#fff8f0' },
  { id: 'superhero',    name: 'Cape & Mask',      slot: 'special',   emoji: '🦸', unlockLevel: 9,  color: '#4060e0' },
  { id: 'princess',     name: 'Princess Gown',    slot: 'special',   emoji: '👸', unlockLevel: 11, color: '#ffd700' },
];

export const FOOD_ITEMS = [
  { id: 'fish',        name: 'Fresh Fish',      emoji: '🐟', hungerBoost: 28, happyBoost: 12, xp: 6,  cookable: true,  cookTime: 3,  cookedEmoji: '🍣', cost: 15 },
  { id: 'chicken',     name: 'Chicken',          emoji: '🍗', hungerBoost: 32, happyBoost: 10, xp: 6,  cookable: true,  cookTime: 4,  cookedEmoji: '🍖', cost: 18 },
  { id: 'milk',        name: 'Warm Milk',        emoji: '🥛', hungerBoost: 12, happyBoost: 8,  xp: 4,  cookable: false, thirstBoost: 25, cost: 8 },
  { id: 'treat',       name: 'Sweet Treat',      emoji: '🍪', hungerBoost: 18, happyBoost: 22, xp: 9,  cookable: false, cost: 12 },
  { id: 'tuna',        name: 'Tuna Steak',       emoji: '🐠', hungerBoost: 38, happyBoost: 18, xp: 12, cookable: true,  cookTime: 5,  cookedEmoji: '🍱', cost: 25 },
  { id: 'salmon',      name: 'Salmon',           emoji: '🐡', hungerBoost: 30, happyBoost: 14, xp: 8,  cookable: true,  cookTime: 4,  cookedEmoji: '🍱', cost: 20 },
  { id: 'cake',        name: 'Birthday Cake',    emoji: '🎂', hungerBoost: 20, happyBoost: 40, xp: 15, cookable: false, cost: 30 },
  { id: 'shrimp',      name: 'Shrimp',           emoji: '🦐', hungerBoost: 22, happyBoost: 16, xp: 7,  cookable: true,  cookTime: 3,  cookedEmoji: '🍤', cost: 16 },
  { id: 'milk_tea',    name: 'Milk Tea',         emoji: '🧋', hungerBoost: 8,  happyBoost: 25, xp: 6,  cookable: false, thirstBoost: 18, cost: 10 },
  { id: 'burger',      name: 'Cat Burger',       emoji: '🍔', hungerBoost: 45, happyBoost: 20, xp: 14, cookable: true,  cookTime: 5,  cookedEmoji: '🍔', cost: 28 },
];

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Baby Cat', 2: 'Little Explorer', 3: 'Playful Cat',
  4: 'Curious Kitten', 5: 'Roommate', 6: 'Mischief Maker',
  7: 'Night Owl', 8: 'Companion', 9: 'Loyal Friend', 10: 'Best Friend',
  11: 'Soulmate', 12: 'Forever Friend',
};

const XP_PER_LEVEL = 100;

const DEFAULT_PET: PetSaveData = {
  name: 'Olajuwon',
  level: 1,
  xp: 0,
  xpToNext: XP_PER_LEVEL,
  bondLevel: 1,
  bondXp: 0,
  hunger: 80,
  thirst: 80,
  happiness: 75,
  energy: 90,
  hygiene: 85,
  health: 100,
  affection: 60,
  posX: 50,
  posY: 72,
  currentState: 'idle',
  isSleeping: false,
  sleepStartTime: null,
  equippedClothing: { collar: 'pink_collar', hat: 'bow', shirt: 'tshirt' },
  unlockedClothing: ['pink_collar', 'bow', 'party_hat', 'birthday', 'tshirt', 'scarf', 'red_collar', 'bell_collar'],
  lastVisit: new Date().toISOString(),
  streak: 1,
  longestStreak: 1,
  totalDaysVisited: 1,
  lastFed: null,
  lastGroomed: null,
  lastPlayed: null,
  foodInventory: { fish: 3, chicken: 2, milk: 3, treat: 2, tuna: 1, salmon: 1, shrimp: 2, milk_tea: 2 },
  unlockedToys: ['ball', 'yarn'],
  coins: 50,
  roomLevel: 1,
  unlockedItems: [],
  achievements: ['first_visit'],
  lastDailyReward: '',
  dailyRewardDay: 0,
};

export const loadPet = (): PetSaveData => {
  if (typeof window === 'undefined') return { ...DEFAULT_PET };
  try {
    const saved = localStorage.getItem(PET_KEY);
    if (!saved) return { ...DEFAULT_PET };
    const data = JSON.parse(saved) as PetSaveData;

    // Apply time decay since last visit
    const now = Date.now();
    const lastVisit = new Date(data.lastVisit).getTime();
    const hoursAway = (now - lastVisit) / (1000 * 60 * 60);

    if (hoursAway > 0.5) {
      const decay = Math.min(hoursAway, 24);
      data.hunger = Math.max(0, data.hunger - decay * 3);
      data.thirst = Math.max(0, data.thirst - decay * 4);
      data.energy = data.isSleeping
        ? Math.min(100, data.energy + decay * 8)
        : Math.max(0, data.energy - decay * 2);
      data.hygiene = Math.max(0, data.hygiene - decay * 1.5);
      data.happiness = Math.max(0, data.happiness - decay * 2);
      if (data.isSleeping && data.energy >= 90) {
        data.isSleeping = false;
        data.currentState = 'idle';
      }
    }

    // Always keep pet name as Olajuwon
    if (!(data as any).petName || (data as any).petName === 'Luna') {
      (data as any).petName = 'Olajuwon';
    }
    data.name = 'Olajuwon';
    
    // Sync coins with global UniverseState
    try {
      const universeData = localStorage.getItem('roqeebat_universe');
      if (universeData) {
        const universeState = JSON.parse(universeData);
        if (typeof universeState.petCoins === 'number') {
          data.coins = universeState.petCoins;
        }
      }
    } catch { /* ignore sync errors */ }

    return { ...DEFAULT_PET, ...data };
  } catch {
    return { ...DEFAULT_PET };
  }
};

export const savePet = (data: PetSaveData): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PET_KEY, JSON.stringify({ ...data, lastVisit: new Date().toISOString() }));
    
    // Sync coins back to global UniverseState
    try {
      const universeData = localStorage.getItem('roqeebat_universe');
      if (universeData) {
        const universeState = JSON.parse(universeData);
        universeState.petCoins = data.coins;
        localStorage.setItem('roqeebat_universe', JSON.stringify(universeState));
      }
    } catch { /* ignore sync errors */ }
  } catch { /* ignore */ }
};

export const addXP = (data: PetSaveData, amount: number): PetSaveData => {
  let xp = data.xp + amount;
  let level = data.level;
  let xpToNext = data.xpToNext;
  const unlocked: string[] = [];

  while (xp >= xpToNext) {
    xp -= xpToNext;
    level += 1;
    xpToNext = XP_PER_LEVEL + level * 20;
    // Unlock clothing for this level
    ALL_CLOTHING.forEach(c => {
      if (c.unlockLevel === level && !data.unlockedClothing.includes(c.id)) {
        unlocked.push(c.id);
      }
    });
  }

  return {
    ...data,
    xp,
    level,
    xpToNext,
    unlockedClothing: [...new Set([...data.unlockedClothing, ...unlocked])],
  };
};

export const checkDailyVisit = (data: PetSaveData): { data: PetSaveData; isNewDay: boolean; message: string } => {
  const now = new Date();
  const last = new Date(data.lastVisit);
  const daysSince = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSince === 0) return { data, isNewDay: false, message: '' };

  let streak = daysSince === 1 ? data.streak + 1 : 1;
  const longest = Math.max(streak, data.longestStreak);

  let message = '';
  if (daysSince === 1) message = `Olajuwon waited for you! 🔥 Day ${streak} streak!`;
  else if (daysSince <= 3) message = `Olajuwon missed you! 💕`;
  else message = `Olajuwon is so happy you're back! 🐱`;

  const updated: PetSaveData = {
    ...data,
    streak,
    longestStreak: longest,
    totalDaysVisited: data.totalDaysVisited + 1,
    lastVisit: now.toISOString(),
    coins: data.coins + 10 * streak,
  };

  return { data: updated, isNewDay: true, message };
};
