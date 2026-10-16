'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { WORLD } from '@/data/world';
import { UniverseState } from '@/lib/persistence';
import { isBirthday } from '@/lib/persistence';
import RoomEnvironment from './RoomEnvironment';
import NavigationHub from './NavigationHub';
import MiniGameArcade from './MiniGameArcade';
import DigitalPet from './DigitalPet';
import DailySurprise from './DailySurprise';
import CatIcon from '@/components/world/CatIcon';
import MakeMeSmile from './MakeMeSmile';
import OpenWhenDrawer from './OpenWhenDrawer';
import MemoryGallery from './MemoryGallery';
import MoodSelector from './MoodSelector';

type View = 
  | 'home'
  | 'games'
  | 'pet'
  | 'daily'
  | 'smile'
  | 'openwhen'
  | 'memories'
  | 'mood'
  | 'random';

interface HomeWorldProps {
  state: UniverseState;
  updateState: (updates: Partial<UniverseState>) => void;
}

export default function HomeWorld({ state, updateState }: HomeWorldProps) {
  const [currentView, setCurrentView] = useState<View>('home');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('evening');
  const [showFirstVisitMessage, setShowFirstVisitMessage] = useState(false);
  const [birthdayMode, setBirthdayMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    const interval = setInterval(updateTimeOfDay, 60000); // Check every minute

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
    }
  }, [state, updateState]);

  // First visit message
  useEffect(() => {
    if (state.totalVisits === 1) {
      setTimeout(() => setShowFirstVisitMessage(true), 2000);
      setTimeout(() => setShowFirstVisitMessage(false), 6000);
    }
  }, [state.totalVisits]);

  // Get current mood atmosphere
  const currentMood = state.selectedMood 
    ? WORLD.moods[state.selectedMood as keyof typeof WORLD.moods]
    : null;

  const handleNavigate = (view: View) => {
    setCurrentView(view);
  };

  const handleBack = () => {
    setCurrentView('home');
  };

  return (
    <div 
      className="relative w-full h-full transition-colors duration-1000"
      style={{
        background: 'linear-gradient(135deg, #1a0f1e 0%, #2d1b3d 50%, #1e2a4a 100%)'
      }}
    >
      {/* 3D Room Environment with bedroom background (always visible) */}
      <RoomEnvironment 
        timeOfDay={timeOfDay}
        mood={currentMood}
        birthdayMode={birthdayMode}
      />

      {/* Mobile Hamburger Menu Button - Modern Glass & Morphing SVG */}
      <motion.button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-3 right-4 z-50 p-2.5 rounded-2xl backdrop-blur-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 10, 22, 0.95), rgba(26, 18, 40, 0.92))',
          border: '1px solid rgba(196, 181, 253, 0.35)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(129, 140, 248, 0.25)',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <motion.path
            strokeWidth="2.2"
            strokeLinecap="round"
            stroke="#ffffff"
            animate={mobileMenuOpen ? { d: 'M 5 5 L 19 19' } : { d: 'M 4 7 L 20 7' }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          />
          <motion.path
            strokeWidth="2.2"
            strokeLinecap="round"
            stroke="#ffffff"
            animate={mobileMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.15 }}
            style={{ transformOrigin: 'center' }}
            d="M 4 12 L 20 12"
          />
          <motion.path
            strokeWidth="2.2"
            strokeLinecap="round"
            stroke="#ffffff"
            animate={mobileMenuOpen ? { d: 'M 5 19 L 19 5' } : { d: 'M 8 17 L 20 17' }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          />
        </svg>
      </motion.button>

      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/75 backdrop-blur-md z-40"
            />
            
            {/* Menu Panel - Website Theme Design */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-72 backdrop-blur-2xl z-40 overflow-y-auto"
              style={{
                background: 'linear-gradient(180deg, rgba(14, 10, 22, 0.98) 0%, rgba(22, 16, 36, 0.97) 50%, rgba(14, 10, 22, 0.98) 100%)',
                borderRight: '1px solid rgba(196, 181, 253, 0.25)',
                boxShadow: '12px 0 40px rgba(0, 0, 0, 0.8), inset -1px 0 20px rgba(129, 140, 248, 0.1)'
              }}
            >
              <div className="p-6">
                {/* Header with fancy logo */}
                <div className="mb-8 text-center">
                  <motion.div 
                    className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-3"
                    style={{
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(255, 158, 183, 0.2))',
                      border: '2px solid rgba(212, 175, 55, 0.5)',
                      boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3), inset 0 2px 15px rgba(255, 255, 255, 0.1)'
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-4xl">✨</span>
                  </motion.div>
                  <h2 className="text-text-primary text-2xl font-light mb-2">Her World</h2>
                  <p className="text-text-secondary text-sm">Your little corner of the internet ♡</p>
                </div>

                <nav className="space-y-2">
                  <MobileMenuButton 
                    icon="🏠" 
                    label="Home" 
                    active={currentView === 'home'} 
                    onClick={() => {
                      setCurrentView('home');
                      setMobileMenuOpen(false);
                    }} 
                  />
                  <MobileMenuButton 
                    icon="🎮" 
                    label="Play Games" 
                    onClick={() => {
                      setCurrentView('games');
                      setMobileMenuOpen(false);
                    }} 
                  />
                  <MobileMenuButton 
                    icon="📸" 
                    label="Best Pics of You" 
                    onClick={() => {
                      setCurrentView('memories');
                      setMobileMenuOpen(false);
                    }} 
                  />
                  <MobileMenuButton 
                    icon="🎵" 
                    label="Music & Vibes" 
                    onClick={() => {
                      setCurrentView('mood');
                      setMobileMenuOpen(false);
                    }} 
                  />
                  <MobileMenuButton 
                    icon="💌" 
                    label="Open When..." 
                    onClick={() => {
                      setCurrentView('openwhen');
                      setMobileMenuOpen(false);
                    }} 
                  />
                  <MobileMenuButton 
                    icon="🐾" 
                    label="My Pet" 
                    onClick={() => {
                      setCurrentView('pet');
                      setMobileMenuOpen(false);
                    }} 
                  />
                  <MobileMenuButton 
                    icon="😊" 
                    label="Mood Selector" 
                    onClick={() => {
                      setCurrentView('mood');
                      setMobileMenuOpen(false);
                    }} 
                  />
                  <MobileMenuButton 
                    icon="✨" 
                    label="Surprise Me" 
                    onClick={() => {
                      setCurrentView('daily');
                      setMobileMenuOpen(false);
                    }} 
                  />
                  <MobileMenuButton 
                    icon="🏆" 
                    label="Achievements" 
                    onClick={() => setMobileMenuOpen(false)} 
                  />
                  <MobileMenuButton 
                    icon="👤" 
                    label="Profile" 
                    onClick={() => setMobileMenuOpen(false)} 
                  />
                </nav>

                {/* Footer */}
                <div className="mt-8 pt-6" style={{
                  borderTop: '1px solid rgba(212, 175, 55, 0.2)'
                }}>
                  <div className="text-center">
                    <div className="text-3xl mb-2">
                      {timeOfDay === 'evening' ? '🌆' : timeOfDay === 'night' ? '🌙' : timeOfDay === 'morning' ? '🌅' : '☀️'}
                    </div>
                    <p className="text-text-secondary text-sm">{timeOfDay === 'evening' ? 'Evening' : timeOfDay === 'night' ? 'Night' : timeOfDay === 'morning' ? 'Morning' : 'Afternoon'}</p>
                    <p className="text-text-secondary/60 text-xs mt-1">Good vibes only ♡</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Left Sidebar Navigation - Fancy Design */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 lg:w-24 backdrop-blur-xl z-30 border-r" style={{
        background: 'linear-gradient(180deg, rgba(26, 15, 30, 0.95) 0%, rgba(45, 27, 61, 0.9) 50%, rgba(30, 42, 74, 0.95) 100%)',
        borderRight: '1px solid rgba(212, 175, 55, 0.2)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.5), inset -1px 0 20px rgba(212, 175, 55, 0.1)'
      }}>
        <div className="flex flex-col h-full w-full py-6 px-2">
          {/* Logo/Title */}
          <div className="mb-8 text-center">
            <motion.div 
              className="w-12 h-12 lg:w-14 lg:h-14 mx-auto rounded-2xl flex items-center justify-center mb-2"
              style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(255, 158, 183, 0.2))',
                border: '2px solid rgba(212, 175, 55, 0.4)',
                boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3), inset 0 2px 10px rgba(255, 255, 255, 0.1)'
              }}
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <span className="text-2xl lg:text-3xl">✨</span>
            </motion.div>
            <p className="text-text-secondary text-[10px] lg:text-xs font-medium">Her World</p>
          </div>

          <nav className="flex-1 space-y-3 overflow-y-auto">
            <NavButton icon="🏠" label="Home" active={currentView === 'home'} onClick={() => setCurrentView('home')} />
            <NavButton icon="🎮" label="Play" onClick={() => setCurrentView('games')} />
            <NavButton icon="📸" label="Photos" onClick={() => setCurrentView('memories')} />
            <NavButton icon="🎵" label="Music" onClick={() => setCurrentView('mood')} />
            <NavButton icon="💌" label="Letters" onClick={() => setCurrentView('openwhen')} />
            <NavButton icon="🐾" label="Pet" onClick={() => setCurrentView('pet')} />
            <NavButton icon="😊" label="Mood" onClick={() => setCurrentView('mood')} />
            <NavButton icon="✨" label="Magic" onClick={() => setCurrentView('daily')} />
            <NavButton icon="🏆" label="Awards" />
            <NavButton icon="👤" label="Me" />
          </nav>

          {/* Footer */}
          <div className="mt-4 text-center">
            <div className="text-text-secondary text-[10px] mb-2">{timeOfDay === 'evening' ? '🌆' : timeOfDay === 'night' ? '🌙' : timeOfDay === 'morning' ? '🌅' : '☀️'}</div>
            <div className="w-full h-px" style={{
              background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3), transparent)'
            }} />
          </div>
        </div>
      </div>

      {/* Main 3D Room Content Area - Fully Responsive with proper padding */}
      <div className="w-full h-full md:ml-20 lg:ml-24 lg:mr-72 xl:mr-80 relative z-10 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <NavigationHub 
              key="home"
              name={WORLD.identity.name}
              onNavigate={handleNavigate}
              birthdayMode={birthdayMode}
            />
          )}

          {currentView === 'games' && (
            <MiniGameArcade 
              key="games"
              state={state}
              updateState={updateState}
              onBack={handleBack}
            />
          )}

          {currentView === 'pet' && (
            <DigitalPet
              key="pet"
              state={state}
              updateState={updateState}
              onBack={handleBack}
            />
          )}

          {currentView === 'daily' && (
            <DailySurprise
              key="daily"
              state={state}
              onBack={handleBack}
            />
          )}

          {currentView === 'smile' && (
            <MakeMeSmile
              key="smile"
              state={state}
              updateState={updateState}
              onBack={handleBack}
            />
          )}

          {currentView === 'openwhen' && (
            <OpenWhenDrawer
              key="openwhen"
              state={state}
              updateState={updateState}
              onBack={handleBack}
            />
          )}

          {currentView === 'memories' && (
            <MemoryGallery
              key="memories"
              state={state}
              updateState={updateState}
              onBack={handleBack}
            />
          )}

          {currentView === 'mood' && (
            <MoodSelector
              key="mood"
              currentMood={state.selectedMood}
              onSelect={(mood) => {
                updateState({ selectedMood: mood });
                setTimeout(() => setCurrentView('home'), 1000);
              }}
              onBack={handleBack}
            />
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* Right Sidebar Widgets - Heart/Love Shape Layout - Elevated z-index */}
      <div className="hidden lg:block fixed right-4 xl:right-8 top-1/2 -translate-y-1/2 w-64 xl:w-72 z-50 pointer-events-none">
        {/* Heart Shape Container */}
        <div className="relative pointer-events-auto" style={{ height: '650px' }}>
          
          {/* Top of Heart - Left Bump */}
          <motion.div
            initial={{ opacity: 0, x: 50, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-0 left-2"
            style={{ width: '48%' }}
          >
            <div className="backdrop-blur-xl border border-soft-pink/30 rounded-2xl p-3"
              style={{
                background: 'linear-gradient(135deg, rgba(26, 15, 30, 0.95), rgba(45, 27, 61, 0.85))',
                boxShadow: '0 8px 32px rgba(212, 175, 55, 0.25), 0 0 50px rgba(212, 175, 55, 0.15)'
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🎁</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-text-primary text-xs font-semibold truncate">Today's Surprise</h3>
                  <p className="text-text-secondary text-[10px]">A little something just for you...</p>
                </div>
              </div>
              <button 
                onClick={() => setCurrentView('daily')}
                className="w-full text-center text-soft-pink text-xs hover:text-warm-amber transition-colors py-1.5 rounded-lg hover:bg-white/5"
              >
                Open it →
              </button>
            </div>
          </motion.div>

          {/* Top of Heart - Right Bump */}
          <motion.div
            initial={{ opacity: 0, x: 50, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute top-0 right-2"
            style={{ width: '48%' }}
          >
            <div className="backdrop-blur-xl border border-soft-pink/30 rounded-2xl p-3"
              style={{
                background: 'linear-gradient(135deg, rgba(26, 15, 30, 0.95), rgba(45, 27, 61, 0.85))',
                boxShadow: '0 8px 32px rgba(212, 175, 55, 0.25), 0 0 50px rgba(212, 175, 55, 0.15)'
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">😊</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-text-primary text-xs font-semibold">Current Mood</h3>
                  <p className="text-text-secondary text-[10px]">How are you feeling?</p>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap justify-center">
                {['😊', '🥹', '😴', '😤', '😭', '🤪'].map((emoji, i) => (
                  <button
                    key={i}
                    className="w-7 h-7 hover:scale-125 transition-transform text-base bg-white/5 hover:bg-white/10 rounded-lg"
                    title="Select mood"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Upper Middle - Curves of heart getting wider */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute top-32 left-0 right-0"
          >
            <div className="backdrop-blur-xl border-2 border-soft-pink/40 rounded-2xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(26, 15, 30, 0.95), rgba(45, 27, 61, 0.85))',
                boxShadow: '0 12px 40px rgba(212, 175, 55, 0.3), 0 0 60px rgba(255, 158, 183, 0.2)'
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 flex items-center justify-center">
                  <CatIcon size={44} animated />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-text-primary text-base font-semibold truncate">{state.petName || 'Olajuwon'}</h3>
                </div>
              </div>
              <div className="space-y-2.5">
                <StatBar icon="💖" label="Happiness" value={state.petHappiness} color="pink" />
                <StatBar icon="⚡" label="Energy" value={state.petEnergy} color="yellow" />
                <StatBar icon="💝" label="Love" value={state.petLove} color="purple" />
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10 mt-2">
                  <span className="text-text-secondary">XP</span>
                  <span className="text-warm-amber font-semibold">{state.petXP || 120} / 300</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Center - Widest part of heart */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute top-80 left-0 right-0"
          >
            <div className="backdrop-blur-xl border-2 border-warm-amber/40 rounded-2xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(26, 15, 30, 0.95), rgba(45, 27, 61, 0.85))',
                boxShadow: '0 12px 40px rgba(212, 175, 55, 0.35), 0 0 70px rgba(212, 175, 55, 0.25)'
              }}
            >
              <h3 className="text-text-primary text-sm font-semibold mb-3 flex items-center gap-2">
                <span>🏆</span> Achievements
                <span className="ml-auto text-xs text-text-secondary">View all →</span>
              </h3>
              <div className="flex gap-2.5 justify-center">
                {[
                  {icon: '🦋', unlocked: true, name: 'Explorer'}, 
                  {icon: '⭐', unlocked: true, name: 'Star'}, 
                  {icon: '🌙', unlocked: true, name: 'Dreamer'}, 
                  {icon: '🎮', unlocked: false, name: 'Gamer'}, 
                  {icon: '👑', unlocked: false, name: 'Queen'}
                ].map((ach, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all hover:scale-125 cursor-pointer ${
                      ach.unlocked 
                        ? 'bg-gradient-to-br from-warm-amber via-sunset-orange to-warm-amber shadow-lg border-2 border-warm-amber/50' 
                        : 'bg-white/5 border border-white/10 opacity-40 hover:opacity-60'
                    }`}
                    title={ach.name}
                  >
                    {ach.icon}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Lower section - Narrowing toward point */}
          <motion.div
            initial={{ opacity: 0, x: 50, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{ width: '75%' }}
          >
            <div className="bg-gradient-to-br from-soft-pink/30 to-plum/30 backdrop-blur-xl border-2 border-soft-pink/40 rounded-2xl p-4 text-center"
              style={{
                boxShadow: '0 10px 40px rgba(255, 158, 183, 0.3), 0 0 50px rgba(255, 158, 183, 0.2)'
              }}
            >
              <p className="text-text-primary text-sm italic leading-relaxed font-light">
                "You're doing better than you think ♡"
              </p>
              <div className="mt-2 text-text-secondary text-xs">
                — Your Daily Affirmation
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* First Visit Message */}
      <AnimatePresence>
        {showFirstVisitMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="backdrop-blur-xl px-6 py-3 rounded-full border border-soft-pink/30" style={{
              background: 'rgba(26, 15, 30, 0.9)'
            }}>
              <p className="text-text-primary text-sm">
                Welcome to your universe, {WORLD.identity.name} ✨
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Birthday Confetti */}
      {birthdayMode && (
        <div className="fixed inset-0 pointer-events-none z-30">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: -50,
                rotate: 0
              }}
              animate={{
                y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 50,
                rotate: Math.random() * 720
              }}
              transition={{
                duration: Math.random() * 3 + 3,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'linear'
              }}
            >
              {['🎉', '🎊', '✨', '🎂', '🎁', '💝'][i % 6]}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Navigation Button Component - Fancy Design
function NavButton({ icon, label, active = false, onClick }: any) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl transition-all relative overflow-hidden ${
        active 
          ? 'text-text-primary' 
          : 'text-text-secondary hover:text-text-primary'
      }`}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      style={{
        background: active 
          ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(255, 158, 183, 0.15))'
          : 'transparent',
        border: active 
          ? '1px solid rgba(212, 175, 55, 0.3)'
          : '1px solid transparent',
        boxShadow: active 
          ? '0 4px 15px rgba(212, 175, 55, 0.2), inset 0 1px 5px rgba(255, 255, 255, 0.1)'
          : 'none'
      }}
    >
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 rounded-xl"
          style={{
            background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.15), transparent)',
          }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="text-xl lg:text-2xl relative z-10">{icon}</span>
      <span className="text-[9px] lg:text-[10px] font-medium text-center leading-tight relative z-10">{label}</span>
    </motion.button>
  );
}

// Mobile Menu Button Component - Fancy Design
function MobileMenuButton({ icon, label, active = false, onClick }: any) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full flex items-center gap-4 py-3.5 px-4 rounded-xl transition-all relative overflow-hidden ${
        active 
          ? 'text-text-primary' 
          : 'text-text-secondary'
      }`}
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: active 
          ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(255, 158, 183, 0.15))'
          : 'rgba(255, 255, 255, 0.02)',
        border: active 
          ? '1px solid rgba(212, 175, 55, 0.4)'
          : '1px solid transparent',
        boxShadow: active 
          ? '0 4px 15px rgba(212, 175, 55, 0.2), inset 0 1px 5px rgba(255, 255, 255, 0.1)'
          : 'none'
      }}
    >
      {active && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
          style={{
            background: 'linear-gradient(to bottom, rgba(212, 175, 55, 1), rgba(255, 158, 183, 0.8))'
          }}
          layoutId="activeMobileTab"
        />
      )}
      <span className="text-2xl">{icon}</span>
      <span className="text-base font-medium">{label}</span>
    </motion.button>
  );
}

// Stat Bar Component
function StatBar({ icon, label, value, color }: any) {
  const colors = {
    pink: 'from-soft-pink to-sunset-orange',
    yellow: 'from-warm-amber to-lamp-glow',
    purple: 'from-plum to-soft-pink'
  };

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-text-primary flex items-center gap-1">
          <span>{icon}</span> {label}
        </span>
        <span className="text-text-secondary">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${colors[color as keyof typeof colors]} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
