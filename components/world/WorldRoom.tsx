'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import WorldSidebar from './WorldSidebar';
import RoomObject from './RoomObject';
import WorldInfoPanel from './WorldInfoPanel';
import { WORLD } from '@/data/world';
import { UniverseState, isBirthday, unlockAchievement, checkTimeBasedAchievements, exploreArea } from '@/lib/persistence';

// Import existing feature components
import MiniGameArcade from '@/components/universe/MiniGameArcade';
import DigitalPet from '@/components/universe/DigitalPet';
import DailySurprise from '@/components/universe/DailySurprise';
import MakeMeSmile from '@/components/universe/MakeMeSmile';
import OpenWhenDrawer from '@/components/universe/OpenWhenDrawer';
import MemoryGallery from '@/components/universe/MemoryGallery';
import MoodSelector from '@/components/universe/MoodSelector';
import MusicPlayer from '@/components/universe/MusicPlayer';
import BirthdayLetter from '@/components/universe/BirthdayLetter';
import Achievements from '@/components/universe/Achievements';
import DiaryEntry from '@/components/world/DiaryEntry';
import CatIcon from './CatIcon';

type View = 'home' | 'diary' | 'games' | 'pet' | 'daily' | 'smile' | 'openwhen' | 'memories' | 'mood' | 'random' | 'achievements' | 'music' | 'letter';

interface WorldRoomProps {
  state: UniverseState;
  updateState: (updates: Partial<UniverseState>) => void;
  onReplayIntro?: () => void;
}

