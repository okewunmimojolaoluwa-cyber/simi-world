# 🚀 Deploy Checklist — Data Persists Across All Devices

## How the data persistence works

Every time Roqeebat opens the site — on her phone, laptop, or any browser —
data is loaded from **Supabase** (the cloud database) first, then localStorage
as a fallback. Every change she makes is saved to **both** instantly.

---

## Step 1 — Set up the Supabase table (ONE-TIME)

1. Go to → https://supabase.com/dashboard/project/kksliorolwzbawfaqcaf
2. Click **SQL Editor** in the left sidebar
3. Open the file `supabase/schema.sql` from this project
4. Paste the entire contents into the editor and click **Run**
5. You should see: `Success. No rows returned.`

---

## Step 2 — Deploy to Vercel

1. Push your code to GitHub (create a repo if you haven't)
2. Go to → https://vercel.com/new
3. Import your GitHub repo
4. Under **Environment Variables**, add these two:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://kksliorolwzbawfaqcaf.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your anon key from .env.local) |

5. Click **Deploy** — Vercel builds and deploys automatically

---

## Step 3 — Verify it works

1. Open the deployed URL on your phone
2. Complete the intro (it saves `birthdayIntroCompleted: true` to Supabase)
3. Open the same URL on a different browser or phone
4. **The intro should be skipped** — dashboard opens directly ✓

---

## What gets saved to the cloud

| Data | Saved |
|------|-------|
| Intro completed (won't repeat) | ✅ Immediately |
| Achievements unlocked | ✅ Immediately |
| Birthday visited flag | ✅ Immediately |
| Olajuwon pet stats | ✅ Every 2.5s |
| Music preference | ✅ Every 2.5s |
| Mood selection | ✅ Every 2.5s |
| Open When letters opened | ✅ Every 2.5s |
| Game scores | ✅ Every 2.5s |
| Visit streak | ✅ Every 2.5s |

Critical fields (intro, achievements, birthday) save **immediately**.
Everything else saves after 2.5 seconds of inactivity.

---

## If network is unavailable

- All data saves to **localStorage** instantly (works offline)
- Failed Supabase writes go into a **pending queue**
- The queue is flushed automatically on the next page load
- No data is ever lost

---

## Supabase dashboard to monitor data

https://supabase.com/dashboard/project/kksliorolwzbawfaqcaf/editor

You can see all saved data in the `universe_state` and `pet_state` tables.
