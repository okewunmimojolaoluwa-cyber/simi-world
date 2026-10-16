'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import CatIcon from './CatIcon';

interface WorldSidebarProps {
  currentView: string;
  onNavigate: (view: any) => void;
  onReplayIntro?: () => void;
}

const NAV = [
  { id: 'home',         icon: '⌂',   label: 'Home',       desc: 'Your space'      },
  { id: 'letter',       icon: '💌',  label: 'My Letter',  desc: 'From Olajuwon'   },
  { id: 'games',        icon: '◈',   label: 'Play',       desc: 'Mini games'      },
  { id: 'memories',     icon: '◫',   label: 'Sunshine 💖', desc: 'All about you'   },
  { id: 'music',        icon: '♪',   label: 'Music',      desc: 'Your vibe'       },
  { id: 'openwhen',     icon: '✉',   label: 'Open When',  desc: 'Letters for you' },
  { id: 'pet',          icon: 'cat', label: 'Olajuwon',   desc: 'Visit the cat'   },
  { id: 'daily',        icon: '✦',   label: 'Motivation', desc: 'Daily spark'     },
  { id: 'achievements', icon: '◎',   label: 'Wins',       desc: 'Achievements'    },
];

/* ─── Animated SVG Morphing Hamburger Button ─────────────────────────── */
function HamIcon({ open }: { open: boolean }) {
  return (
    <div className="w-5 h-5 flex items-center justify-center pointer-events-none" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        {/* Top bar -> Top diagonal of X */}
        <motion.path
          strokeWidth="2.5"
          strokeLinecap="round"
          stroke="#ffffff"
          animate={open ? { d: 'M 5 5 L 19 19' } : { d: 'M 3 6 L 21 6' }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        />
        {/* Middle bar -> Fade out */}
        <motion.path
          strokeWidth="2.5"
          strokeLinecap="round"
          stroke="#ffffff"
          animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.15 }}
          style={{ transformOrigin: 'center' }}
          d="M 3 12 L 21 12"
        />
        {/* Bottom bar -> Bottom diagonal of X */}
        <motion.path
          strokeWidth="2.5"
          strokeLinecap="round"
          stroke="#ffffff"
          animate={open ? { d: 'M 5 19 L 19 5' } : { d: 'M 7 18 L 21 18' }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        />
      </svg>
    </div>
  );
}

/* ─── Shared Brand Header ─────────────────────────────────────────── */
function Brand() {
  return (
    <div className="flex items-center gap-3 px-4 pt-5 pb-4">
      <div className="w-10 h-10 grid place-items-center shrink-0 rounded-2xl bg-gradient-to-tr from-[#818cf8]/25 to-[#c084fc]/35 border border-[#c4b5fd]/40 shadow-lg shadow-[#818cf8]/15">
        <svg viewBox="0 0 40 40" width="22" height="22" fill="none">
          <path
            d="M20 4L24 14L35 14L27 21L30 32L20 25L10 32L13 21L5 14L16 14Z"
            stroke="#ffd700"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="20" r="4" fill="#a78bfa" opacity="0.9" />
        </svg>
      </div>
      <div className="flex flex-col">
        <strong className="font-serif text-[15px] font-bold text-[#ffffff] leading-tight tracking-wide drop-shadow-sm">
          Simi&apos;s World
        </strong>
        <span className="text-[10px] font-bold text-[#c4b5fd] uppercase tracking-wider mt-0.5">
          a place just for you
        </span>
      </div>
    </div>
  );
}

