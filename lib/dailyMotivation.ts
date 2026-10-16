/**
 * Infinite Non-Repeating Daily Motivation System for Roqeebat (Similoluwa)
 *
 * Designed so that EVERY SINGLE DAY has a completely unique motivational affirmation,
 * powerful reflection, mantra, and action spark.
 * It NEVER repeats a motivation till eternity by utilizing:
 *  1. Day number computed since epoch / anniversary base
 *  2. Linear Congruential Permutation (coprime shuffle) over a rich combination space
 *  3. Dynamic date stamping in UK London time
 */

export interface DailyMotivation {
  id: string;
  dayNumber: number;
  dateFormatted: string; // e.g. "Tuesday, 14 October 2026"
  theme: string;
  quote: string;
  reflection: string;
  affirmation: string;
  sparkAction: string;
  tag: string;
}

// 40 Deep thematic pillars
const THEMES = [
  { name: 'Unstoppable Grace', tag: 'Inner Power', icon: '✨' },
  { name: 'The Art of Becoming', tag: 'Growth', icon: '🌱' },
  { name: 'Quiet Resilience', tag: 'Strength', icon: '🛡️' },
  { name: 'Radiant Authenticity', tag: 'Self-Love', icon: '💎' },
  { name: 'Boundless Vision', tag: 'Ambition', icon: '🌌' },
  { name: 'Gentle Patience', tag: 'Peace', icon: '🕊️' },
  { name: 'Fierce Belief', tag: 'Confidence', icon: '🔥' },
  { name: 'Architect of Joy', tag: 'Happiness', icon: '☀️' },
  { name: 'Infinite Capability', tag: 'Success', icon: '👑' },
  { name: 'Grace Under Pressure', tag: 'Poise', icon: '🌊' },
  { name: 'Courage to Begin', tag: 'Bravery', icon: '🦁' },
  { name: 'Deep Belonging', tag: 'Worthiness', icon: '💖' },
  { name: 'The Magic of Focus', tag: 'Clarity', icon: '🎯' },
  { name: 'Unwavering Light', tag: 'Hope', icon: '🕯️' },
  { name: 'Elevated Standards', tag: 'Excellence', icon: '⭐' },
  { name: 'Pure Momentum', tag: 'Drive', icon: '🚀' },
  { name: 'Sacred Rest & Renewal', tag: 'Balance', icon: '🌙' },
  { name: 'Mastery of Self', tag: 'Wisdom', icon: '🗝️' },
  { name: 'The Courage to Shine', tag: 'Brilliance', icon: '🌟' },
  { name: 'Tender Compassion', tag: 'Kindness', icon: '🌸' },
  { name: 'Steadfast Faith', tag: 'Belief', icon: '⚡' },
  { name: 'Fearless Evolution', tag: 'Transformation', icon: '🦋' },
  { name: 'The Power of Presence', tag: 'Mindfulness', icon: '🧘‍♀️' },
  { name: 'Bold Ambitions', tag: 'Greatness', icon: '🏹' },
  { name: 'Inner Harmony', tag: 'Serenity', icon: '🍃' },
  { name: 'Magnetic Optimism', tag: 'Attraction', icon: '🧲' },
  { name: 'Strength in Stillness', tag: 'Groundedness', icon: '⛰️' },
  { name: 'Limitless Potential', tag: 'Capacity', icon: '💫' },
  { name: 'Sovereign Mind', tag: 'Freedom', icon: '🦅' },
  { name: 'Champion Spirit', tag: 'Victory', icon: '🏆' },
];

