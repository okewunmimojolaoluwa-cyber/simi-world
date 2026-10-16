# 📊 Content Structure Guide

## Complete Structure of config/content.ts

This file shows **exactly** what's in your `config/content.ts` and what each part does.

---

## 🗂️ Full Structure

```typescript
export const CONTENT = {
  // Basic Info
  HER_NAME: "Roqeebat",
  BIRTHDAY_DATE: "October 10",
  LOCATION: "London",
  
  // Opening (used in GameEntrance)
  OPENING: {
    title: "🎉 BREAKING NEWS 🎉",
    headline: "London Celebrates: It's Roqeebat Day!",
    subheadline: "The most beautiful soul turns another year fabulous",
    buttonText: "Show Me The Love! 💝"
  },

  // Videos (NEW! - Add unlimited videos)
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
    // Add more videos here...
  ],

  // Photo Gallery
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
    // Add more photos (up to 9 or more)...
  ],

  // Fun Facts (NEW! - Flip cards)
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
    // 6 fun facts total...
  ],

  // Birthday Wishes (NEW! - Rotating wishes)
  WISHES: [
    {
      id: 1,
      message: "Happy Birthday to someone who's aging like fine wine... expensive and making everyone jealous! 🍷",
      emoji: "🎂"
    },
    {
      id: 2,
      message: "Another year older, but you're still out here breaking necks with those looks! 💅",
      emoji: "✨"
    },
    // 6 wishes total...
  ],

  // Birthday Message (NEW! - Replaces romantic letter)
  BIRTHDAY_MESSAGE: {
    title: "Happy Birthday, Roqeebat! 🎊",
    paragraphs: [
      "Today is YOUR day! The world is literally better because you're in it.",
      "You're beautiful, you're strong, you're absolutely incredible, and you deserve to be celebrated not just today, but every single day.",
      "From London to the world - you shine brighter than any light in the city. Keep being the amazing person you are!",
      "Here's to another year of being fabulous, making memories, and being absolutely unstoppable!",
      "Wishing you all the happiness, success, and blessings this year! You deserve it ALL! 💕"
    ],
    closing: "Have the most AMAZING birthday! 🎉🎂🎁",
  },

  // Music (optional)
  MUSIC_URL: "/audio/background-music.mp3",
};
```

---

## 📋 What Each Section Does

### 1. Basic Info
```typescript
HER_NAME: "Roqeebat"        // Used throughout the site
BIRTHDAY_DATE: "October 10" // Shows in multiple places
LOCATION: "London"           // Used in text references
```

**Where it appears:**
- Hero section
- Various messages
- Meta titles

---

### 2. OPENING
```typescript
OPENING: {
  title: "...",        // Breaking news title
  headline: "...",     // Main headline after game
  subheadline: "...",  // Subtitle
  buttonText: "..."    // Button to enter site
}
```

**Where it appears:**
- Game entrance reveal screen
- After catching cakes or skipping

---

### 3. VIDEOS (NEW!)
```typescript
VIDEOS: [
  {
    id: 1,              // Unique number
    url: "...",         // Path to video file
    title: "...",       // Video title
    caption: "..."      // Video description
  }
]
```

**Where it appears:**
- Video Showcase section
- Grid of all videos
- Click to watch in modal

**How to add more:**
1. Put video in `public/videos/`
2. Copy the structure
3. Update id, url, title, caption
4. Save!

---

### 4. PHOTOS
```typescript
PHOTOS: [
  {
    id: 1,              // Unique number
    url: "...",         // Path to photo
    caption: "..."      // Photo caption
  }
]
```

**Where it appears:**
- Photo Gallery section
- Grid layout
- Click for fullscreen

**How to add more:**
1. Put photo in `public/images/gallery/`
2. Copy the structure
3. Update id, url, caption
4. Save!

---

### 5. FUN_FACTS (NEW!)
```typescript
FUN_FACTS: [
  {
    id: 1,              // Unique number
    icon: "👑",         // Emoji icon
    title: "...",       // Short title
    fact: "..."         // The actual fun fact
  }
]
```

**Where it appears:**
- Fun Facts section
- Flip cards
- Icon + title on front
- Fact on back

**Tips:**
- Use emojis that fit the fact
- Keep titles short (2-4 words)
- Facts can be 1-2 sentences
- Mix funny and sweet

---

### 6. WISHES (NEW!)
```typescript
WISHES: [
  {
    id: 1,              // Unique number
    message: "...",     // Birthday wish (1-2 sentences)
    emoji: "🎂"         // Emoji to display
  }
]
```

**Where it appears:**
- Birthday Wishes section
- Auto-rotates every 5 seconds
- Can navigate manually

