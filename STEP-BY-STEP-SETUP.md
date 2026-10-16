# 🎉 Step-by-Step Setup Guide for Roqeebat's Birthday Website

## What You Need to Do

I saw the beautiful photos you have of Roqeebat! Now let's add them to the website.

---

## 📋 STEP 1: Copy Her Photos to the Right Places

### For "Our Story" Section (Need 4 photos)

1. Choose 4 of your favorite photos of her
2. Copy them to: `C:\Users\USER PC\Desktop\birthday\public\images\`
3. Rename them:
   - First photo → `memory1.jpg`
   - Second photo → `memory2.jpg`
   - Third photo → `memory3.jpg`
   - Fourth photo → `memory4.jpg`

**Example using the photos you showed me:**
- White hoodie photo → `memory1.jpg`
- Black outfit photo → `memory2.jpg`
- Yellow top photo → `memory3.jpg`
- Another favorite → `memory4.jpg`

### For Photo Gallery (Need 9+ photos)

1. Choose 9 of her best photos (or use all of them!)
2. Create folder: `C:\Users\USER PC\Desktop\birthday\public\images\gallery\`
3. Copy photos there and rename them:
   - `photo1.jpg`
   - `photo2.jpg`
   - `photo3.jpg`
   - ... up to `photo9.jpg` (or more!)

**Suggested order from photos you showed:**
1. Yellow top photo (stunning!)
2. Black outfit full body
3. White hoodie 
4. Another black outfit
5. Yellow top different angle
6. White hoodie different angle
7. Any other photos you have
8. More photos...
9. Even more!

---

## 🎥 STEP 2: Add a Special Video (Optional but AMAZING!)

If you have a video message or video montage:

1. Copy video to: `C:\Users\USER PC\Desktop\birthday\public\videos\`
2. Rename it to: `special-message.mp4`

**Video Ideas:**
- Record yourself saying happy birthday to her
- A slideshow of photos with music
- A memorable video you have together
- Any special moment captured on video

**Important:** Keep video under 50MB for best performance

---

## 🎵 STEP 3: Add Background Music (Optional)

1. Choose a meaningful song (her favorite or a romantic one)
2. Make sure it's MP3 format
3. Copy to: `C:\Users\USER PC\Desktop\birthday\public\audio\`
4. Rename to: `background-music.mp3`

---

## ✏️ STEP 4: Personalize the Messages

Open: `C:\Users\USER PC\Desktop\birthday\config\content.ts`

### Update Memory Descriptions

Find the `MEMORIES` section and personalize each story:

```typescript
{
  id: 1,
  date: "First Time We Met",  // ← Your actual story
  title: "Where it all started",
  description: "Write your real memory here...", // ← YOUR words!
  location: "Actual place",
  image: "/images/memory1.jpg",
},
```

### Update Photo Captions

Find the `PHOTOS` section:

```typescript
{
  id: 1,
  url: "/images/gallery/photo1.jpg",
  caption: "Your beautiful caption here", // ← Make it personal!
},
```

### Write Your Birthday Letter

Find the `LETTER` section and write from your heart:

```typescript
LETTER: {
  greeting: "Dear Roqeebat,",
  paragraphs: [
    "Write your first paragraph...",
    "Second paragraph...",
    "Keep going...",
    "Tell her everything you want to say...",
  ],
  closing: "Happy Birthday, Roqeebat. ❤️",
  signature: "With all my heart,",
},
```

---

## 🚀 STEP 5: Install and Run

### First Time Setup:

Open Command Prompt in the birthday folder and run:

```bash
npm install
```

**Note:** This might take 5-10 minutes the first time. Be patient!

If it shows any errors, try:
```bash
npm install --legacy-peer-deps --force
```

### Run the Website:

```bash
npm run dev
```

Then open your browser and go to: **http://localhost:3000**

---

## ✅ STEP 6: Test Everything

Check these on your computer AND your phone:

- [ ] Opening animation works
- [ ] All photos show up
- [ ] Countdown shows correct date (October 10)
- [ ] "Our Story" section has all 4 photos
- [ ] Photo gallery has all photos
- [ ] Video plays (if you added one)
- [ ] Music works (click button bottom-right)
- [ ] Birthday cake candles blow out
- [ ] All text is personal and correct
- [ ] Everything looks good on mobile
- [ ] Everything looks good on desktop

---

## 📱 STEP 7: Test on Your Phone

While the website is running:

1. Find your computer's IP address:
   - Open Command Prompt
   - Type: `ipconfig`
   - Look for "IPv4 Address" (something like 192.168.1.X)

2. On your phone's browser, go to:
   ```
   http://YOUR-IP-ADDRESS:3000
   ```
   Example: `http://192.168.1.5:3000`

3. Make sure your phone is on the same WiFi as your computer!

---

## 🌐 STEP 8: Deploy Online (Make it Live!)

### Option 1: Vercel (Easiest - 5 minutes)

1. Create account at: https://vercel.com (free!)
2. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. In your birthday folder:
   ```bash
   vercel login
   vercel
   ```
4. Follow the prompts (press Enter for defaults)
5. You'll get a live URL like: `your-site.vercel.app`
6. Share this URL with Roqeebat on her birthday!

### Option 2: Netlify (Also Easy)

1. Build the site:
   ```bash
   npm run build
   ```
2. Go to: https://www.netlify.com
3. Drag the `.next` folder to Netlify
4. Get your live URL!

---

## 🎁 STEP 9: Birthday Day Plan

### Before October 10:
- [ ] All photos added
- [ ] All text personalized
- [ ] Video added (if using)
- [ ] Music added (if using)
- [ ] Tested on computer
- [ ] Tested on phone
- [ ] Deployed online
- [ ] Have the URL ready

### On October 10:
- Send her the URL
- Watch her reaction! 😊

---

## 🆘 Troubleshooting

### "npm install" is taking forever
- It's normal! First install can take 5-10 minutes
- Don't close the window
- Let it finish

### Photos not showing
- Check file names are EXACTLY: memory1.jpg, photo1.jpg, etc.
- Make sure they're in the right folders
- File names are case-sensitive!
- Try refreshing: Ctrl + Shift + R

### Video not playing
- Make sure it's MP4 format
- Check file size (under 50MB)
- Path should be: `/videos/special-message.mp4`

### Can't see website on phone
- Make sure phone and computer on same WiFi
- Double-check IP address
- Try turning phone WiFi off and on

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```
Then go to: http://localhost:3001

---

## 💡 Pro Tips

1. **Compress large photos:**
   - Use https://tinypng.com/
   - Keeps quality, reduces file size

2. **Test in incognito mode:**
   - Shows what she'll see
   - Clears cache issues

3. **Take screenshots:**
   - Document the beautiful site you made
   - Show friends/family later

4. **Save the URL:**
   - Write it down
   - Send it to yourself
   - Don't lose it before October 10!

---

## 📞 Quick Commands Reference

```bash
# Install dependencies
npm install

# Run website locally
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel
```

---

## 🎉 You're All Set!

Once you complete these steps, you'll have created something truly special for Roqeebat.

This isn't just a website—it's a digital love letter, a photo album, and a celebration all in one.

She's going to love it! ❤️

---

**Questions?** Check the other markdown files:
- `HOW-TO-ADD-PHOTOS-AND-VIDEOS.md` - Detailed photo guide
- `README.md` - Technical documentation
- `SETUP.md` - General setup info

**Ready to start?** Begin with STEP 1! 🚀
