'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UniverseState } from '@/lib/persistence';
import { 
  getGlobalAudio, 
  getCurrentTrackIndex, 
  setCurrentTrackIndex,
  getIsPlaying,
  setIsPlaying,
  getCurrentTrack,
  subscribeToMusic,
  reloadTracks,
  TRACKS 
} from '@/lib/globalMusic';

interface MusicPlayerProps {
  state: UniverseState;
  updateState: (u: Partial<UniverseState>) => void;
  onBack: () => void;
}

function formatTime(s: number) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/* ── Animated bars (playing indicator) ───────────────────────── */
function PlayingBars({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 16, flexShrink: 0 }}>
      {[0.6, 1, 0.75, 0.9, 0.5].map((h, i) => (
        <motion.div key={i}
          animate={{ scaleY: [h, 1, h * 0.4, 1, h] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
          style={{ width: 3, height: 16, background: color, borderRadius: 2, transformOrigin: 'bottom', opacity: 0.9 }}
        />
      ))}
    </div>
  );
}

/* ── Circular progress ring ───────────────────────────────────── */
function ProgressRing({ pct, color, size }: { pct: number; color: string; size: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ - dash}
        animate={{ strokeDashoffset: circ - dash }} transition={{ duration: 0.5 }}
      />
    </svg>
  );
}