**Tips:**
- Can be funny!
- Can be sweet!
- Mix both!
- Keep them short

---

### 7. BIRTHDAY_MESSAGE (NEW!)
```typescript
BIRTHDAY_MESSAGE: {
  title: "...",         // Main title
  paragraphs: [         // Array of message paragraphs
    "Paragraph 1...",
    "Paragraph 2...",
    "Paragraph 3...",
  ],
  closing: "..."        // Final closing message
}
```

**Where it appears:**
- Letter section
- Typing animation
- Main birthday message

**Tips:**
- 3-5 paragraphs work well
- Celebrate HER
- Keep it uplifting
- Not overly romantic

---

### 8. MUSIC_URL
```typescript
MUSIC_URL: "/audio/background-music.mp3"
```

**Where it appears:**
- Music control (top right)
- Optional background music

**How to add:**
1. Put MP3 in `public/audio/background-music.mp3`
2. That's it!

---

## 🎨 Customization Examples

### Example 1: Add a Video
```typescript
VIDEOS: [
  // ... existing videos ...
  {
    id: 4,  // Next available number
    url: "/videos/birthday-fun.mp4",
    title: "Birthday Vibes! 🎉",
    caption: "This was so much fun!"
  }
]
```

### Example 2: Add a Fun Fact
```typescript
FUN_FACTS: [
  // ... existing facts ...
  {
    id: 7,  // Next available number
    icon: "🎵",
    title: "Music Taste",
    fact: "Has impeccable taste in music that makes everyone jealous!"
  }
]
```

### Example 3: Add a Birthday Wish
```typescript
WISHES: [
  // ... existing wishes ...
  {
    id: 7,  // Next available number
    message: "Cheers to another year of being the coolest person in London! Keep shining! ✨",
    emoji: "🌟"
  }
]
```

### Example 4: Customize Birthday Message
```typescript
BIRTHDAY_MESSAGE: {
  title: "Happy Birthday, Roqeebat! 🎊",
  paragraphs: [
    "Today the world celebrates YOU!",
    "You're incredible, stunning, and absolutely one of a kind.",
    "Keep being the amazing person you are!",
    "Wishing you the best birthday ever!"
  ],
  closing: "Enjoy your special day! 🎂💝",
}
```

---

## 📊 Array Sizes

| Section | Current Count | Can Add More? |
|---------|--------------|---------------|
| VIDEOS | 3 | ✅ Unlimited |
| PHOTOS | 9 | ✅ Unlimited |
| FUN_FACTS | 6 | ✅ Yes |
| WISHES | 6 | ✅ Yes |
| BIRTHDAY_MESSAGE paragraphs | 5 | ✅ Yes |

**You can add as many as you want to any section!**

---

## 🔧 Rules for Editing

### 1. IDs Must Be Unique
```typescript
// ❌ BAD
{id: 1, ...}
{id: 1, ...}  // Same ID!

// ✅ GOOD
{id: 1, ...}
{id: 2, ...}  // Different ID
```

### 2. Commas Between Items
```typescript
// ❌ BAD
{id: 1, ...}
{id: 2, ...}  // Missing comma!

// ✅ GOOD
{id: 1, ...},  // Comma here
{id: 2, ...}
```

### 3. Quotes for Strings
```typescript
// ❌ BAD
title: Happy Birthday

// ✅ GOOD
title: "Happy Birthday"
```

### 4. File Paths Start with /
```typescript
// ❌ BAD
url: "videos/video1.mp4"

// ✅ GOOD
url: "/videos/video1.mp4"
```

---

## 🧪 Testing Your Changes

After editing:
1. Save the file
2. Run: `npm run dev`
3. Open: http://localhost:3000
4. Check your changes appear
5. Fix any errors if needed

---

## 🆘 Common Mistakes

### Missing Comma
```typescript
// ❌ Error: Missing comma
{
  id: 1,
  url: "/videos/video1.mp4"
} // Need comma here!
{
  id: 2,
```

### Unclosed Quote
```typescript
// ❌ Error: Missing quote
title: "My Title

// ✅ Fixed
title: "My Title"
```

### Wrong File Path
```typescript
// ❌ Won't show
url: "images/photo1.jpg"

// ✅ Correct
url: "/images/gallery/photo1.jpg"
```

---

## ✅ Quick Reference

**File location:**
`config/content.ts`

**How to edit:**
1. Open file
2. Find section to change
3. Update text/add items
4. Save file
5. Test with `npm run dev`

**Need help?**
- Check syntax (commas, quotes)
- Look at examples above
- Read error messages
- Test often!

---

Made for Roqeebat's Birthday! 🎉
Edit with confidence! 💪
