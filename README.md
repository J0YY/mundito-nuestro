# mundito nuestro

A romantic, highly polished, mobile-responsive map app for Joy & Socrates to pin memories across the world. Built with Next.js (App Router), React, TypeScript, Tailwind, React Leaflet, Supabase (DB + Storage + Realtime), and Zustand.

## Features
- World map with memory pins colored by category, with contributor labels
- Create/Edit/Delete memories with photo upload to Supabase Storage
- Filters by contributor, category, year; time range filtering
- Timeline view synced with map
- Thought heatmap toggle (for "thinking of you" pins)
- Memory trails (chronological polylines)
- Secret memories that unlock on a date
- Bucket list completion with visual transition
- Core memory Cinematic Mode
- Realtime updates via Supabase

## Tech
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- React Leaflet + Leaflet.heat
- Supabase (Database + Realtime + Storage)
- Zustand for state management

## Setup

1) Clone and install
```bash
npm install
```

2) Supabase
- Create a new Supabase project
- In SQL editor, run `supabase/schema.sql` from this repository to create the `memories` table and basic RLS
- In Storage, create a bucket named `memory-photos` and make it public
- Get your Project URL and anon public key

3) Environment variables
Create a `.env.local` in project root:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4) Run
```bash
npm run dev
```

Open http://localhost:3000

## Deploy
- Deploy to Vercel
- Add environment variables on Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Data model
Table `public.memories`:
- id (uuid, pk)
- lat, lng (float8)
- title, description (text)
- contributor ('joy' | 'socrates')
- category ('core' | 'thought' | 'bucket_list' | 'trip' | 'milestone' | 'inside_joke' | 'celebration' | 'heartbreak_repair' | 'anniversary' | 'secret')
- color (text, optional)
- mood ('soft' | 'romantic' | 'chaotic' | 'longing' | 'nostalgic' | null)
- emoji (text, optional)
- date (date), time (time, optional)
- photo_url (text, optional)
- is_bucket_list_completed (boolean, default false)
- secret_unlock_date (date, nullable)
- created_at (timestamptz)

Storage: `memory-photos` bucket.

## Notes
- Realtime subscription listens to INSERT/UPDATE/DELETE on `memories`
- Thought heatmap uses `leaflet.heat`. Types are declared in `types/leaflet-heat.d.ts`
- Default pin colors are derived from category; explicit `color` is supported
- Secret memories: title/description hidden until unlock date

## License
Personal project for Joy & Socrates 💞

