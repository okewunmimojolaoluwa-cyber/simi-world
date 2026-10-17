'use client';

/**
 * DigitalPet — Olajuwon's Virtual Pet Game
 *
 * Routes to:
 *  - DigitalPetMobile  on screens ≤ 800px (2D, touch-optimised)
 *  - Full 3D R3F version on desktop (≥ 801px)
 */

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { UniverseState } from '@/lib/persistence';
import {
  loadPet, savePet, addXP, checkDailyVisit,
  ALL_CLOTHING, FOOD_ITEMS, LEVEL_NAMES,
  type PetSaveData, type ClothingSlot,
} from '@/lib/petPersistence';
import { loadPetFromDB, debouncedSavePet } from '@/lib/sync';
import { sounds } from '@/lib/audioSynthesis';
import OlajuwonCat3D, { type CatAnimState } from './OlajuwonCat3D';
import PetRoom3D from './PetRoom3D';

interface Props {
  state: UniverseState;
  updateState: (u: Partial<UniverseState>) => void;
  onBack: () => void;
}

type Panel = 'none' | 'food' | 'wardrobe' | 'toys' | 'shop' | 'cooking';
type WTab  = 'hat' | 'collar' | 'shirt' | 'accessory' | 'special';
type TOD   = 'morning' | 'afternoon' | 'evening' | 'night';

const clamp = (v: number) => Math.max(0, Math.min(100, v));

// Synchronized with Nigeria Time (Africa/Lagos)
export function getNigeriaTime(): { tod: TOD; hour: number; minute: number; timeStr: string; isNight: boolean } {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lagos',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23',
    });
    const parts = formatter.formatToParts(new Date());
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '12', 10);
    const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    // UK Day: 06:00 - 18:00 (bright sunlight)
    // UK Evening: 18:00 - 21:00 (dusk)
    // UK Night: 21:00 - 06:00 (dark night)
    let tod: TOD = 'afternoon';
    if (hour >= 6 && hour < 12) tod = 'morning';
    else if (hour >= 12 && hour < 18) tod = 'afternoon';
    else if (hour >= 18 && hour < 21) tod = 'evening';
    else tod = 'night';

    const isNight = hour < 6 || hour >= 19;
    return { tod, hour, minute, timeStr, isNight };
  } catch {
    const h = new Date().getHours();
    return {
      tod: (h >= 6 && h < 18 ? 'afternoon' : 'night') as TOD,
      hour: h,
      minute: 0,
      timeStr: `${h}:00`,
      isNight: h < 6 || h >= 19,
    };
  }
}

function getLighting(tod: TOD, lampOn: boolean): { ambientI: number; ambientColor: string; dirI: number; dirColor: string } {
  const isNight = tod === 'night' || tod === 'evening';

  if (isNight) {
    if (lampOn) {
      // Night with Lamp ON: The room is bright, warm, and illuminated with a golden amber glow!
      return { ambientI: 0.65, ambientColor: '#ffe7c4', dirI: 0.85, dirColor: '#ffdca0' };
    } else {
      // Night with Lamp OFF: Dark nocturnal atmospheric room with soft moonlight
      return { ambientI: 0.08, ambientColor: '#121636', dirI: 0.20, dirColor: '#2b3f78' };
    }
  }

  // Daytime in the UK (morning / afternoon):
  if (tod === 'morning') {
    return { ambientI: 0.65, ambientColor: '#fff5e0', dirI: 0.90, dirColor: '#fff8ea' };
  }
  // Afternoon: Full bright sunlight!
  return { ambientI: 0.75, ambientColor: '#ffffff', dirI: 1.05, dirColor: '#fffdf6' };
}

/* ────────────────────────────────────────────────────────────────
   CAT CONTROLLER — lives inside R3F Canvas
──────────────────────────────────────────────────────────────── */
interface CatControllerProps {
  targetPos: THREE.Vector3;
  animState: CatAnimState;
  onReached: () => void;
  onPointerDown: () => void;
  bedPos: THREE.Vector3;
  isSleeping: boolean;
  equipped: Partial<Record<string, string>>;
}

