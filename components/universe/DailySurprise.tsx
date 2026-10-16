'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { UniverseState } from '@/lib/persistence';
import { getDailyMotivation, DailyMotivation } from '@/lib/dailyMotivation';
import { sounds } from '@/lib/audioSynthesis';

interface DailySurpriseProps {
  state: UniverseState;
  onBack: () => void;
}

export default function DailySurprise({ state, onBack }: DailySurpriseProps) {
  const [motivation, setMotivation] = useState<DailyMotivation | null>(null);
  const [opened, setOpened] = useState(false);
  const [activeTab, setActiveTab] = useState<'quote' | 'reflection' | 'affirmation' | 'spark'>('quote');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const data = getDailyMotivation();
    setMotivation(data);
    // Check if she opened it today previously from localStorage
    try {
      const savedOpenedDate = localStorage.getItem('roqeebat_daily_motivation_date');
      const todayKey = new Date().toDateString();
      if (savedOpenedDate === todayKey) {
        setOpened(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleOpen = () => {
    try {
      sounds.reveal();
    } catch (e) {}
    setOpened(true);
    try {
      localStorage.setItem('roqeebat_daily_motivation_date', new Date().toDateString());
    } catch (e) {}
  };

  const handleCopyQuote = () => {
    if (!motivation) return;
    try {
      sounds.click();
    } catch (e) {}
    const text = `"${motivation.quote}" — Today's Motivation for Roqeebat ✨\nAffirmation: ${motivation.affirmation}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  if (!motivation) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(16px, 5vw, 40px)',
        paddingTop: 'clamp(72px, 12vw, 84px)',
        paddingBottom: 'clamp(40px, 8vw, 60px)',
        boxSizing: 'border-box',
        overflowY: 'auto',
        fontFamily: 'var(--font-poppins), sans-serif',
        color: '#f0ece4',
        position: 'relative',
      }}
    >
      {/* Back button */}
      <motion.button
        onClick={() => {
          try { sounds.click(); } catch (e) {}
          onBack();
        }}
        whileHover={{ x: -4, scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'absolute',
          top: 'clamp(16px, 4vw, 24px)',
          left: 'clamp(12px, 4vw, 24px)',
          background: 'rgba(18, 14, 24, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          borderRadius: 24,
          padding: '8px 18px',
          color: '#e8d4a0',
          cursor: 'pointer',
          fontSize: 'clamp(11px, 3vw, 13px)',
          fontWeight: 600,
          letterSpacing: '0.04em',
          zIndex: 20,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        ← Back
      </motion.button>

      {/* Main Container */}
      <div style={{ maxWidth: 620, width: '100%', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        
        {/* Top Header Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 30,
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            color: '#ffd980',
            fontSize: 'clamp(11px, 2.8vw, 12.5px)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          <span>☀️ Daily Motivation</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span>{motivation.dateFormatted}</span>
        </motion.div>

        <h1
          style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(1.6rem, 5.5vw, 2.4rem)',
            color: '#fff5df',
            lineHeight: 1.25,
            margin: '0 0 10px 0',
            fontWeight: 500,
            textShadow: '0 2px 20px rgba(212,175,55,0.25)',
          }}
        >
          Your Morning Spark, Roqeebat ✨
        </h1>

        <p
          style={{
            color: 'rgba(240, 220, 200, 0.75)',
            fontSize: 'clamp(12px, 3.2vw, 14.5px)',
            maxWidth: 480,
            margin: '0 auto 28px auto',
            lineHeight: 1.6,
          }}
        >
          A completely unique dose of power, wisdom, and confidence tailored for you every single sunrise.
        </p>

        {/* Closed Sealed Capsule State */}
        {!opened ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              padding: 'clamp(28px, 6vw, 44px) 20px',
              borderRadius: 28,
              background: 'radial-gradient(ellipse at center, rgba(38, 26, 48, 0.75) 0%, rgba(16, 11, 22, 0.88) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6), inset 0 0 24px rgba(212, 175, 55, 0.08)',
              backdropFilter: 'blur(16px)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                margin: '0 auto 20px auto',
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.25), rgba(255, 107, 157, 0.25))',
                border: '1.5px solid rgba(255, 215, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 44,
                boxShadow: '0 0 35px rgba(255, 215, 0, 0.35)',
              }}
            >
              🕯️
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
                color: '#ffeacc',
                marginBottom: 8,
              }}
            >
              Today&apos;s Theme: {motivation.theme}
            </h3>

            <p style={{ color: 'rgba(235, 210, 190, 0.7)', fontSize: 13, marginBottom: 26 }}>
              Tap below to unseal today&apos;s bespoke inspiration and power affirmation.
            </p>

            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 10px 32px rgba(255, 200, 70, 0.45)' }}
              whileTap={{ scale: 0.96 }}
              onClick={handleOpen}
              style={{
                background: 'linear-gradient(135deg, #ffd700 0%, #e6a817 50%, #c47c0b 100%)',
                color: '#1a1006',
                border: 'none',
                padding: '14px 34px',
                borderRadius: 30,
                fontSize: 'clamp(13px, 3.5vw, 15px)',
                fontWeight: 700,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 8px 24px rgba(255, 200, 70, 0.3)',
              }}
            >
              <span>✨ Reveal Today&apos;s Motivation</span>
            </motion.button>
          </motion.div>
        ) : (
          /* Opened / Active Motivation Sanctuary */
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            style={{
              borderRadius: 28,
              background: 'radial-gradient(ellipse at top, rgba(34, 22, 44, 0.88) 0%, rgba(14, 9, 20, 0.94) 100%)',
              border: '1.5px solid rgba(220, 180, 70, 0.4)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7), inset 0 0 30px rgba(220, 180, 70, 0.1)',
              backdropFilter: 'blur(20px)',
              padding: 'clamp(20px, 5vw, 36px)',
              textAlign: 'left',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top pill bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10,
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: '1px solid rgba(220, 180, 70, 0.18)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>👑</span>
                <span style={{ color: '#ffd980', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}>
                  {motivation.theme}
                </span>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    padding: '2px 8px',
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  Day #{motivation.dayNumber}
                </span>
              </div>

              {/* Copy Quote Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyQuote}
                style={{
                  background: copied ? 'rgba(74, 222, 128, 0.2)' : 'rgba(220, 180, 70, 0.15)',
                  border: `1px solid ${copied ? 'rgba(74, 222, 128, 0.5)' : 'rgba(220, 180, 70, 0.3)'}`,
                  color: copied ? '#4ade80' : '#ffd980',
                  borderRadius: 18,
                  padding: '5px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{copied ? '✓ Saved to Clipboard' : '📋 Copy Inspiration'}</span>
              </motion.button>
            </div>

            {/* Nav Tabs for different sections */}
            <div
              style={{
                display: 'flex',
                gap: 6,
                marginBottom: 22,
                background: 'rgba(0,0,0,0.3)',
                padding: 4,
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {[
                { id: 'quote', label: 'Quote', icon: '💬' },
                { id: 'reflection', label: 'Reflection', icon: '🪞' },
                { id: 'affirmation', label: 'Affirmation', icon: '💎' },
                { id: 'spark', label: 'Action Spark', icon: '⚡' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    try { sounds.click(); } catch (e) {}
                    setActiveTab(tab.id as any);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: 12,
                    border: 'none',
                    background: activeTab === tab.id ? 'linear-gradient(135deg, #ffd700, #d49510)' : 'transparent',
                    color: activeTab === tab.id ? '#1a1005' : 'rgba(240, 225, 205, 0.7)',
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    fontSize: 'clamp(11px, 2.7vw, 12.5px)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div style={{ minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <AnimatePresence mode="wait">
                {activeTab === 'quote' && (
                  <motion.div
                    key="quote"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div style={{ fontSize: 32, color: 'rgba(255, 215, 0, 0.4)', lineHeight: 1 }}>“</div>
                    <blockquote
                      style={{
                        margin: '0 0 14px 0',
                        fontSize: 'clamp(1.05rem, 3.8vw, 1.25rem)',
                        fontFamily: 'var(--font-playfair), Georgia, serif',
                        color: '#fff5df',
                        lineHeight: 1.6,
                        fontStyle: 'italic',
                      }}
                    >
                      {motivation.quote}
                    </blockquote>
                    <div style={{ color: 'rgba(255, 215, 0, 0.7)', fontSize: 12, fontWeight: 600 }}>
                      — Dedicated to Roqeebat Similoluwa
                    </div>
                  </motion.div>
                )}

                {activeTab === 'reflection' && (
                  <motion.div
                    key="reflection"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div style={{ color: '#ffd980', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                      Deep Reflection
                    </div>
                    <p style={{ margin: 0, fontSize: 'clamp(13.5px, 3.4vw, 15px)', color: 'rgba(255, 240, 225, 0.9)', lineHeight: 1.7 }}>
                      {motivation.reflection}
                    </p>
                  </motion.div>
                )}

                {activeTab === 'affirmation' && (
                  <motion.div
                    key="affirmation"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div style={{ color: '#ffd980', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                      Speak This Out Loud Today
                    </div>
                    <div
                      style={{
                        background: 'rgba(255, 215, 0, 0.08)',
                        borderLeft: '3px solid #ffd700',
                        padding: '12px 16px',
                        borderRadius: '0 12px 12px 0',
                        fontSize: 'clamp(14px, 3.6vw, 16px)',
                        color: '#fff3d1',
                        fontStyle: 'italic',
                        lineHeight: 1.6,
                      }}
                    >
                      &ldquo;{motivation.affirmation}&rdquo;
                    </div>
                  </motion.div>
                )}

                {activeTab === 'spark' && (
                  <motion.div
                    key="spark"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div style={{ color: '#ffd980', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                      Today&apos;s Micro-Action
                    </div>
                    <p style={{ margin: 0, fontSize: 'clamp(13.5px, 3.4vw, 15px)', color: 'rgba(255, 240, 225, 0.92)', lineHeight: 1.7 }}>
                      {motivation.sparkAction}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer note */}
            <div
              style={{
                marginTop: 24,
                paddingTop: 16,
                borderTop: '1px solid rgba(220, 180, 70, 0.15)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <span style={{ color: 'rgba(240, 220, 200, 0.5)', fontSize: 11.5 }}>
                ✨ Fresh bespoke motivation unlocks every midnight (UK Time)
              </span>
            </div>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
}

