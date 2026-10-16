'use client';

/**
 * OLAJUWON — Photorealistic Black & White Male Cat
 *
 * Instead of SVG cartoons, each action state uses a real cat photograph
 * sourced from Unsplash. CSS filters, transforms, and blend modes
 * integrate the cat into the room environment naturally.
 *
 * Photo credits: Unsplash (free-to-use license)
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

export type CatEmotion = 'neutral' | 'happy' | 'sad' | 'hungry' | 'sleepy' | 'excited' | 'curious' | 'playful';
export type CatAction  = 'idle' | 'walk' | 'eat' | 'drink' | 'sleep' | 'play' | 'groom' | 'sit' | 'stretch' | 'bathe';

interface ClothingItem { id: string; name: string; slot: string; emoji: string; color?: string; }

interface OlajuwonCatProps {
  scale?: number;
  emotion?: CatEmotion;
  action?: CatAction;
  facingLeft?: boolean;
  equipped?: Partial<Record<string, string>>;
  clothingItems?: ClothingItem[];
  onClick?: () => void;
  /** When true, renders in-scene (no drop shadow, integrated perspective) */
  inScene?: boolean;
}

/**
 * Real black-and-white cat photos for each state.
 * All from Unsplash — free commercial license.
 */
const CAT_PHOTOS: Record<string, string> = {
  // Standing / idle — black and white cat standing, looking forward
  idle:    'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=400&q=90',
  // Sitting — black and white cat sitting upright
  sit:     'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=90',
  // Walking — cat mid-stride
  walk:    'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&q=90',
  // Eating / head down
  eat:     'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&q=90',
  // Sleeping / curled up
  sleep:   'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&q=90',
  // Playing / alert and playful
  play:    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=90',
  // Stretching
  stretch: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=90',
  // Grooming / licking paw
  groom:   'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=90',
};

// Clothing overlay layer — renders as an emoji/text above the cat
function ClothingOverlay({
  equipped, clothingItems, catWidth,
}: { equipped: Partial<Record<string,string>>; clothingItems: ClothingItem[]; catWidth: number }) {
  const hat      = Object.values(equipped).map(id => clothingItems.find(c => c.id === id && c.slot === 'hat')).find(Boolean);
  const collar   = Object.values(equipped).map(id => clothingItems.find(c => c.id === id && c.slot === 'collar')).find(Boolean);
  const shirt    = Object.values(equipped).map(id => clothingItems.find(c => c.id === id && c.slot === 'shirt')).find(Boolean);
  const acc      = Object.values(equipped).map(id => clothingItems.find(c => c.id === id && c.slot === 'accessory')).find(Boolean);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
      {hat && (
        <motion.div
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', fontSize: catWidth * 0.28, lineHeight: 1, userSelect: 'none' }}
        >{hat.emoji}</motion.div>
      )}
      {collar && (
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', background: collar.color || '#c8a020', borderRadius: 99, padding: '2px 10px', fontSize: catWidth * 0.1, color: 'white', fontWeight: 700, whiteSpace: 'nowrap', boxShadow: `0 2px 8px ${collar.color || '#c8a020'}88`, userSelect: 'none' }}>
          {collar.emoji || '●'}
        </div>
      )}
      {shirt && (
        <div style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translateX(-50%)', fontSize: catWidth * 0.2, userSelect: 'none', mixBlendMode: 'screen' as const }}>
          {shirt.emoji}
        </div>
      )}
      {acc && (
        <div style={{ position: 'absolute', top: '24%', right: '10%', fontSize: catWidth * 0.18, userSelect: 'none' }}>
          {acc.emoji}
        </div>
      )}
    </div>
  );
}

