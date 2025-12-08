# Supabase Setup Guide

## 1. Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project or select an existing one
3. Go to **Project Settings** > **API**
4. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## 2. Configure Environment Variables

Add these to your `.env.local` file:

```
GEMINI_API_KEY=your_existing_gemini_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Set Up Database

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the following SQL:

```sql
-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    data JSONB NOT NULL,
    pdf_url TEXT,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on last_updated for faster sorting
CREATE INDEX IF NOT EXISTS idx_resumes_last_updated ON resumes(last_updated DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Enable all access for resumes" ON resumes
    FOR ALL
    USING (true)
    WITH CHECK (true);
```

5. Click **Run** to execute the query

## 4. Set Up Storage Bucket

1. Go to **Storage** in the left sidebar
2. Click **Create a new bucket**
3. Name it: `resume-pdfs`
4. Make it **Public**
5. Click **Create bucket**

### Set Storage Policies

1. Click on the `resume-pdfs` bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Select **For full customization**
5. Add this policy:

```sql
CREATE POLICY "Public Access for resume-pdfs"
ON storage.objects FOR ALL
USING (bucket_id = 'resume-pdfs')
WITH CHECK (bucket_id = 'resume-pdfs');
```

## 5. Restart Your Dev Server

After setting up everything, restart your development server:

```bash
npm run dev
```

## Verification

Your Supabase connection should now work! The app will:
- Save resume data to the cloud database
- Upload PDF files to Supabase Storage
- Fetch resumes from the cloud

Check the browser console - you should no longer see the warning:
"Supabase credentials not found. Cloud features will be disabled."
