# JUCO Diamond Hub — Deploy Guide

## What you have
A full Next.js web app with:
- Homepage
- Athlete sign-up (3-step form)
- Athlete public profile page
- Athlete profile editor
- Coach login / sign-up
- Coach search dashboard (filter by position, state, GPA, grad year, status)
- Coach saved prospects board

---

## Step 1: Set up Supabase (free database + auth)

1. Go to https://supabase.com and create a free account
2. Click "New project" — name it "juco-diamond-hub"
3. Choose a region closest to you, set a database password, click Create
4. Wait ~2 minutes for it to spin up
5. Go to **SQL Editor** in the left sidebar
6. Click **New Query**
7. Open the file `SUPABASE_SETUP.sql` from this folder, copy everything, paste it in, click **Run**
8. Go to **Settings → API** in the left sidebar
9. Copy your **Project URL** and **anon public** key

---

## Step 2: Add your Supabase keys

1. In this folder, duplicate the file `.env.example`
2. Rename it `.env.local`
3. Paste your Project URL and anon key into it:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## Step 3: Deploy to Vercel (free hosting)

### Option A — GitHub (recommended)
1. Create a free account at https://github.com
2. Create a new repository called "juco-diamond-hub"
3. Upload all these files to it
4. Go to https://vercel.com, sign up with GitHub
5. Click "Add New Project" → import your GitHub repo
6. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
7. Click **Deploy** — your site will be live in ~2 minutes

### Option B — Vercel CLI
```bash
npm install -g vercel
cd juco-diamond-hub
npm install
vercel
```
Follow the prompts and add your environment variables when asked.

---

## Step 4: Connect a custom domain (optional, ~$12/year)

1. Buy a domain at Namecheap or Google Domains (jucodiamondub.com, etc.)
2. In Vercel → your project → Settings → Domains
3. Add your domain and follow the DNS instructions

---

## Your site pages

| Page | URL |
|------|-----|
| Homepage | / |
| Athlete sign-up | /athlete/signup |
| Athlete login | /athlete/login |
| Athlete profile editor | /athlete/profile-edit |
| Public athlete profile | /athlete/[id] |
| Coach login | /coach/login |
| Coach search dashboard | /coach/dashboard |
| Coach saved prospects | /coach/saved |

---

## Monthly cost at launch

| Service | Cost |
|---------|------|
| Supabase | Free (up to 50,000 users) |
| Vercel | Free |
| Domain | ~$1/month |
| **Total** | **~$1/month** |

---

## Need help?
If you get stuck on any step, share the error message and I can walk you through it.