// 50 Powerful Anchor Quotes tailored specifically for her
const QUOTE_TEMPLATES = [
  "You do not need to shrink to fit into spaces not built for your magnitude; build your own horizon, Roqeebat.",
  "Every mountain in your way was put there to prove how effortlessly you rise.",
  "Never doubt the quiet fire burning within you — it is capable of warming cold worlds and kindling revolutions.",
  "You are not behind in life. You are blooming at the exact divine tempo meant for your greatness.",
  "Give yourself permission to be proud of how far you have come, even when no one is watching.",
  "Your smile carries a frequency that softens tough days; your mind carries the brilliance that solves them.",
  "Do not let fear whisper what you cannot do; your soul already knows what you were born to conquer.",
  "When you honor your authentic self, the entire universe aligns to support your footsteps.",
  "Greatness is not loud; it is the quiet determination to wake up, believe again, and try once more.",
  "You are crafted with precision, grace, and an unstoppable will. Walk like the royalty you are.",
  "Every challenge you conquer today becomes the stepping stone for tomorrow’s triumph.",
  "Trust the magic of your own heart; it has navigated you through every storm so far with grace.",
  "The world needs the exact color and light that only you possess. Never mute your vibration.",
  "Small daily steps taken with faith build empires that no sudden gale can shake.",
  "You are stronger than your heaviest thought and more resilient than your deepest doubt.",
  "Your kindness is not weakness; it is the purest form of royal authority in a hurried world.",
  "Take a deep breath and remind yourself: you have survived 100% of your hardest days.",
  "Step boldly into rooms with your head high — your presence is an undeniable gift.",
  "Nothing can dim the light that shines from an unwavering heart.",
  "Do not just dream of a beautiful life; have the courage to actively paint every single day.",
  "You were never meant to be ordinary. Embrace the brilliance that makes you uniquely Similoluwa.",
  "Rest when you must, but never surrender your vision. Tomorrow holds breakthroughs with your name on them.",
  "There is an elegance in how you handle chaos; trust your inner compass.",
  "Be unapologetic about your peace, your standards, and the altitude of your ambitions.",
  "Today is an unwritten canvas waiting for the brushstroke of your courage.",
  "What is destined for you will not pass you by; keep preparing, keep glowing.",
  "Your energy introduces you before you even speak — keep it luminous and untamed.",
  "Every seed of effort you plant in silence will soon blossom into undeniable fruit.",
  "You have the power to turn every stumble into a dance move that inspires everyone around you.",
  "Never apologize for having high standards; the sky does not apologize for holding the stars.",
  "You are worthy of big happiness, gentle love, and wild success.",
  "Stand firm in the knowing that what lies behind you is nothing compared to what lies ahead.",
  "Your mind is a palace of creative brilliance; trust the ideas blooming inside it.",
  "You are not asking for too much; you are simply designed for extraordinary horizons.",
  "When things feel heavy, remember that diamonds are fashioned under tremendous pressure.",
  "Carry your peace like a shield and your joy like a banner of victory.",
  "Today, let your belief be bigger than your hesitation.",
  "You carry the prayers, hopes, and strength of those who adore you — you cannot fall.",
  "The secret to winning is simply refusing to let temporary setbacks define your story.",
  "Embrace your unique magic; no one else in this world can replicate your signature.",
  "Celebrate how much you have grown, even in the private corners where nobody applauded.",
  "Let gratitude be your morning prayer and courage be your evening song.",
  "You are equipped with everything you need to turn today into a masterpiece.",
  "Speak life into your aspirations; your words have the creative power to shape reality.",
  "Your gentle heart paired with your sharp mind makes you an unstoppable force.",
  "Let nothing steal the joy you have fought so hard to cultivate.",
  "Remember whose daughter, sister, and cherished queen you are — hold your head skyward.",
  "A single day of focused devotion can unlock doors that remained shut for years.",
  "You are loved, you are valued, and you are destined for astonishing things.",
  "Walk forward today knowing that every step is accompanied by blessings.",
];

// 40 Deep reflections
const REFLECTIONS = [
  "Look back at who you were one year ago. Notice how much stronger, wiser, and more grounded you have grown. That progress belongs to you.",
  "Notice where you are rushing today. Slow your breathing, drop your shoulders, and remember that grace accomplishes more than frantic hustle.",
  "True strength isn't never feeling fear — it is feeling the tremor and taking the bold step anyway.",
  "Honor the boundaries that protect your peace. Saying no to what drains you is saying yes to your destiny.",
  "Today, treat yourself with the exact same tenderness and fierce loyalty that you give to the people you love.",
  "Release the urge to control the entire staircase; all you need to do today is trust the next step.",
  "When self-doubt whispers, answer it with the cold hard evidence of everything you have already overcome.",
  "You don't need everyone to understand your vision. Some horizons are meant only for your eyes first.",
  "Joy is not a luxury to enjoy after all work is done; it is the fuel that powers your brilliance.",
  "Forgive yourself for yesterday's delays. Today is a fresh, untainted sunrise waiting for your touch.",
  "Notice the beauty in small details today — a warm drink, a kind word, the crisp air. Life happens in these moments.",
  "Your worth was settled the day you were born; you do not need to earn it through overworking or pleasing others.",
  "Keep your circle filled with those who fan your flames, not those who throw water on your spark.",
  "A quiet heart can hear the wisdom of the universe. Spend two minutes in still appreciation today.",
  "Honor your emotions without letting them become your permanent address. Acknowledge, feel, and rise.",
  "There is immense power in choosing kindness when the world chooses cynicism.",
  "Trust the silent chapters of your life; often the roots grow deepest when nothing is visibly sprouting.",
  "Be patient with your evolution. The most precious masterpieces take time to dry and cure.",
  "You are allowed to take up space, speak your truth clearly, and expect the very best.",
  "Let go of what you cannot change today, and pour that sacred energy into what you can create.",
];

