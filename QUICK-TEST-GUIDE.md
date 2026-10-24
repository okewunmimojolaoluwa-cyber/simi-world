# 🧪 Quick Test Guide - Media Sync Fix

**Last Updated**: October 24, 2026

## ✅ What Was Fixed

Uploaded media (photos, videos, music) from admin dashboard now appears on Simi's dashboard automatically.

---

## 🎯 Quick Test Steps

### Test 1: Photo Upload & Display

1. **Login as Admin**
   - Go to homepage
   - Click "Happy Birthday My Baby" 5 times to trigger admin gesture
   - Enter password: `emmjay1234`

2. **Upload a Photo**
   - Navigate to "Sunshine" tab in admin dashboard
   - Click "Upload New Media" button
   - Select a photo file from your device
   - Add title: "Test Photo"
   - Click Upload
   - ✅ Verify photo appears in admin's Sunshine list

3. **View as Simi**
   - Logout from admin
   - Login as Simi (password: `simi1234`)
   - Navigate to "Sunshine" from the main menu
   - ✅ **VERIFY**: Your uploaded photo appears alongside existing photos
   - ✅ **VERIFY**: Photo has "UPLOADED" badge
   - ✅ Click on photo - should open in fullscreen viewer

---

### Test 2: Video Upload & Display

1. **Login as Admin** (if not already)

2. **Upload a Video**
   - In admin dashboard → Sunshine tab
   - Click "Upload New Media"
   - Select a video file (.mp4, .webm, etc.)
   - Add title: "Test Video"
   - Click Upload
   - ✅ Verify video appears in admin's Sunshine list

3. **View as Simi**
   - Logout from admin
   - Login as Simi
   - Navigate to "Sunshine"
   - Click "Videos 🎬" filter button
   - ✅ **VERIFY**: Your uploaded video appears
   - ✅ **VERIFY**: Video has "UPLOADED" badge
   - ✅ Click on video - should play in fullscreen viewer

---

### Test 3: Music Upload & Display

1. **Login as Admin** (if not already)

2. **Upload Music**
   - In admin dashboard → Music Library tab
   - Click "Upload New Media"
   - Select an audio file (.mp3, .wav, etc.)
   - Add title: "Test Song"
   - Add artist: "Test Artist"
   - Click Upload
   - ✅ Verify song appears in admin's Music Library list

3. **View as Simi**
   - Logout from admin
   - Login as Simi
   - Navigate to "Music" from the main menu
   - Scroll down to the playlist
   - ✅ **VERIFY**: Your uploaded song appears in the list
   - ✅ **VERIFY**: Song shows title "Test Song" and artist "Test Artist"
   - ✅ Click on the song - should load and play

---

## 🔍 What to Look For

### ✅ Success Indicators

**Photos/Videos (Sunshine)**:
- Uploaded items appear in grid alongside hardcoded items
- "UPLOADED" badge visible on database items
- Default items have their original badges (PORTRAIT, VIDEO, etc.)
- Filter buttons work correctly (All/Photos/Videos)
- Loading spinner shows briefly when opening gallery
- Clicking items opens fullscreen viewer

**Music (Music Library)**:
- Uploaded tracks appear in playlist
- Track title and artist display correctly
- Clicking track loads and plays audio
- Playlist counter shows correct total count
- Progress bar and controls work normally

### ❌ Issues to Report

- Uploaded items don't appear at all
- "UPLOADED" badge not showing
- Items appear in admin but not in Simi's view
- Loading spinner never disappears
- Errors in browser console
- Videos won't play
- Music won't load

---

## 🛠️ Troubleshooting

### Issue: Uploaded media not appearing

**Check**:
1. Is Supabase storage bucket "media" created?
   - See: `STORAGE-BUCKET-SETUP-GUIDE.md`
   
2. Are environment variables correct?
   - Check `.env` file has correct Supabase keys
   
3. Is media actually saved in database?
   - Login to Supabase dashboard
   - Go to Table Editor → `media_library`
   - Verify records exist

4. Check browser console for errors
   - Press F12 to open DevTools
   - Look for red error messages
   - Common errors:
     - "bucket not found" → Create storage bucket
     - "401 Unauthorized" → Check API keys
     - "Network error" → Check internet connection

### Issue: Media appears in admin but not Simi

**This was the bug we just fixed!** If still happening:

1. **Hard refresh** Simi's page
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Check API response**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Navigate to Sunshine/Music
   - Look for `/api/media?type=photo` request
   - Click on it → Preview tab
   - Verify `media` array contains your uploads

3. **Verify public URLs**
   - In API response, check `publicUrl` field
   - Copy URL and paste in new browser tab
   - Should load the actual file
   - If 404/403 error → Storage permissions issue

---

## 📊 Expected Behavior

### Default Content (Always Shows)

**Photos**: 4 hardcoded photos (photo1-4.jpg)
**Videos**: 3 hardcoded videos (video2-4.mp4)
**Music**: 10 hardcoded songs (Ayra Starr, BNXN, Rema, etc.)

### After Uploads

**Photos**: Default 4 + Your uploads
**Videos**: Default 3 + Your uploads
**Music**: Default 10 + Your uploads

**All content shows together seamlessly!**

---

## 🎬 Demo Flow

For a complete test:

```
1. Start at homepage (logged out)
2. Login as Admin (5 clicks + password)
3. Upload 1 photo, 1 video, 1 song
4. Logout
5. Login as Simi
6. Check Sunshine → See your photo + video
7. Check Music → See your song
8. Play all 3 items
9. ✅ All working!
```

---

## 📸 Visual Checks

### Sunshine Gallery
```
┌─────────┬─────────┬─────────┬─────────┐
│ Photo 1 │ Photo 2 │ Photo 3 │ Photo 4 │  ← Hardcoded (default)
│PORTRAIT │PORTRAIT │PORTRAIT │PORTRAIT │
├─────────┼─────────┼─────────┼─────────┤
│ Video 1 │ Video 2 │ Video 3 │ YOUR    │  ← Mixed
│  VIDEO  │  VIDEO  │  VIDEO  │ UPLOADED│
├─────────┼─────────┼─────────┼─────────┤
│  YOUR   │  YOUR   │         │         │  ← Your uploads
│UPLOADED │UPLOADED │         │         │
└─────────┴─────────┴─────────┴─────────┘
```

### Music Player Playlist
```
1. Who's Dat Girl - Ayra Starr Ft Rema     🟣  ← Default
2. Cutesy - BNXN                           🟣
3. Eja Meja - BNXN Ft Asake                🟣
...
10. Where I'm From - TML Vibez             🟣
11. Test Song - Test Artist                🟣  ← Your upload!
```

---

## ⚡ Performance Notes

- **First load**: May take 1-2 seconds to fetch from API
- **Loading spinner**: Shows during fetch
- **Subsequent loads**: Faster (browser caching)
- **Large files**: Videos >50MB may load slowly (normal)

---

## 🎉 Success!

If you see:
- ✅ Photos in gallery with UPLOADED badge
- ✅ Videos playing in viewer
- ✅ Songs in playlist and playing

**Then everything is working perfectly!** 🎊

---

## 📞 Need Help?

If tests fail, check these files for details:
- `MEDIA-SYNC-FIX-COMPLETE.md` - Full implementation details
- `STORAGE-BUCKET-SETUP-GUIDE.md` - Storage setup instructions
- `SUPABASE-SETUP.md` - Database configuration

Or check browser console (F12) for error messages.
