'use client';

import { motion } from 'framer-motion';
import { UniverseState } from '@/lib/persistence';
import { WORLD } from '@/data/world';
import { useEffect, useState } from 'react';
import CatIcon from './CatIcon';

interface WorldInfoPanelProps {
  state: UniverseState;
  onNavigate: (view: any) => void;
  updateState: (updates: Partial<UniverseState>) => void;
}

export default function WorldInfoPanel({ state, onNavigate, updateState }: WorldInfoPanelProps) {
  const [currentMoodData, setCurrentMoodData] = useState<any>(null);

  useEffect(() => {
    if (state.selectedMood && WORLD.moods[state.selectedMood as keyof typeof WORLD.moods]) {
      setCurrentMoodData(WORLD.moods[state.selectedMood as keyof typeof WORLD.moods]);
    }
  }, [state.selectedMood]);

  // Get daily surprise content
  const getDailySurprise = () => {
    const today = new Date().toDateString();
    if (state.lastDailySurpriseDate === today) {
      return 'Come back tomorrow!';
    }
    return 'A new surprise awaits you';
  };

  return (
    <>
      <aside className="world-info">
        {/* Motivation Panel */}
        <motion.div
          className="info-panel surprise-panel"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="panel-heading">
            <span>Daily Motivation</span>
            <span>☀️</span>
          </div>
          <h3>Daily spark for Roqeebat</h3>
          <button onClick={() => onNavigate('daily')}>
            Open Motivation ✨
          </button>
        </motion.div>

        {/* Mood Panel */}
        <motion.div
          className="info-panel mood-panel"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="panel-heading">
            <span>Current Vibe</span>
          </div>
          {currentMoodData ? (
            <div className="mood-value">
              <span style={{ fontSize: '26px' }}>{currentMoodData.emoji}</span>
              <div>
                <strong>{currentMoodData.label}</strong>
                <small style={{ display: 'block', marginTop: '2px', fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>
                  {currentMoodData.atmosphere.description}
                </small>
              </div>
            </div>
          ) : (
            <div className="mood-value">
              <span>😊</span>
              <div>
                <strong>Set your mood</strong>
                <small style={{ display: 'block', marginTop: '2px', fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>
                  Click to choose
                </small>
              </div>
            </div>
          )}
          <button 
            onClick={() => onNavigate('mood')}
            style={{
              marginTop: '10px',
              padding: '6px 10px',
              border: '0',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '10px',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
            }}
          >
            Change Mood
          </button>
        </motion.div>

        {/* Pet Panel */}
        <motion.div
          className="info-panel pet-panel"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="pet-panel-header">
            <div className="pet-avatar" style={{ background: 'transparent', border: 'none' }}>
              <CatIcon size={38} animated />
            </div>
            <div>
              <strong>{state.petName || 'Olajuwon'}</strong>
            </div>
          </div>
          <div className="stat">
            <span>Happiness</span>
            <div className="progress">
              <i style={{ width: `${state.petHappiness || 86}%` }} />
            </div>
          </div>
          <div className="stat">
            <span>Energy</span>
            <div className="progress">
              <i style={{ width: `${state.petEnergy || 67}%` }} />
            </div>
          </div>
          <div className="stat">
            <span>Love</span>
            <div className="progress">
              <i style={{ width: `${state.petLove || 94}%` }} />
            </div>
          </div>
          <button 
            onClick={() => onNavigate('pet')}
            style={{
              marginTop: '12px',
              padding: '7px 12px',
              border: '0',
              borderRadius: '8px',
              background: 'rgba(236, 181, 211, 0.13)',
              color: '#f2bdd9',
              fontSize: '11px',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(236, 181, 211, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(236, 181, 211, 0.13)';
            }}
          >
            Visit {state.petName || 'Olajuwon'}
          </button>
        </motion.div>
      </aside>

      <style jsx>{`
        .world-info {
          position: absolute;
          right: 25px;
          top: 32px;
          width: 245px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 30;
        }

        .info-panel {
          padding: 18px;
          border: 1px solid rgba(255, 193, 224, 0.2);
          border-radius: 18px;
          background: rgba(26, 15, 30, 0.85);
          backdrop-filter: blur(25px);
          box-shadow: 0 20px 50px rgba(255, 107, 157, 0.25),
                      0 0 80px rgba(255, 193, 224, 0.1);
        }

        .panel-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255, 193, 224, 0.6);
        }

        .surprise-panel h3 {
          margin: 0 0 16px;
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 19px;
          line-height: 1.3;
          font-weight: 400;
          color: #fef9f5;
          text-shadow: 0 2px 15px rgba(255, 107, 157, 0.3);
        }

        .surprise-panel button {
          padding: 9px 15px;
          border: 0;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(255, 193, 224, 0.15));
          color: #ffc1e0;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 107, 157, 0.2);
        }

        .surprise-panel button:hover {
          background: linear-gradient(135deg, rgba(255, 107, 157, 0.3), rgba(255, 193, 224, 0.25));
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 107, 157, 0.35);
        }

        .mood-value {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mood-value span {
          font-size: 23px;
        }

        .mood-value strong {
          font-size: 13px;
          font-weight: 600;
          color: #fef9f5;
        }

        .music-panel {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .album-art {
          width: 50px;
          height: 50px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 10px;
          background: linear-gradient(135deg, #818cf8, #c084fc);
          font-size: 22px;
          box-shadow: 0 4px 20px rgba(129, 140, 248, 0.4);
        }

        .music-panel strong,
        .music-panel small {
          display: block;
        }

        .music-panel strong {
          margin-top: 4px;
          font-size: 13px;
          font-weight: 600;
          color: #fef9f5;
        }

        .music-panel small {
          margin-top: 3px;
          font-size: 10px;
          color: rgba(255, 193, 224, 0.6);
        }

        .small-label {
          font-size: 8px;
          letter-spacing: 0.14em;
          color: rgba(255, 193, 224, 0.5);
          text-transform: uppercase;
          font-weight: 600;
        }

        .pet-panel-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .pet-avatar {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255, 193, 224, 0.2), rgba(212, 165, 212, 0.1));
          border: 2px solid rgba(255, 193, 224, 0.3);
          font-size: 22px;
          box-shadow: 0 4px 20px rgba(255, 107, 157, 0.3);
        }

        .pet-panel-header strong,
        .pet-panel-header span {
          display: block;
        }

        .pet-panel-header strong {
          font-size: 14px;
          font-weight: 600;
          color: #fef9f5;
        }

        .pet-panel-header span {
          margin-top: 3px;
          font-size: 9px;
          color: rgba(255, 193, 224, 0.6);
          font-weight: 500;
        }

        .stat {
          margin-top: 12px;
        }

        .stat > span {
          display: block;
          margin-bottom: 6px;
          font-size: 8px;
          color: rgba(255, 193, 224, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
        }

        .progress {
          height: 5px;
          overflow: hidden;
          border-radius: 20px;
          background: rgba(255, 193, 224, 0.15);
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .progress i {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #818cf8, #c084fc);
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 10px rgba(129, 140, 248, 0.5);
        }

        @media (max-width: 1100px) {
          .world-info {
            width: 205px;
          }
        }

        @media (max-width: 800px) {
          .world-info {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