export default function MusicPlayer({ state, updateState, onBack }: MusicPlayerProps) {
  const [trackIdx, setTrackIdx] = useState(() => getCurrentTrackIndex());
  const [playing, setPlayingState] = useState(() => getIsPlaying());
  const [progress, setProgress] = useState(0);    // 0–100
  const [current, setCurrent]   = useState(0);    // seconds
  const [duration, setDuration] = useState(0);    // seconds
  const [volume, setVolume]     = useState(0.8);
  const [shuffle, setShuffle]   = useState(false);
  const [repeat, setRepeat]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const track = TRACKS[trackIdx] ?? TRACKS[0];

  // Get global audio instance and sync with global state
  useEffect(() => {
    audioRef.current = getGlobalAudio();
    
    // Force reload tracks from database to get latest uploads
    reloadTracks();
    
    // Sync with current global state when component mounts
    const globalTrackIdx = getCurrentTrackIndex();
    const globalIsPlaying = getIsPlaying();
    setTrackIdx(globalTrackIdx);
    setPlayingState(globalIsPlaying);
    
    // Subscribe to global music changes
    const unsubscribe = subscribeToMusic(() => {
      setTrackIdx(getCurrentTrackIndex());
      setPlayingState(getIsPlaying());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrent(audio.currentTime);
      setDuration(audio.duration || 0);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onEnded = () => {
      if (repeat) { audio.currentTime = 0; audio.play(); return; }
      const next = shuffle
        ? Math.floor(Math.random() * TRACKS.length)
        : (trackIdx + 1) % TRACKS.length;
      setCurrentTrackIndex(next);
      setTrackIdx(next);
    };
    const onCanPlay = () => setLoading(false);
    const onWaiting = () => setLoading(true);
    const onPlay = () => {
      setIsPlaying(true);
      setPlayingState(true);
    };
    const onPause = () => {
      setIsPlaying(false);
      setPlayingState(false);
    };
    const onError = (e: ErrorEvent) => {
      console.error('Audio error:', e);
      setLoading(false);
      setIsPlaying(false);
      setPlayingState(false);
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError as any);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError as any);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [trackIdx, shuffle, repeat]);

  // Load new track (only when track changes)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // If the track is already loaded and matches, don't reload
    const currentSrc = audio.src;
    const targetSrc = typeof window !== 'undefined' ? new URL(track.file, window.location.origin).href : track.file;
    
    if (currentSrc === targetSrc) {
      // Track is already loaded, just sync state
      updateState({ currentSong: trackIdx });
      setCurrentTrackIndex(trackIdx);
      return;
    }
    
    // New track - load it
    const wasPlaying = playing;
    setLoading(true);
    setCurrent(0); setProgress(0); setDuration(0);
    audio.src = track.file;
    audio.load();
    if (wasPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
        setPlayingState(false);
      });
    }
    updateState({ currentSong: trackIdx });
    setCurrentTrackIndex(trackIdx);
  }, [trackIdx]); // eslint-disable-line

  // Volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setIsPlaying(false);
      setPlayingState(false);
      updateState({ musicEnabled: false });
    } else {
      if (!audio.src) audio.src = track.file;
      audio.play().then(() => {
        setIsPlaying(true);
        setPlayingState(true);
        updateState({ musicEnabled: true });
      }).catch(() => {});
    }
  }, [playing, track, updateState]);

  const skipTo = (idx: number) => {
    const newIdx = ((idx % TRACKS.length) + TRACKS.length) % TRACKS.length;
    setTrackIdx(newIdx);
    setCurrentTrackIndex(newIdx);
    setIsPlaying(true);
    setPlayingState(true);
    setTimeout(() => audioRef.current?.play().catch(() => {}), 80);
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
  };

  const trackColor = track.color;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        width: '100%', minHeight: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: 'clamp(16px,5vw,40px)',
        paddingTop: 'clamp(72px,12vw,80px)',
        paddingBottom: 'clamp(24px,5vw,40px)',
        boxSizing: 'border-box',
        overflowY: 'auto',
        fontFamily: 'var(--font-poppins), sans-serif',
        background: `radial-gradient(ellipse at 50% 0%, ${trackColor}18, transparent 60%)`,
        transition: 'background 0.8s ease',
      }}
    >
      {/* Back */}
      <motion.button onClick={onBack} whileHover={{ x: -4 }}
        style={{ position: 'absolute', top: 'clamp(16px,4vw,24px)', left: 'clamp(12px,4vw,24px)', background: 'rgba(14,11,8,0.8)', border: '1px solid rgba(200,168,48,0.25)', borderRadius: 20, padding: '6px 14px', color: 'rgba(200,168,48,0.8)', cursor: 'pointer', fontSize: 'clamp(11px,3vw,13px)', fontWeight: 700, zIndex: 10 }}>
        ← Back
      </motion.button>

      {/* Title */}
      <h2 style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 'clamp(1.2rem,4vw,1.6rem)', color: '#e8d4a0', marginBottom: 28, fontWeight: 400, textAlign: 'center' }}>
        🎵 Music
      </h2>

      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── NOW PLAYING CARD ── */}
        <div style={{ background: 'rgba(14,11,8,0.85)', border: `1px solid ${trackColor}44`, borderRadius: 24, padding: 'clamp(20px,5vw,32px)', boxShadow: `0 0 60px ${trackColor}22`, transition: 'border-color 0.6s, box-shadow 0.6s' }}>

          {/* Album art placeholder with animated ring */}
          <div style={{ position: 'relative', width: 'clamp(120px,35vw,160px)', height: 'clamp(120px,35vw,160px)', margin: '0 auto 24px', flexShrink: 0 }}>
            <ProgressRing pct={progress} color={trackColor} size={160} />
            <div style={{
              position: 'absolute', inset: 8, borderRadius: '50%',
              background: `linear-gradient(135deg, ${trackColor}33, rgba(20,16,12,0.9))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 48, boxShadow: `0 4px 30px ${trackColor}44`,
            }}>
              {playing ? '🎵' : '🎶'}
            </div>
            {/* Spinning disc effect when playing */}
            {playing && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: `2px dashed ${trackColor}44`, pointerEvents: 'none' }}
              />
            )}
          </div>

          {/* Track info */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <AnimatePresence mode="wait">
              <motion.div key={trackIdx}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}>
                <div style={{ fontSize: 'clamp(14px,4vw,18px)', fontWeight: 700, color: '#e8d4a0', marginBottom: 4, letterSpacing: '-0.01em' }}>{track.title}</div>
                <div style={{ fontSize: 'clamp(11px,3vw,13px)', color: 'rgba(200,168,48,0.5)', letterSpacing: '0.04em' }}>{track.artist}</div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div
            ref={progressRef}
            onClick={seekTo}
            style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 4, cursor: 'pointer', marginBottom: 8, overflow: 'hidden', position: 'relative' }}
          >
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
              style={{ height: '100%', background: `linear-gradient(90deg, ${trackColor}, ${trackColor}bb)`, borderRadius: 4, boxShadow: `0 0 8px ${trackColor}88` }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(200,168,48,0.4)', marginBottom: 20 }}>
            <span>{formatTime(current)}</span>
            <span>{loading ? '...' : formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(12px,4vw,24px)' }}>
            {/* Shuffle */}
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => setShuffle(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: shuffle ? 1 : 0.3, color: trackColor, transition: 'opacity 0.2s' }}>
              🔀
            </motion.button>
            {/* Prev */}
            <motion.button whileTap={{ scale: 0.88 }} whileHover={{ scale: 1.08 }}
              onClick={() => skipTo(trackIdx - 1)}
              style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid rgba(200,168,48,0.2)`, background: 'rgba(255,255,255,0.05)', cursor: 'pointer', fontSize: 18, color: '#e8d4a0', display: 'grid', placeItems: 'center' }}>
              ⏮
            </motion.button>
            {/* Play/Pause */}
            <motion.button
              whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.06 }}
              onClick={togglePlay}
              style={{
                width: 'clamp(54px,14vw,64px)', height: 'clamp(54px,14vw,64px)',
                borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: `linear-gradient(135deg, ${trackColor}, ${trackColor}bb)`,
                fontSize: 'clamp(20px,5vw,24px)',
                display: 'grid', placeItems: 'center',
                boxShadow: `0 4px 20px ${trackColor}66`,
                color: 'white',
              }}>
              {loading ? '⏳' : playing ? '⏸' : '▶'}
            </motion.button>
            {/* Next */}
            <motion.button whileTap={{ scale: 0.88 }} whileHover={{ scale: 1.08 }}
              onClick={() => skipTo(trackIdx + 1)}
              style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid rgba(200,168,48,0.2)`, background: 'rgba(255,255,255,0.05)', cursor: 'pointer', fontSize: 18, color: '#e8d4a0', display: 'grid', placeItems: 'center' }}>
              ⏭
            </motion.button>
            {/* Repeat */}
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => setRepeat(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: repeat ? 1 : 0.3, color: trackColor, transition: 'opacity 0.2s' }}>
              🔁
            </motion.button>
          </div>

          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20 }}>
            <span style={{ fontSize: 14, opacity: 0.5 }}>🔈</span>
            <input type="range" min={0} max={1} step={0.01} value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: trackColor, height: 4, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 14, opacity: 0.5 }}>🔊</span>
          </div>
        </div>

        {/* ── TRACK LIST ── */}
        <div style={{ background: 'rgba(14,11,8,0.7)', border: '1px solid rgba(200,168,48,0.1)', borderRadius: 18, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px 8px', fontSize: 10, color: 'rgba(200,168,48,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
            Playlist · {TRACKS.length} songs
          </div>
          {TRACKS.map((t, i) => {
            const isActive = i === trackIdx;
            return (
              <motion.button key={t.id}
                onClick={() => { skipTo(i); }}
                whileHover={{ background: 'rgba(255,255,255,0.04)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 16px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: isActive ? `${t.color}14` : 'transparent',
                  borderLeft: isActive ? `3px solid ${t.color}` : '3px solid transparent',
                  transition: 'background 0.15s',
                }}
              >
                {/* Track number or playing bars */}
                <div style={{ width: 22, flexShrink: 0, textAlign: 'center' }}>
                  {isActive && playing
                    ? <PlayingBars color={t.color} />
                    : <span style={{ fontSize: 11, color: isActive ? t.color : 'rgba(200,168,48,0.3)', fontWeight: 600 }}>{i + 1}</span>
                  }
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'clamp(11px,3vw,13px)', fontWeight: 600, color: isActive ? t.color : '#e8d4a0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                  <div style={{ fontSize: 'clamp(9px,2.5vw,11px)', color: 'rgba(200,168,48,0.38)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.artist}</div>
                </div>
                {/* Color dot */}
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, flexShrink: 0, opacity: isActive ? 1 : 0.3 }} />
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
