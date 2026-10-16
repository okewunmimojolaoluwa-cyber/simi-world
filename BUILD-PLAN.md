# ROQEEBAT'S UNIVERSE - BUILD PLAN

## PROJECT SCOPE
This is NOT a birthday website. This is a personal digital world—an interactive experience she'll return to for months.

---

## PHASE 1: FOUNDATION (Essential Infrastructure)
**Status: IN PROGRESS**

### Core Systems
- ✅ Data structure (`data/world.ts`)
- ✅ Persistence system (`lib/persistence.ts`)
- ✅ State management hook (`hooks/useUniverse.ts`)
- ⏳ Main page structure (`app/page.tsx`)
- ⏳ Loading screen
- ⏳ Achievement toast system

---

## PHASE 2: THE HOME WORLD (Hub Experience)
**Priority: CRITICAL**

### Components to Build
1. `HomeWorld.tsx` - The main interactive room
   - Time-based atmosphere (morning/evening/night)
   - Mood-based environment changes
   - Parallax depth layering
   - Ambient animations (curtains, lights, particles)
   - Interactive objects as navigation

2. `RoomEnvironment.tsx` - Visual environment
   - Window with dynamic sky
   - Desk with objects
   - Lamp with glow
   - Photos on wall
   - Plants with subtle movement
   - Clock showing real time

3. `NavigationObjects.tsx` - Interactive navigation
   - Floating objects representing sections
   - Touch/drag physics
   - Hover states
   - Selection animations

---

## PHASE 3: MINI-GAME ARCADE (Replayability)
**Priority: HIGH**

### Games to Build
1. **Star Catcher**
   - Touch/mouse to move character
   - Falling stars to catch
   - Score system
   - Timer
   - High score persistence

2. **Quick Tap**
   - Objects appear randomly
   - Tap correct one quickly
   - Increasing difficulty
   - Score tracking

3. **Memory Match**
   - Card flip animations
   - Match pairs
   - Move counter
   - Best time tracking

### Shared Systems
- `GameContainer.tsx` - Wrapper with UI
- `ScoreSystem.ts` - Score persistence
- `GameControls.tsx` - Restart/exit

---

## PHASE 4: DIGITAL PET (Emotional Connection)
**Priority: HIGH**

### Pet System
- `DigitalPet.tsx` - Main pet component
- `PetStates.ts` - Animations and states
- `PetActions.tsx` - Feed/play/pet UI
- `PetProgress.tsx` - Stats display
- Progression system
- Unlock system for accessories
- Multiple expressions/animations

---

## PHASE 5: DAILY & RANDOM CONTENT
**Priority: HIGH (Drives Return Visits)**

### Components
1. `DailySurprise.tsx`
   - One new thing per day
   - Opening animation
   - Content variety
   - Already-seen state

2. `MakeMeSmile.tsx`
   - Random content generator
   - Never repetitive
   - Track click count
   - Award/compliment animations

3. `RandomButton.tsx`
   - Navigate to random unexplored area
   - Prioritize undiscovered content
   - Smooth transitions

---

## PHASE 6: EMOTIONAL CONTENT
**Priority: MEDIUM-HIGH**

### Open When System
- `OpenWhenDrawer.tsx` - Visual drawer/box
- `EnvelopeCard.tsx` - Individual envelopes
- `EnvelopeOpen.tsx` - Opening animation
- Physical paper unfold effect
- Track opened envelopes

---

## PHASE 7: MEMORY MUSEUM
**Priority: MEDIUM**

### Museum Experience
- `MemoryMuseum.tsx` - Main container
- `Exhibition.tsx` - Individual room
- `MuseumNavigation.tsx` - Room-to-room movement
- `PhotoFrame.tsx` - Individual photo display
- Spatial navigation (walk through)
- Zoom/inspect interactions

---

## PHASE 8: MOOD SYSTEM
**Priority: MEDIUM (Enhances Everything)**

### Mood Components
- `MoodSelector.tsx` - Mood picker UI
- `AtmosphereController.tsx` - Changes environment
- `ParticleSystem.tsx` - Mood-based particles
- `LightingSystem.tsx` - Dynamic lighting
- Background color transitions
- Music mood matching

