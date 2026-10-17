# Quick Start - Admin Dashboard

## 🚀 How to Access Admin Dashboard

### Method 1: Secret Gesture (Recommended)
1. Go to the website homepage
2. Look for the text **"Happy Birthday My Baby"** (in the golden badge with cake emoji)
3. **Click it 5 times rapidly**
4. A password prompt will appear
5. Enter admin password: `emmjay1234`
6. You'll be redirected to `/admin`

### Method 2: Direct URL
1. Go to `https://your-site.com/admin`
2. Enter admin password: `emmjay1234`
3. Dashboard loads

---

## 🎯 Admin Dashboard Features

### 📊 Login History Tab
- View all login attempts (Simi and Admin)
- See timestamps in Lagos time (Africa/Lagos)
- Track success/failure rates
- Monitor IP addresses

### ☀️ Sunshine Gallery Tab
**Upload Photos/Videos:**
1. Select "Photo" or "Video" button
2. Add optional caption
3. Drag & drop file OR click to browse
4. Wait for upload (progress bar shows)
5. Media appears in grid below

**Manage Media:**
- Hover over item → Click "View" or "Delete"
- Delete requires confirmation
- Supports JPG, PNG, GIF, WEBP (photos)
- Supports MP4, WEBM, MOV (videos)

### 🎵 Music Library Tab
**Upload Music:**
1. Click "Music" button
2. Add optional caption (track name)
3. Upload MP3, WAV, or OGG file
4. Track appears in library

**Manage Music:**
- Play tracks directly in browser
- Download tracks
- Delete tracks
- Fully responsive on mobile

---

## 📱 Mobile Usage

The dashboard is fully responsive:
- Works on phones, tablets, desktops
- Touch-friendly buttons
- Audio controls optimized for mobile
- Grid layouts adapt to screen size

---

## 🔐 Passwords

**Simi Access** (main site after intro):
```
Password: simi1234
```

**Admin Access** (dashboard):
```
Password: emmjay1234
```

---

## ⚙️ Deployment Setup

### Required Environment Variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://kksliorolwzbawfaqcaf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=<from-supabase-dashboard>
SIMI_ACCESS_PASSWORD=simi1234
ADMIN_ACCESS_PASSWORD=emmjay1234
SESSION_SECRET=<generate-with-openssl>
NODE_ENV=production
NEXT_PUBLIC_APP_URL=<your-deployment-url>
```

### Supabase Setup:
1. Run migration: `supabase/migrations/001_add_auth_and_media.sql`
2. Create storage bucket named `media` (public read)
3. Get service role key from Settings → API

### Deploy:
```bash
npm install
npm run build
npm start
```

---

## ⚠️ Troubleshooting

**Admin gesture not working:**
- Make sure you click exactly 5 times
- Click quickly (within 3 seconds)
- Look for progress dots in top-right corner

**Upload failing:**
- Check file size (must be under 50MB)
- Verify file type is supported
- Check browser console for errors

**Can't access /admin:**
- Make sure you're logged in as admin
- Session might have expired (re-enter password)
- Check environment variables are set

**Media not loading:**
- Verify Supabase storage bucket is public
- Check `media_library` table has records
- Ensure URLs are accessible

---

## 📞 Support

If issues persist:
1. Check browser console (F12)
2. Check server logs
3. Verify environment variables
4. Test Supabase connection
5. Check database tables have data

---

## ✅ Testing Checklist

Before going live:
- [ ] Admin gesture works (5 clicks)
- [ ] Admin password works (`emmjay1234`)
- [ ] Can upload photos
- [ ] Can upload videos
- [ ] Can upload music
- [ ] Can delete media
- [ ] Login history shows events
- [ ] Mobile view works properly
- [ ] Simi password works (`simi1234`)
- [ ] Session persists on refresh

---

**Ready to use!** 🎉

The admin dashboard is fully functional and ready for production deployment.