/* ─── Staggered Drawer Animation Variants ─────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 350, damping: 26 },
  },
};

export default function WorldSidebar({ currentView, onNavigate, onReplayIntro }: WorldSidebarProps) {
  const [open, setOpen] = useState(false);
  const [hov, setHov] = useState<string | null>(null);

  // Close drawer on view change
  useEffect(() => {
    setOpen(false);
  }, [currentView]);

  // Handle body scroll locking & keyboard escape
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const activeNav = NAV.find((n) => n.id === currentView);

  return (
    <>
      {/* ══════════════ DESKTOP SIDEBAR (Visible ≥ 1024px) ══════════════ */}
      <aside className="hidden lg:flex w-[215px] shrink-0 h-screen flex-col z-50 relative overflow-hidden bg-gradient-to-b from-[#0e0a16]/95 via-[#161024]/95 to-[#0e0a16]/98 backdrop-blur-2xl border-r border-[#c4b5fd]/20 shadow-2xl">
        <Brand />
        <div className="h-px mx-4 mb-3.5 bg-gradient-to-r from-transparent via-[#818cf8]/35 to-transparent" />
        
        {/* Desktop Nav Items */}
        <nav className="flex-1 flex flex-col gap-1.5 px-3 overflow-y-auto no-scrollbar">
          {NAV.map((item) => {
            const active = currentView === item.id;
            const hover = hov === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                onMouseEnter={() => setHov(item.id)}
                onMouseLeave={() => setHov(null)}
                whileTap={{ scale: 0.97 }}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-[#818cf8]/25 via-[#9333ea]/20 to-[#6366f1]/20 text-[#ffffff] border border-[#a78bfa]/50 shadow-[0_4px_20px_rgba(129,140,248,0.25)]'
                    : 'text-[#fef9f5]/85 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.1] hover:text-[#ffffff] hover:border-[#c4b5fd]/35'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="desktopActiveBar"
                    className="absolute left-0 top-[15%] bottom-[15%] w-1 rounded-r bg-gradient-to-b from-[#818cf8] via-[#ffd700] to-[#c084fc] shadow-[0_0_12px_rgba(129,140,248,0.9)]"
                  />
                )}
                <span className={`w-8 h-8 grid place-items-center shrink-0 rounded-lg transition-colors ${
                  active 
                    ? 'bg-gradient-to-tr from-[#818cf8]/35 to-[#c084fc]/35 text-[#ffffff] border border-[#c4b5fd]/60 shadow-sm' 
                    : 'bg-white/10 text-[#fef9f5]'
                }`}>
                  {item.icon === 'cat' ? (
                    <CatIcon size={20} animated={active || hover} />
                  ) : (
                    <span className="text-base font-bold leading-none">{item.icon}</span>
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-bold tracking-wide truncate text-[#ffffff]">
                    {item.label}
                  </span>
                  <span className="block text-[10px] font-semibold text-[#c4b5fd] mt-0.5 truncate">
                    {item.desc}
                  </span>
                </div>
                {active && (
                  <span className="w-2 h-2 rounded-full bg-[#ffd700] shadow-[0_0_10px_rgba(255,215,0,0.95)]" />
                )}
              </motion.button>
            );
          })}
        </nav>

        {onReplayIntro && (
          <div className="px-3 pb-2 pt-2">
            <motion.button
              onClick={onReplayIntro}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-serif font-bold text-[#ffd700] bg-[#ffd700]/10 hover:bg-[#ffd700]/20 border border-[#ffd700]/30 shadow-sm transition-all cursor-pointer"
            >
              <span>🗝</span>
              <span>Replay The Story</span>
            </motion.button>
          </div>
        )}

        <div className="flex items-center gap-2 px-4 py-3.5 border-t border-[#c4b5fd]/15 bg-black/25">
          <span className="text-sm text-[#a78bfa] animate-pulse">♡</span>
          <span className="text-[9.5px] font-bold uppercase tracking-widest text-[#c4b5fd]/90">made with love</span>
        </div>
      </aside>

      {/* ══════════════ MOBILE FLOATING TOPBAR (Visible < 1024px) ══════════════ */}
      <header className="fixed top-0 left-0 right-0 z-[200] flex lg:hidden items-center justify-between px-4 h-[calc(60px+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] bg-gradient-to-r from-[#0e0a16]/95 via-[#1a1228]/95 to-[#0e0a16]/95 backdrop-blur-2xl border-b border-[#c4b5fd]/25 shadow-[0_4px_30px_rgba(0,0,0,0.7)]">
        {/* Left: Brand Logo & Title */}
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer active:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 grid place-items-center rounded-xl bg-gradient-to-tr from-[#818cf8]/30 to-[#c084fc]/35 border border-[#c4b5fd]/50 shadow-md shadow-[#818cf8]/20">
            <svg viewBox="0 0 40 40" width="18" height="18" fill="none">
              <path
                d="M20 4L24 14L35 14L27 21L30 32L20 25L10 32L13 21L5 14L16 14Z"
                stroke="#ffd700"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="20" cy="20" r="3.5" fill="#a78bfa" opacity="0.95" />
            </svg>
          </div>
          <span className="font-serif text-[15.5px] font-bold text-[#ffffff] tracking-tight drop-shadow-md">
            Simi&apos;s World
          </span>
        </div>

        {/* Center: Active Route Badge */}
        <motion.div
          key={currentView}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#818cf8]/20 to-[#c084fc]/25 border border-[#c4b5fd]/45 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-[#ffd700] shadow-[0_0_8px_#ffd700]" />
          <span className="text-[11px] font-extrabold text-[#ffffff] uppercase tracking-wider">
            {activeNav?.label ?? 'Home'}
          </span>
        </motion.div>

        {/* Right: SVG Morphing Hamburger Button */}
        <motion.button
          onClick={() => setOpen((v) => !v)}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-200 ${
            open 
              ? 'bg-gradient-to-br from-[#818cf8]/35 to-[#c084fc]/40 border-2 border-[#ffd700] text-[#ffffff] shadow-[0_0_25px_rgba(129,140,248,0.5)]' 
              : 'bg-gradient-to-br from-[#818cf8]/20 to-[#c084fc]/25 border border-[#c4b5fd]/40 text-[#ffffff] shadow-md shadow-[#818cf8]/15 active:bg-[#818cf8]/35'
          }`}
          aria-label={open ? 'Close menu' : 'Open navigation menu'}
          aria-expanded={open}
        >
          <HamIcon open={open} />
        </motion.button>
      </header>

      {/* ══════════════ MOBILE DRAWER SHEET + BACKDROP ══════════════ */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              key="mobileBackdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[300] bg-black/75 backdrop-blur-md lg:hidden"
            />

            {/* Slide-over Drawer Menu Panel */}
            <motion.div
              key="mobileDrawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
              className="fixed inset-y-0 left-0 z-[400] w-[min(88vw,320px)] flex lg:hidden flex-col bg-gradient-to-b from-[#0e0a16]/98 via-[#181028]/98 to-[#0b0813]/98 backdrop-blur-3xl border-r border-[#c4b5fd]/25 shadow-[16px_0_60px_rgba(0,0,0,0.9)]"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation Menu"
            >
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pr-4 pt-2">
                <Brand />
                <motion.button
                  onClick={() => setOpen(false)}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 grid place-items-center rounded-xl bg-white/10 hover:bg-[#818cf8]/25 border border-[#c4b5fd]/40 text-[#ffffff] shadow-md active:bg-[#818cf8]/35"
                  aria-label="Close menu"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <line x1="3" y1="3" x2="15" y2="15" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="15" y1="3" x2="3" y2="15" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </motion.button>
              </div>

              <div className="h-px mx-4 mb-4 bg-gradient-to-r from-transparent via-[#818cf8]/40 to-transparent" />

              {/* Staggered Navigation Item List */}
              <motion.nav
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex-1 flex flex-col gap-2 px-3.5 overflow-y-auto no-scrollbar"
              >
                {NAV.map((item) => {
                  const active = currentView === item.id;
                  const hover = hov === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      variants={itemVariants}
                      onClick={() => {
                        onNavigate(item.id);
                        setOpen(false);
                      }}
                      onMouseEnter={() => setHov(item.id)}
                      onMouseLeave={() => setHov(null)}
                      whileTap={{ scale: 0.96 }}
                      className={`relative w-full flex items-center gap-3.5 p-3 rounded-2xl text-left transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-[#818cf8]/30 via-[#9333ea]/25 to-[#6366f1]/25 text-[#ffffff] border-2 border-[#c4b5fd]/60 shadow-[0_6px_24px_rgba(129,140,248,0.3)]'
                          : 'text-[#fef9f5]/90 bg-white/[0.05] border border-white/10 hover:bg-[#818cf8]/20 hover:border-[#c4b5fd]/40'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="mobileActiveBar"
                          className="absolute left-0 top-[15%] bottom-[15%] w-1.5 rounded-r-md bg-gradient-to-b from-[#818cf8] via-[#ffd700] to-[#c084fc] shadow-[0_0_12px_rgba(129,140,248,0.9)]"
                        />
                      )}
                      <span className={`w-10 h-10 grid place-items-center shrink-0 rounded-xl transition-colors ${
                        active 
                          ? 'bg-gradient-to-tr from-[#818cf8]/35 to-[#c084fc]/45 text-[#ffffff] border border-[#c4b5fd]/70 shadow-md' 
                          : 'bg-white/10 text-[#ffffff]'
                      }`}>
                        {item.icon === 'cat' ? (
                          <CatIcon size={22} animated={active || hover} />
                        ) : (
                          <span className="text-lg font-bold leading-none">{item.icon}</span>
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="block text-[14px] font-bold tracking-wide truncate text-[#ffffff]">
                          {item.label}
                        </span>
                        <span className="block text-[11.5px] font-semibold text-[#c4b5fd] truncate mt-0.5">
                          {item.desc}
                        </span>
                      </div>
                      {active && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-[#ffffff] bg-gradient-to-r from-[#818cf8] to-[#9333ea] border border-[#c4b5fd] shadow-md">
                          active
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </motion.nav>

              {onReplayIntro && (
                <div className="px-4 pb-2 pt-2">
                  <motion.button
                    onClick={() => {
                      setOpen(false);
                      onReplayIntro();
                    }}
                    whileTap={{ scale: 0.96 }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-serif font-bold text-[#ffd700] bg-[#ffd700]/10 border border-[#ffd700]/30 shadow-sm transition-all cursor-pointer"
                  >
                    <span>🗝</span>
                    <span>Replay The Story</span>
                  </motion.button>
                </div>
              )}

              {/* Drawer Bottom Footer */}
              <div className="p-4 border-t border-[#c4b5fd]/20 bg-black/35">
                <div className="flex items-center gap-2">
                  <span className="text-base text-[#a78bfa] animate-pulse">♡</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#c4b5fd]">made with love</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
