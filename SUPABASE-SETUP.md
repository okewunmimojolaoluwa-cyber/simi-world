# 🗄️ Supabase Setup Guide

## Why this matters
Without Supabase, all data (Olajuwon's stats, clothing, coins, streak) lives only in the **browser's localStorage**. This means:
- Refresh on a different browser → data gone
- Open on phone → data gone
- Deploy to Vercel → data resets every session

With Supabase, all data syncs to **PostgreSQL** in the cloud. Works everywhere, persists forever.

---

## Step 1: Create Supabase Project

1. Go to **https://supabase.com**
2. Click **Start your project**
3. Sign in with GitHub
4. Click **New project**
5. Fill in:
   - **Name**: `simiworld` (or anything)
   - **Database Password**: create a strong password (save it)
   - **Region**: pick closest to London (EU West)
6. Click **Create new project** — wait ~2 minutes

---

## Step 2: Run the Database Schema

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Copy the entire contents of `supabase/schema.sql` in this project
4. Paste it into the SQL editor
5. Click **Run** (green button)
6. You should see "Success. No rows returned"

This creates two tables:
- `universe_state` — stores visits, streak, achievements, mood, game scores
- `pet_state` — stores Olajuwon's level, hunger, clothing, coins, everything

---

## Step 3: Get Your API Keys

1. In Supabase, click **Project Settings** (gear icon) → **API**
2. You need two values:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public** key — a long string starting with `eyJ...`

---

## Step 4: Add Environment Variables

### For local development:
1. Copy `.env.local.example` to `.env.local`:
   ```
   copy .env.local.example .env.local
   ```
2. Open `.env.local` and fill in your values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
   ```
3. Restart the dev server: `npm run dev`

### For Vercel deployment:
1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add both variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
3. Redeploy

---

## Step 5: Verify It Works

1. Open the app in your browser
2. Go to Olajuwon's pet page
3. Change something (equip clothing, feed him, etc.)
4. Go to Supabase → **Table Editor** → `pet_state`
5. You should see the updated data within ~3 seconds

---

## How the Sync Works

```
User action
    ↓
localStorage (immediate — no delay, app stays fast)
    ↓
[3 second debounce]
    ↓
Supabase PostgreSQL (cloud sync)
```

**On app load:**
1. Load from localStorage instantly (fast render)
2. Load from Supabase in background
3. If Supabase has newer data → merge and update

**If offline:**
- localStorage keeps everything working
- Supabase sync will happen next time they're online

---

## Troubleshooting

**"Data still resets on refresh"**
→ Check that `.env.local` has the correct values
→ Check browser console for errors starting with `[sync]`

**"Supabase table is empty"**
→ Make sure you ran `schema.sql` in the SQL Editor
→ Make sure Row Level Security policies were created (last part of schema.sql)

**"Error: relation does not exist"**
→ Re-run the schema.sql — the table wasn't created

---

## Data Structure

### `pet_state` table stores:
- Name, level, XP, bond level
- All needs (hunger, thirst, happiness, energy, hygiene, health)
- Equipped clothing + full wardrobe unlocks
- Food inventory + coins
- Streak, last visit, achievements
- Sleeping state

### `universe_state` table stores:
- Visit count and streak
- Unlocked achievements
- Game scores
- Open When letters opened
- Mood selection
- Daily surprise tracking