export default function WorldRoom({ state, updateState, onReplayIntro }: WorldRoomProps) {
  const [currentView, setCurrentView] = useState<View>('home');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('evening');
  const [birthdayMode, setBirthdayMode] = useState(false);
  const [confettiItems] = useState<Array<{x:number;dur:number;delay:number;rotate:number;emoji:string}>>([]);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS

  // Ensure we're on the client
  useEffect(() => {
    setIsClient(true);
    console.log('[WorldRoom] Component mounted, state:', state);
  }, [state]);

  // Add error boundary at component level
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('[WorldRoom] Runtime error caught:', event.error);
      setRenderError(event.error?.message || 'An unexpected error occurred');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Determine time of day
  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setTimeOfDay('morning');
      else if (hour >= 12 && hour < 17) setTimeOfDay('afternoon');
      else if (hour >= 17 && hour < 21) setTimeOfDay('evening');
      else setTimeOfDay('night');
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check if it's birthday
  useEffect(() => {
    const isHerBirthday = isBirthday(
      WORLD.identity.birthday.month,
      WORLD.identity.birthday.day
    );
    
    setBirthdayMode(isHerBirthday);
    
    if (isHerBirthday && !state.birthdayVisited) {
      updateState({ 
        birthdayVisited: true,
        birthdayYear: new Date().getFullYear()
      });
      
      // Unlock birthday achievement
      if (typeof window !== 'undefined') {
        unlockAchievement('birthday-girl');
      }
    }
    
    // Check time-based achievements
    if (typeof window !== 'undefined') {
      checkTimeBasedAchievements();
    }
  }, [state, updateState]);

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    
    // Track area exploration for achievements
    if (typeof window !== 'undefined') {
      exploreArea(view);
    }
  };

  const handleBack = () => {
    setCurrentView('home');
  };

  // Get time-based greeting
  const getTimeGreeting = () => {
    if (timeOfDay === 'morning') return 'Good morning';
    if (timeOfDay === 'afternoon') return 'Good afternoon';
    if (timeOfDay === 'evening') return 'Good evening';
    return 'Hey there';
  };

  // Show loading while client initializes
  if (!isClient) {
    console.log('[WorldRoom] Waiting for client initialization...');
    return (
      <div style={{ 
        position: 'fixed', 
        inset: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'linear-gradient(135deg, #1a0f1e 0%, #2d1b3d 100%)',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center', padding: 32 }}>
          <h2 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16 }}>✨ Preparing Your World</h2>
          <p style={{ color: '#c4b5fd', fontSize: 16 }}>Just a moment...</p>
        </div>
      </div>
    );
  }

  // Show error UI if component has an error
  if (renderError) {
    return (
      <div style={{ 
        position: 'fixed', 
        inset: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'linear-gradient(135deg, #1a0f1e 0%, #2d1b3d 100%)',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        zIndex: 10000
      }}>
        <div style={{ textAlign: 'center', padding: 32, maxWidth: 500 }}>
          <h2 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16 }}>✨ Setting Up Your World</h2>
          <p style={{ color: '#c4b5fd', fontSize: 16, marginBottom: 8 }}>Just a moment...</p>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>{renderError}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: 24, 
              padding: '12px 24px', 
              background: '#c4b5fd', 
              color: '#1a0f1e', 
              border: 'none', 
              borderRadius: 8, 
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 600
            }}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  console.log('[WorldRoom] Rendering main world UI, currentView:', currentView);

  return (
    <main className="world">
      <WorldSidebar currentView={currentView} onNavigate={handleNavigate} onReplayIntro={onReplayIntro} />
      
      <section className="room">
        {/* Background bedroom image with atmospheric overlay */}
        <div className="room-background">
          <img 
            src="/images/gallery/homepage.jpg"
            alt="Simi's room"
            className="room-bg-image"
            style={{
              filter: 'brightness(0.78) contrast(1.05) saturate(1.1)',
              objectPosition: 'center center',
            }}
          />
          <div className="room-atmosphere" style={{
            background: `linear-gradient(180deg, 
              rgba(10, 5, 30, 0.25) 0%, 
              rgba(20, 5, 40, 0.35) 50%, 
              rgba(5, 0, 15, 0.70) 100%
            )`
          }} />
        </div>

        {/* Room objects rendered directly on the background image */}

        {/* Show room interface only when on home view */}
        {currentView === 'home' && (
          <>
            {/* Room Header */}
            <div className="room-header">
              <div>
                <p className="eyebrow">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long' })} {timeOfDay}
                </p>
                <h1>
                  {birthdayMode ? '🎉 Happy Birthday' : getTimeGreeting()}, {WORLD.identity.name}!
                </h1>
                <p>{birthdayMode ? 'Your special day is here!' : 'What are we doing today?'}</p>
              </div>
            </div>

            {/* Interactive Room Objects */}
            <RoomObject
              type="gift"
              position={{ left: '47%', top: '39%' }}
              label="Open Something"
              onClick={() => handleNavigate('daily')}
            >
              <div className="gift">
                <div className="gift-lid" />
                <div className="gift-box" />
                <div className="gift-ribbon" />
              </div>
            </RoomObject>

            <RoomObject
              type="game"
              position={{ left: '27%', top: '43%' }}
              label="Play"
              onClick={() => handleNavigate('games')}
            >
              <div className="controller">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M6 11h4m-2-2v4m8-1h.01M18 10h.01M9 21h6m-8-4h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
              </div>
            </RoomObject>

            <RoomObject
              type="memory"
              position={{ left: '36%', top: '62%' }}
              label="My Sunshine Moments 💖"
              onClick={() => handleNavigate('memories')}
            >
              <div className="photos-stack">
                <div className="photo photo-one" />
                <div className="photo photo-two" />
                <div className="photo photo-three" />
              </div>
            </RoomObject>

            <RoomObject
              type="music"
              position={{ left: '56%', top: '58%' }}
              label="My Vibe"
              onClick={() => handleNavigate('mood')}
            >
              <div className="turntable">
                <div className="record">
                  <div className="record-center" />
                </div>
              </div>
            </RoomObject>

            <RoomObject
              type="envelope"
              position={{ left: '66%', top: '40%' }}
              label="Open When..."
              onClick={() => handleNavigate('openwhen')}
            >
              <div className="envelope">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
            </RoomObject>

            {/* CAT — Olajuwon on the bed */}
            <motion.button
              onClick={() => handleNavigate('pet')}
              style={{
                position: 'absolute',
                left: '18%',
                top: '58%',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              {/* Birthday Greeting Tag */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: [0, -4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.92), rgba(245, 158, 11, 0.92))',
                  color: '#0e0a16',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: 12,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Waiting for you! 🐾
              </motion.div>

              {/* Cat SVG — clean cartoon black-and-white */}
              <CatIcon size={110} animated />
              {/* Name tag */}
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#ffd700',
                letterSpacing: '0.06em',
                fontFamily: 'var(--font-poppins), sans-serif',
                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
              }}>
                Olajuwon 👑
              </span>
            </motion.button>

            <RoomObject
              type="surprise"
              position={{ left: '72%', top: '65%' }}
              label="Random"
              onClick={() => handleNavigate('smile')}
            >
              <div className="crystal">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </RoomObject>

            <RoomObject
              type="mood"
              position={{ left: '79%', top: '28%' }}
              label="My Mood"
              onClick={() => handleNavigate('mood')}
            >
              <div className="mood-object">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              </div>
            </RoomObject>

            {/* Decorative Elements */}
            <div className="plant plant-one">🌿</div>
            <div className="plant plant-two">🪴</div>
            
            <div className="lamp">
              <div className="lamp-light" />
              <div className="lamp-shade" />
            </div>

            {/* Floating aesthetic elements for girly vibe */}
            <motion.div
              className="floating-element"
              style={{ left: '15%', top: '20%' }}
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              🦋
            </motion.div>

            <motion.div
              className="floating-element"
              style={{ right: '12%', top: '55%' }}
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            >
              🌸
            </motion.div>

            <motion.div
              className="floating-element"
              style={{ left: '25%', top: '80%' }}
              animate={{
                y: [0, -12, 0],
                rotate: [0, -5, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
            >
              ✨
            </motion.div>

            <motion.div
              className="floating-element"
              style={{ right: '30%', top: '15%' }}
              animate={{
                y: [0, -18, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2,
              }}
            >
              💖
            </motion.div>

            <motion.div
              className="floating-element"
              style={{ left: '70%', top: '75%' }}
              animate={{
                y: [0, -10, 0],
                x: [0, -8, 0],
              }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1.5,
              }}
            >
              🌙
            </motion.div>

            {/* Right Information Panels */}
            <WorldInfoPanel state={state} onNavigate={handleNavigate} updateState={updateState} />

            {/* Achievement Mini */}
            <div className="achievement-mini">
              <div className="trophy">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9H4.5a2.5 2.5 0 010-5H6m12 0h1.5a2.5 2.5 0 010 5H18m-6 10v-7.5m-6-2.5h12a1 1 0 011 1v4a1 1 0 01-1 1H6a1 1 0 01-1-1v-4a1 1 0 011-1z"/>
                </svg>
              </div>
              <div>
                <span>ACHIEVEMENTS</span>
                <strong>{state.unlockedAchievements?.length || 0} unlocked</strong>
              </div>
            </div>
          </>
        )}

        {/* Feature Views with AnimatePresence */}
        <AnimatePresence mode="wait">
          {currentView === 'games' && (
            <motion.div key="games" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="feature-view">
              <div className="feature-view-backdrop">
                <img src="/images/backgrounds/bg_games.jpg" alt="" className="feature-bg-img" />
                <div className="feature-bg-overlay" />
              </div>
              <div className="feature-view-inner">
                <MiniGameArcade 
                  state={state}
                  updateState={updateState}
                  onBack={handleBack}
                />
              </div>
            </motion.div>
          )}

          {currentView === 'diary' && (
            <motion.div key="diary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="feature-view">
              <div className="feature-view-backdrop">
                <img src="/images/backgrounds/bg_letters.jpg" alt="" className="feature-bg-img" />
                <div className="feature-bg-overlay" />
              </div>
              <div className="feature-view-inner" style={{ overflowY: 'auto' }}>
                <motion.button 
                  onClick={handleBack} 
                  whileHover={{ x: -4 }}
                  style={{ 
                    position: 'fixed', 
                    top: 'clamp(16px,4vw,24px)', 
                    left: 'clamp(12px,4vw,24px)', 
                    background: 'rgba(14,11,8,0.8)', 
                    border: '1px solid rgba(255,255,255,0.08)', 
                    color: '#fff', 
                    width: 44, 
                    height: 44, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: 24, 
                    zIndex: 10,
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  ←
                </motion.button>
                <DiaryEntry />
              </div>
            </motion.div>
          )}

          {currentView === 'letter' && (
            <motion.div key="letter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="feature-view">
              <div className="feature-view-backdrop">
                <img src="/images/backgrounds/bg_letters.jpg" alt="" className="feature-bg-img" />
                <div className="feature-bg-overlay" />
              </div>
              <div className="feature-view-inner" style={{ overflowY: 'auto' }}>
                <motion.button 
                  onClick={handleBack} 
                  whileHover={{ x: -4 }}
                  style={{ 
                    position: 'fixed', 
                    top: 'clamp(16px,4vw,24px)', 
                    left: 'clamp(12px,4vw,24px)', 
                    background: 'rgba(14,11,8,0.8)', 
                    border: '1px solid rgba(200,168,48,0.25)', 
                    borderRadius: 20, 
                    padding: '6px 14px', 
                    color: 'rgba(200,168,48,0.8)', 
                    cursor: 'pointer', 
                    fontSize: 'clamp(11px,3vw,13px)', 
                    fontWeight: 700, 
                    zIndex: 100 
                  }}
                >
                  ← Back
                </motion.button>
                <BirthdayLetter />
              </div>
            </motion.div>
          )}

          {currentView === 'pet' && (
            <motion.div key="pet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="feature-view">
              <div className="feature-view-backdrop">
                <img src="/images/backgrounds/bg_pet.jpg" alt="" className="feature-bg-img" />
                <div className="feature-bg-overlay" />
              </div>
              <div className="feature-view-inner">
                <DigitalPet 
                  state={state}
                  updateState={updateState}
                  onBack={handleBack}
                />
              </div>
            </motion.div>
          )}

          {currentView === 'daily' && (
            <motion.div key="daily" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="feature-view">
              <div className="feature-view-backdrop">
                <img src="/images/backgrounds/bg_daily.jpg" alt="" className="feature-bg-img" />
                <div className="feature-bg-overlay" />
              </div>
              <div className="feature-view-inner">
                <DailySurprise 
                  state={state}
                  onBack={handleBack}
                />
              </div>
            </motion.div>
          )}

          {currentView === 'smile' && (
            <motion.div key="smile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="feature-view">
              <div className="feature-view-backdrop">
                <img src="/images/backgrounds/bg_daily.jpg" alt="" className="feature-bg-img" />
                <div className="feature-bg-overlay" />
              </div>
              <div className="feature-view-inner">
                <MakeMeSmile 
                  state={state}
                  updateState={updateState}
                  onBack={handleBack}
                />
              </div>
            </motion.div>
          )}

          {currentView === 'openwhen' && (
            <motion.div key="openwhen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="feature-view">
              <div className="feature-view-backdrop">
                <img src="/images/backgrounds/bg_letters.jpg" alt="" className="feature-bg-img" />
                <div className="feature-bg-overlay" />
              </div>
              <div className="feature-view-inner">
                <OpenWhenDrawer 
                  state={state}
                  updateState={updateState}
                  onBack={handleBack}
                />
              </div>
            </motion.div>
          )}

          {currentView === 'memories' && (
            <motion.div key="memories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="feature-view">
              <div className="feature-view-backdrop">
                <img src="/images/backgrounds/bg_memories.jpg" alt="" className="feature-bg-img" />
                <div className="feature-bg-overlay" />
              </div>
              <div className="feature-view-inner">
                <MemoryGallery 
                  state={state}
                  updateState={updateState}
                  onBack={handleBack}
                />
              </div>
            </motion.div>
          )}

          {currentView === 'mood' && (
            <motion.div key="mood" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="feature-view">
              <div className="feature-view-backdrop">
                <img src="/images/backgrounds/bg_music.jpg" alt="" className="feature-bg-img" />
                <div className="feature-bg-overlay" />
              </div>
              <div className="feature-view-inner">
                <MoodSelector
                  currentMood={state.selectedMood}
                  onSelect={(mood) => { updateState({ selectedMood: mood }); setTimeout(() => setCurrentView('home'), 1000); }}
                  onBack={handleBack}
                />
              </div>
            </motion.div>
          )}

          {currentView === 'music' && (
            <motion.div key="music" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="feature-view">
              <div className="feature-view-backdrop">
                <img src="/images/backgrounds/bg_music.jpg" alt="" className="feature-bg-img" />
                <div className="feature-bg-overlay" />
              </div>
              <div className="feature-view-inner">
                <MusicPlayer state={state} updateState={updateState} onBack={handleBack} />
              </div>
            </motion.div>
          )}

          {currentView === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="feature-view"
            >
              <div className="feature-view-backdrop">
                <img src="/images/backgrounds/bg_memories.jpg" alt="" className="feature-bg-img" />
                <div className="feature-bg-overlay" />
              </div>
              <div className="feature-view-inner" style={{ overflowY: 'auto' }}>
                <Achievements state={state} onBack={handleBack} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Birthday Confetti */}
        {birthdayMode && confettiItems.length > 0 && (
          <div className="birthday-confetti">
            {confettiItems.map((item, i) => (
              <motion.div
                key={i}
                className="confetti-piece"
                initial={{ x: item.x, y: -50, rotate: 0 }}
                animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 50, rotate: item.rotate }}
                transition={{ duration: item.dur, repeat: Infinity, delay: item.delay, ease: 'linear' }}
              >
                {item.emoji}
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <style jsx global>{`
        @media (max-width: 1023px) {
          .room {
            padding-top: calc(60px + env(safe-area-inset-top, 0px));
          }
        }

        .world {
          width: 100%;
          min-height: 100vh;
          display: flex;
          overflow: clip;
          background: radial-gradient(circle at 72% 25%, rgba(255, 107, 157, 0.35), transparent 30%),
                      radial-gradient(circle at 35% 70%, rgba(155, 123, 222, 0.25), transparent 32%),
                      radial-gradient(circle at 50% 50%, rgba(212, 165, 212, 0.2), transparent 55%),
                      linear-gradient(135deg, #1a0f1e 0%, #2d1b3d 50%, #4a2f5c 100%);
          color: #fef9f5;
          font-family: var(--font-poppins), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .room {
          position: relative;
          flex: 1;
          min-height: 100vh;
          overflow: visible;
          background: linear-gradient(180deg, 
            rgba(255, 107, 157, 0.08) 0%,
            rgba(155, 123, 222, 0.12) 50%,
            rgba(212, 165, 212, 0.08) 100%
          );
        }

        .room-background {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .room-bg-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .room-atmosphere {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, 
            rgba(26, 15, 30, 0.35) 0%, 
            rgba(45, 27, 61, 0.75) 50%,
            rgba(26, 15, 30, 0.85) 100%
          );
          pointer-events: none;
        }

        /* Floating aesthetic elements */
        .floating-element {
          position: absolute;
          font-size: 32px;
          z-index: 8;
          pointer-events: none;
          filter: drop-shadow(0 6px 16px rgba(255, 107, 157, 0.6));
        }

        .room-header {
          position: absolute;
          top: 52px;
          left: 48px;
          z-index: 10;
        }

        .eyebrow {
          margin: 0 0 8px;
          color: #c4b5fd;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
        }

        .room-header h1 {
          margin: 0;
          font-family: var(--font-playfair), Georgia, serif;
          font-size: clamp(34px, 4.5vw, 62px);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #ffffff;
          text-shadow: 0 4px 24px rgba(0, 0, 0, 0.8), 0 0 30px rgba(129, 140, 248, 0.5);
        }

        .room-header p:last-child {
          margin-top: 8px;
          color: #e9d5ff;
          font-size: 16px;
          font-weight: 600;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
        }

        .world-level {
          position: absolute;
          left: 320px;
          top: 4px;
          display: flex;
          flex-direction: column;
          white-space: nowrap;
          opacity: 0.8;
        }

        .world-level span {
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.16em;
          color: rgba(255, 193, 224, 0.5);
        }

        .world-level strong {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 24px;
          font-weight: 500;
          color: #ffd700;
          text-shadow: 0 2px 12px rgba(255, 215, 0, 0.5);
        }

        /* Decorative Elements */
        .plant {
          position: absolute;
          z-index: 7;
          font-size: 60px;
          opacity: 0.8;
          filter: drop-shadow(0 10px 25px rgba(155, 123, 222, 0.4));
        }

        .plant-one {
          bottom: 6%;
          left: 5%;
        }

        .plant-two {
          bottom: 11%;
          left: 18%;
        }

        .lamp {
          position: absolute;
          right: 24%;
          bottom: 12%;
          z-index: 8;
        }

        .lamp-light {
          position: absolute;
          width: 200px;
          height: 200px;
          top: -105px;
          left: -65px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.15), transparent 70%);
          filter: blur(20px);
        }

        .lamp-shade {
          width: 58px;
          height: 48px;
          border-radius: 10px 10px 22px 22px;
          background: linear-gradient(180deg, #e0b876 0%, #d4a774 100%);
          box-shadow: 0 0 45px rgba(255, 215, 0, 0.3),
                      0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .achievement-mini {
          position: absolute;
          bottom: 25px;
          left: 25px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border: 1px solid rgba(255, 193, 224, 0.25);
          border-radius: 16px;
          background: rgba(26, 15, 30, 0.8);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(255, 107, 157, 0.2);
          z-index: 20;
        }

        .trophy {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 232, 168, 0.1));
          color: #ffd700;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        }

        .achievement-mini span,
        .achievement-mini strong {
          display: block;
        }

        .achievement-mini span {
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: rgba(255, 193, 224, 0.5);
          text-transform: uppercase;
        }

        .achievement-mini strong {
          margin-top: 3px;
          font-size: 12px;
          font-weight: 600;
          color: #fef9f5;
        }

        /* Feature Views Outer Bank Backdrop */
        .feature-view {
          position: absolute;
          inset: 0;
          z-index: 40;
          overflow: hidden;
        }

        .feature-view-backdrop {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .feature-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          filter: brightness(0.70) contrast(1.08) saturate(1.15);
        }

        .feature-bg-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(12, 8, 24, 0.45) 0%, rgba(6, 4, 12, 0.78) 100%);
        }

        .feature-view-inner {
          position: relative;
          z-index: 10;
          width: 100%;
          height: 100%;
          overflow-y: auto;
        }

        @media (max-width: 1023px) {
          .feature-view {
            top: calc(60px + env(safe-area-inset-top, 0px));  /* clear the mobile topbar */
          }

          .room-header {
            top: calc(72px + env(safe-area-inset-top, 0px));
            left: 16px;
            right: 16px;
          }

          .room-header h1 {
            font-size: 26px;
          }

          .world-level {
            position: static;
            margin-top: 10px;
          }

          .achievement-mini {
            bottom: 85px;
            left: 15px;
          }

          .plant {
            font-size: 40px;
          }

          .lamp {
            right: 15%;
            bottom: 8%;
          }
        }
      `}</style>
    </main>
  );
}
