# Deployment Guide for Ezzy

This guide will help you deploy your Ezzy application to GitHub and Vercel with a working Supabase database.

## Prerequisites

- GitHub account
- Vercel account
- Supabase account

## Step 1: Push to GitHub

1. Create a new repository on GitHub (e.g., `ezzy-app`)
2. Copy the repository URL
3. Run these commands in your terminal:

```bash
cd /Users/abhiraj/Pictures/Vscode/my-app
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

## Step 2: Set up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to the SQL Editor in your Supabase dashboard
3. Run the migration script from `supabase-migration.sql`:

```sql
-- Create the pastes table
CREATE TABLE IF NOT EXISTS public.pastes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    views INTEGER DEFAULT 0 NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.pastes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view pastes" ON public.pastes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert pastes" ON public.pastes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update pastes" ON public.pastes FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete pastes" ON public.pastes FOR DELETE USING (true);

-- Create index
CREATE INDEX IF NOT EXISTS pastes_created_at_idx ON public.pastes(created_at DESC);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.pastes;
```

4. Get your Supabase credentials:
   - Go to Settings > API
   - Copy the `Project URL` and `anon public` key

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
5. Click "Deploy"

## Step 4: Verify Deployment

1. Once deployed, visit your Vercel app URL
2. Test creating a new document
3. Test the show/hide functionality
4. Verify data is being saved to Supabase

## Environment Variables

Make sure these are set in both your local `.env.local` and Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features Included

- ✅ Modern dark theme with Inter font
- ✅ Compact design with 1-2 line previews
- ✅ Smooth show/hide toggle functionality
- ✅ Real-time updates
- ✅ Copy and delete functionality
- ✅ Responsive design
- ✅ Lucide React icons

## Troubleshooting

- If you see database errors, ensure the migration script ran successfully
- If environment variables aren't working, check they're set correctly in Vercel
- For local development, ensure `.env.local` exists with the correct values

Your Ezzy app should now be live and fully functional!