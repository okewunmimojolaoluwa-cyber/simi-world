'use client';

/**
 * DigitalPetMobile — Full-screen mobile pet game.
 * Renders a beautiful 2D room scene with animated CSS/SVG cat.
 * All game logic (state, needs, persistence) is shared with desktop.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  loadPet, savePet, addXP, checkDailyVisit,
  ALL_CLOTHING, FOOD_ITEMS, LEVEL_NAMES,
  type PetSaveData, type ClothingSlot,
} from '@/lib/petPersistence';
import CatIcon from '@/components/world/CatIcon';

interface Props {
  onBack: () => void;
}

type Panel = 'none' | 'food' | 'wardrobe' | 'action';
type WTab  = 'hat' | 'collar' | 'shirt' | 'accessory';
type CatMood = 'happy' | 'neutral' | 'sleepy' | 'hungry' | 'playful';

const clamp = (v: number) => Math.max(0, Math.min(100, v));

function getMood(p: PetSaveData): CatMood {
  if (p.isSleeping) return 'sleepy';
  if (p.hunger < 25 || p.thirst < 25) return 'hungry';
  if (p.energy < 20) return 'sleepy';
  if (p.happiness > 75) return 'happy';
  return 'neutral';
}

function getHour() { return new Date().getHours(); }
function isNight()  { const h = getHour(); return h >= 20 || h < 6; }
function isEvening(){ const h = getHour(); return h >= 17 && h < 20; }

/* ── Tiny stat pip ─────────────────────────────────────────────── */
function Pip({ icon, val, col }: { icon: string; val: number; col: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div style={{ width: 32, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div animate={{ width: `${val}%` }} transition={{ duration: 0.7 }}
          style={{ height: '100%', background: val < 28 ? '#e05858' : col, borderRadius: 3 }} />
      </div>
    </div>
  );
}

/* ── Toast ─────────────────────────────────────────────────────── */
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div initial={{ opacity: 0, y: -16, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', background: 'rgba(10,8,6,0.96)', border: '1px solid rgba(200,168,48,0.3)', color: '#e8d4a0', padding: '8px 20px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', zIndex: 200, pointerEvents: 'none', boxShadow: '0 6px 24px rgba(0,0,0,0.5)' }}>
      {msg}
    </motion.div>
  );
}

/* ── Room background ───────────────────────────────────────────── */
function MobileRoom({ isSleeping, onFloorTap }: { isSleeping: boolean; onFloorTap: () => void }) {
  // Read time only on client to avoid SSR hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const night   = mounted ? isNight()   : false;
  const evening = mounted ? isEvening() : false;
  const lampOn  = night || evening;

  // Sky gradient colours — used in SVG linearGradient, NOT as CSS strings
  const skyTop = night   ? '#050818' : evening ? '#c06030' : '#6ab0e0';
  const skyBot = night   ? '#0d1530' : evening ? '#e08040' : '#a8d4f0';

  return (
    <svg viewBox="0 0 390 600" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="mWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isSleeping ? '#0a0808' : '#1a1410'} />
          <stop offset="100%" stopColor={isSleeping ? '#120e0c' : '#231a14'} />
        </linearGradient>
        <linearGradient id="mFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a1f14" />
          <stop offset="100%" stopColor="#1a1210" />
        </linearGradient>
        <linearGradient id="mSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="100%" stopColor={skyBot} />
        </linearGradient>
        <radialGradient id="lampGlow" cx="50%" cy="0%">
          <stop offset="0%" stopColor="rgba(200,140,60,0.45)" />
          <stop offset="100%" stopColor="rgba(200,140,60,0)" />
        </radialGradient>
        <radialGradient id="moonGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="rgba(160,180,255,0.25)" />
          <stop offset="100%" stopColor="rgba(160,180,255,0)" />
        </radialGradient>
      </defs>

      {/* Wall */}
      <rect x="0" y="0" width="390" height="390" fill="url(#mWall)" />

      {/* Floor — interactive */}
      <rect x="0" y="390" width="390" height="210" fill="url(#mFloor)" onClick={onFloorTap} style={{ cursor: 'crosshair' }} />
      {[400, 420, 440, 460, 480, 500, 520].map(y => <line key={y} x1="0" y1={y} x2="390" y2={y} stroke="#3a2a18" strokeWidth="1" opacity="0.5" />)}

      {/* Rug */}
      <ellipse cx="195" cy="490" rx="160" ry="45" fill="#4a1a14" opacity="0.6" />
      <ellipse cx="195" cy="490" rx="148" ry="38" fill="none" stroke="#6a2a24" strokeWidth="2" opacity="0.5" />

      {/* WINDOW — uses SVG gradient, not CSS */}
      <rect x="120" y="30" width="150" height="140" fill="url(#mSky)" />
      {/* City at night */}
      {night && (
        <g>
          {([[130, 95, 25, 65],[160, 110, 20, 50],[185, 90, 25, 70],[215, 100, 20, 60],[240, 85, 25, 75]] as number[][]).map(([x,y,w,h],i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} fill="#080812" />
              {[0,1,2].map(r => [0,1].map(c => {
                // Deterministic opacity using position — no Math.random()
                const op = ((i + r + c) % 3 === 0) ? 0.9 : ((i + r * 2 + c) % 2 === 0) ? 0.7 : 0.5;
                return <rect key={`${r}-${c}`} x={x+3+c*9} y={y+5+r*14} width={5} height={6} fill="#f0c840" opacity={op} />;
              }))}
            </g>
          ))}
        </g>
      )}
      {/* Moon */}
      {night && <circle cx="240" cy="60" r="18" fill="#e8e4d8" opacity="0.9" />}
      {night && <ellipse cx="240" cy="60" rx="50" ry="50" fill="url(#moonGlow)" />}
      {/* Window frame */}
      <rect x="120" y="30" width="150" height="140" fill="none" stroke="#3d2c1e" strokeWidth="6" />
      <line x1="195" y1="30" x2="195" y2="170" stroke="#3d2c1e" strokeWidth="5" />
      <line x1="120" y1="100" x2="270" y2="100" stroke="#3d2c1e" strokeWidth="5" />
      {/* Curtains */}
      <path d="M 120 30 Q 100 70 105 170 Q 112 145 120 170 L 120 30 Z" fill="#261c14" opacity="0.92" />
      <path d="M 270 30 Q 290 70 285 170 Q 278 145 270 170 L 270 30 Z" fill="#261c14" opacity="0.92" />

      {/* LAMP GLOW */}
      {lampOn && <ellipse cx="340" cy="250" rx="80" ry="120" fill="url(#lampGlow)" />}

      {/* BED (right side) */}
      {/* Headboard */}
      <rect x="250" y="220" width="135" height="120" rx="8" fill="#16120e" />
      <rect x="256" y="226" width="123" height="108" rx="6" fill="none" stroke="#2e2418" strokeWidth="1.5" />
      {/* Mattress */}
      <rect x="244" y="332" width="141" height="70" rx="5" fill="#1c1814" />
      <rect x="248" y="336" width="133" height="62" rx="3" fill="#e8e0d0" opacity={isSleeping ? 0.7 : 0.88} />
      {/* Blanket */}
      <rect x="248" y="358" width="133" height="34" rx="3" fill="#2a2030" />
      {/* Pillow */}
      <rect x="254" y="339" width="60" height="26" rx="6" fill="#f0ece4" />
      <rect x="320" y="339" width="54" height="26" rx="6" fill="#f0ece4" />
      {/* Bedside table */}
      <rect x="390" y="340" width="0" height="60" rx="3" fill="#2a1c12" />

      {/* FLOOR LAMP */}
      <rect x="40" y="280" width="4" height="110" rx="2" fill="#3a2c20" />
      <path d="M 20 280 Q 42 268 64 280 Z" fill="#2e2218" />
      <ellipse cx="42" cy="278" rx="16" ry="6" fill={lampOn ? '#ffc850' : '#1c1610'} opacity={lampOn ? 0.85 : 0.4} />

      {/* FOOD STATION */}
      <ellipse cx="90" cy="545" rx="44" ry="15" fill="#1e1810" stroke="#2e2218" strokeWidth="1.5" />
      <ellipse cx="78" cy="542" rx="15" ry="6" fill="#2a2418" stroke="#c8a030" strokeWidth="1.5" />
      <ellipse cx="78" cy="539" rx="12" ry="4" fill="#161210" />
      <text x="78" y="542" textAnchor="middle" fontSize="9" style={{ userSelect: 'none' }}>🐟</text>
      <ellipse cx="103" cy="542" rx="13" ry="5.5" fill="#1a2a3a" stroke="#4a8aaa" strokeWidth="1.5" />
      <text x="103" y="544" textAnchor="middle" fontSize="9" style={{ userSelect: 'none' }}>💧</text>

      {/* TOY BASKET */}
      <ellipse cx="310" cy="555" rx="30" ry="12" fill="#5a3820" />
      <rect x="280" y="535" width="60" height="24" rx="4" fill="#4a2e14" stroke="#5a3820" strokeWidth="1.5" />
      <text x="310" y="549" textAnchor="middle" fontSize="14" style={{ userSelect: 'none' }}>🧶</text>

      {/* Wall art */}
      <rect x="20" y="40" width="70" height="55" rx="5" fill="#0e0c0a" stroke="rgba(200,168,48,0.25)" strokeWidth="1.5" />
      <text x="55" y="73" textAnchor="middle" fontSize="22" opacity="0.25" style={{ userSelect: 'none' }}>🐾</text>

      {/* Sleeping overlay when cat sleeps */}
      {isSleeping && <rect x="0" y="0" width="390" height="600" fill="rgba(4,3,10,0.4)" />}
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export default function DigitalPetMobile({ onBack }: Props) {
  const [pet, setPet]         = useState<PetSaveData>(() => loadPet());
  const [panel, setPanel]     = useState<Panel>('none');
  const [wTab, setWTab]       = useState<WTab>('hat');
  const [toast, setToast]     = useState('');
  const [returnMsg, setReturn]= useState('');
  const [catX, setCatX]       = useState(50);  // % position on floor
  const [action, setAction]   = useState<'idle'|'walk'|'eat'|'play'|'groom'>('idle');
  const [dialogue, setDialogue] = useState('');
  const [tapCount, setTap]    = useState(0);
  const petRef = useRef(pet);
  const idleRef = useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(() => { petRef.current = pet; savePet(pet); }, [pet]);

  useEffect(() => {
    const { data, isNewDay, message } = checkDailyVisit(pet);
    if (isNewDay) { setPet(data); if (message) setReturn(message); }
  }, []); // eslint-disable-line

  // Decay every 60s
  useEffect(() => {
    const t = setInterval(() => {
      setPet(prev => {
        if (prev.isSleeping) {
          const u = { ...prev, energy: clamp(prev.energy + 2.5) };
          if (u.energy >= 96) u.isSleeping = false;
          return u;
        }
        return { ...prev, hunger: clamp(prev.hunger - 0.4), thirst: clamp(prev.thirst - 0.7), energy: clamp(prev.energy - 0.25), hygiene: clamp(prev.hygiene - 0.15) };
      });
    }, 60_000);
    return () => clearInterval(t);
  }, []);

  // Random idle
  useEffect(() => {
    const schedule = () => {
      idleRef.current = setTimeout(() => {
        if (petRef.current.isSleeping) { schedule(); return; }
        const opts = [
          { a: 'groom' as const, dlg: '...',           dur: 2500 },
          { a: 'idle'  as const, dlg: '*looks around*', dur: 2000 },
          { a: 'idle'  as const, dlg: 'Meow...',        dur: 2000 },
          { a: 'play'  as const, dlg: '✨',            dur: 2000 },
        ];
        const b = opts[Math.floor(Math.random() * opts.length)];
        setAction(b.a);
        if (b.dlg) { setDialogue(b.dlg); setTimeout(() => setDialogue(''), b.dur); }
        setTimeout(() => { setAction('idle'); schedule(); }, b.dur);
      }, 8000 + Math.random() * 12000);
    };
    schedule();
    return () => { if (idleRef.current) clearTimeout(idleRef.current); };
  }, []); // eslint-disable-line

  function showToast(msg: string) { setToast(msg); }
  function showDialogue(msg: string, dur = 2000) { setDialogue(msg); setTimeout(() => setDialogue(''), dur); }

  function handleFloorTap(e: React.MouseEvent<HTMLDivElement>) {
    if (petRef.current.isSleeping) { showDialogue('Shhh... 💤'); return; }
    if (panel !== 'none') { setPanel('none'); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = Math.max(10, Math.min(88, ((e.clientX - rect.left) / rect.width) * 100));
    setAction('walk');
    setTimeout(() => { setCatX(pct); setTimeout(() => setAction('idle'), 100); }, 500);
  }

  function handleAction(act: string) {
    setPanel('none');
    if (act === 'food') { setPanel('food'); return; }
    if (act === 'water') {
      setAction('eat');
      setPet(prev => { const u = addXP({ ...prev, thirst: clamp(prev.thirst + 34), happiness: clamp(prev.happiness + 4) }, 3); return u; });
      showToast('Olajuwon drank water 💧 +34');
      setTimeout(() => setAction('idle'), 1800);
      return;
    }
    if (act === 'sleep') {
      if (petRef.current.isSleeping) {
        setPet(prev => ({ ...prev, isSleeping: false }));
        setAction('idle'); showDialogue('Good morning ☀️');
      } else {
        setAction('idle');
        setPet(prev => ({ ...prev, isSleeping: true, sleepStartTime: new Date().toISOString() }));
        showDialogue('Goodnight 💤', 3000);
      }
      return;
    }
    if (act === 'toys') {
      setAction('play');
      setPet(prev => { const u = addXP({ ...prev, happiness: clamp(prev.happiness + 18), energy: clamp(prev.energy - 12) }, 10); return u; });
      showToast('Playing! 🧶 +18 Happy');
      setTimeout(() => setAction('idle'), 3000);
      return;
    }
    if (act === 'groom') {
      setAction('groom');
      setPet(prev => { const u = addXP({ ...prev, hygiene: clamp(prev.hygiene + 35), happiness: clamp(prev.happiness + 8) }, 8); return u; });
      showToast('Groomed! ✨ +35 Hygiene');
      setTimeout(() => setAction('idle'), 2500);
      return;
    }
    if (act === 'wardrobe') { setPanel('wardrobe'); }
  }

  function feedCat(foodId: string) {
    const food = FOOD_ITEMS.find(f => f.id === foodId);
    if (!food || !(pet.foodInventory[foodId] > 0)) { showToast(`No ${food?.name || 'food'} left!`); return; }
    setPanel('none');
    setAction('eat');
    setPet(prev => addXP({ ...prev, hunger: clamp(prev.hunger + food.hungerBoost), happiness: clamp(prev.happiness + food.happyBoost), thirst: food.thirstBoost ? clamp(prev.thirst + food.thirstBoost) : prev.thirst, foodInventory: { ...prev.foodInventory, [foodId]: prev.foodInventory[foodId] - 1 }, lastFed: new Date().toISOString() }, food.xp));
    showToast(`${food.emoji} ${food.name} — +${food.hungerBoost} Hunger`);
    setTimeout(() => setAction('idle'), 2500);
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
    if (pet.isSleeping) { showDialogue('*snores* 💤'); return; }
    const n = tapCount + 1; setTap(n);
    const r: Array<() => void> = [
      () => { showDialogue('Purrr 💛'); setPet(p => addXP({ ...p, happiness: clamp(p.happiness + 6) }, 4)); },
      () => { setAction('play'); showDialogue('Play!'); setTimeout(() => setAction('idle'), 1200); },
      () => { showDialogue('*head bumps*'); },
      () => { showDialogue('Meow.'); },
      () => { showDialogue('*walks away*'); setCatX(c => Math.min(88, c + 15)); setTap(0); },
    ];
    r[Math.min(n - 1, r.length - 1)]();
  }

  const mood     = getMood(pet);
  const levelLabel = LEVEL_NAMES[pet.level] || 'Legend';
  const xpPct    = Math.round((pet.xp / pet.xpToNext) * 100);
  const nightMode = isNight() || pet.isSleeping;

  // Cat position: if sleeping, move to bed area
  const displayX = pet.isSleeping ? 75 : catX;

  const actionButtons = [
    { id: 'food',     icon: '🍽️', label: 'Feed' },
    { id: 'water',    icon: '💧', label: 'Water' },
    { id: 'toys',     icon: '🧶', label: 'Play' },
    { id: 'groom',    icon: '✨', label: 'Groom' },
    { id: 'sleep',    icon: pet.isSleeping ? '☀️' : '🌙', label: pet.isSleeping ? 'Wake' : 'Sleep' },
    { id: 'wardrobe', icon: '👔', label: 'Dress' },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#0a0806', fontFamily: 'var(--font-poppins), sans-serif', userSelect: 'none' }}>

      {/* ── ROOM ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <MobileRoom isSleeping={pet.isSleeping} onFloorTap={() => {}} />
      </div>

      {/* ── FLOOR TAP ZONE ── */}
      <div
        onClick={handleFloorTap}
        style={{ position: 'absolute', left: 0, right: 0, top: '62%', height: '24%', zIndex: 8, cursor: 'crosshair' }}
      />

      {/* ── CAT ── */}
      <motion.div
        animate={{ left: `${displayX}%`, bottom: pet.isSleeping ? '27%' : '24%' }}
        transition={{ duration: action === 'walk' ? 0.7 : 0.4, ease: 'easeInOut' }}
        style={{ position: 'absolute', transform: 'translateX(-50%)', zIndex: 15, cursor: 'pointer' }}
        onClick={handleCatTap}
      >
        {/* Dialogue */}
        <AnimatePresence>
          {dialogue && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', bottom: '108%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(10,8,6,0.95)', border: '1px solid rgba(200,168,48,0.3)', color: '#e8d4a0', padding: '5px 12px', borderRadius: 12, fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', zIndex: 5, boxShadow: '0 4px 16px rgba(0,0,0,0.7)' }}>
              {dialogue}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CatIcon SVG — large on mobile, animated */}
        <motion.div
          animate={
            action === 'idle' ? { y: [0, -6, 0] } :
            action === 'play' ? { y: [0, -20, 0, -12, 0], rotate: [0, -5, 5, 0] } :
            action === 'eat'  ? { y: [0, 4, 0] } :
            action === 'groom'? { rotate: [0, -6, 6, 0] } :
            pet.isSleeping    ? { scaleX: 1.3, scaleY: 0.7 } : {}
          }
          transition={{ duration: action === 'play' ? 0.8 : 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <CatIcon
            size={pet.isSleeping ? 88 : 72}
            animated={!pet.isSleeping}
            style={{ filter: pet.isSleeping ? 'brightness(0.6)' : nightMode ? 'brightness(0.85)' : 'brightness(1)' }}
          />
        </motion.div>

        {/* Sleeping Zzz */}
        {pet.isSleeping && (
          <motion.div
            animate={{ opacity: [0, 0.9, 0], y: [0, -30], x: [0, 12] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
            style={{ position: 'absolute', top: -20, right: -8, fontSize: 16, color: 'rgba(155,130,200,0.9)', fontWeight: 700, pointerEvents: 'none' }}
          >z Z</motion.div>
        )}
      </motion.div>

      {/* ── RETURN BANNER ── */}
      <AnimatePresence>
        {returnMsg && (
          <motion.div initial={{ opacity: 0, y: -28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            onClick={() => setReturn('')}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,8,6,0.97)', borderBottom: '1px solid rgba(200,168,48,0.22)', color: '#e8d4a0', padding: '10px 20px', textAlign: 'center', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {returnMsg} <span style={{ opacity: 0.4, fontSize: 10 }}>· tap to close</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOAST ── */}
      <AnimatePresence>{toast && <Toast msg={toast} onDone={() => setToast('')} />}</AnimatePresence>

      {/* ── TOP HUD ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, background: 'linear-gradient(to bottom, rgba(5,3,2,0.95), transparent)', padding: '10px 14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <motion.button onClick={onBack} whileHover={{ x: -2 }}
          style={{ background: 'rgba(10,8,6,0.8)', border: '1px solid rgba(200,168,48,0.22)', borderRadius: 18, padding: '5px 12px', color: 'rgba(200,168,48,0.75)', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
          ← Back
        </motion.button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#e8d4a0', fontWeight: 700, letterSpacing: '0.08em' }}>
            OLAJUWON · <span style={{ color: '#c8a830' }}>LV.{pet.level}</span>
          </div>
          <div style={{ fontSize: 8, color: 'rgba(200,168,48,0.45)', letterSpacing: '0.06em' }}>{levelLabel}</div>
          <div style={{ width: 90, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden', margin: '3px auto 0' }}>
            <motion.div animate={{ width: `${xpPct}%` }} style={{ height: '100%', background: 'linear-gradient(90deg,#c8a830,#e8d080)', borderRadius: 2 }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#c8a830', fontWeight: 700 }}>🪙{pet.coins}</span>
          <span style={{ fontSize: 11, color: '#e05858', fontWeight: 600 }}>🔥{pet.streak}</span>
        </div>
      </div>

      {/* ── NEEDS ROW ── */}
      <div style={{ position: 'absolute', top: 58, left: 0, right: 0, zIndex: 50, display: 'flex', justifyContent: 'center', gap: 14 }}>
        <Pip icon="🍗" val={pet.hunger}    col="#c8a830" />
        <Pip icon="💧" val={pet.thirst}    col="#5a9abf" />
        <Pip icon="😊" val={pet.happiness} col="#d4a040" />
        <Pip icon="⚡" val={pet.energy}    col="#8a7ade" />
        <Pip icon="✨" val={pet.hygiene}   col="#5aaa8a" />
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'linear-gradient(to top, rgba(5,3,2,0.97), rgba(5,3,2,0.8) 60%, transparent)', padding: '22px 12px 14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, maxWidth: 420, margin: '0 auto' }}>
          {actionButtons.map(btn => (
            <motion.button key={btn.id}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={() => handleAction(btn.id)}
              style={{ background: 'rgba(20,16,12,0.9)', border: '1px solid rgba(200,168,48,0.18)', borderRadius: 14, padding: '10px 4px 7px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
              <span style={{ fontSize: 20, lineHeight: 1 }}>{btn.icon}</span>
              <span style={{ fontSize: 8.5, color: 'rgba(200,168,48,0.6)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{btn.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── FOOD PANEL ── */}
      <AnimatePresence>
        {panel === 'food' && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            style={{ position: 'absolute', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: 'rgba(12,9,6,0.98)', border: '1px solid rgba(200,168,48,0.2)', borderRadius: 18, padding: '14px 16px', zIndex: 80, minWidth: 280, maxWidth: '90vw', boxShadow: '0 -6px 32px rgba(0,0,0,0.7)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#e8d4a0', fontSize: 13, fontWeight: 700 }}>🍽️ Feed Olajuwon</span>
              <button onClick={() => setPanel('none')} style={{ background: 'none', border: 'none', color: 'rgba(200,168,48,0.4)', cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {FOOD_ITEMS.map(food => {
                const qty = pet.foodInventory[food.id] || 0;
                return (
                  <motion.button key={food.id} whileHover={{ scale: qty > 0 ? 1.1 : 1 }} whileTap={{ scale: qty > 0 ? 0.92 : 1 }}
                    onClick={() => qty > 0 && feedCat(food.id)} disabled={qty === 0}
                    style={{ background: qty > 0 ? 'rgba(200,168,48,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${qty > 0 ? 'rgba(200,168,48,0.3)' : 'rgba(255,255,255,0.05)'}`, borderRadius: 10, padding: '10px 4px', cursor: qty > 0 ? 'pointer' : 'not-allowed', opacity: qty > 0 ? 1 : 0.3, textAlign: 'center' }}>
                    <div style={{ fontSize: 22 }}>{food.emoji}</div>
                    <div style={{ fontSize: 8, color: '#c8a830', marginTop: 3 }}>{food.name}</div>
                    <div style={{ fontSize: 8, color: qty > 0 ? '#e8d4a0' : '#444' }}>×{qty}</div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── WARDROBE PANEL ── */}
      <AnimatePresence>
        {panel === 'wardrobe' && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            style={{ position: 'absolute', bottom: 90, left: 0, right: 0, background: 'rgba(12,9,6,0.98)', borderTop: '1px solid rgba(200,168,48,0.2)', borderRadius: '16px 16px 0 0', padding: '16px 14px', zIndex: 80, maxHeight: '55vh', overflowY: 'auto', boxShadow: '0 -8px 40px rgba(0,0,0,0.75)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#e8d4a0', fontSize: 13, fontWeight: 700 }}>👔 Wardrobe</span>
              <button onClick={() => setPanel('none')} style={{ background: 'none', border: 'none', color: 'rgba(200,168,48,0.4)', cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
              {(['hat','collar','shirt','accessory'] as WTab[]).map(t => (
                <button key={t} onClick={() => setWTab(t)}
                  style={{ padding: '5px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', flexShrink: 0, background: wTab === t ? 'rgba(200,168,48,0.22)' : 'transparent', border: `1px solid ${wTab === t ? 'rgba(200,168,48,0.5)' : 'rgba(200,168,48,0.12)'}`, borderRadius: 8, color: wTab === t ? '#c8a830' : 'rgba(200,168,48,0.4)', whiteSpace: 'nowrap' }}>
                  {t}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {ALL_CLOTHING.filter(c => c.slot === wTab).map(item => {
                const unlocked = pet.unlockedClothing.includes(item.id);
                const isOn     = pet.equippedClothing[item.slot as ClothingSlot] === item.id;
                return (
                  <motion.button key={item.id} whileHover={{ scale: unlocked ? 1.06 : 1 }} whileTap={{ scale: unlocked ? 0.94 : 1 }}
                    onClick={() => unlocked && equipItem(item.id)}
                    style={{ background: isOn ? 'rgba(200,168,48,0.2)' : unlocked ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.2)', border: `1px solid ${isOn ? '#c8a830' : unlocked ? 'rgba(200,168,48,0.15)' : 'rgba(255,255,255,0.05)'}`, borderRadius: 10, padding: '10px 4px', cursor: unlocked ? 'pointer' : 'not-allowed', opacity: unlocked ? 1 : 0.36, textAlign: 'center' }}>
                    <div style={{ fontSize: 22 }}>{unlocked ? item.emoji : '🔒'}</div>
                    <div style={{ fontSize: 8, color: unlocked ? '#c8a830' : 'rgba(255,255,255,0.2)', marginTop: 2 }}>{unlocked ? item.name : `Lv.${item.unlockLevel}`}</div>
                    {isOn && <div style={{ fontSize: 8, color: '#e8d080', marginTop: 1 }}>✓ on</div>}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