---

## PHASE 9: MUSIC ROOM
**Priority: MEDIUM-LOW**

### Music Player
- `MusicRoom.tsx` - Visual music space
- `AudioPlayer.tsx` - Playback controls
- `Visualizer.tsx` - Audio visualizations
- `Playlist.tsx` - Song selection
- Environment reactions to music

---

## PHASE 10: ACHIEVEMENTS & SECRETS
**Priority: MEDIUM**

### Achievement System
- `AchievementToast.tsx` - Unlock notifications
- `AchievementCabinet.tsx` - View all achievements
- `AchievementCard.tsx` - Individual display
- Secret trigger system
- Hidden clickables throughout

---

## PHASE 11: BIRTHDAY MODE
**Priority: MEDIUM (Time-Sensitive)**

### Birthday Experience
- Date detection system
- `BirthdayTransformation.tsx` - World changes
- `BirthdayCake.tsx` - Interactive cake
- `BirthdayLetter.tsx` - Special message
- Candle animation
- Wish interaction
- Special unlocks

---

## PHASE 12: ABOUT HER
**Priority: LOW**

### Profile/About
- `AboutHer.tsx` - Main display
- Fun facts presentation
- Favorite things
- Personality traits
- Playful design (not boring profile)

---

## TECHNICAL REQUIREMENTS

### Animation Quality
- Spring physics for all movements
- Momentum and inertia
- No simple opacity fades
- Layered parallax
- Staggered timing
- GPU-accelerated transforms

### Responsive Design
- Mobile-first approach
- Touch gestures primary
- Desktop mouse enhancements
- Different compositions per device
- Maintain performance

### Performance
- Lazy load components
- Request animation frame optimization
- Clean up event listeners
- GPU-friendly CSS
- Image optimization
- Respect prefers-reduced-motion

### Code Quality
- TypeScript strict mode
- Reusable components
- Clear separation of concerns
- Data-driven design
- No console errors
- No hydration issues

---

## ESTIMATED TIMELINE

**Phase 1 (Foundation):** 2-4 hours
**Phase 2 (Home World):** 4-6 hours
**Phase 3 (Games):** 6-8 hours
**Phase 4 (Pet):** 4-6 hours
**Phase 5 (Daily/Random):** 3-4 hours
**Phase 6 (Open When):** 2-3 hours
**Phase 7 (Museum):** 4-5 hours
**Phase 8 (Mood System):** 3-4 hours
**Phase 9 (Music):** 2-3 hours
**Phase 10 (Achievements):** 2-3 hours
**Phase 11 (Birthday):** 3-4 hours
**Phase 12 (About):** 2 hours

**Total Estimated:** 35-50 hours of focused development

---

## CURRENT STATUS

**Completed:**
- ✅ Data structure
- ✅ Persistence layer
- ✅ State management
- ✅ Project architecture

**In Progress:**
- ⏳ Main page structure
- ⏳ Loading screen

**Next Up:**
- Home World foundation
- Basic navigation
- First game

---

## IMPLEMENTATION APPROACH

Given the scope, I recommend:

### Option A: Full Build (35-50 hours)
Build everything as specified. This is the complete vision.

### Option B: MVP First (15-20 hours)
1. Home World hub
2. One mini-game
3. Digital Pet basics
4. Daily Surprise
5. Make Me Smile
6. Open When system
7. Basic memory gallery
8. Birthday mode
9. Achievement system

Then expand with remaining features.

### Option C: Incremental (Build as we go)
I build one complete section at a time, you review/test, I continue.

---

## RECOMMENDATION

Start with **Option B (MVP)**, then expand.

This ensures:
- Core experience works perfectly
- She has something to explore immediately
- Return value is built in from day one
- We can refine based on feedback
- Add more features over time

The MVP will still be far beyond a typical birthday website.

---

## NEXT STEPS

1. Complete Foundation (Phase 1)
2. Build Home World MVP
3. Add one polished game
4. Implement Digital Pet
5. Add Daily/Random content
6. Test entire experience
7. Expand features

Should I proceed with MVP approach and start building HomeWorld?
