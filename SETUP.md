# Setup Instructions

## Complete Birthday Website - Ready to Deploy!

This is a production-ready, highly interactive birthday website built with Next.js, TypeScript, and Framer Motion.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

If you encounter any issues, try:
```bash
npm install --legacy-peer-deps
```

### 2. Customize Content
Open `config/content.ts` and personalize:
- **HER_NAME**: Replace "Sarah" with her actual name
- **BIRTHDAY_DATE**: Set to her birthday (format: "2026-12-25T00:00:00")
- **MEMORIES**: Add your own photos and memories
- **PHOTOS**: Update with your actual photo URLs
- **APPRECIATION_MESSAGES**: Customize what you appreciate about her
- **LETTER**: Write your personal birthday letter
- **FINAL_MESSAGE**: Customize the closing messages

### 3. Add Photos
Replace the Unsplash placeholder URLs in `config/content.ts` with your own photos:
- Upload photos to a service (Cloudinary, Imgur, or keep them in `/public/images/`)
- Update all `image` and `url` fields with your photo URLs

### 4. Add Background Music (Optional)
- Place your audio file in `public/audio/background-music.mp3`
- Or update `MUSIC_URL` in `config/content.ts` with your file path

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to preview.

### 6. Build for Production
```bash
npm run build
npm start
```

## Deployment

### Option 1: Vercel (Recommended)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Deploy (automatic!)

### Option 2: Netlify
1. Build the project: `npm run build`
2. Deploy the `.next` folder to Netlify

### Option 3: Any Node.js Hosting
- Build: `npm run build`
- Start: `npm start`
- Requires Node.js 18+

## Features Included

✓ Cinematic opening experience
✓ Interactive floating particles
✓ Birthday countdown (if before her birthday)
✓ Our story timeline with memories
✓ Photo gallery with fullscreen viewer
✓ Flip-card appreciation messages
✓ Interactive birthday cake with candles
✓ Personal letter with typing animation
✓ Confetti celebration
✓ Optional background music
✓ Hidden Easter egg
✓ Fully responsive (mobile-first)
✓ Keyboard navigation
✓ Respects reduced-motion preferences
✓ 60 FPS animations

## Troubleshooting

### Port already in use
```bash
npm run dev -- -p 3001
```

### Build errors
Make sure you're using Node.js 18 or higher:
```bash
node --version
```

### Photos not loading
- Make sure image URLs are publicly accessible
- Check browser console for errors
- Use absolute URLs (https://...)

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Need Help?
Check the README.md for more details about the architecture and features.

---

Made with ❤️