function CatController({ targetPos, animState, onReached, onPointerDown, bedPos, isSleeping, equipped }: CatControllerProps) {
  const groupRef   = useRef<THREE.Group>(null);
  const facingRef  = useRef(0); // y rotation
  const reachedRef = useRef(false);
  const SPEED      = 2.8;
  const TURN_SPEED = 8;

  useFrame((_state, delta: number) => {
    if (!groupRef.current) return;
    const cat = groupRef.current;

    if (isSleeping) {
      // Lerp to bed surface position
      cat.position.x = THREE.MathUtils.lerp(cat.position.x, bedPos.x, 0.04);
      cat.position.y = THREE.MathUtils.lerp(cat.position.y, bedPos.y, 0.04);
      cat.position.z = THREE.MathUtils.lerp(cat.position.z, bedPos.z, 0.04);
      // Rotate cat to lie along the bed (facing headboard direction)
      cat.rotation.y = THREE.MathUtils.lerp(cat.rotation.y, Math.PI, 0.04);
      return;
    }

    const dx = targetPos.x - cat.position.x;
    const dz = targetPos.z - cat.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 0.08) {
      // Rotate toward target
      const targetAngle = Math.atan2(dx, dz);
      const angleDiff   = targetAngle - facingRef.current;
      const shortAngle  = ((angleDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
      facingRef.current += shortAngle * Math.min(1, TURN_SPEED * delta);
      cat.rotation.y = facingRef.current;
      // Move
      cat.position.x += (dx / dist) * SPEED * delta;
      cat.position.z += (dz / dist) * SPEED * delta;
      reachedRef.current = false;
    } else {
      // Arrived
      cat.position.x = targetPos.x;
      cat.position.z = targetPos.z;
      if (!reachedRef.current) {
        reachedRef.current = true;
        onReached();
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <OlajuwonCat3D
        animState={animState}
        position={[0, 0, 0]}
        scale={0.92}
        onPointerDown={onPointerDown}
        equipped={equipped}
      />
    </group>
  );
}

/* ────────────────────────────────────────────────────────────────
   SCENE — wraps room + cat + lighting
──────────────────────────────────────────────────────────────── */
interface SceneProps {
  tod: TOD;
  lampOn: boolean;
  catTarget: THREE.Vector3;
  catAnim: CatAnimState;
  isSleeping: boolean;
  onCatReached: () => void;
  onCatTap: () => void;
  onClickFloor: (pt: THREE.Vector3) => void;
  onClickObject: (id: string) => void;
  equipped: Partial<Record<string, string>>;
}

// Bed center in world: x=3.2, z=-1.2, mattress top Y = 0.67
const BED_POS = new THREE.Vector3(3.2, 0.67, -1.0);

function Scene({ tod, lampOn, catTarget, catAnim, isSleeping, onCatReached, onCatTap, onClickFloor, onClickObject, equipped }: SceneProps) {
  const light = getLighting(tod, lampOn);
  const isNight = tod === 'night' || tod === 'evening';

  return (
    <>
      <ambientLight intensity={light.ambientI} color={light.ambientColor} />
      <directionalLight
        intensity={light.dirI}
        color={light.dirColor}
        position={isNight ? [2, 5, 3] : [3, 7, 4]}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* If lamp is ON at night or evening, cast radiant warm light throughout the room */}
      {lampOn && (
        <>
          <pointLight position={[1.9, 1.4, -1.2]} intensity={3.5} color="#ffa530" distance={7} decay={2} />
          <pointLight position={[-3.5, 2.2, 1]}   intensity={3.0} color="#ff9825" distance={6.5} decay={2} />
          <pointLight position={[0, 2.2, 0]}       intensity={1.8} color="#ffbe58" distance={8} decay={2} />
        </>
      )}

      <PetRoom3D timeOfDay={tod} lampOn={lampOn} onClickFloor={onClickFloor} onClickObject={onClickObject} />

      <CatController
        targetPos={catTarget}
        animState={catAnim}
        onReached={onCatReached}
        onPointerDown={onCatTap}
        bedPos={BED_POS}
        isSleeping={isSleeping}
        equipped={equipped}
      />
    </>
  );
}

/* ────────────────────────────────────────────────────────────────
   HUD COMPONENTS
──────────────────────────────────────────────────────────────── */
function NeedPip({ icon, val, col }: { icon: string; val: number; col: string }) {
  const low = val < 28;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 11 }}>{icon}</span>
      <div style={{ width: 50, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div animate={{ width: `${Math.round(val)}%` }} transition={{ duration: 0.6 }}
          style={{ height: '100%', borderRadius: 3, background: low ? '#e05858' : col }} />
      </div>
    </div>
  );
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
      style={{ position: 'absolute', top: 58, left: '50%', transform: 'translateX(-50%)', background: 'rgba(10,8,6,0.97)', border: '1px solid rgba(200,168,48,0.28)', color: '#e8d4a0', padding: '7px 20px', borderRadius: 24, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', zIndex: 200, boxShadow: '0 6px 28px rgba(0,0,0,0.65)', pointerEvents: 'none' }}>
      {msg}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────
   MAIN COMPONENT
──────────────────────────────────────────────────────────────── */
export default function DigitalPet({ onBack }: Props) {
  // ── Desktop 3D version ────────────────────────────────────────
  const [pet, setPet]         = useState<PetSaveData>(() => loadPet());
  const [panel, setPanel]     = useState<Panel>('none');
  const [wTab, setWTab]       = useState<WTab>('hat');
  const [toast, setToast]     = useState('');
  const [cookingFood, setCookingFood] = useState<string | null>(null);
  const [cookProgress, setCookProgress] = useState(0);
  const [nigeriaTime, setNigeriaTime] = useState(getNigeriaTime);
  const [lampOn, setLampOn]   = useState(false);
  const tod = nigeriaTime.tod;
  const [returnMsg, setReturn]= useState('');

  // Keep synchronized with Nigeria (Lagos) Time
  useEffect(() => {
    const t = setInterval(() => {
      setNigeriaTime(getNigeriaTime());
    }, 20000);
    return () => clearInterval(t);
  }, []);
  const [catAnim, setCatAnim] = useState<CatAnimState>('idle');
  const [dialogue, setDialogue] = useState('');
  const [tapCount, setTapCount] = useState(0);

  // ── Load from Supabase on mount (sync fresher remote data) ─────
  useEffect(() => {
    loadPetFromDB().then(remote => {
      if (!remote) return;
      setPet(prev => {
        const prevTime = new Date(prev.lastVisit || 0).getTime();
        const remTime  = new Date((remote.lastVisit as string) || 0).getTime();
        if (remTime > prevTime) {
          const merged = { ...prev, ...remote } as PetSaveData;
          savePet(merged); // write merged back to localStorage
          return merged;
        }
        return prev;
      });
    }).catch(() => {/* offline — localStorage is fine */});
  }, []); // eslint-disable-line

  // Cat navigation target (3D world coords)
  const [catTarget, setCatTarget] = useState(() => new THREE.Vector3(0, 0, 1.5));
  const petRef   = useRef(pet);
  const idleRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walkingRef = useRef(false);

  useEffect(() => {
    petRef.current = pet;
    savePet(pet);           // localStorage — instant
    debouncedSavePet(pet);  // Supabase — debounced 3s
  }, [pet]);

  // Daily return
  useEffect(() => {
    const { data, isNewDay, message } = checkDailyVisit(pet);
    if (isNewDay) { setPet(data); if (message) setReturn(message); }
    deriveAnim(data);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime decay
  useEffect(() => {
    const t = setInterval(() => {
      setPet(prev => {
        if (prev.isSleeping) {
          const u = { ...prev, energy: clamp(prev.energy + 3) };
          if (u.energy >= 96) { u.isSleeping = false; }
          return u;
        }
        return { ...prev, hunger: clamp(prev.hunger - 0.4), thirst: clamp(prev.thirst - 0.7), energy: clamp(prev.energy - 0.2), hygiene: clamp(prev.hygiene - 0.12) };
      });
    }, 60_000);
    return () => clearInterval(t);
  }, []);

  // Random idle behaviours
  useEffect(() => {
    const schedule = () => {
      idleRef.current = setTimeout(() => {
        if (petRef.current.isSleeping || walkingRef.current) { schedule(); return; }
        const opts: Array<{ a: CatAnimState; dlg?: string; dur: number }> = [
          { a: 'groom',   dlg: '...',            dur: 3500 },
          { a: 'sit',                             dur: 4000 },
          { a: 'stretch',                         dur: 2500 },
          { a: 'happy',   dlg: '✨',             dur: 2000 },
          { a: 'idle',    dlg: '*looks around*', dur: 2500 },
          { a: 'idle',    dlg: 'Meow...',        dur: 2000 },
        ];
        const b = opts[Math.floor(Math.random() * opts.length)];
        setCatAnim(b.a);
        if (b.dlg) showDialogue(b.dlg, b.dur);
        setTimeout(() => { setCatAnim('idle'); schedule(); }, b.dur);
      }, 9000 + Math.random() * 12000);
    };
    schedule();
    return () => { if (idleRef.current) clearTimeout(idleRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function deriveAnim(p: PetSaveData) {
    if (p.isSleeping) { setCatAnim('sleep'); return; }
  }

  function showToast(msg: string)  { setToast(msg); }
  function showDialogue(msg: string, dur = 2000) { setDialogue(msg); setTimeout(() => setDialogue(''), dur); }

  function walkThenDo(target: THREE.Vector3, cb: () => void) {
    walkingRef.current = true;
    setCatAnim('walk');
    setCatTarget(target.clone());
    // cb called by CatController.onReached → handleCatReached
    reachCallbackRef.current = cb;
  }

  const reachCallbackRef = useRef<(() => void) | null>(null);

  const handleCatReached = useCallback(() => {
    walkingRef.current = false;
    if (reachCallbackRef.current) {
      reachCallbackRef.current();
      reachCallbackRef.current = null;
    }
  }, []);

  function handleFloorClick(pt: THREE.Vector3) {
    if (petRef.current.isSleeping) { showDialogue('Shhh... 💤'); return; }
    if (panel !== 'none') { setPanel('none'); return; }
    walkThenDo(new THREE.Vector3(pt.x, 0, pt.z), () => setCatAnim('idle'));
  }

  function handleObject(id: string) {
    const p = petRef.current;
    setPanel('none');

    if (id === 'food') {
      walkThenDo(new THREE.Vector3(-2.5, 0, 2.5), () => setPanel('food'));
      return;
    }
    if (id === 'water') {
      walkThenDo(new THREE.Vector3(-2.2, 0, 2.5), () => {
        setCatAnim('drink');
        setTimeout(() => {
          setPet(prev => { const u = addXP({ ...prev, thirst: clamp(prev.thirst + 34), happiness: clamp(prev.happiness + 4) }, 3); return u; });
          showToast('Olajuwon drank water 💧 +34 Thirst');
          setTimeout(() => setCatAnim('idle'), 2000);
        }, 600);
      });
      return;
    }
    if (id === 'bed') {
      if (p.isSleeping) {
        setPet(prev => ({ ...prev, isSleeping: false }));
        setCatAnim('stretch');
        walkThenDo(new THREE.Vector3(1, 0, 1), () => { setCatAnim('idle'); showDialogue('Good morning ☀️'); });
      } else {
        walkThenDo(BED_POS, () => {
          setCatAnim('sleep');
          setPet(prev => ({ ...prev, isSleeping: true, sleepStartTime: new Date().toISOString() }));
          showDialogue('Goodnight... 💤', 3000);
        });
      }
      return;
    }
    if (id === 'wardrobe') {
      setPanel('wardrobe');
      return;
    }
    if (id === 'lamp') {
      setLampOn(prev => {
        const next = !prev;
        showToast(next ? '💡 Turned on the lamp! Room is bright.' : '🌑 Turned off the lamp.');
        sounds.click();
        return next;
      });
      return;
    }
    if (id === 'toys') {
      walkThenDo(new THREE.Vector3(2.2, 0, 2.6), () => {
        setCatAnim('play');
        setPet(prev => { const u = addXP({ ...prev, happiness: clamp(prev.happiness + 18), energy: clamp(prev.energy - 12) }, 10); return u; });
        showToast('Playing! 🧶 +18 Happy');
        setTimeout(() => setCatAnim('idle'), 3500);
      });
    }
  }

  function feedCat(foodId: string) {
    const food = FOOD_ITEMS.find(f => f.id === foodId);
    if (!food || !pet.foodInventory[foodId]) { showToast('No food left!'); return; }
    setPanel('none');
    setCatAnim('eat');
    setTimeout(() => {
      setPet(prev => addXP({ ...prev, hunger: clamp(prev.hunger + food.hungerBoost), happiness: clamp(prev.happiness + food.happyBoost), thirst: food.thirstBoost ? clamp(prev.thirst + food.thirstBoost) : prev.thirst, foodInventory: { ...prev.foodInventory, [foodId]: (prev.foodInventory[foodId] || 0) - 1 }, lastFed: new Date().toISOString() }, food.xp));
      showToast(`${food.emoji} ${food.name} — +${food.hungerBoost} Hunger`);
      setTimeout(() => setCatAnim('idle'), 2800);
    }, 500);
  }

  function equipItem(id: string) {
    const item = ALL_CLOTHING.find(c => c.id === id);
    if (!item) return;
    setPet(prev => {
      const eq = { ...prev.equippedClothing };
      if (eq[item.slot] === id) { delete eq[item.slot]; showToast(`Removed ${item.name}`); }
      else { eq[item.slot] = id; showToast(`${item.emoji} Equipped ${item.name}`); }
      return { ...prev, equippedClothing: eq };
    });
  }

  function handleCatTap() {
    if (pet.isSleeping) { showDialogue('*snores softly* 💤'); return; }
    const n = tapCount + 1; setTapCount(n);
    const r: Array<() => void> = [
      () => { setCatAnim('happy'); showDialogue('Purrrr 💛'); setPet(p => addXP({ ...p, affection: clamp(p.affection + 8), happiness: clamp(p.happiness + 6) }, 4)); },
      () => { setCatAnim('play'); showDialogue('Play with me!'); setTimeout(() => setCatAnim('idle'), 1500); },
      () => { showDialogue('*head bumps you*'); },
      () => { showDialogue('Meow.'); },
      () => { showDialogue('*walks away*'); walkThenDo(new THREE.Vector3(catTarget.x + 1.5, 0, catTarget.z), () => setCatAnim('idle')); setTapCount(0); },
    ];
    r[Math.min(n - 1, r.length - 1)]();
  }

  const xpPct      = Math.round((pet.xp / pet.xpToNext) * 100);
  const levelLabel = LEVEL_NAMES[pet.level] || 'Legend';

  // ── Time-based greeting ────────────────────────────────────────
  const greetings: Record<TOD, string> = {
    morning:   `Good morning, Simi! ☀️`,
    afternoon: `Good afternoon, Simi! 🌤️`,
    evening:   `Good evening, Simi! 🌅`,
    night:     `Sweet dreams, Simi! 🌙`,
  };
  const greeting = greetings[tod];

  // ── Buy food from shop ─────────────────────────────────────────
  const buyFood = (foodId: string) => {
    const food = FOOD_ITEMS.find(f => f.id === foodId) as any;
    if (!food || !food.cost) return;
    if (pet.coins < food.cost) { showToast(`Not enough coins! Need 🪙${food.cost}`); return; }
    setPet(prev => ({
      ...prev,
      coins: prev.coins - food.cost,
      foodInventory: { ...prev.foodInventory, [foodId]: (prev.foodInventory[foodId] || 0) + 1 },
    }));
    showToast(`Bought ${food.emoji} ${food.name}! 🪙-${food.cost}`);
  };

  // ── Cook food ──────────────────────────────────────────────────
  const startCooking = (foodId: string) => {
    const food = FOOD_ITEMS.find(f => f.id === foodId) as any;
    if (!food || !food.cookable) { feedCat(foodId); return; }
    if (!pet.foodInventory[foodId] || pet.foodInventory[foodId] <= 0) { showToast(`No ${food.name} to cook!`); return; }
    setPanel('cooking');
    setCookingFood(foodId);
    setCookProgress(0);
    const total = (food.cookTime || 3) * 1000;
    const interval = setInterval(() => {
      setCookProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setPanel('none');
            setCookingFood(null);
            setCookProgress(0);
            feedCat(foodId);
          }, 500);
          return 100;
        }
        return p + (100 / (total / 100));
      });
    }, 100);
  };

  // ── Equip item with visual feedback ───────────────────────────
  const equipItemWithFeedback = (id: string) => {
    const item = ALL_CLOTHING.find(c => c.id === id);
    if (!item) return;
    setPet(prev => {
      const eq = { ...prev.equippedClothing } as Record<string, string>;
      if (eq[item.slot] === id) { 
        delete eq[item.slot]; 
        showToast(`Removed ${item.name}`); 
      } else { 
        eq[item.slot] = id; 
        showToast(`${item.emoji} Olajuwon is wearing ${item.name}!`); 
      }
      return { ...prev, equippedClothing: eq };
    });
  };

  // ── Get visual clothing on cat ────────────────────────────────
  const catClothingDisplay = (() => {
    const layers: string[] = [];
    const eq = pet.equippedClothing as Record<string, string>;
    if (eq.collar) { const c = ALL_CLOTHING.find(x => x.id === eq.collar); if (c) layers.push(c.emoji); }
    if (eq.shirt)  { const c = ALL_CLOTHING.find(x => x.id === eq.shirt);  if (c) layers.push(c.emoji); }
    if (eq.hat)    { const c = ALL_CLOTHING.find(x => x.id === eq.hat);    if (c) layers.push(c.emoji); }
    if (eq.accessory) { const c = ALL_CLOTHING.find(x => x.id === eq.accessory); if (c) layers.push(c.emoji); }
    return layers;
  })();

  // Camera: closer on mobile portrait (detected via window width at render time)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const camPos: [number, number, number] = isMobile
    ? [0, 5.5, 11.0]   // pulled back + higher for portrait
    : tod === 'night'
      ? [0, 4.5, 8.5]
      : [0, 4.0, 9.0];

  const S = {
    // Root container
    root: {
      position: 'relative' as const,
      width: '100%',
      height: '100%',
      background: '#050302',
      fontFamily: 'var(--font-poppins), sans-serif',
      userSelect: 'none' as const,
      overflowX: 'hidden' as const,
    },

    // Top HUD
    topHud: {
      position: 'absolute' as const,
      top: 0, left: 0, right: 0,
      zIndex: 100,
      background: 'linear-gradient(to bottom, rgba(4,2,1,0.92), transparent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '8px 10px 20px' : '10px 16px 26px',
      gap: 6,
    },

    backBtn: {
      background: 'rgba(10,8,6,0.85)',
      border: '1px solid rgba(200,168,48,0.25)',
      borderRadius: 20,
      padding: isMobile ? '5px 10px' : '5px 14px',
      color: 'rgba(200,168,48,0.8)',
      cursor: 'pointer',
      fontSize: isMobile ? 11 : 12,
      fontWeight: 700,
      flexShrink: 0,
    },

    levelBadge: {
      textAlign: 'center' as const,
      flex: 1,
      minWidth: 0,
    },

    coins: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-end',
      gap: 2,
      flexShrink: 0,
    },

    // Needs strip
    needsStrip: {
      position: 'absolute' as const,
      bottom: 0, left: 0, right: 0,
      zIndex: 100,
      background: 'linear-gradient(to top, rgba(4,2,1,0.96), transparent)',
      display: 'flex',
      gap: isMobile ? 5 : 10,
      justifyContent: 'center',
      alignItems: 'center',
      padding: isMobile ? '18px 8px 10px' : '22px 16px 10px',
      flexWrap: 'nowrap' as const,
      overflowX: 'auto' as const,
    },

    // Food panel — slides up from bottom, full-width on mobile
    foodPanel: {
      position: 'absolute' as const,
      bottom: isMobile ? 0 : 48,
      left: isMobile ? 0 : '50%',
      right: isMobile ? 0 : 'auto',
      transform: isMobile ? undefined : 'translateX(-50%)',
      background: 'rgba(10,8,6,0.99)',
      border: '1px solid rgba(200,168,48,0.22)',
      borderRadius: isMobile ? '20px 20px 0 0' : 18,
      padding: isMobile ? '16px 16px 24px' : '16px 20px',
      zIndex: 160,
      minWidth: isMobile ? undefined : 290,
      boxShadow: '0 -8px 40px rgba(0,0,0,0.85)',
    },

    // Wardrobe — bottom sheet on mobile, side panel on desktop
    wardrobePanel: {
      position: 'absolute' as const,
      ...(isMobile
        ? { bottom: 0, left: 0, right: 0, maxHeight: '70vh', borderRadius: '20px 20px 0 0', borderLeft: 'none', borderTop: '1px solid rgba(200,168,48,0.18)' }
        : { top: 48, right: 0, bottom: 48, width: 220, borderLeft: '1px solid rgba(200,168,48,0.14)' }
      ),
      background: 'rgba(10,8,6,0.99)',
      overflowY: 'auto' as const,
      zIndex: 160,
      padding: isMobile ? '14px 14px 28px' : 14,
    },
  };

  return (
    <div style={S.root}>

      {/* ── 3D CANVAS ── */}
      <Canvas
        shadows
        style={{ position: 'absolute', inset: 0 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, isMobile ? 1.5 : 2]}
      >
        <PerspectiveCamera makeDefault position={camPos} fov={isMobile ? 60 : 50} />
        <OrbitControls
          target={[0, 0.8, 0]}
          maxPolarAngle={Math.PI / 2.15}
          minPolarAngle={Math.PI / 5}
          maxAzimuthAngle={isMobile ? Math.PI / 3 : Math.PI / 4}
          minAzimuthAngle={isMobile ? -Math.PI / 3 : -Math.PI / 4}
          enableZoom
          minDistance={isMobile ? 5 : 5}
          maxDistance={isMobile ? 16 : 13}
          enablePan={false}
          dampingFactor={0.08}
          enableDamping
          touches={{ ONE: 2, TWO: 1 } as any}
        />
        <fog attach="fog" args={['#050302', 14, 24]} />
        <Suspense fallback={null}>
          <Scene
            tod={tod}
            lampOn={lampOn}
            catTarget={catTarget}
            catAnim={catAnim}
            isSleeping={pet.isSleeping}
            onCatReached={handleCatReached}
            onCatTap={handleCatTap}
            onClickFloor={handleFloorClick}
            onClickObject={handleObject}
            equipped={pet.equippedClothing}
          />
        </Suspense>
      </Canvas>

      {/* ── AMBIENT NIGHT LAMP GLOW OVERLAY ── */}
      {lampOn && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 10,
            background: 'radial-gradient(circle at 65% 45%, rgba(255, 190, 70, 0.18) 0%, rgba(255, 140, 30, 0.09) 55%, transparent 85%)',
            mixBlendMode: 'screen',
            transition: 'opacity 0.6s ease',
          }}
        />
      )}

      {/* ── DIALOGUE BUBBLE ── */}
      <AnimatePresence>
        {dialogue && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              position: 'absolute',
              top: isMobile ? '22%' : '30%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(10,8,6,0.95)',
              border: '1px solid rgba(200,168,48,0.35)',
              color: '#e8d4a0',
              padding: isMobile ? '6px 14px' : '7px 16px',
              borderRadius: 14,
              fontSize: isMobile ? 11 : 12,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              zIndex: 50,
              boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
              pointerEvents: 'none',
            }}
          >{dialogue}</motion.div>
        )}
      </AnimatePresence>

      {/* ── RETURN BANNER ── */}
      <AnimatePresence>
        {returnMsg && (
          <motion.div
            initial={{ opacity: 0, y: -28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            onClick={() => setReturn('')}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, zIndex: 130,
              background: 'rgba(10,8,6,0.97)',
              borderBottom: '1px solid rgba(200,168,48,0.22)',
              color: '#e8d4a0',
              padding: isMobile ? '8px 16px' : '10px 20px',
              textAlign: 'center',
              fontSize: isMobile ? 12 : 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {returnMsg} <span style={{ opacity: 0.4, fontSize: 10 }}>· tap to close</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOAST ── */}
      <AnimatePresence>{toast && <Toast msg={toast} onDone={() => setToast('')} />}</AnimatePresence>

      {/* ── TOP HUD ── */}
      <div style={S.topHud}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <motion.button onClick={onBack} whileHover={{ x: -3 }} style={S.backBtn}>
            ← Back
          </motion.button>

          {/* Lamp Control Toggle Button */}
          <motion.button
            onClick={() => {
              setLampOn(prev => {
                const next = !prev;
                showToast(next ? '💡 Turned on the lamp! Room is bright.' : '🌑 Turned off the lamp.');
                sounds.click();
                return next;
              });
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: lampOn 
                ? 'linear-gradient(135deg, rgba(255, 180, 50, 0.4), rgba(255, 215, 0, 0.25))' 
                : 'rgba(10,8,6,0.85)',
              border: lampOn ? '1px solid rgba(255, 215, 0, 0.8)' : '1px solid rgba(200,168,48,0.25)',
              borderRadius: 20,
              padding: isMobile ? '4px 8px' : '5px 12px',
              color: lampOn ? '#ffe680' : 'rgba(200,168,48,0.8)',
              cursor: 'pointer',
              fontSize: isMobile ? 10.5 : 12,
              fontWeight: 700,
              boxShadow: lampOn ? '0 0 16px rgba(255, 180, 50, 0.45)' : 'none',
              transition: 'all 0.3s ease',
            }}
            title="Click to turn lamp ON/OFF"
          >
            <span>{lampOn ? '💡' : '🕯️'}</span>
            <span>{lampOn ? 'Lamp ON' : 'Lamp OFF'}</span>
          </motion.button>
        </div>

        <div style={S.levelBadge}>
          {/* Time-based greeting with Nigeria Time */}
          <div style={{ fontSize: 9, color: 'rgba(200,168,48,0.7)', letterSpacing: '0.04em', marginBottom: 2 }}>
            �� Nigeria {nigeriaTime.timeStr} ({nigeriaTime.isNight ? 'Night' : 'Day'}) · {greeting}
          </div>
          <div style={{ fontSize: isMobile ? 11 : 12, color: '#e8d4a0', fontWeight: 700, letterSpacing: '0.08em' }}>
            OLAJUWON
          </div>
          {/* Equipped clothing display */}
          {catClothingDisplay.length > 0 && (
            <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginTop: 4 }}>
              {catClothingDisplay.map((emoji, i) => (
                <span key={i} style={{ fontSize: 14, lineHeight: 1 }}>{emoji}</span>
              ))}
            </div>
          )}
          <div style={{ width: isMobile ? 80 : 110, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden', margin: '4px auto 0' }}>
            <motion.div animate={{ width: `${xpPct}%` }} style={{ height: '100%', background: 'linear-gradient(90deg,#c8a830,#e8d080)', borderRadius: 2 }} />
          </div>
        </div>

        <div style={S.coins}>
          <span style={{ fontSize: isMobile ? 11 : 12, color: '#c8a830', fontWeight: 700 }}>🪙 {pet.coins}</span>
          <span style={{ fontSize: isMobile ? 10 : 11, color: '#e05858', fontWeight: 600 }}>🔥 {pet.streak}d</span>
        </div>
      </div>

      {/* ── NEEDS STRIP + QUICK ACTIONS ── */}
      <div style={S.needsStrip}>
        <NeedPip icon="🍗" val={pet.hunger}    col="#c8a830" />
        <NeedPip icon="💧" val={pet.thirst}    col="#5a9abf" />
        <NeedPip icon="😊" val={pet.happiness} col="#d4a040" />
        <NeedPip icon="⚡" val={pet.energy}    col="#8a7ade" />
        <NeedPip icon="✨" val={pet.hygiene}   col="#5aaa8a" />
        {/* Separator */}
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
        {/* Quick action buttons */}
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={() => handleObject('food')}
          style={{ background: 'rgba(200,168,48,0.1)', border: '1px solid rgba(200,168,48,0.22)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 11, color: '#c8a830', fontWeight: 700, flexShrink: 0 }}>
          🍽️
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={() => setPanel('shop')}
          style={{ background: 'rgba(200,168,48,0.1)', border: '1px solid rgba(200,168,48,0.22)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 11, color: '#c8a830', fontWeight: 700, flexShrink: 0 }}>
          🛍️
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={() => handleObject('wardrobe')}
          style={{ background: 'rgba(200,168,48,0.1)', border: '1px solid rgba(200,168,48,0.22)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 11, color: '#c8a830', fontWeight: 700, flexShrink: 0 }}>
          👗
        </motion.button>
      </div>

      {/* ── SLEEPING INDICATOR ── */}
      {pet.isSleeping && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 80, pointerEvents: 'none', textAlign: 'center' }}>
          <motion.div
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3.5, repeat: Infinity }}
            style={{ color: 'rgba(160,140,210,0.7)', fontSize: isMobile ? 11 : 13, fontWeight: 500, letterSpacing: '0.04em' }}
          >
            Olajuwon is sleeping 💤<br />
            <span style={{ fontSize: 9, opacity: 0.6 }}>Tap the bed to wake him</span>
          </motion.div>
        </div>
      )}

      {/* ── FOOD PANEL ── */}
      <AnimatePresence>
        {panel === 'food' && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            style={S.foodPanel}
          >
            {/* Drag handle on mobile */}
            {isMobile && (
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(200,168,48,0.3)', margin: '0 auto 14px' }} />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ color: '#e8d4a0', fontSize: isMobile ? 14 : 13, fontWeight: 700 }}>🍽️ Feed Olajuwon</span>
              <button onClick={() => setPanel('none')} style={{ background: 'none', border: 'none', color: 'rgba(200,168,48,0.5)', cursor: 'pointer', fontSize: 24, lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: isMobile ? 6 : 8 }}>
              {FOOD_ITEMS.map(food => {
                const qty = pet.foodInventory[food.id] || 0;
                const isCookable = (food as any).cookable;
                return (
                  <div key={food.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {/* Food card */}
                    <div style={{
                      background: qty > 0 ? 'rgba(200,168,48,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${qty > 0 ? 'rgba(200,168,48,0.3)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: 12, padding: isMobile ? '10px 4px 6px' : '8px 4px 5px',
                      opacity: qty > 0 ? 1 : 0.32, textAlign: 'center' as const,
                    }}>
                      <div style={{ fontSize: isMobile ? 24 : 20 }}>{food.emoji}</div>
                      <div style={{ fontSize: 8, color: '#c8a830', marginTop: 2 }}>{food.name}</div>
                      <div style={{ fontSize: 8, color: qty > 0 ? '#e8d4a0' : 'rgba(255,255,255,0.22)' }}>×{qty}</div>
                    </div>
                    {/* Eat / Cook buttons */}
                    {qty > 0 && (
                      <div style={{ display: 'flex', gap: 3 }}>
                        <motion.button whileTap={{ scale: 0.9 }}
                          onClick={() => feedCat(food.id)}
                          style={{ flex: 1, background: 'rgba(200,168,48,0.15)', border: 'none', borderRadius: 6, padding: '4px 2px', cursor: 'pointer', fontSize: 8, color: '#e8d4a0', fontWeight: 600 }}>
                          Eat
                        </motion.button>
                        {isCookable && (
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => startCooking(food.id)}
                            style={{ flex: 1, background: 'rgba(255,120,30,0.2)', border: 'none', borderRadius: 6, padding: '4px 2px', cursor: 'pointer', fontSize: 8, color: '#ffb060', fontWeight: 600 }}>
                            🔥 Cook
                          </motion.button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Shop link */}
            <div style={{ marginTop: 10, textAlign: 'center' as const }}>
              <button onClick={() => setPanel('shop')}
                style={{ background: 'transparent', border: '1px solid rgba(200,168,48,0.22)', borderRadius: 20, padding: '5px 16px', color: 'rgba(200,168,48,0.6)', fontSize: 10, cursor: 'pointer', fontWeight: 600 }}>
                🛍️ Buy more food
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── WARDROBE PANEL — enhanced with outfit preview ── */}
      <AnimatePresence>
        {panel === 'wardrobe' && (
          <motion.div
            initial={{ opacity: 0, y: isMobile ? 60 : 0, x: isMobile ? 0 : 56 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: isMobile ? 60 : 0, x: isMobile ? 0 : 56 }}
            style={S.wardrobePanel}
          >
            {isMobile && (
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(200,168,48,0.3)', margin: '0 auto 12px' }} />
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ color: '#e8d4a0', fontSize: 14, fontWeight: 700 }}>👗 Olajuwon&apos;s Wardrobe</span>
              <button onClick={() => setPanel('none')} style={{ background: 'none', border: 'none', color: 'rgba(200,168,48,0.5)', cursor: 'pointer', fontSize: 24, lineHeight: 1 }}>×</button>
            </div>

            {/* Currently wearing */}
            <div style={{ background: 'rgba(200,168,48,0.06)', border: '1px solid rgba(200,168,48,0.15)', borderRadius: 12, padding: '8px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
              <span style={{ fontSize: 10, color: 'rgba(200,168,48,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', flexShrink: 0 }}>Wearing:</span>
              {Object.entries(pet.equippedClothing).map(([slot, id]) => {
                const item = ALL_CLOTHING.find(c => c.id === id);
                if (!item) return null;
                return (
                  <motion.button key={slot} whileTap={{ scale: 0.9 }}
                    onClick={() => equipItem(id)}
                    title={`Remove ${item.name}`}
                    style={{ background: 'rgba(200,168,48,0.12)', border: '1px solid rgba(200,168,48,0.25)', borderRadius: 8, padding: '3px 8px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {item.emoji} <span style={{ fontSize: 9, color: '#c8a830' }}>{item.name}</span>
                    <span style={{ fontSize: 9, color: 'rgba(200,168,48,0.4)', marginLeft: 2 }}>✕</span>
                  </motion.button>
                );
              })}
              {Object.keys(pet.equippedClothing).length === 0 && (
                <span style={{ fontSize: 10, color: 'rgba(200,168,48,0.3)', fontStyle: 'italic' }}>Nothing equipped</span>
              )}
            </div>

            {/* Tabs — all 5 slots */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' as const }}>
              {(['hat','collar','shirt','accessory','special'] as WTab[]).map(t => (
                <button key={t} onClick={() => setWTab(t)}
                  style={{
                    flex: '1 1 auto', padding: '6px 4px', fontSize: 9, fontWeight: 700,
                    textTransform: 'uppercase' as const, letterSpacing: '0.05em', cursor: 'pointer',
                    background: wTab === t ? 'rgba(200,168,48,0.22)' : 'transparent',
                    border: `1px solid ${wTab === t ? 'rgba(200,168,48,0.5)' : 'rgba(200,168,48,0.1)'}`,
                    borderRadius: 8, color: wTab === t ? '#c8a830' : 'rgba(200,168,48,0.4)',
                    transition: 'all 0.18s',
                    whiteSpace: 'nowrap' as const,
                  }}
                >{t === 'accessory' ? 'Acc.' : t}</button>
              ))}
            </div>

            {/* Items grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7, maxHeight: isMobile ? '40vh' : '50vh', overflowY: 'auto' as const }}>
              {ALL_CLOTHING.filter(c => c.slot === wTab).map(item => {
                const unlocked = pet.unlockedClothing.includes(item.id);
                const isOn     = pet.equippedClothing[item.slot as ClothingSlot] === item.id;
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: unlocked ? 1.07 : 1, y: unlocked ? -2 : 0 }}
                    whileTap={{ scale: unlocked ? 0.93 : 1 }}
                    onClick={() => unlocked && equipItemWithFeedback(item.id)}
                    title={unlocked ? `${isOn ? 'Remove' : 'Equip'} ${item.name}` : `Unlocks at Level ${item.unlockLevel}`}
                    style={{
                      background: isOn ? `${item.color}28` : unlocked ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.18)',
                      border: `1.5px solid ${isOn ? (item.color || '#c8a830') : unlocked ? 'rgba(200,168,48,0.16)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: 11, padding: '10px 4px 7px', cursor: unlocked ? 'pointer' : 'not-allowed',
                      opacity: unlocked ? 1 : 0.35, textAlign: 'center' as const,
                      boxShadow: isOn ? `0 0 14px ${item.color || '#c8a830'}44` : 'none',
                      transition: 'all 0.2s',
                      position: 'relative' as const,
                    }}
                  >
                    {isOn && (
                      <div style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: '#c8a830', boxShadow: '0 0 6px #c8a830' }} />
                    )}
                    <div style={{ fontSize: 22 }}>{unlocked ? item.emoji : '🔒'}</div>
                    <div style={{ fontSize: 8, color: unlocked ? '#c8a830' : 'rgba(255,255,255,0.2)', marginTop: 3, lineHeight: 1.2 }}>
                      {unlocked ? item.name : `Lv.${item.unlockLevel}`}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Quick buy unlocks hint */}
            <div style={{ marginTop: 10, textAlign: 'center' as const }}>
              <button onClick={() => setPanel('shop')}
                style={{ background: 'rgba(200,168,48,0.1)', border: '1px solid rgba(200,168,48,0.25)', borderRadius: 20, padding: '5px 16px', color: 'rgba(200,168,48,0.7)', fontSize: 10, cursor: 'pointer', fontWeight: 600 }}>
                🛍️ Buy more in Shop
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SHOP PANEL ── */}
      <AnimatePresence>
        {panel === 'shop' && (
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            style={{ ...S.foodPanel, minWidth: isMobile ? undefined : 340 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: '#e8d4a0', fontSize: 14, fontWeight: 700 }}>🛍️ Food Shop</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#c8a830', fontWeight: 700 }}>🪙 {pet.coins}</span>
                <button onClick={() => setPanel('none')} style={{ background: 'none', border: 'none', color: 'rgba(200,168,48,0.5)', cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>×</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
              {FOOD_ITEMS.map(food => {
                const qty = pet.foodInventory[food.id] || 0;
                const canAfford = pet.coins >= (food as any).cost;
                return (
                  <motion.button key={food.id}
                    whileHover={{ scale: canAfford ? 1.05 : 1 }} whileTap={{ scale: canAfford ? 0.95 : 1 }}
                    onClick={() => {
                      if (!canAfford) { showToast(`Need 🪙${(food as any).cost} coins!`); return; }
                      setPet(prev => ({
                        ...prev,
                        coins: prev.coins - (food as any).cost,
                        foodInventory: { ...prev.foodInventory, [food.id]: (prev.foodInventory[food.id] || 0) + 1 },
                      }));
                      showToast(`Bought ${food.emoji} ${food.name}!`);
                    }}
                    disabled={!canAfford}
                    style={{
                      background: canAfford ? 'rgba(200,168,48,0.1)' : 'rgba(0,0,0,0.2)',
                      border: `1px solid ${canAfford ? 'rgba(200,168,48,0.3)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: 12, padding: '10px 6px', cursor: canAfford ? 'pointer' : 'not-allowed',
                      opacity: canAfford ? 1 : 0.45, textAlign: 'center' as const,
                    }}
                  >
                    <div style={{ fontSize: 24 }}>{food.emoji}</div>
                    <div style={{ fontSize: 9, color: '#e8d4a0', marginTop: 3, fontWeight: 600 }}>{food.name}</div>
                    <div style={{ fontSize: 9, color: '#c8a830', marginTop: 2 }}>🪙 {(food as any).cost}</div>
                    <div style={{ fontSize: 8, color: 'rgba(200,168,48,0.4)', marginTop: 1 }}>In stock: {qty}</div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── COOKING PANEL ── */}
      <AnimatePresence>
        {panel === 'cooking' && cookingFood && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              background: 'rgba(12,9,6,0.98)', border: '1px solid rgba(200,168,48,0.3)',
              borderRadius: 20, padding: '28px 32px', zIndex: 180, textAlign: 'center',
              minWidth: 240, boxShadow: '0 12px 50px rgba(0,0,0,0.8)',
            }}
          >
            {(() => {
              const food = FOOD_ITEMS.find(f => f.id === cookingFood)!;
              return (
                <>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>
                    {cookProgress < 100 ? food.emoji : (food as any).cookedEmoji || food.emoji}
                  </div>
                  <div style={{ color: '#e8d4a0', fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
                    {cookProgress < 100 ? `Cooking ${food.name}...` : `${food.name} is ready! 🎉`}
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden', marginBottom: 14 }}>
                    <motion.div
                      animate={{ width: `${cookProgress}%` }}
                      transition={{ duration: 0.3 }}
                      style={{ height: '100%', borderRadius: 6, background: 'linear-gradient(90deg, #ff8030, #ffd060)', boxShadow: '0 0 10px #ff8030' }}
                    />
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(200,168,48,0.5)', marginBottom: cookProgress < 100 ? 0 : 12 }}>
                    {cookProgress < 100 ? `${Math.round(cookProgress)}%` : 'Ready to serve!'}
                  </div>
                  {cookProgress >= 100 && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setPanel('none');
                        setCookingFood(null);
                        setCookProgress(0);
                        // Feed the cat with the cooked meal
                        setCatAnim('eat');
                        setPet(prev => {
                          const updated = addXP({
                            ...prev,
                            hunger: clamp(prev.hunger + food.hungerBoost + 10),
                            happiness: clamp(prev.happiness + food.happyBoost + 5),
                            foodInventory: { ...prev.foodInventory, [food.id]: Math.max(0, (prev.foodInventory[food.id] || 0) - 1) },
                            lastFed: new Date().toISOString(),
                          }, food.xp + 5);
                          return updated;
                        });
                        showToast(`🍽️ Olajuwon loved the cooked ${food.name}! +${food.hungerBoost + 10} Hunger`);
                        setTimeout(() => { setCatAnim('idle'); }, 3000);
                      }}
                      style={{ background: 'linear-gradient(135deg, #ff8030, #ffd060)', border: 'none', borderRadius: 20, padding: '9px 24px', color: '#0a0806', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                    >
                      Serve to Olajuwon 🍽️
                    </motion.button>
                  )}
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BACKDROP for panels on mobile ── */}
      <AnimatePresence>
        {panel !== 'none' && isMobile && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPanel('none')}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 155, backdropFilter: 'blur(2px)' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