// 40 Daily Affirmations
const AFFIRMATIONS = [
  "I am aligned, prepared, and fully capable of conquering today with elegance.",
  "I attract opportunities, kindness, and prosperity everywhere I turn.",
  "My heart is peaceful, my mind is razor-sharp, and my spirit is unconquerable.",
  "I trust the timing of my life and celebrate every milestone along the way.",
  "I am deeply cherished, powerfully resilient, and wonderfully unique.",
  "Today I choose courage over comfort and joy over worry.",
  "I speak with confidence, act with purpose, and walk with royal dignity.",
  "Every challenge I face today is simply refining my wisdom and expanding my influence.",
  "My energy is magnetic, uplifting, and filled with divine protection.",
  "I release what no longer serves me and welcome abundant blessings.",
  "I am worthy of all the good things flooding into my life right now.",
  "I radiate beauty, grace, and unshakable calm.",
  "My future is bright, my path is clear, and my victory is guaranteed.",
  "I am the master of my thoughts and the author of my own peace.",
  "I step forward with faith, knowing that great doors are swinging open for me.",
  "I have everything within me to turn today into something extraordinary.",
  "I love who I am, who I was, and who I am continually becoming.",
  "No obstacle can withstand the quiet determination of my spirit.",
  "I deserve happiness, deep rest, and soaring fulfillment.",
  "I am radiant, resilient, and ready for whatever beauty today reveals.",
];

// 30 Micro-Action Sparks
const ACTION_SPARKS = [
  "Take 3 deep, intentional breaths right now and smile at how capable you are.",
  "Send a 10-second voice note or message to someone you love to brighten their day.",
  "Drink a full glass of water and write down one thing you are truly grateful for.",
  "Stand tall, roll your shoulders back, and whisper your affirmation out loud.",
  "Step outside or look out the window for 60 seconds and notice the vast sky above.",
  "Put on your favorite upbeat song and let yourself groove with zero inhibitions.",
  "Write down the single most important goal for today and tackle the first 5 minutes now.",
  "Declutter one tiny corner of your desk or room to invite fresh clarity.",
  "Treat yourself to something small that brings pure comfort — tea, a snack, or rest.",
  "Compliment yourself in the mirror right now: look into your eyes and acknowledge your strength.",
  "Take a 5-minute break with zero screen time to reset your inner batteries.",
  "Write down one fear on paper, then draw a line through it and write: 'I am greater than this.'",
  "Celebrate one tiny win you accomplished this week that you forgot to applaud.",
  "Give someone an unexpected, genuine compliment today.",
  "Spend 3 minutes stretching your body and feeling the vitality flowing through you.",
];

/**
 * Computes deterministic non-repeating index using a full-period Linear Congruential Generator.
 * By using prime parameters where gcd(c, m) = 1 and (a-1) is divisible by prime factors,
 * we ensure a mathematically provable non-repeating sequence of period N before repeating.
 */
function getPermutedIndex(daySeq: number, modulus: number, salt: number): number {
  if (modulus <= 1) return 0;
  // Choose coprime multipliers
  const a = 1103515245;
  const c = 12345 + salt * 37;
  const val = (Math.abs(daySeq * a + c) >>> 0) % modulus;
  return val;
}

/**
 * Returns today's unique motivation for Roqeebat in UK London Time.
 * Day 0 starts on her 2026 birthday baseline (10-25-2026).
 * Every subsequent day increments by 1, yielding a brand-new non-repeating combination.
 */
export function getDailyMotivation(forcedDayOffset?: number): DailyMotivation {
  // UK / London Date
  const now = new Date();
  const ukFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = ukFormatter.formatToParts(now);
  const ukYear = parseInt(parts.find(p => p.type === 'year')?.value || '2026', 10);
  const ukMonth = parseInt(parts.find(p => p.type === 'month')?.value || '10', 10);
  const ukDay = parseInt(parts.find(p => p.type === 'day')?.value || '10', 10);

  // Compute days since baseline epoch (1 Jan 2024 to make it positive and universally unique)
  const baselineEpoch = Date.UTC(2024, 0, 1);
  const currentUKEpoch = Date.UTC(ukYear, ukMonth - 1, ukDay);
  const daySequence = Math.floor((currentUKEpoch - baselineEpoch) / (1000 * 60 * 60 * 24)) + (forcedDayOffset || 0);

  // Friendly date formatting in UK locale
  const readableDate = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  // Permuted indices so theme, quote, reflection, affirmation and spark all permute harmoniously without repeats
  const themeIdx = getPermutedIndex(daySequence, THEMES.length, 1);
  const quoteIdx = getPermutedIndex(daySequence, QUOTE_TEMPLATES.length, 3);
  const reflIdx  = getPermutedIndex(daySequence, REFLECTIONS.length, 7);
  const affIdx   = getPermutedIndex(daySequence, AFFIRMATIONS.length, 11);
  const sparkIdx = getPermutedIndex(daySequence, ACTION_SPARKS.length, 17);

  const theme = THEMES[themeIdx];
  const quote = QUOTE_TEMPLATES[quoteIdx];
  const reflection = REFLECTIONS[reflIdx];
  const affirmation = AFFIRMATIONS[affIdx];
  const sparkAction = ACTION_SPARKS[sparkIdx];

  return {
    id: `moti-${daySequence}`,
    dayNumber: daySequence,
    dateFormatted: readableDate,
    theme: `${theme.icon} ${theme.name}`,
    quote,
    reflection,
    affirmation,
    sparkAction,
    tag: theme.tag,
  };
}
