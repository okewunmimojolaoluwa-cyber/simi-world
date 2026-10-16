'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { UniverseState } from '@/lib/persistence';

interface MiniGameArcadeProps {
  state: UniverseState;
  updateState: (updates: Partial<UniverseState>) => void;
  onBack: () => void;
}

// ─── STAR CATCHER ────────────────────────────────────────────────────────────
function StarCatcher({ onScore, onEnd, difficulty, settings }: { 
  onScore: (s: number) => void; 
  onEnd: (s: number) => void;
  difficulty: Difficulty;
  settings: { spawnRate: number; time: number; bombChance: number };
}) {
  const [stars, setStars] = useState<{ id: number; x: number; type: 'star' | 'bomb' | 'heart' }[]>([]);
  const [basket, setBasket] = useState(50);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [effects, setEffects] = useState<{ id: number; x: number; y: number; text: string; color: string }[]>([]);
  const idRef = useRef(0);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const gameOverRef = useRef(false);

  // Move basket with mouse/touch
  const handleMove = useCallback((clientX: number, rect: DOMRect) => {
    const pct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    setBasket(pct);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, el.getBoundingClientRect());
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, el.getBoundingClientRect());
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => { el.removeEventListener('mousemove', onMouseMove); el.removeEventListener('touchmove', onTouchMove); };
  }, [handleMove]);

  // Spawn falling items
  useEffect(() => {
    if (gameOverRef.current) return;
    const interval = setInterval(() => {
      if (gameOverRef.current) return;
      const rand = Math.random();
      const type = rand < settings.bombChance ? 'bomb' : rand > 0.8 ? 'heart' : 'star';
      setStars(prev => [...prev, { id: ++idRef.current, x: 5 + Math.random() * 90, type }]);
    }, settings.spawnRate);
    return () => clearInterval(interval);
  }, [settings]);

  // Check catches - remove items that fall off bottom
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameOverRef.current) return;
      setStars(prev => {
        const next: typeof prev = [];
        for (const s of prev) {
          const el = document.getElementById(`falling-${s.id}`);
          if (!el) { next.push(s); continue; }
          const rect = el.getBoundingClientRect();
          const containerRect = containerRef.current?.getBoundingClientRect();
          if (!containerRect) { next.push(s); continue; }
          const relY = rect.bottom - containerRect.top;
          const relX = (rect.left + rect.right) / 2 - containerRect.left;
          const basketPx = (basket / 100) * containerRect.width;
          const catchZone = containerRect.height * 0.88;

          if (relY >= catchZone) {
            const inBasket = Math.abs(relX - basketPx) < 55;
            if (inBasket) {
              let pts = 0; let txt = ''; let col = '';
              if (s.type === 'star') { pts = 10; txt = '+10 ⭐'; col = '#ffd700'; }
              else if (s.type === 'heart') { pts = 25; txt = '+25 💕'; col = '#ff6b9d'; }
              else { pts = -1; txt = '💥 Oops!'; col = '#ff4444';
                livesRef.current = Math.max(0, livesRef.current - 1);
                setLives(livesRef.current);
                if (livesRef.current === 0) { gameOverRef.current = true; onEnd(scoreRef.current); }
              }
              if (pts > 0) {
                scoreRef.current += pts;
                setScore(scoreRef.current);
                onScore(scoreRef.current);
              }
              setEffects(e => [...e, { id: Date.now(), x: relX, y: catchZone, text: txt, color: col }]);
              // don't push (remove it)
            } else {
              if (s.type === 'star' || s.type === 'heart') {
                livesRef.current = Math.max(0, livesRef.current - 1);
                setLives(livesRef.current);
                if (livesRef.current === 0) { gameOverRef.current = true; onEnd(scoreRef.current); }
              }
              // remove fallen item
            }
          } else {
            next.push(s);
          }
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [basket, onEnd, onScore]);

  const itemEmojis = { star: '⭐', bomb: '💣', heart: '💕' };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden', cursor: 'none', userSelect: 'none', borderRadius: 16, background: 'linear-gradient(180deg, #1a0f2e 0%, #2d1b3d 100%)' }}>
      {/* Stars */}
      {stars.map(s => (
        <motion.div
          key={s.id}
          id={`falling-${s.id}`}
          initial={{ y: -40 }}
          animate={{ y: '420px' }}
          transition={{ duration: s.type === 'bomb' ? 2.2 : 3.5, ease: 'linear' }}
          style={{ position: 'absolute', left: `${s.x}%`, fontSize: 28, zIndex: 5, filter: s.type === 'bomb' ? 'drop-shadow(0 0 6px #ff4444)' : 'drop-shadow(0 0 8px rgba(255,215,0,0.8))' }}
        >
          {itemEmojis[s.type]}
        </motion.div>
      ))}

      {/* Basket */}
      <motion.div
        style={{ position: 'absolute', bottom: '8%', left: `${basket}%`, transform: 'translateX(-50%)', zIndex: 10 }}
      >
        <div style={{ fontSize: 44, filter: 'drop-shadow(0 4px 12px rgba(255,107,157,0.6))' }}>🧺</div>
      </motion.div>

      {/* Score effects */}
      <AnimatePresence>
        {effects.map(e => (
          <motion.div key={e.id} initial={{ opacity: 1, y: e.y, x: e.x - 20 }} animate={{ opacity: 0, y: e.y - 60 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
            style={{ position: 'absolute', color: e.color, fontWeight: 700, fontSize: 16, zIndex: 20, pointerEvents: 'none' }}>
            {e.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* HUD */}
      <div style={{ position: 'absolute', top: 12, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 16px', zIndex: 15 }}>
        <div style={{ color: '#ffd700', fontWeight: 700, fontSize: 18 }}>⭐ {score}</div>
        <div style={{ fontSize: 16 }}>{Array.from({ length: 3 }).map((_, i) => <span key={i}>{i < lives ? '❤️' : '🖤'}</span>)}</div>
      </div>
    </div>
  );
}

// ─── MEMORY MATCH ─────────────────────────────────────────────────────────────
function MemoryMatch({ onScore, onEnd, difficulty, settings }: { 
  onScore: (s: number) => void; 
  onEnd: (s: number) => void;
  difficulty: Difficulty;
  settings: { pairs: number; time: number };
}) {
  const ALL_EMOJIS = ['🌸', '🦋', '💕', '🌺', '✨', '🎀', '🌙', '💎', '🌟', '💖'];
  const EMOJIS = ALL_EMOJIS.slice(0, settings.pairs);
  const [cards, setCards] = useState(() => {
    const pairs = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5).map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));
    return pairs;
  });
  const [flipped, setFlipped] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const scoreRef = useRef(0);

  const flip = (id: number) => {
    if (locked) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;
    const newFlipped = [...flipped, id];
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setLocked(true);
      setMoves(m => m + 1);
      const [a, b] = newFlipped.map(fid => cards.find(c => c.id === fid)!);
      if (a.emoji === b.emoji) {
        const pts = 20;
        scoreRef.current += pts;
        setScore(scoreRef.current);
        onScore(scoreRef.current);
        setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, matched: true } : c));
        setFlipped([]);
        setLocked(false);
        if (cards.filter(c => !c.matched).length <= 2) {
          const bonus = Math.max(0, 100 - moves * 3);
          scoreRef.current += bonus;
          setScore(scoreRef.current);
          onEnd(scoreRef.current);
        }
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, flipped: false } : c));
          setFlipped([]);
          setLocked(false);
        }, 900);
      }
    }
  };

  const matched = cards.filter(c => c.matched).length;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, padding: '0 4px' }}>
        <span style={{ color: '#ffd700', fontWeight: 700 }}>⭐ {score}</span>
        <span style={{ color: '#ffc1e0' }}>{matched / 2}/{EMOJIS.length} pairs</span>
        <span style={{ color: 'rgba(255,193,224,0.6)' }}>Moves: {moves}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {cards.map(card => (
          <motion.button
            key={card.id}
            onClick={() => flip(card.id)}
            whileHover={!card.matched && !card.flipped ? { scale: 1.06 } : {}}
            whileTap={!card.matched && !card.flipped ? { scale: 0.94 } : {}}
            style={{
              height: 68,
              borderRadius: 12,
              border: card.matched ? '2px solid #ff6b9d' : card.flipped ? '2px solid rgba(255,193,224,0.5)' : '2px solid rgba(255,193,224,0.15)',
              background: card.matched ? 'linear-gradient(135deg, rgba(255,107,157,0.25), rgba(212,165,212,0.2))' : card.flipped ? 'rgba(255,193,224,0.12)' : 'rgba(26,15,30,0.8)',
              fontSize: card.flipped || card.matched ? 30 : 20,
              cursor: card.matched ? 'default' : 'pointer',
              color: card.flipped || card.matched ? undefined : 'rgba(255,193,224,0.25)',
              boxShadow: card.matched ? '0 0 20px rgba(255,107,157,0.3)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {card.flipped || card.matched ? card.emoji : '✦'}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── WORD SCRAMBLE ────────────────────────────────────────────────────────────
function WordScramble({ onScore, onEnd, difficulty, settings }: { 
  onScore: (s: number) => void; 
  onEnd: (s: number) => void;
  difficulty: Difficulty;
  settings: { words: number; time: number; wordLength: [number, number] };
}) {
  const allWords = [
    { word: 'BIRTHDAY', hint: '🎂 Today is your ___' },
    { word: 'BEAUTIFUL', hint: '💕 How you look always' },
    { word: 'ROQEEBAT', hint: '👑 The birthday girl' },
    { word: 'LONDON', hint: '🇬🇧 Your city' },
    { word: 'STUNNING', hint: '✨ You are absolutely ___' },
    { word: 'CELEBRATE', hint: '🎉 Time to ___' },
    { word: 'AMAZING', hint: '🌟 You are ___' },
    { word: 'PRINCESS', hint: '👸 Royal vibes only' },
    { word: 'SMILE', hint: '😊 What you do best' },
    { word: 'QUEEN', hint: '👑 Your royal status' },
    { word: 'SUNSHINE', hint: '☀️ You light up my day' },
    { word: 'SPECIAL', hint: '💖 What you are to me' },
  ];

  // Filter words by difficulty length
  const words = allWords.filter(w => 
    w.word.length >= settings.wordLength[0] && 
    w.word.length <= settings.wordLength[1]
  ).slice(0, settings.words);

  const [round, setRound] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);

  const scramble = (word: string) => word.split('').sort(() => Math.random() - 0.5).join('');

  useEffect(() => {
    setScrambled(scramble(words[round].word));
    setInput('');
    setFeedback(null);
  }, [round, words]);
          setTimeout(() => setRound(r => r + 1), 1000);
  const guess = () => {
    if (input.toUpperCase() === words[round].word) {
      const pts = 50; // Fixed points for correct answer
      scoreRef.current += pts;
      setScore(scoreRef.current);
      onScore(scoreRef.current);
      setFeedback('correct');
      if (round >= words.length - 1) { setTimeout(() => onEnd(scoreRef.current), 800); }
      else { setTimeout(() => setRound(r => r + 1), 900); }
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 600);
    }
  };

  const current = words[round];

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      {/* HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ color: '#ffd700', fontWeight: 700 }}>⭐ {score}</span>
        <span style={{ color: 'rgba(255,193,224,0.6)' }}>{round + 1}/{words.length}</span>
      </div>

      {/* Hint */}
      <p style={{ color: 'rgba(255,193,224,0.6)', marginBottom: 10, fontSize: 13 }}>{current.hint}</p>

      {/* Scrambled word */}
      <div style={{ marginBottom: 24 }}>
        {scrambled.split('').map((letter, i) => (
          <motion.span
            key={i}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            style={{
              display: 'inline-block',
              margin: '0 4px',
              padding: '10px 14px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(255,107,157,0.2), rgba(155,123,222,0.2))',
              border: '1px solid rgba(255,193,224,0.3)',
              color: '#fef9f5',
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: 2,
              fontFamily: 'monospace',
            }}
          >
            {letter}
          </motion.span>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && guess()}
          placeholder="Type your answer..."
          autoFocus
          style={{
            padding: '12px 18px',
            borderRadius: 30,
            border: `2px solid ${feedback === 'correct' ? '#4caf50' : feedback === 'wrong' ? '#ff4444' : 'rgba(255,193,224,0.3)'}`,
            background: 'rgba(26,15,30,0.8)',
            color: '#fef9f5',
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: 3,
            outline: 'none',
            width: 200,
            textAlign: 'center',
            textTransform: 'uppercase',
            transition: 'border-color 0.2s ease',
          }}
        />
        <motion.button
          onClick={guess}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '12px 24px',
            borderRadius: 30,
            border: 'none',
            background: 'linear-gradient(135deg, #ff6b9d, #9b7ede)',
            color: 'white',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Guess ✓
        </motion.button>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ marginTop: 16, fontSize: 28, color: '#4caf50' }}>
            ✅ Correct! +50 pts
          </motion.div>
        )}
        {feedback === 'wrong' && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: [0, -8, 8, -4, 0] }} exit={{ opacity: 0 }}
            style={{ marginTop: 16, fontSize: 16, color: '#ff4444' }}>
            ❌ The answer was: {current.word}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MAIN ARCADE ──────────────────────────────────────────────────────────────
type GameId = 'stars' | 'memory' | 'scramble';
type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultySettings {
  stars: { spawnRate: number; time: number; bombChance: number };
  memory: { pairs: number; time: number };
  scramble: { words: number; time: number; wordLength: [number, number] };
}

const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
  easy: {
    stars: { spawnRate: 1000, time: 45, bombChance: 0.1 },
    memory: { pairs: 6, time: 60 },
    scramble: { words: 3, time: 45, wordLength: [4, 6] },
  },
  medium: {
    stars: { spawnRate: 700, time: 35, bombChance: 0.2 },
    memory: { pairs: 8, time: 45 },
    scramble: { words: 5, time: 60, wordLength: [5, 8] },
  },
  hard: {
    stars: { spawnRate: 500, time: 30, bombChance: 0.3 },
    memory: { pairs: 10, time: 40 },
    scramble: { words: 7, time: 75, wordLength: [6, 10] },
  },
};

