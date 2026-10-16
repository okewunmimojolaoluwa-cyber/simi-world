# 📸 How to Add Roqeebat's Photos and Videos

## Quick Start Guide

### Step 1: Organize Your Files

Create these folders if they don't exist:
```
public/
  ├── images/
  │   └── gallery/
  │       ├── photo1.jpg      (For photo gallery)
  │       ├── photo2.jpg
  │       ├── photo3.jpg
  │       ├── photo4.jpg
  │       ├── photo5.jpg
  │       ├── photo6.jpg
  │       ├── photo7.jpg
  │       ├── photo8.jpg
  │       └── photo9.jpg
  ├── videos/
  │   ├── video1.mp4           (Multiple videos supported!)
  │   ├── video2.mp4
  │   └── video3.mp4
  └── audio/
      └── background-music.mp3 (Optional music)
```

### Step 2: Add Her Photos

#### For Photo Gallery (9+ photos):
1. Select stunning photos of Roqeebat
2. Create folder: `public/images/gallery/`
3. Rename them: `photo1.jpg` through `photo9.jpg`
4. Place in: `public/images/gallery/`

**Tips:**
- Use high-quality images (at least 1200px wide)
- Choose her best shots where she looks amazing!
- You can add MORE than 9 - just keep numbering: photo10.jpg, photo11.jpg, etc.
- Mix different looks/outfits/moods

**Update config/content.ts:**
```typescript
PHOTOS: [
  {
    id: 1,
    url: "/images/gallery/photo1.jpg",
    caption: "London's finest 👑",
  },
  {
    id: 2,
    url: "/images/gallery/photo2.jpg",
    caption: "Serving looks as always",
  },
  // Add more photos with fun captions!
]
```

### Step 3: Add Videos (Multiple Videos Supported!)

**NEW: You can add as many videos as you want!**

**Where to put your videos:**
```
public/videos/video1.mp4
public/videos/video2.mp4
public/videos/video3.mp4
... and more!
```

**What kind of videos to add:**
- Fun moments you captured
- Memorable clips
- Any videos you want to share with her
- Short or long - all work!

**Video format:**
- MP4 format works best
- Keep each file under 50MB for best performance
- Any orientation works (landscape, portrait, square)

**Update config/content.ts:**
```typescript
VIDEOS: [
  {
    id: 1,
    url: "/videos/video1.mp4",
    title: "That Time You... 😂",
    caption: "Still laughing about this one!"
  },
  {
    id: 2,
    url: "/videos/video2.mp4",
    title: "Queen Energy ✨",
    caption: "Look at you shining!"
  },
  {
    id: 3,
    url: "/videos/video3.mp4",
    title: "Vibes 🔥",
    caption: "This is THE moment"
  },
  // Add as many videos as you want!
]
```

**How the videos work:**
- All videos display in a beautiful grid
- Click any video to watch in full-screen modal
- Navigate between videos with arrow buttons
- Auto-plays when opened
- Full video controls (play, pause, seek, fullscreen)

### Step 4: Add Background Music (Optional)

1. Choose a fun/meaningful song (MP3 format)
2. Rename to: `background-music.mp3`
3. Place in: `public/audio/`

**Tips:**
- Choose instrumental or music she loves
- Keep volume moderate
- She can toggle it on/off with the music button

### Step 5: Customize Fun Facts

Open `config/content.ts` and personalize the fun facts about her:

```typescript
FUN_FACTS: [
  {
    id: 1,
    icon: "👑",
    title: "London's Royalty",
    fact: "Officially the most stunning person to ever grace the city"
  },
  {
    id: 2,
    icon: "✨",
    title: "Smile Power",
    fact: "Can light up an entire room (scientifically proven)"
  },
  // Add your own fun facts!
]
```

### Step 6: Customize Birthday Wishes

Add funny/sweet rotating birthday messages:

```typescript
WISHES: [
  {
    id: 1,
    message: "Happy Birthday to someone who's aging like fine wine... expensive and making everyone jealous! 🍷",
    emoji: "🎂"
  },
  // Add more funny/sweet wishes
]
```

### Step 7: Write Your Birthday Message

Customize the main birthday message:

```typescript
BIRTHDAY_MESSAGE: {
  title: "Happy Birthday, Roqeebat! 🎊",
  paragraphs: [
    "Today is YOUR day! The world is literally better because you're in it.",
    "Add your own heartfelt messages here...",
    "Multiple paragraphs work great!",
  ],
  closing: "Have the most AMAZING birthday! 🎉🎂🎁",
}
```

## File Size Guidelines

- **Photos**: 500KB - 2MB each (compress if needed)
- **Videos**: Under 50MB each (compress if larger)
- **Audio**: 3-5MB for a full song

## Image Formats Supported

- `.jpg` / `.jpeg` (recommended)
- `.png` (works but larger file size)
- `.webp` (best compression)

## Video Formats Supported

- `.mp4` (recommended)
- `.webm` (works)
- `.mov` (may need conversion)

## Troubleshooting

### Photos not showing?
1. Check file names match exactly (case-sensitive)
2. Make sure files are in `public/images/gallery/`
3. Update `PHOTOS` array in `config/content.ts`
4. Refresh browser (Ctrl + Shift + R)

### Videos not showing?
1. Make sure they're in `public/videos/`
2. Check file paths in `VIDEOS` array in `config/content.ts`
3. Use MP4 format
4. Check file size (under 50MB each)
5. Try a different browser

### Videos not playing?
1. Make sure it's MP4 format
2. File might be too large - compress it
3. Try opening video directly in browser: `http://localhost:3000/videos/video1.mp4`

### Music not playing?
1. Click the music button (top right)
2. Browser might block autoplay - manual start required
3. Check file is named `background-music.mp3` in `public/audio/`

## Need to Compress Files?

**For Images:**
- Use https://tinypng.com/ (free, easy)
- Or use https://squoosh.app/ (more control)

**For Videos:**
- Use HandBrake (free software)
- Or online: https://www.freeconvert.com/video-compressor

**For Audio:**
- Use Audacity (free software)
- Or online: https://www.freeconvert.com/audio-compressor

## Quick Checklist Before Launch

- [ ] All gallery photos added
- [ ] All videos added (optional)
- [ ] Music added (optional)
- [ ] All photo captions personalized
- [ ] All video titles and captions added
- [ ] Fun facts customized
- [ ] Birthday wishes customized
- [ ] Birthday message written
- [ ] Birthday date correct: October 10
- [ ] Her name correct: Roqeebat
- [ ] Tested on your phone
- [ ] Tested on computer

## Ready to Test?

Run:
```bash
npm run dev
```

Open: http://localhost:3000

Check everything looks perfect!

## What's New in This Version?

✨ **Game Entrance**: Catch falling cakes mini-game (10 seconds of fun!)
📹 **Multi-Video Support**: Add as many videos as you want
📊 **Fun Facts**: Flip cards with fun facts about her
🎉 **Rotating Wishes**: Auto-rotating funny/sweet birthday messages
💌 **New Message Format**: More celebratory, less romantic
🎯 **All About Her**: Focus on celebrating HER, not "our moments"

## Game Entrance

The website now starts with a fun cake-catching game!
- 10 seconds to catch falling birthday cakes
- Click/tap cakes before they disappear
- Shows your score at the end
- Can skip to go straight to celebration

---

Made with ❤️ for Roqeebat's Birthday in London 🎂👑