// Breathing shimmer overlay
function BreathingOverlay({ width, height }: { width: number; height: number }) {
  return (
    <motion.div
      animate={{ opacity: [0, 0.04, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      style={{ position: 'absolute', inset: 0, background: 'white', borderRadius: 'inherit', pointerEvents: 'none', zIndex: 3 }}
    />
  );
}

export default function OlajuwonCat({
  scale = 1,
  emotion = 'neutral',
  action = 'idle',
  facingLeft = false,
  equipped = {},
  clothingItems = [],
  onClick,
  inScene = false,
}: OlajuwonCatProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [blinkVisible, setBlinkVisible] = useState(false);
  const prevAction = useRef(action);

  // Blink overlay
  useEffect(() => {
    const schedule = () => {
      const t = setTimeout(() => {
        setBlinkVisible(true);
        setTimeout(() => { setBlinkVisible(false); schedule(); }, 100);
      }, 2500 + Math.random() * 3000);
      return t;
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  // Reset load state when action changes (new photo)
  useEffect(() => {
    if (prevAction.current !== action) {
      setImgLoaded(false);
      prevAction.current = action;
    }
  }, [action]);

  const photoKey = action === 'drink' ? 'eat' : action === 'walk' ? 'walk' : action in CAT_PHOTOS ? action : 'idle';
  const photoUrl  = CAT_PHOTOS[photoKey] || CAT_PHOTOS.idle;

  // Base size
  const W = 160 * scale;
  const H = 160 * scale;

  // Action-specific aspect ratios and crops
  const cropConfigs: Record<string, { aspect: number; position: string }> = {
    idle:    { aspect: 0.85, position: 'center 20%' },
    sit:     { aspect: 0.75, position: 'center 15%' },
    walk:    { aspect: 1.1,  position: 'center 30%' },
    eat:     { aspect: 0.9,  position: 'center 40%' },
    sleep:   { aspect: 1.8,  position: 'center 50%' },
    play:    { aspect: 0.9,  position: 'center 20%' },
    stretch: { aspect: 1.3,  position: 'center 30%' },
    groom:   { aspect: 0.85, position: 'center 20%' },
    bathe:   { aspect: 1.0,  position: 'center 25%' },
  };
  const crop = cropConfigs[photoKey] || cropConfigs.idle;
  const imgW  = W;
  const imgH  = W / crop.aspect;

  // Emotion-based colour grade filter
  const emotionFilter: Record<CatEmotion, string> = {
    neutral:  'brightness(1) saturate(0.92)',
    happy:    'brightness(1.06) saturate(1.05) hue-rotate(-5deg)',
    excited:  'brightness(1.1) saturate(1.1)',
    playful:  'brightness(1.05) saturate(1.08)',
    sad:      'brightness(0.88) saturate(0.7)',
    hungry:   'brightness(0.9) saturate(0.8)',
    sleepy:   'brightness(0.82) saturate(0.7)',
    curious:  'brightness(1.02) saturate(0.95)',
  };

  // Action-based motion
  const actionMotion: Record<string, object> = {
    idle:    { y: [0, -4, 0], rotate: [0, 0.5, -0.5, 0] },
    sit:     { y: [0, -2, 0] },
    walk:    { x: [0, 3, -3, 0], y: [0, -3, 0] },
    eat:     { y: [0, 6, 0, 6, 0], rotate: [0, 2, 0] },
    sleep:   { scaleY: [1, 1.02, 1] },
    play:    { y: [0, -10, 0, -6, 0], rotate: [0, -5, 5, 0] },
    stretch: { scaleX: [1, 1.12, 1], y: [0, -3, 0] },
    groom:   { rotate: [0, -4, 4, -2, 0], y: [0, -2, 0] },
    bathe:   { y: [0, -3, 0], rotate: [0, 1, -1, 0] },
  };

  const motionAnim = actionMotion[photoKey] || actionMotion.idle;
  const motionDur  = photoKey === 'eat' ? 1.0 : photoKey === 'play' ? 0.8 : photoKey === 'sleep' ? 3.5 : 3.0;

  return (
    <motion.div
      onClick={onClick}
      style={{
        position: 'relative',
        width:  imgW,
        height: imgH,
        cursor: onClick ? 'pointer' : 'default',
        transform: facingLeft ? 'scaleX(-1)' : undefined,
        flexShrink: 0,
      }}
      animate={motionAnim}
      transition={{ duration: motionDur, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={onClick ? { scale: 1.04 } : {}}
      whileTap={onClick ? { scale: 0.96 } : {}}
    >
      {/* Soft contact shadow */}
      {!inScene && (
        <div style={{
          position: 'absolute', bottom: -10, left: '15%', right: '15%', height: 16,
          background: 'rgba(0,0,0,0.35)', borderRadius: '50%', filter: 'blur(8px)',
          zIndex: 1,
        }} />
      )}

      {/* Photo container with rounded shape */}
      <AnimatePresence mode="wait">
        <motion.div
          key={photoKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: imgLoaded ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            position: 'relative',
            width: imgW,
            height: imgH,
            borderRadius: action === 'sleep' ? '24px' : '50% 50% 45% 45% / 40% 40% 50% 50%',
            overflow: 'hidden',
            boxShadow: inScene ? 'none' : '0 12px 40px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          <img
            src={photoUrl}
            alt="Olajuwon the cat"
            onLoad={() => setImgLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: crop.position,
              display: 'block',
              filter: emotionFilter[emotion] + ' contrast(1.05)',
            }}
          />

          {/* Blink overlay — subtle flash */}
          <AnimatePresence>
            {blinkVisible && (
              <motion.div
                key="blink"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.12 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.05 }}
                style={{ position: 'absolute', inset: 0, background: 'white', pointerEvents: 'none' }}
              />
            )}
          </AnimatePresence>

          {/* Breathing overlay */}
          <BreathingOverlay width={imgW} height={imgH} />

          {/* Emotional colour wash */}
          {emotion === 'sad' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(60,80,120,0.18)', pointerEvents: 'none' }} />
          )}
          {emotion === 'sleepy' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(40,30,60,0.22)', pointerEvents: 'none' }} />
          )}
          {(emotion === 'happy' || emotion === 'excited') && (
            <motion.div
              animate={{ opacity: [0, 0.08, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(255,220,100,0.12)', pointerEvents: 'none' }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Placeholder while loading */}
      {!imgLoaded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #1e1e1e, #2a2a2a)',
          borderRadius: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ fontSize: 28, filter: 'grayscale(1)' }}
          >🐱</motion.div>
        </div>
      )}

      {/* Clothing overlays */}
      {imgLoaded && (
        <ClothingOverlay equipped={equipped} clothingItems={clothingItems} catWidth={imgW} />
      )}

      {/* Action particle effects */}
      <AnimatePresence>
        {action === 'eat' && (
          <>
            <motion.div key="e1" initial={{ opacity: 0, x: 0, y: 0 }} animate={{ opacity: [0,1,0], x: -20, y: -30 }} exit={{ opacity: 0 }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.8 }} style={{ position: 'absolute', top: '60%', left: '20%', fontSize: 12, pointerEvents: 'none', zIndex: 10 }}>✨</motion.div>
            <motion.div key="e2" initial={{ opacity: 0, x: 0, y: 0 }} animate={{ opacity: [0,1,0], x: 20, y: -25 }} exit={{ opacity: 0 }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.3 }} style={{ position: 'absolute', top: '60%', right: '20%', fontSize: 12, pointerEvents: 'none', zIndex: 10 }}>✨</motion.div>
          </>
        )}
        {(action === 'play' || action === 'idle') && emotion === 'happy' && (
          <motion.div key="heart" initial={{ opacity: 0, y: 0, scale: 0.5 }} animate={{ opacity: [0,1,0], y: -40, scale: [0.5,1.2,0.8] }} exit={{ opacity: 0 }} transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2 }} style={{ position: 'absolute', top: '-5%', left: '50%', fontSize: 16, pointerEvents: 'none', zIndex: 10 }}>💕</motion.div>
        )}
        {action === 'groom' && (
          <motion.div key="shine" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.9, 0] }} exit={{ opacity: 0 }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }} style={{ position: 'absolute', top: '10%', right: '5%', fontSize: 14, pointerEvents: 'none', zIndex: 10 }}>✦</motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