export default function MiniGameArcade({ state, updateState, onBack }: MiniGameArcadeProps) {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [liveScore, setLiveScore] = useState(0);

  const games: { id: GameId; emoji: string; title: string; desc: string; color: string }[] = [
    { id: 'stars', emoji: '⭐', title: 'Star Catcher', desc: 'Catch stars & hearts, avoid bombs! 3 difficulty levels.', color: '#ffd700' },
    { id: 'memory', emoji: '🌸', title: 'Memory Match', desc: 'Find matching pairs! Choose your challenge.', color: '#ff6b9d' },
    { id: 'scramble', emoji: '🎀', title: 'Word Scramble', desc: 'Unscramble words fast! Multiple difficulty levels.', color: '#9b7ede' },
  ];

  const handleSelectGame = (gameId: GameId) => {
    setSelectedGame(gameId);
    setShowDifficultySelect(true);
  };

  const handleSelectDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    setShowDifficultySelect(false);
  };

  const handleEnd = (score: number) => {
    setFinalScore(score);
    setGameOver(true);
    const gameKey = `${selectedGame}_${difficulty}` as any;
    const best = state.gameScores?.[gameKey] || 0;
    if (score > best) {
      updateState({ gameScores: { ...state.gameScores, [gameKey]: score } });
    }
  };

  const reset = () => { 
    setGameOver(false); 
    setSelectedGame(null); 
    setShowDifficultySelect(false);
    setLiveScore(0); 
    setFinalScore(0); 
  };

  const getBestScore = () => {
    if (!selectedGame) return 0;
    const gameKey = `${selectedGame}_${difficulty}` as any;
    return state.gameScores?.[gameKey] || 0;
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'linear-gradient(180deg, rgba(26,15,30,0.97) 0%, rgba(45,27,61,0.99) 100%)',
      color: '#fef9f5',
      fontFamily: 'var(--font-poppins), sans-serif',
      overflowY: 'auto',
      padding: '24px 20px',
      position: 'relative',
    }}>
      {/* Back */}
      <motion.button
        onClick={selectedGame && !showDifficultySelect ? reset : onBack}
        whileHover={{ x: -4 }}
        style={{ position: 'absolute', top: 20, left: 20, background: 'transparent', border: 'none', color: '#ffc1e0', cursor: 'pointer', fontSize: 15, fontWeight: 600, zIndex: 10 }}
      >
        ← {selectedGame && !showDifficultySelect ? 'Games' : 'Back'}
      </motion.button>

      {/* Header */}
      <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 400, marginBottom: 4, marginTop: 8, textAlign: 'center' }}>
        {showDifficultySelect ? 'Choose Difficulty' : selectedGame ? games.find(g => g.id === selectedGame)?.title : 'Game Arcade ✨'}
      </h2>

      {/* Difficulty badge during game */}
      {selectedGame && !gameOver && !showDifficultySelect && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ 
            padding: '4px 12px', 
            borderRadius: 12, 
            background: difficulty === 'hard' ? 'rgba(255,68,68,0.2)' : difficulty === 'medium' ? 'rgba(255,193,7,0.2)' : 'rgba(76,175,80,0.2)',
            color: difficulty === 'hard' ? '#ff6b6b' : difficulty === 'medium' ? '#ffc107' : '#81c784',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}>
            {difficulty === 'hard' ? '🔥 Hard' : difficulty === 'medium' ? '⚡ Medium' : '🌟 Easy'}
          </span>
          <p style={{ color: 'rgba(255,193,224,0.5)', fontSize: 12, letterSpacing: '0.1em' }}>
            Best: {getBestScore()}
          </p>
        </div>
      )}

      {/* Difficulty Selection Screen */}
      <AnimatePresence>
        {showDifficultySelect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ width: '100%', maxWidth: 600, marginTop: 32 }}
          >
            <p style={{ textAlign: 'center', color: 'rgba(255,193,224,0.6)', marginBottom: 24, fontSize: 14 }}>
              Select your challenge level
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff, i) => (
                <motion.button
                  key={diff}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ x: 8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectDifficulty(diff)}
                  style={{
                    padding: '20px 24px',
                    borderRadius: 16,
                    border: `2px solid ${diff === 'hard' ? '#ff6b6b44' : diff === 'medium' ? '#ffc10744' : '#81c78444'}`,
                    background: `linear-gradient(135deg, ${diff === 'hard' ? 'rgba(255,68,68,0.1)' : diff === 'medium' ? 'rgba(255,193,7,0.1)' : 'rgba(76,175,80,0.1)'}, rgba(26,15,30,0.8))`,
                    color: '#fef9f5',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <span style={{ fontSize: 32 }}>
                    {diff === 'hard' ? '🔥' : diff === 'medium' ? '⚡' : '🌟'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, textTransform: 'capitalize' }}>
                      {diff}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,193,224,0.6)' }}>
                      {diff === 'easy' && 'Perfect for beginners • More time • Fewer obstacles'}
                      {diff === 'medium' && 'Balanced challenge • Standard time • Moderate difficulty'}
                      {diff === 'hard' && 'Expert mode • Less time • Maximum challenge'}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,193,224,0.5)' }}>
                    Best: {state.gameScores?.[`${selectedGame}_${diff}` as any] || 0}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game over screen */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: 32 }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>
              {finalScore >= 150 ? '🏆' : finalScore >= 100 ? '🌟' : finalScore >= 50 ? '🎀' : '💖'}
            </div>
            <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 28, marginBottom: 8 }}>
              {finalScore >= 150 ? 'Incredible!' : finalScore >= 100 ? 'Amazing!' : finalScore >= 50 ? 'Nice work!' : 'Good try!'}
            </h3>
            <p style={{ color: '#ffd700', fontSize: 36, fontWeight: 700, marginBottom: 8 }}>{finalScore} pts</p>
            <div style={{ 
              display: 'inline-block',
              padding: '6px 16px', 
              borderRadius: 12, 
              background: difficulty === 'hard' ? 'rgba(255,68,68,0.15)' : difficulty === 'medium' ? 'rgba(255,193,7,0.15)' : 'rgba(76,175,80,0.15)',
              color: difficulty === 'hard' ? '#ff6b6b' : difficulty === 'medium' ? '#ffc107' : '#81c784',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: 12
            }}>
              {difficulty} mode
            </div>
            {finalScore > getBestScore() && (
              <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: '#ff6b9d', fontSize: 14, marginBottom: 16 }}>
                🎉 New high score for {difficulty} mode!
              </motion.p>
            )}
            <p style={{ color: 'rgba(255,193,224,0.5)', fontSize: 13, marginBottom: 28 }}>
              Best ({difficulty}): {Math.max(finalScore, getBestScore())} pts
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setGameOver(false); setLiveScore(0); setFinalScore(0); }}
                style={{ padding: '12px 28px', borderRadius: 30, border: '1px solid rgba(255,107,157,0.4)', background: 'rgba(255,107,157,0.15)', color: '#fef9f5', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
              >
                Play Again 🔄
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setGameOver(false); setShowDifficultySelect(true); setLiveScore(0); setFinalScore(0); }}
                style={{ padding: '12px 28px', borderRadius: 30, border: '1px solid rgba(155,126,222,0.4)', background: 'rgba(155,126,222,0.15)', color: '#fef9f5', cursor: 'pointer', fontSize: 14 }}
              >
                Change Difficulty
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={reset}
                style={{ padding: '12px 28px', borderRadius: 30, border: '1px solid rgba(255,193,224,0.2)', background: 'rgba(255,193,224,0.05)', color: 'rgba(255,193,224,0.7)', cursor: 'pointer', fontSize: 14 }}
              >
                All Games
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game selection */}
      {!selectedGame && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, width: '100%', maxWidth: 800, marginTop: 16 }}>
          {games.map((game, i) => (
            <motion.button
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, boxShadow: `0 20px 40px ${game.color}33` }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelectGame(game.id)}
              style={{
                padding: '28px 20px',
                borderRadius: 20,
                border: `1px solid ${game.color}33`,
                background: `linear-gradient(135deg, rgba(26,15,30,0.9), rgba(45,27,61,0.8))`,
                color: '#fef9f5',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12, filter: `drop-shadow(0 4px 12px ${game.color}66)` }}>{game.emoji}</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: game.color }}>{game.title}</h3>
              <p style={{ color: 'rgba(255,193,224,0.6)', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>{game.desc}</p>
              {state.gameScores?.[game.id] ? (
                <div style={{ padding: '6px 14px', borderRadius: 20, background: `${game.color}22`, display: 'inline-block', fontSize: 12, color: game.color, fontWeight: 600 }}>
                  Best: {state.gameScores[game.id]} pts 🏆
                </div>
              ) : (
                <div style={{ color: 'rgba(255,193,224,0.3)', fontSize: 12 }}>No score yet — be the first!</div>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Active game */}
      {/* Active game */}
      {selectedGame && !gameOver && !showDifficultySelect && (
        <div style={{ width: '100%', maxWidth: 560, marginTop: 8 }}>
          {selectedGame === 'stars' && <StarCatcher onScore={setLiveScore} onEnd={handleEnd} difficulty={difficulty} settings={DIFFICULTY_SETTINGS[difficulty].stars} />}
          {selectedGame === 'memory' && <MemoryMatch onScore={setLiveScore} onEnd={handleEnd} difficulty={difficulty} settings={DIFFICULTY_SETTINGS[difficulty].memory} />}
          {selectedGame === 'scramble' && <WordScramble onScore={setLiveScore} onEnd={handleEnd} difficulty={difficulty} settings={DIFFICULTY_SETTINGS[difficulty].scramble} />}
        </div>
      )}
    </div>
  );
}
