'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { WORLD } from '@/data/world';
import { UniverseState } from '@/lib/persistence';

interface OpenWhenDrawerProps {
  state: UniverseState;
  updateState: (updates: Partial<UniverseState>) => void;
  onBack: () => void;
}

const ENVELOPE_ICONS: Record<string, string> = {
  sad: '😢', bored: '😑', missMe: '🥺', angry: '😤',
  cantSleep: '🌙', motivation: '🔥', laugh: '😂', greatDay: '🌟',
};

export default function OpenWhenDrawer({ state, updateState, onBack }: OpenWhenDrawerProps) {
  const [selectedEnvelope, setSelectedEnvelope] = useState<string | null>(null);

  const envelopes = [
    { id: 'sad',        ...WORLD.openWhen.sad },
    { id: 'bored',      ...WORLD.openWhen.bored },
    { id: 'missMe',     ...WORLD.openWhen.missMe },
    { id: 'angry',      ...WORLD.openWhen.angry },
    { id: 'cantSleep',  ...WORLD.openWhen.cantSleep },
    { id: 'motivation', ...WORLD.openWhen.motivation },
    { id: 'laugh',      ...WORLD.openWhen.laugh },
    { id: 'greatDay',   ...WORLD.openWhen.greatDay },
  ];

  const handleOpen = (id: string) => {
    if (!state.openedEnvelopes.includes(id)) {
      updateState({ openedEnvelopes: [...state.openedEnvelopes, id] });
    }
    setSelectedEnvelope(id);
  };

  const selectedContent = envelopes.find(e => e.id === selectedEnvelope);

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
        justifyContent: 'flex-start',
        padding: 'clamp(16px, 5vw, 40px)',
        paddingTop: 'clamp(72px, 12vw, 80px)',
        paddingBottom: 'clamp(24px, 5vw, 40px)',
        boxSizing: 'border-box',
        overflowY: 'auto',
        fontFamily: 'var(--font-poppins), sans-serif',
      }}
    >
      <motion.button
        onClick={onBack}
        whileHover={{ x: -4 }}
        style={{
          position: 'absolute',
          top: 'clamp(16px, 4vw, 24px)',
          left: 'clamp(12px, 4vw, 24px)',
          background: 'rgba(14,11,8,0.8)',
          border: '1px solid rgba(200,168,48,0.25)',
          borderRadius: 20,
          padding: '6px 14px',
          color: 'rgba(200,168,48,0.8)',
          cursor: 'pointer',
          fontSize: 'clamp(11px, 3vw, 13px)',
          fontWeight: 700,
          zIndex: 10,
        }}
      >
        ← Back
      </motion.button>

      <AnimatePresence mode="wait">
        {!selectedEnvelope ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -30 }}
            style={{ maxWidth: 600, width: '100%' }}
          >
            <h2 style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(1.3rem, 5vw, 2rem)',
              color: '#e8d4a0',
              marginBottom: 'clamp(16px, 5vw, 28px)',
              textAlign: 'center',
              fontWeight: 400,
            }}>Open When... 💌</h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(130px, 40vw, 160px), 1fr))',
              gap: 'clamp(8px, 2.5vw, 14px)',
            }}>
              {envelopes.map((envelope, index) => {
                const isOpened = state.openedEnvelopes.includes(envelope.id);
                return (
                  <motion.button
                    key={envelope.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpen(envelope.id)}
                    style={{
                      background: isOpened ? 'rgba(200,168,48,0.08)' : 'rgba(20,16,12,0.88)',
                      border: `1px solid ${isOpened ? 'rgba(200,168,48,0.3)' : 'rgba(200,168,48,0.15)'}`,
                      borderRadius: 16,
                      padding: 'clamp(12px, 3.5vw, 18px) 10px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      position: 'relative',
                    }}
                  >
                    <div style={{ fontSize: 'clamp(26px, 8vw, 34px)', marginBottom: 6, lineHeight: 1 }}>
                      {isOpened ? ENVELOPE_ICONS[envelope.id] : '💌'}
                    </div>
                    <p style={{
                      color: '#e8d4a0',
                      fontSize: 'clamp(9px, 2.5vw, 11px)',
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      margin: 0,
                      lineHeight: 1.3,
                    }}>{envelope.title}</p>
                    {isOpened && (
                      <div style={{
                        position: 'absolute', top: 8, right: 8,
                        width: 7, height: 7, borderRadius: '50%',
                        background: '#c8a830', boxShadow: '0 0 6px rgba(200,168,48,0.7)',
                      }} />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            style={{ maxWidth: 520, width: '100%' }}
          >
            <motion.button
              onClick={() => setSelectedEnvelope(null)}
              whileHover={{ x: -3 }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(200,168,48,0.6)',
                cursor: 'pointer',
                fontSize: 'clamp(11px, 3vw, 13px)',
                fontWeight: 600,
                marginBottom: 'clamp(14px, 4vw, 20px)',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              ← All letters
            </motion.button>

            <div style={{
              background: 'rgba(20,16,12,0.9)',
              border: '1px solid rgba(200,168,48,0.22)',
              borderRadius: 20,
              padding: 'clamp(18px, 5vw, 32px)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
                color: '#e8d4a0',
                marginBottom: 'clamp(12px, 4vw, 20px)',
                fontWeight: 400,
              }}>{selectedContent?.title}</h3>
              <p style={{
                color: '#c8b89a',
                fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',
                lineHeight: 1.8,
                whiteSpace: 'pre-line',
              }}>
                {selectedContent?.content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
