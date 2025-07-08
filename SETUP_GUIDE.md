# PasteShare - Global Data Storage Setup Guide

This guide will help you set up global data storage for your PasteShare application using Supabase (free tier) and deploy it to Vercel.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (free)
3. Create a new project:
   - Choose a project name (e.g., "pasteshare")
   - Set a database password (save this!)
   - Select a region close to your users
   - Click "Create new project"

### Step 2: Set Up the Database

1. Wait for your project to finish setting up (1-2 minutes)
2. Go to the **SQL Editor** in your Supabase dashboard
3. Copy and paste the contents of `supabase-migration.sql` from your project
4. Click "Run" to create the database table and policies

### Step 3: Get Your API Keys

1. Go to **Settings** > **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon/public key** (starts with `eyJ`)

### Step 4: Configure Environment Variables

1. In your project root, create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Step 5: Test Locally

1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)
4. Try creating a paste - it should now be stored globally!

## 🌍 Deploy to Vercel (Free)

### Option 1: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "New Project"
3. Import your GitHub repository
4. In the deployment settings, add your environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login and deploy:
   ```bash
   vercel login
   vercel
   ```

3. Add environment variables:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

4. Redeploy:
   ```bash
   vercel --prod
   ```

## ✨ Features You Now Have

- **Global Data Storage**: All pastes are stored in Supabase and accessible worldwide
- **Real-time Sync**: Changes appear instantly across all connected devices
- **Free Hosting**: Both Supabase and Vercel offer generous free tiers
- **Automatic Backups**: Supabase handles database backups automatically
- **Scalable**: Can handle thousands of users and pastes

## 🔧 Troubleshooting

### "Failed to load pastes" Error

1. Check your `.env.local` file has the correct Supabase credentials
2. Verify your Supabase project is active (not paused)
3. Make sure you ran the SQL migration script
4. Check browser console for detailed error messages

### Real-time Updates Not Working

1. Ensure you have the latest version of `@supabase/supabase-js`
2. Check that Row Level Security policies are set up correctly
3. Verify your Supabase project has real-time enabled (it's on by default)

### Deployment Issues

1. Make sure environment variables are set in Vercel dashboard
2. Check that your `.env.local` is in `.gitignore` (it should be)
3. Verify your build completes successfully locally first

## 📊 Usage Limits (Free Tiers)

### Supabase Free Tier
- 500MB database storage
- 2GB bandwidth per month
- 50,000 monthly active users
- Real-time connections: 200 concurrent

### Vercel Free Tier
- 100GB bandwidth per month
- 6,000 build minutes per month
- Unlimited static deployments

## 🔒 Security Notes

- Row Level Security (RLS) is enabled by default
- Anyone can read, create, update, and delete pastes (by design)
- For private pastes, you'd need to implement authentication
- API keys are safe to expose (they're public keys)

## 🚀 Next Steps

- Add user authentication for private pastes
- Implement paste expiration dates
- Add syntax highlighting for code
- Create paste categories or tags
- Add file upload support

---

**Need help?** Check the [Supabase docs](https://supabase.com/docs) or [Vercel docs](https://vercel.com/docs) for more detailed information.