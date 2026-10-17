'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '@/lib/audioSynthesis';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import CatIcon from '@/components/world/CatIcon';
import AdminGestureLogin from '@/components/auth/AdminGestureLogin';

interface BirthdayGiftIntroProps {
  onUnlock: () => void;
  isReplay?: boolean;
}

type Act = 'opening' | 'room' | 'reveal' | 'transition';
type ActiveStation = null | 'drawer' | 'musicbox' | 'gift';

/* ── Floating particle for ambient effect ── */
function Particle({ i }: { i: number }) {
  const size = 2 + (i % 3);
  const x = ((i * 137.5) % 100);
  const delay = (i * 0.3) % 6;
  const dur = 6 + (i % 5);
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${x}%`,
        bottom: '-10px',
        width: size,
        height: size,
        borderRadius: '50%',
        background: i % 3 === 0 ? '#ffd700' : i % 3 === 1 ? '#ff6b9d' : '#c4b5fd',
        boxShadow: `0 0 ${size * 3}px currentColor`,
        pointerEvents: 'none',
      }}
      animate={{ y: [0, -(600 + (i % 300))], opacity: [0, 0.9, 0], scale: [0.5, 1.2, 0.3] }}
      transition={{ duration: dur, repeat: Infinity, delay, ease: 'easeOut' }}
    />
  );
}

/* ── Shimmer line ── */
function ShimmerLine({ delay = 0, top = '50%', opacity = 0.15 }: { delay?: number; top?: string; opacity?: number }) {
  return (
    <motion.div
      style={{ position: 'absolute', left: 0, right: 0, top, height: 1, background: 'linear-gradient(90deg, transparent 0%, #ffd700 20%, #ff6b9d 50%, #c4b5fd 80%, transparent 100%)', opacity, pointerEvents: 'none' }}
      animate={{ scaleX: [0, 1, 0], x: ['-100%', '0%', '100%'] }}
      transition={{ duration: 3.5, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  );
}

export default function BirthdayGiftIntro({ onUnlock }: BirthdayGiftIntroProps) {
  const [act, setAct] = useState<Act>('opening');
  const [activeStation, setActiveStation] = useState<ActiveStation>(null);
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // Clue discovery states
  const [discoveredMonth, setDiscoveredMonth] = useState(false);
  const [discoveredDay, setDiscoveredDay] = useState(false);
  const [isMusicBoxPlaying, setIsMusicBoxPlaying] = useState(false);

  // Birthday Present Combination State (Target: 1 0 - 2 5 for October 25)
  const [digit1, setDigit1] = useState(0); // Month tens
  const [digit2, setDigit2] = useState(1); // Month ones
  const [digit3, setDigit3] = useState(0); // Day tens
  const [digit4, setDigit4] = useState(5); // Day ones
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [shakeGift, setShakeGift] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleAdminLogin = async (password: string) => {
    return await login(password, 'admin');
  };

  const handleAdminAuthenticated = () => {
    // Redirect to admin dashboard
    router.push('/admin');
  };

  const handleStartAdventure = () => {
    sounds.startRoomTone();
    sounds.click();
    setAct('room');
  };

  const handleOpenDrawer = () => {
    sounds.drawerSlide();
    setActiveStation('drawer');
    setDiscoveredMonth(true);
  };

  const handleOpenMusicBox = () => {
    sounds.click();
    setActiveStation('musicbox');
  };

  const handlePlayMusicBox = () => {
    if (isMusicBoxPlaying) return;
    setIsMusicBoxPlaying(true);
    sounds.playMusicBoxMelody();
    setDiscoveredDay(true);
    setTimeout(() => setIsMusicBoxPlaying(false), 2800);
  };

  const handleInspectGift = () => {
    sounds.click();
    setActiveStation('gift');
  };

  const handleApplyDiscoveredClues = () => {
    sounds.click();
    setDigit1(1); setDigit2(0); setDigit3(2); setDigit4(5);
    setUnlockError(null);
  };

  const cycleDigit = (setter: React.Dispatch<React.SetStateAction<number>>, dir: number) => {
    sounds.tick();
    setter(prev => (prev + dir + 10) % 10);
    setUnlockError(null);
  };

  const handleAttemptUnlock = () => {
    const isCorrect = digit1 === 1 && digit2 === 0 && digit3 === 2 && digit4 === 5;
    if (isCorrect) {
      setActiveStation(null);
      sounds.unlockChord();
      sounds.ribbonSlide();
      setTimeout(() => { sounds.reveal(); setAct('reveal'); }, 1200);
    } else {
      sounds.tick();
      setShakeGift(true);
      setTimeout(() => setShakeGift(false), 600);
      setUnlockError('Your birthday is October 25th — that\'s 10 · 25 ✦');
    }
  };

  const handleEnterWorld = () => {
    sounds.click();
    setAct('transition');
    setTimeout(() => onUnlock(), 1800);
  };

  if (!mounted) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#040208', color: '#f5ede2', userSelect: 'none', fontFamily: 'var(--font-poppins), sans-serif' }}>

      {/* Global ambient particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
        {Array.from({ length: 30 }).map((_, i) => <Particle key={i} i={i} />)}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          ACT 01 — THE GRAND ENTRANCE
      ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {act === 'opening' && (
          <motion.div
            key="act-opening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, transition: { duration: 1.2 } }}
            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, overflow: 'hidden' }}
          >
            {/* Cinematic Background with Enhanced Overlay */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
              <motion.img
                src="/images/backgrounds/intro_portal.jpg"
                alt=""
                animate={{ scale: [1.08, 1.12, 1.08] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.18) saturate(1.4) contrast(1.2)' }}
              />
              {/* Multi-layer gradient overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(4,2,8,0.5) 35%, rgba(4,2,8,0.85) 70%, #000000 100%)' }} />
              {/* Animated gold atmospheric glow */}
              <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.15, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(255,215,0,0.25) 0%, rgba(255,140,0,0.15) 30%, rgba(255,107,157,0.1) 50%, transparent 75%)' }}
              />
              {/* Purple accent glow */}
              <motion.div
                animate={{ opacity: [0.15, 0.3, 0.15] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 70%, rgba(196,181,253,0.18) 0%, transparent 50%)' }}
              />
            </div>

            {/* Floating light particles - Enhanced */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
              {[...Array(35)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: '120%', x: `${(i * 3.2) % 100}%`, opacity: 0 }}
                  animate={{ y: '-20%', opacity: [0, 0.9, 0.6, 0] }}
                  transition={{ duration: 10 + (i % 5), repeat: Infinity, delay: i * 0.25, ease: 'easeOut' }}
                  style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    width: i % 7 === 0 ? 6 : i % 5 === 0 ? 4 : 2, 
                    height: i % 7 === 0 ? 6 : i % 5 === 0 ? 4 : 2, 
                    borderRadius: '50%', 
                    background: i % 4 === 0 ? '#ffd700' : i % 4 === 1 ? '#ff6b9d' : i % 4 === 2 ? '#ff9f43' : '#ffffff', 
                    boxShadow: `0 0 ${i % 7 === 0 ? 20 : 12}px currentColor` 
                  }}
                />
              ))}
            </div>

            {/* Radial light beams */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`beam-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.08, 0], rotate: [i * 45, i * 45 + 10] }}
                transition={{ duration: 8, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 2,
                  height: '60vh',
                  background: 'linear-gradient(to bottom, rgba(255,215,0,0.3), transparent)',
                  transformOrigin: 'top center',
                  transform: `rotate(${i * 45}deg)`,
                  pointerEvents: 'none',
                }}
              />
            ))}

            {/* Main content container */}
            <div style={{ 
              position: 'relative', 
              zIndex: 3, 
              textAlign: 'center', 
              padding: '20px max(20px, min(5vw, 60px))', 
              maxWidth: '1600px',
              width: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              margin: 'auto',
              minHeight: '100vh',
              justifyContent: 'center',
              gap: 'max(12px, min(2vh, 28px))'
            }}>

              {/* Sweet birthday greeting - Enhanced */}
              <motion.div
                initial={{ opacity: 0, y: -40, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3, duration: 1.2, type: 'spring', damping: 15 }}
                style={{ position: 'relative' }}
              >
                {/* Rotating outer ring */}
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
                  style={{ position: 'absolute', inset: -12, borderRadius: '50%', border: '1px dashed rgba(255,215,0,0.35)', pointerEvents: 'none' }}
                />
                {/* Counter-rotating inner ring */}
                <motion.div
                  animate={{ rotate: [360, 0] }}
                  transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
                  style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: '1px dotted rgba(255,107,157,0.25)', pointerEvents: 'none' }}
                />
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'clamp(10px, 3vw, 14px)', background: 'linear-gradient(135deg, rgba(255,215,0,0.22), rgba(255,140,0,0.18), rgba(255,107,157,0.15))', border: '1.5px solid rgba(255,215,0,0.65)', borderRadius: 100, padding: 'clamp(10px, 2.5vw, 12px) clamp(18px, 5vw, 28px)', backdropFilter: 'blur(16px)', boxShadow: '0 12px 40px rgba(255,215,0,0.3), 0 0 60px rgba(255,107,157,0.15), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                  <motion.span animate={{ scale: [1, 1.5, 1], rotate: [0, 360] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>🎂</motion.span>
                  <AdminGestureLogin
                    targetText={
                      <span style={{ fontSize: 'clamp(11px, 2.8vw, 15px)', fontWeight: 800, letterSpacing: '0.1em', color: '#ffe8a0', textShadow: '0 2px 8px rgba(0,0,0,0.6)', fontFamily: 'var(--font-playfair), Georgia, serif', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                        Happy Birthday My Baby
                      </span>
                    }
                    onAdminLogin={handleAdminLogin}
                    onAuthenticated={handleAdminAuthenticated}
                  />
                  <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: 1.25 }} style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>💖</motion.span>
                </div>
              </motion.div>

              {/* ULTRA LUXURIOUS GIFT BOX - Completely Redesigned */}
              <motion.div
                initial={{ opacity: 0, scale: 0.6, rotateY: -40 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ delay: 0.5, duration: 1.5, type: 'spring', damping: 18 }}
                style={{ perspective: 1400, width: '100%', display: 'flex', justifyContent: 'center', maxWidth: 'min(90vw, 600px)' }}
              >
                <motion.div
                  animate={{ y: [0, -25, 0], rotateZ: [0, -3, 3, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ position: 'relative', display: 'inline-block' }}
                >
                  {/* Multi-layer radiant glow */}
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    style={{ position: 'absolute', inset: -60, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,215,0,0.6), rgba(255,140,0,0.4), rgba(255,107,157,0.3), transparent)', filter: 'blur(40px)', zIndex: -2 }}
                  />
                  <motion.div
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                    style={{ position: 'absolute', inset: -40, borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,181,253,0.4), rgba(255,107,157,0.3), transparent)', filter: 'blur(30px)', zIndex: -1 }}
                  />
                  
                  {/* Premium 3D Gift Box */}
                  <div style={{ position: 'relative', width: 'clamp(180px, 25vw, 320px)', height: 'clamp(180px, 25vw, 320px)', transformStyle: 'preserve-3d' }}>
                    
                    {/* Outer decorative frame */}
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                      style={{ 
                        position: 'absolute', 
                        inset: -20, 
                        border: '2px solid rgba(255,215,0,0.2)', 
                        borderRadius: 24,
                        pointerEvents: 'none'
                      }}
                    />
                    
                    {/* Main luxury box body with gradient */}
                    <motion.div 
                      animate={{ boxShadow: ['0 30px 80px rgba(0,0,0,0.8), inset 0 2px 0 rgba(255,255,255,0.15)', '0 40px 100px rgba(139,45,92,0.6), inset 0 2px 0 rgba(255,255,255,0.2)', '0 30px 80px rgba(0,0,0,0.8), inset 0 2px 0 rgba(255,255,255,0.15)'] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      style={{ 
                        position: 'absolute', 
                        inset: 0, 
                        background: 'linear-gradient(145deg, #a03a5c 0%, #7a2248 25%, #5c1a3d 50%, #4a1532 75%, #2d0a1d 100%)', 
                        borderRadius: 20, 
                        border: '2px solid rgba(139,45,92,0.6)'
                      }} 
                    />

                    {/* Glossy highlight overlay */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(155deg, rgba(255,255,255,0.15) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.3) 100%)',
                      borderRadius: 20,
                      pointerEvents: 'none'
                    }} />
                    
                    {/* Animated shimmer sweep across box */}
                    <motion.div
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                        borderRadius: 20,
                        pointerEvents: 'none'
                      }}
                    />
                    
                    {/* Premium gold ribbon vertical - Enhanced */}
                    <motion.div 
                      animate={{ boxShadow: ['0 6px 20px rgba(255,215,0,0.6), inset 0 2px 0 rgba(255,255,255,0.5)', '0 8px 30px rgba(255,215,0,0.8), inset 0 2px 0 rgba(255,255,255,0.6)', '0 6px 20px rgba(255,215,0,0.6), inset 0 2px 0 rgba(255,255,255,0.5)'] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      style={{ 
                        position: 'absolute', 
                        left: '50%', 
                        top: 0, 
                        bottom: 0, 
                        width: 'clamp(22px,5vw,36px)', 
                        transform: 'translateX(-50%)', 
                        background: 'linear-gradient(90deg, #9a6d0f 0%, #d4af37 20%, #ffd700 35%, #ffed4e 50%, #ffd700 65%, #d4af37 80%, #9a6d0f 100%)',
                        border: '1px solid rgba(255,237,78,0.4)'
                      }} 
                    />
                    
                    {/* Premium gold ribbon horizontal - Enhanced */}
                    <motion.div 
                      animate={{ boxShadow: ['0 6px 20px rgba(255,215,0,0.6), inset 0 2px 0 rgba(255,255,255,0.5)', '0 8px 30px rgba(255,215,0,0.8), inset 0 2px 0 rgba(255,255,255,0.6)', '0 6px 20px rgba(255,215,0,0.6), inset 0 2px 0 rgba(255,255,255,0.5)'] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                      style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: 0, 
                        right: 0, 
                        height: 'clamp(22px,5vw,36px)', 
                        transform: 'translateY(-50%)', 
                        background: 'linear-gradient(180deg, #9a6d0f 0%, #d4af37 20%, #ffd700 35%, #ffed4e 50%, #ffd700 65%, #d4af37 80%, #9a6d0f 100%)',
                        border: '1px solid rgba(255,237,78,0.4)'
                      }} 
                    />
                    
                    {/* Elegant center bow - Larger and more prominent */}
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)', 
                        fontSize: 'clamp(64px,16vw,100px)', 
                        filter: 'drop-shadow(0 12px 30px rgba(255,215,0,0.8)) drop-shadow(0 0 40px rgba(255,107,157,0.6))', 
                        zIndex: 3 
                      }}
                    >
                      🎀
                    </motion.div>

                    {/* Enhanced sparkle effects - More dynamic */}
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          opacity: [0, 1, 0], 
                          scale: [0, i % 3 === 0 ? 2 : 1.5, 0], 
                          rotate: [0, 360],
                          x: [0, (i % 2 === 0 ? 10 : -10)],
                          y: [0, (i % 2 === 0 ? -10 : 10)]
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }}
                        style={{ 
                          position: 'absolute', 
                          top: `${15 + (i * 7)}%`, 
                          left: `${8 + (i * 8)}%`, 
                          fontSize: 'clamp(16px,4vw,28px)', 
                          color: i % 3 === 0 ? '#ffd700' : i % 3 === 1 ? '#ff6b9d' : '#ffffff',
                          textShadow: '0 0 15px currentColor'
                        }}
                      >
                        {i % 4 === 0 ? '✦' : i % 4 === 1 ? '★' : i % 4 === 2 ? '✧' : '◈'}
                      </motion.div>
                    ))}

                    {/* Corner accent decorations */}
                    {[0, 1, 2, 3].map((corner) => (
                      <motion.div
                        key={`corner-${corner}`}
                        animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.9, 1.1, 0.9] }}
                        transition={{ duration: 3, repeat: Infinity, delay: corner * 0.5 }}
                        style={{
                          position: 'absolute',
                          width: 20,
                          height: 20,
                          border: '2px solid rgba(255,215,0,0.6)',
                          borderRadius: 4,
                          ...(corner === 0 && { top: -10, left: -10, borderRight: 'none', borderBottom: 'none' }),
                          ...(corner === 1 && { top: -10, right: -10, borderLeft: 'none', borderBottom: 'none' }),
                          ...(corner === 2 && { bottom: -10, left: -10, borderRight: 'none', borderTop: 'none' }),
                          ...(corner === 3 && { bottom: -10, right: -10, borderLeft: 'none', borderTop: 'none' }),
                        }}
                      />
                    ))}
                  </div>

                  {/* Orbiting stars around the gift */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={`orbit-${i}`}
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 15 + i * 2, repeat: Infinity, ease: 'linear' }}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: 'clamp(140px,32vw,220px)',
                        height: 'clamp(140px,32vw,220px)',
                        marginTop: 'clamp(-70px,-16vw,-110px)',
                        marginLeft: 'clamp(-70px,-16vw,-110px)',
                        pointerEvents: 'none'
                      }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: '50%',
                          fontSize: 'clamp(14px,3.5vw,20px)',
                          color: i % 2 === 0 ? '#ffd700' : '#ff6b9d',
                          textShadow: '0 0 12px currentColor'
                        }}
                      >
                        ✦
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Headline - Enhanced typography */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <h1 style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontSize: 'min(max(1.8rem, 3vw), 4.5rem)',
                  fontWeight: 400,
                  fontStyle: 'italic',
                  color: '#ffffff',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  marginBottom: '0',
                  textShadow: '0 0 80px rgba(255,215,0,0.6), 0 6px 40px rgba(0,0,0,0.95), 0 0 30px rgba(255,107,157,0.4)',
                  padding: '0 max(12px, min(3vw, 40px))',
                  maxWidth: '100%',
                }}>
                  I made something
                </h1>
                <h1 style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontSize: 'min(max(2rem, 4vw), 5.5rem)',
                  fontWeight: 700,
                  fontStyle: 'normal',
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 20%, #ff9f43 40%, #ff6b9d 70%, #c4b5fd 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  marginBottom: '0',
                  filter: 'drop-shadow(0 0 50px rgba(255,215,0,0.5)) drop-shadow(0 4px 20px rgba(0,0,0,0.8))',
                  padding: '0 max(12px, min(3vw, 40px))',
                  maxWidth: '100%',
                }}>
                  just for you.
                </h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.9 }}
                  style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontSize: 'min(max(1rem, 1.5vw), 1.8rem)',
                    fontStyle: 'italic',
                    fontWeight: 500,
                    color: 'rgba(255,232,160,0.75)',
                    marginBottom: 0,
                    textShadow: '0 2px 15px rgba(0,0,0,0.8)',
                    padding: '0 max(12px, min(3vw, 40px))',
                    maxWidth: '100%',
                  }}
                >
                  But you have to find it first.
                </motion.p>
              </motion.div>

              {/* CTA - Enhanced button */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.8 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 clamp(16px, 4vw, 20px)' }}
              >
                <motion.button
                  onClick={handleStartAdventure}
                  whileHover={{ scale: 1.05, boxShadow: '0 16px 60px rgba(255,215,0,0.6), 0 0 100px rgba(255,107,157,0.5)' }}
                  whileTap={{ scale: 0.96 }}
                  animate={{ boxShadow: ['0 12px 50px rgba(255,107,157,0.5), 0 0 0 2px rgba(255,215,0,0.4)', '0 12px 50px rgba(255,215,0,0.6), 0 0 0 2px rgba(255,107,157,0.5)', '0 12px 50px rgba(255,107,157,0.5), 0 0 0 2px rgba(255,215,0,0.4)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'clamp(10px, 3vw, 14px)',
                    padding: 'clamp(16px, 4vw, 26px) clamp(32px, 8vw, 64px)',
                    borderRadius: 100,
                    background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 25%, #ff9f43 50%, #ff6b9d 100%)',
                    color: '#1a0808',
                    fontSize: 'clamp(13px, 3.5vw, 17px)',
                    fontWeight: 900,
                    letterSpacing: 'clamp(0.1em, 0.15em, 0.16em)',
                    textTransform: 'uppercase',
                    border: 'none',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    maxWidth: '100%',
                    minWidth: 'fit-content',
                  }}
                >
                  {/* Enhanced shimmer sweep */}
                  <motion.span
                    animate={{ x: ['-200%', '300%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
                    style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.8) 50%, transparent 80%)', pointerEvents: 'none' }}
                  />
                  <span>Open Your Gift</span>
                  <motion.span
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >→</motion.span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          ACT 02 — THE SECRET STUDY
      ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {act === 'room' && (
          <motion.div
            key="act-room"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', zIndex: 10 }}
          >
            {/* Background */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
              <img
                src="/images/backgrounds/bg_letters.jpg"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.22) saturate(0.6)' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.07) 0%, transparent 65%)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,2,8,0.6) 0%, transparent 30%, transparent 70%, rgba(4,2,8,0.8) 100%)' }} />
            </div>

            <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', padding: 'clamp(20px,5vw,40px)' }}>

              {/* Header */}
              <div style={{ marginBottom: 'clamp(20px,4vw,36px)' }}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}
                >
                  <div style={{ width: 32, height: 2, background: 'linear-gradient(90deg, #ffd700, #ff6b9d)' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.8)' }}>Act II · The Secret Study</span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(1.6rem, 5vw, 2.8rem)', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 8 }}
                >
                  Find the combination.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: 'rgba(196,181,253,0.6)', maxWidth: 500 }}
                >
                  Three objects in the room hold your birthday secret. Explore each one.
                </motion.p>
              </div>

              {/* Clue tracker pills */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{ display: 'flex', gap: 10, marginBottom: 'clamp(20px,4vw,32px)', flexWrap: 'wrap' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: discoveredMonth ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${discoveredMonth ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)'}`, transition: 'all 0.4s' }}>
                  <span style={{ fontSize: 10, color: discoveredMonth ? '#ffd700' : 'rgba(255,255,255,0.25)' }}>✦</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: discoveredMonth ? '#f5e6b8' : 'rgba(255,255,255,0.3)', letterSpacing: '0.04em' }}>
                    {discoveredMonth ? 'Month: October (10)' : 'Month — undiscovered'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: discoveredDay ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${discoveredDay ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)'}`, transition: 'all 0.4s' }}>
                  <span style={{ fontSize: 10, color: discoveredDay ? '#ffd700' : 'rgba(255,255,255,0.25)' }}>✦</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: discoveredDay ? '#f5e6b8' : 'rgba(255,255,255,0.3)', letterSpacing: '0.04em' }}>
                    {discoveredDay ? 'Day: the 25th' : 'Day — undiscovered'}
                  </span>
                </div>
              </motion.div>

              {/* Three station cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(240px,30vw,300px),1fr))', gap: 'clamp(12px,3vw,20px)', flex: 1 }}>

                {/* STATION 1 — Writing Desk */}
                <motion.button
                  onClick={handleOpenDrawer}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, type: 'spring', damping: 20 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    position: 'relative', cursor: 'pointer', textAlign: 'left',
                    padding: 'clamp(20px,4vw,28px)',
                    borderRadius: 20,
                    background: discoveredMonth
                      ? 'linear-gradient(145deg, rgba(212,175,55,0.12), rgba(14,11,8,0.9))'
                      : 'linear-gradient(145deg, rgba(30,20,50,0.9), rgba(14,11,8,0.95))',
                    border: `1px solid ${discoveredMonth ? 'rgba(212,175,55,0.45)' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: discoveredMonth ? '0 0 40px rgba(212,175,55,0.12)' : '0 8px 32px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(20px)',
                    transition: 'background 0.4s, border-color 0.4s, box-shadow 0.4s',
                  }}
                >
                  {discoveredMonth && (
                    <div style={{ position: 'absolute', top: 12, right: 14, fontSize: 11, fontWeight: 800, color: '#ffd700', letterSpacing: '0.1em' }}>FOUND ✓</div>
                  )}
                  <div style={{ fontSize: 'clamp(36px,8vw,52px)', marginBottom: 16, filter: 'drop-shadow(0 4px 12px rgba(212,175,55,0.4))' }}>🖋️</div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: 8 }}>Station 01</div>
                  <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 500, color: '#ffffff', marginBottom: 8, letterSpacing: '-0.01em' }}>
                    The Writing Desk
                  </h3>
                  <p style={{ fontSize: 12, color: 'rgba(196,181,253,0.6)', lineHeight: 1.6 }}>
                    {discoveredMonth ? 'A letter dated October. The clue is yours.' : 'A mahogany desk with a brass drawer pull. Something is hidden inside.'}
                  </p>
                </motion.button>

                {/* STATION 2 — Gift Box (center, featured) */}
                <motion.button
                  onClick={handleInspectGift}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, type: 'spring', damping: 20 }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    position: 'relative', cursor: 'pointer', textAlign: 'left',
                    padding: 'clamp(20px,4vw,28px)',
                    borderRadius: 20,
                    background: 'linear-gradient(145deg, rgba(109,26,36,0.35), rgba(14,8,24,0.95))',
                    border: '2px solid rgba(212,175,55,0.45)',
                    boxShadow: '0 0 60px rgba(212,175,55,0.15), 0 12px 48px rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {/* Featured label */}
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', background: 'linear-gradient(135deg, #6d1a24, #9b2d3a)', border: '1px solid #ffd700', borderRadius: 100, padding: '4px 14px', fontSize: 10, fontWeight: 800, color: '#f5e6b8', letterSpacing: '0.1em' }}>
                    For Similoluwa ♡
                  </div>

                  {/* Gift visual */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ fontSize: 'clamp(44px,10vw,64px)', marginBottom: 16, textAlign: 'center', display: 'block', filter: 'drop-shadow(0 8px 20px rgba(255,107,157,0.5))' }}
                  >
                    🎀
                  </motion.div>

                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.75)', marginBottom: 8, textAlign: 'center' }}>The Main Gift · 4-Digit Lock</div>
                  <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 500, color: '#ffffff', marginBottom: 8, letterSpacing: '-0.01em', textAlign: 'center' }}>
                    The Birthday Box
                  </h3>
                  <p style={{ fontSize: 12, color: 'rgba(245,230,184,0.55)', lineHeight: 1.6, textAlign: 'center' }}>
                    Wrapped in midnight velvet. Sealed with a brass combination lock.
                  </p>
                </motion.button>

                {/* STATION 3 — Music Box */}
                <motion.button
                  onClick={handleOpenMusicBox}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75, type: 'spring', damping: 20 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    position: 'relative', cursor: 'pointer', textAlign: 'left',
                    padding: 'clamp(20px,4vw,28px)',
                    borderRadius: 20,
                    background: discoveredDay
                      ? 'linear-gradient(145deg, rgba(212,175,55,0.12), rgba(14,11,8,0.9))'
                      : 'linear-gradient(145deg, rgba(30,20,50,0.9), rgba(14,11,8,0.95))',
                    border: `1px solid ${discoveredDay ? 'rgba(212,175,55,0.45)' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: discoveredDay ? '0 0 40px rgba(212,175,55,0.12)' : '0 8px 32px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(20px)',
                    transition: 'background 0.4s, border-color 0.4s, box-shadow 0.4s',
                  }}
                >
                  {discoveredDay && (
                    <div style={{ position: 'absolute', top: 12, right: 14, fontSize: 11, fontWeight: 800, color: '#ffd700', letterSpacing: '0.1em' }}>FOUND ✓</div>
                  )}
                  <motion.div
                    animate={isMusicBoxPlaying ? { rotate: 360 } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{ fontSize: 'clamp(36px,8vw,52px)', marginBottom: 16, filter: 'drop-shadow(0 4px 12px rgba(196,181,253,0.5))', display: 'inline-block' }}
                  >
                    🎵
                  </motion.div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)', marginBottom: 8 }}>Station 02</div>
                  <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 500, color: '#ffffff', marginBottom: 8, letterSpacing: '-0.01em' }}>
                    The Music Box
                  </h3>
                  <p style={{ fontSize: 12, color: 'rgba(196,181,253,0.6)', lineHeight: 1.6 }}>
                    {discoveredDay ? 'The melody reveals the 25th day. The secret is yours.' : 'An ornate carillon box with a hand-wound brass crank.'}
                  </p>
                </motion.button>

              </div>

              {/* Footer hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                style={{ textAlign: 'center', marginTop: 'clamp(16px,3vw,24px)', fontSize: 11, color: 'rgba(196,181,253,0.4)', letterSpacing: '0.06em' }}
              >
                Explore the desk and music box first, then crack the gift box lock
              </motion.p>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          STATION MODALS
      ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>

        {/* DRAWER MODAL */}
        {activeStation === 'drawer' && (
          <motion.div
            key="drawer-modal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(12px,4vw,24px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 22 }}
              style={{ position: 'relative', width: '100%', maxWidth: 480, background: 'linear-gradient(145deg, #1a1228, #0f0b18)', border: '1px solid rgba(212,175,55,0.35)', borderRadius: 24, padding: 'clamp(24px,5vw,36px)', boxShadow: '0 32px 80px rgba(0,0,0,0.9), 0 0 80px rgba(212,175,55,0.08)' }}
            >
              <button onClick={() => setActiveStation(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 34, height: 34, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 14, display: 'grid', placeItems: 'center' }}>✕</button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', display: 'grid', placeItems: 'center', fontSize: 22 }}>✉️</div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(1rem,3.5vw,1.25rem)', fontWeight: 500, color: '#ffffff', marginBottom: 2 }}>Handwritten Letter</h3>
                  <p style={{ fontSize: 10, color: 'rgba(212,175,55,0.6)', letterSpacing: '0.12em', fontFamily: 'monospace' }}>Found inside the desk drawer</p>
                </div>
              </div>

              {/* Letter */}
              <div style={{ background: 'rgba(20,14,30,0.8)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 16, padding: 'clamp(16px,4vw,24px)', fontFamily: 'var(--font-playfair), Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(0.9rem,3vw,1rem)', color: 'rgba(228,220,210,0.88)', lineHeight: 1.85 }}>
                "October… the tenth month of the year.
                <br /><br />
                Every October, autumn turns to gold in the United Kingdom. It's the month you came into the world — and everything became brighter."
              </div>

              {/* Clue badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, padding: '12px 16px', borderRadius: 14, background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#ffd700', fontSize: 14 }}>✦</span>
                  <span style={{ fontSize: 11, color: '#f5ede2', fontWeight: 600 }}>Clue Discovered</span>
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 800, color: '#ffd700', background: 'rgba(12,9,22,0.9)', padding: '4px 12px', borderRadius: 8, border: '1px solid rgba(212,175,55,0.35)', letterSpacing: '0.06em' }}>Month = 10</span>
              </div>

              <button
                onClick={() => setActiveStation(null)}
                style={{ marginTop: 20, width: '100%', padding: '13px 24px', borderRadius: 14, background: 'linear-gradient(135deg, #c8a830, #e8d080, #c5a059)', color: '#0e0b06', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(212,175,55,0.3)' }}
              >
                Keep Clue & Return ✓
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* MUSIC BOX MODAL */}
        {activeStation === 'musicbox' && (
          <motion.div
            key="musicbox-modal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(12px,4vw,24px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 22 }}
              style={{ position: 'relative', width: '100%', maxWidth: 440, background: 'linear-gradient(145deg, #1a1228, #0f0b18)', border: '1px solid rgba(196,181,253,0.3)', borderRadius: 24, padding: 'clamp(24px,5vw,36px)', boxShadow: '0 32px 80px rgba(0,0,0,0.9)', textAlign: 'center' }}
            >
              <button onClick={() => setActiveStation(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 34, height: 34, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 14, display: 'grid', placeItems: 'center' }}>✕</button>

              <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(1.1rem,4vw,1.4rem)', fontWeight: 500, color: '#ffffff', marginBottom: 4 }}>The Carillon Music Box</h3>
              <p style={{ fontSize: 10, color: 'rgba(196,181,253,0.55)', letterSpacing: '0.12em', marginBottom: 24, fontFamily: 'monospace' }}>Wound with a hand-crafted brass key</p>

              {/* Animated crank disc */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <div style={{ position: 'relative', width: 110, height: 110 }}>
                  <motion.div
                    animate={isMusicBoxPlaying ? { rotate: 360 } : {}}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                    style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px dashed rgba(196,181,253,0.4)' }}
                  />
                  <motion.div
                    animate={isMusicBoxPlaying ? { rotate: -360 } : {}}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: '1px solid rgba(212,175,55,0.25)' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.span
                      animate={isMusicBoxPlaying ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      style={{ fontSize: 42, filter: isMusicBoxPlaying ? 'drop-shadow(0 0 16px rgba(196,181,253,0.8))' : 'none' }}
                    >
                      🎵
                    </motion.span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 12, color: 'rgba(228,220,210,0.6)', marginBottom: 20, lineHeight: 1.6 }}>
                {isMusicBoxPlaying ? '♪ Playing a gentle birthday chime… ♪' : 'Turn the crank to hear the melody hidden within.'}
              </p>

              <button
                onClick={handlePlayMusicBox}
                disabled={isMusicBoxPlaying}
                style={{ padding: '11px 28px', borderRadius: 12, background: isMusicBoxPlaying ? 'rgba(196,181,253,0.15)' : 'linear-gradient(135deg, #c4b5fd, #818cf8)', color: isMusicBoxPlaying ? 'rgba(255,255,255,0.4)' : '#0e0a1c', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: isMusicBoxPlaying ? 'not-allowed' : 'pointer', transition: 'all 0.3s' }}
              >
                {isMusicBoxPlaying ? '♪ Playing…' : 'Wind the Crank'}
              </button>

              <AnimatePresence>
                {discoveredDay && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, padding: '12px 16px', borderRadius: 14, background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', textAlign: 'left' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#ffd700', fontSize: 14 }}>✦</span>
                      <span style={{ fontSize: 11, color: '#f5ede2', fontWeight: 600 }}>Clue Discovered</span>
                    </div>
                    <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 800, color: '#ffd700', background: 'rgba(12,9,22,0.9)', padding: '4px 12px', borderRadius: 8, border: '1px solid rgba(212,175,55,0.35)', letterSpacing: '0.06em' }}>Day = 25</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setActiveStation(null)}
                style={{ marginTop: 16, width: '100%', padding: '12px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
              >
                Return to the Study
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* GIFT LOCK MODAL */}
        {activeStation === 'gift' && (
          <motion.div
            key="gift-modal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(12px,4vw,24px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={shakeGift ? { scale: 1, y: 0, x: [-8, 8, -6, 6, -3, 3, 0] } : { scale: 1, y: 0, x: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 22 }}
              style={{ position: 'relative', width: '100%', maxWidth: 420, background: 'linear-gradient(145deg, #1a0e22, #0f0b18)', border: '2px solid rgba(212,175,55,0.4)', borderRadius: 24, padding: 'clamp(24px,5vw,36px)', boxShadow: '0 32px 80px rgba(0,0,0,0.9), 0 0 80px rgba(212,175,55,0.1)', textAlign: 'center' }}
            >
              <button onClick={() => setActiveStation(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 34, height: 34, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 14, display: 'grid', placeItems: 'center' }}>✕</button>

              <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 100, background: 'rgba(109,26,36,0.6)', border: '1px solid rgba(212,175,55,0.5)', fontSize: 10, fontWeight: 800, color: '#f5e6b8', letterSpacing: '0.1em', marginBottom: 14 }}>
                Simi's Gift Box Lock
              </div>
              <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(1.2rem,4vw,1.5rem)', fontWeight: 600, color: '#ffffff', marginBottom: 6, letterSpacing: '-0.02em' }}>
                The 4-Tumbler Seal
              </h3>
              <p style={{ fontSize: 12, color: 'rgba(196,181,253,0.55)', marginBottom: 28, lineHeight: 1.6 }}>
                Align the month and day of your birthday
              </p>

              {/* Tumblers */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
                {/* Month group */}
                <div style={{ display: 'flex', gap: 6, padding: '12px 10px', borderRadius: 16, background: 'rgba(8,6,14,0.9)', border: '1px solid rgba(212,175,55,0.25)' }}>
                  {[{ val: digit1, set: setDigit1 }, { val: digit2, set: setDigit2 }].map(({ val, set }, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <button onClick={() => cycleDigit(set, 1)} style={{ background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer', fontSize: 14, padding: '2px 6px', lineHeight: 1 }}>▲</button>
                      <div style={{ width: 44, height: 58, background: 'linear-gradient(180deg, #1e1830, #120e1c)', border: '1px solid rgba(212,175,55,0.35)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#f5e6b8', fontFamily: 'monospace', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)' }}>
                        {val}
                      </div>
                      <button onClick={() => cycleDigit(set, -1)} style={{ background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer', fontSize: 14, padding: '2px 6px', lineHeight: 1 }}>▼</button>
                    </div>
                  ))}
                  <div style={{ alignSelf: 'flex-end', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', paddingBottom: 6, marginLeft: 2 }}>Mo</div>
                </div>

                <div style={{ fontSize: 22, color: '#ffd700', fontWeight: 900 }}>·</div>

                {/* Day group */}
                <div style={{ display: 'flex', gap: 6, padding: '12px 10px', borderRadius: 16, background: 'rgba(8,6,14,0.9)', border: '1px solid rgba(212,175,55,0.25)' }}>
                  {[{ val: digit3, set: setDigit3 }, { val: digit4, set: setDigit4 }].map(({ val, set }, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <button onClick={() => cycleDigit(set, 1)} style={{ background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer', fontSize: 14, padding: '2px 6px', lineHeight: 1 }}>▲</button>
                      <div style={{ width: 44, height: 58, background: 'linear-gradient(180deg, #1e1830, #120e1c)', border: '1px solid rgba(212,175,55,0.35)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#f5e6b8', fontFamily: 'monospace', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)' }}>
                        {val}
                      </div>
                      <button onClick={() => cycleDigit(set, -1)} style={{ background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer', fontSize: 14, padding: '2px 6px', lineHeight: 1 }}>▼</button>
                    </div>
                  ))}
                  <div style={{ alignSelf: 'flex-end', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)', paddingBottom: 6, marginLeft: 2 }}>Day</div>
                </div>
              </div>

              {/* Quick fill shortcut */}
              {(discoveredMonth || discoveredDay) && (
                <button
                  onClick={handleApplyDiscoveredClues}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '0 auto 16px', background: 'none', border: 'none', color: 'rgba(212,175,55,0.7)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(212,175,55,0.3)' }}
                >
                  ✦ Use my discovered clues (10 · 25)
                </button>
              )}

              {/* Error */}
              <AnimatePresence>
                {unlockError && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ fontSize: 12, color: '#fca5a5', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, lineHeight: 1.5 }}
                  >
                    {unlockError}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                onClick={handleAttemptUnlock}
                style={{ width: '100%', padding: '14px 24px', borderRadius: 14, background: 'linear-gradient(135deg, #d4af37, #f5e6b8, #c5a059)', color: '#0e0b06', fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', boxShadow: '0 4px 24px rgba(212,175,55,0.35)' }}
              >
                🔓 Release The Lock
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          ACT 03 — THE REVEAL (REDESIGNED)
      ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {act === 'reveal' && (
          <motion.div
            key="act-reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', zIndex: 10, background: 'radial-gradient(ellipse at 50% 50%, #1f0d30 0%, #0d0418 50%, #000000 100%)' }}
          >
            {/* Multi-layer burst light effects */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 3.5, 3], opacity: [0, 0.7, 0.4] }}
              transition={{ duration: 3, ease: 'easeOut' }}
              style={{ position: 'absolute', width: '80vw', height: '80vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,215,0,0.35) 0%, rgba(255,140,0,0.2) 30%, rgba(255,107,157,0.15) 50%, transparent 70%)', pointerEvents: 'none', zIndex: 0, filter: 'blur(50px)' }}
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 2.5, 2], opacity: [0, 0.5, 0.25] }}
              transition={{ duration: 2.8, ease: 'easeOut', delay: 0.3 }}
              style={{ position: 'absolute', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,181,253,0.3) 0%, rgba(139,92,246,0.15) 40%, transparent 70%)', pointerEvents: 'none', zIndex: 0, filter: 'blur(40px)' }}
            />

            {/* Enhanced rising stardust with varied particles */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
              {Array.from({ length: 60 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: '120%', x: `${(i * 2) % 100}%`, opacity: 0, scale: 0.3 }}
                  animate={{ y: '-30%', opacity: [0, 1, 0.8, 0], scale: [0.3, i % 7 === 0 ? 2 : 1.5, 0.2] }}
                  transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.08, ease: 'easeOut' }}
                  style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    width: i % 9 === 0 ? 8 : i % 6 === 0 ? 5 : 3, 
                    height: i % 9 === 0 ? 8 : i % 6 === 0 ? 5 : 3, 
                    borderRadius: '50%', 
                    background: i % 5 === 0 ? '#ffd700' : i % 5 === 1 ? '#ff6b9d' : i % 5 === 2 ? '#c4b5fd' : i % 5 === 3 ? '#ff9f43' : '#ffffff', 
                    boxShadow: `0 0 ${i % 7 === 0 ? 20 : 10}px currentColor` 
                  }}
                />
              ))}
            </div>

            {/* Floating celebration confetti */}
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={`confetti-${i}`}
                initial={{ y: -50, x: `${(i * 4) % 100}%`, opacity: 0, rotate: 0 }}
                animate={{ 
                  y: ['0vh', '110vh'], 
                  opacity: [0, 1, 0.9, 0.7, 0],
                  rotate: [0, i % 2 === 0 ? 360 : -360],
                  x: [`${(i * 4) % 100}%`, `${((i * 4) + (i % 2 === 0 ? 10 : -10)) % 100}%`]
                }}
                transition={{ duration: 5 + (i % 3), repeat: Infinity, delay: 0.5 + (i * 0.1), ease: 'linear' }}
                style={{
                  position: 'absolute',
                  top: 0,
                  width: i % 4 === 0 ? 12 : 8,
                  height: i % 4 === 0 ? 12 : 8,
                  background: i % 4 === 0 ? '#ffd700' : i % 4 === 1 ? '#ff6b9d' : i % 4 === 2 ? '#c4b5fd' : '#ff9f43',
                  borderRadius: i % 3 === 0 ? '50%' : 2,
                  boxShadow: '0 0 10px currentColor',
                  pointerEvents: 'none',
                  zIndex: 2
                }}
              />
            ))}

            {/* Content */}
            <div style={{ 
              position: 'relative', 
              zIndex: 5, 
              textAlign: 'center', 
              padding: '20px max(20px, min(5vw, 60px))', 
              maxWidth: '1600px',
              width: '100%', 
              margin: 'auto',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'max(14px, min(2vh, 32px))'
            }}>

              {/* Sweet celebration badge */}
              <motion.div
                initial={{ scale: 0, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: 'spring', damping: 12, stiffness: 200 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 'clamp(10px, 2.5vw, 12px)', padding: 'clamp(8px, 2vw, 10px) clamp(16px, 4vw, 24px)', borderRadius: 100, background: 'linear-gradient(135deg, rgba(255,215,0,0.25), rgba(255,107,157,0.2))', border: '1.5px solid rgba(255,215,0,0.5)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 30px rgba(255,215,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)', maxWidth: '90%' }}
              >
                <motion.span animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} style={{ fontSize: 'clamp(18px, 4vw, 20px)' }}>🎁</motion.span>
                <span style={{ fontSize: 'clamp(10px, 2.5vw, 13px)', fontWeight: 700, letterSpacing: 'clamp(0.06em, 0.08em, 0.08em)', color: '#ffe8a0', fontFamily: 'var(--font-poppins), sans-serif', textShadow: '0 2px 8px rgba(0,0,0,0.6)', whiteSpace: 'nowrap' }}>
                  Your special world awaits
                </span>
                <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: 'clamp(18px, 4vw, 20px)' }}>💝</motion.span>
              </motion.div>

              {/* Memorable Birthday reveal */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: '100%', maxWidth: '1200px' }}
              >
                {/* Animated celebration emojis */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'clamp(6px, 1.5vw, 16px)', marginBottom: 'max(8px, min(1.5vh, 20px))' }}
                >
                  <motion.span 
                    animate={{ rotate: [-10, 10, -10], scale: [1, 1.1, 1] }} 
                    transition={{ duration: 2.5, repeat: Infinity }}
                    style={{ display: 'inline-block', fontSize: 'min(max(32px, 3vw), 64px)', filter: 'drop-shadow(0 4px 12px rgba(255,215,0,0.5))' }}
                  >
                    🎉
                  </motion.span>
                  <motion.span 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    style={{ display: 'inline-block', fontSize: 'min(max(32px, 3vw), 64px)', filter: 'drop-shadow(0 4px 12px rgba(255,107,157,0.5))' }}
                  >
                    🎂
                  </motion.span>
                  <motion.span 
                    animate={{ rotate: [10, -10, 10], scale: [1, 1.1, 1] }} 
                    transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                    style={{ display: 'inline-block', fontSize: 'min(max(32px, 3vw), 64px)', filter: 'drop-shadow(0 4px 12px rgba(196,181,253,0.5))' }}
                  >
                    🎈
                  </motion.span>
                </motion.div>

                <h1 style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontSize: 'min(max(2rem, 3.5vw), 6rem)',
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(135deg, #ffffff 0%, #ffd700 25%, #ffb300 45%, #ff9f43 65%, #ff6b9d 85%, #c4b5fd 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '0',
                  filter: 'drop-shadow(0 0 60px rgba(255,215,0,0.5)) drop-shadow(0 8px 30px rgba(0,0,0,0.8))',
                  textShadow: 'none',
                  padding: '0 max(12px, min(3vw, 40px))',
                  maxWidth: '100%',
                }}>
                  Happy Birthday
                </h1>
                <motion.h2 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontSize: 'min(max(2.3rem, 4vw), 7rem)',
                    fontWeight: 800,
                    lineHeight: 1.05,
                    letterSpacing: '-0.04em',
                    background: 'linear-gradient(135deg, #ffd700 0%, #ff9f43 35%, #ff6b9d 70%, #ff1493 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '0',
                    filter: 'drop-shadow(0 0 70px rgba(255,107,157,0.6)) drop-shadow(0 10px 40px rgba(0,0,0,0.9))',
                    padding: '0 max(12px, min(3vw, 40px))',
                    maxWidth: '100%',
                  }}
                >
                  My Baby!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.8 }}
                  style={{ 
                    fontFamily: 'var(--font-playfair), Georgia, serif', 
                    fontStyle: 'italic', 
                    fontSize: 'min(max(13px, 1.3vw), 20px)', 
                    color: 'rgba(255,232,160,0.8)', 
                    letterSpacing: '0.08em', 
                    marginBottom: 0,
                    textShadow: '0 2px 15px rgba(0,0,0,0.8)',
                    padding: '0 max(12px, min(3vw, 40px))',
                    maxWidth: '100%',
                  }}
                >
                  Today is all about you ✨
                </motion.p>
              </motion.div>

              {/* Heartfelt message - Enhanced */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.8, duration: 1 }}
                style={{
                  padding: 'max(16px, min(2.5vw, 32px))',
                  maxWidth: '1000px',
                  width: 'calc(100% - max(24px, min(6vw, 60px)))',
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,107,157,0.08))',
                  border: '1px solid rgba(255,215,0,0.25)',
                  borderRadius: 'max(16px, min(2.5vw, 24px))',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 12px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                <blockquote style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: 'min(max(0.95rem, 1.3vw), 1.9rem)',
                  fontWeight: 500,
                  color: 'rgba(255,237,226,0.92)',
                  lineHeight: 1.65,
                  letterSpacing: '-0.01em',
                  margin: 0,
                  textShadow: '0 2px 20px rgba(0,0,0,0.7)'
                }}>
                  "I couldn't put an entire world in a box,
                  <br />
                  <span style={{ 
                    background: 'linear-gradient(135deg, #ffd700, #ff9f43, #ff6b9d)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: 700
                  }}>
                    so I made you one.
                  </span>"
                </blockquote>
              </motion.div>

              {/* What awaits inside */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 }}
                style={{ padding: '0 clamp(16px, 4vw, 20px)' }}
              >
                <p style={{ 
                  fontSize: 'min(max(12px, 1.2vw), 17px)', 
                  color: 'rgba(196,181,253,0.7)', 
                  lineHeight: 1.7, 
                  maxWidth: '900px', 
                  margin: '0 auto',
                  textShadow: '0 2px 12px rgba(0,0,0,0.8)'
                }}>
                  Inside awaits your cozy bedroom, fun games,
                  <br />
                  cherished memories, favourite music,
                  <br />
                  heartfelt letters, and Olajuwon 💖
                </p>
              </motion.div>

              {/* Enter button - Enhanced */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 clamp(16px, 4vw, 20px)' }}
              >
                <motion.button
                  onClick={handleEnterWorld}
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 70px rgba(255,215,0,0.6), 0 0 100px rgba(255,107,157,0.5)' }}
                  whileTap={{ scale: 0.96 }}
                  animate={{ 
                    boxShadow: [
                      '0 12px 50px rgba(255,107,157,0.5), 0 0 80px rgba(255,215,0,0.3)',
                      '0 16px 60px rgba(255,215,0,0.6), 0 0 90px rgba(255,107,157,0.4)',
                      '0 12px 50px rgba(255,107,157,0.5), 0 0 80px rgba(255,215,0,0.3)'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'max(10px, min(2vw, 14px))',
                    padding: 'max(14px, min(3vw, 22px)) max(28px, min(6vw, 56px))',
                    borderRadius: 100,
                    background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 30%, #ff9f43 60%, #ff6b9d 100%)',
                    color: '#1a0808',
                    fontSize: 'min(max(13px, 2.5vw), 17px)',
                    fontWeight: 900,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    border: '2px solid rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    maxWidth: '95%',
                    minWidth: 'fit-content',
                  }}
                >
                  {/* Animated shimmer */}
                  <motion.span
                    animate={{ x: ['-200%', '300%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.8, ease: 'easeInOut' }}
                    style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.9) 50%, transparent 80%)', pointerEvents: 'none' }}
                  />
                  <motion.span animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity }}>🎁</motion.span>
                  <span>Enter Your World</span>
                  <motion.span
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >→</motion.span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          ACT 04 — THE TRANSITION
      ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {act === 'transition' && (
          <motion.div
            key="act-transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 50%, #ffe8a0 0%, #f9c46a 30%, #e8834a 60%, #c53b7d 100%)' }}
          >
            <div style={{ textAlign: 'center' }}>
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                style={{ fontSize: 'clamp(40px,10vw,64px)', marginBottom: 16, filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.25))' }}
              >
                ✦
              </motion.div>
              <motion.p
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                style={{ fontFamily: 'var(--font-poppins), sans-serif', fontSize: 'clamp(12px,3vw,15px)', fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#1a0a08' }}
              >
                Opening Simi&apos;s World…
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
