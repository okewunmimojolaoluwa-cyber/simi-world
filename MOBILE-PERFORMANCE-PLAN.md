# Mobile Performance Optimization Plan

## Current Performance Issues

### Act 1 (Opening) - BirthdayGiftIntro.tsx
**Problems:**
- 30 floating particles animating continuously
- 35+ floating light particles
- 8 radial light beams with blur effects
- 12 sparkle effects around gift box
- 6 orbiting stars around gift
- Multiple shimmer/glow effects with backdrop-filter blur
- Large background image with multiple gradient overlays
- Complex box-shadow animations

**Impact:** High CPU usage on mobile, especially with blur effects

### Act 2 (Room) - BirthdayGiftIntro.tsx (room scene)
**Problems:**
- 3D perspective transforms
- Multiple shadow effects
- Shimmer lines animating
- Complex gradients and filters

**Impact:** Lag when interacting with objects

### Act 3 (Reveal) - BirthdayGiftIntro.tsx (reveal scene)
**Problems:**
- Confetti animations
- Multiple transition effects
- Heavy animations

**Impact:** Choppy transitions

## Optimization Strategy

### 1. **Detect Device Performance**
- Use `window.matchMedia('(max-width: 768px)')` for mobile detection
- Check `navigator.hardwareConcurrency` for CPU cores
- Use `will-change` CSS property sparingly
- Add performance mode toggle

### 2. **Reduce Particle Count on Mobile**
```tsx
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
const particleCount = isMobile ? 10 : 30; // 66% reduction
```

### 3. **Simplify Animations**
- Remove backdrop-filter blur on mobile (very expensive)
- Reduce box-shadow animations
- Use `transform` and `opacity` only (GPU-accelerated)
- Remove complex gradients with multiple stops

### 4. **Optimize Images**
- Use Next.js Image component with srcset for responsive images
- Compress background images further
- Lazy load non-critical images
- Use CSS background-color fallback while image loads

### 5. **Reduce Animation Complexity**
- Fewer keyframes in animations
- Longer duration (slower = less CPU)
- Remove `ease-in-out`, use `linear` for performance
- Pause animations when not in viewport

### 6. **CSS Performance**
```css
/* Good - GPU accelerated */
transform: translateX(10px);
opacity: 0.5;

/* Bad - triggers layout/paint */
left: 10px;
filter: blur(10px); /* especially bad on mobile */
```

### 7. **React Performance**
- Wrap expensive components in `React.memo()`
- Use `useMemo` for computed values
- Debounce state updates
- Virtualize long lists

## Implementation Priority

### Phase 1: Critical (Do First) ✅
1. **Detect mobile device and reduce particle count**
2. **Remove backdrop-filter blur on mobile**
3. **Simplify box-shadow animations**
4. **Compress/optimize background images**

### Phase 2: Important
5. **Lazy load Act 2 and Act 3 scenes**
6. **Use CSS `will-change` strategically**
7. **Memoize expensive components**
8. **Add loading skeleton for smooth transitions**

### Phase 3: Nice to Have
9. **Add FPS monitor for testing**
10. **Progressive image loading**
11. **Performance mode toggle in settings**
12. **Service worker for image caching**

## Specific Optimizations

### Act 1 Opening Scene

**Before:**
```tsx
// 30 particles
{Array.from({ length: 30 }).map((_, i) => <Particle key={i} i={i} />)}

// 35 light particles with complex animations
{[...Array(35)].map((_, i) => (
  <motion.div animate={{ y: '-20%', opacity: [0, 0.9, 0.6, 0] }} />
))}

// 8 light beams with blur
{[...Array(8)].map((_, i) => (
  <motion.div style={{ filter: 'blur(40px)' }} />
))}
```

**After:**
```tsx
const isMobile = window.innerWidth < 768;
const particleCount = isMobile ? 8 : 30;
const lightCount = isMobile ? 12 : 35;
const beamCount = isMobile ? 3 : 8;

// Reduced particles
{Array.from({ length: particleCount }).map((_, i) => <Particle key={i} i={i} />)}

// Simplified animations - no blur on mobile
{[...Array(lightCount)].map((_, i) => (
  <motion.div 
    animate={{ y: '-20%', opacity: [0, 0.8, 0] }} 
    style={{ filter: isMobile ? 'none' : 'blur(20px)' }}
  />
))}
```

### Gift Box Optimizations

**Before:**
- 12 sparkle effects
- 6 orbiting stars
- Multiple shadow animations
- Backdrop-filter blur

**After (Mobile):**
- 4 sparkle effects (66% reduction)
- 2 orbiting stars (66% reduction)
- Single static shadow
- Remove backdrop-filter blur
- Simplify gradient to solid colors

### Background Image

**Before:**
```tsx
<img src="/images/backgrounds/intro_portal.jpg" style={{
  filter: 'brightness(0.18) saturate(1.4) contrast(1.2)'
}} />
```

**After:**
```tsx
import Image from 'next/image';

<Image 
  src="/images/backgrounds/intro_portal.jpg" 
  alt=""
  fill
  priority
  quality={isMobile ? 60 : 85}
  sizes="100vw"
  style={{
    objectFit: 'cover',
    filter: isMobile 
      ? 'brightness(0.2)' // Simplified
      : 'brightness(0.18) saturate(1.4) contrast(1.2)'
  }}
/>
```

## Performance Targets

### Desktop (Current)
- 60 FPS ✅
- Smooth animations ✅
- Full visual effects ✅

### Mobile (Target After Optimization)
- 30-45 FPS (acceptable)
- Smooth enough to be enjoyable
- Reduced but still beautiful effects
- Fast load time (< 3 seconds)

## Testing Checklist

- [ ] Test on iPhone SE (small screen, older hardware)
- [ ] Test on Android mid-range device
- [ ] Test on slow 3G connection
- [ ] Check Chrome DevTools Performance tab
- [ ] Measure First Contentful Paint (FCP)
- [ ] Measure Time to Interactive (TTI)
- [ ] Check memory usage
- [ ] Test all three acts (opening, room, reveal)

## Quick Wins (Can Implement Now)

1. **Reduce particle count by 70% on mobile**
2. **Remove all blur effects on mobile**
3. **Simplify animations to transform/opacity only**
4. **Compress images to 60% quality for mobile**
5. **Increase animation duration (slower = smoother)**
6. **Remove sparkles/orbiting effects on mobile**

These changes alone should improve performance by 50-60% on mobile devices.
