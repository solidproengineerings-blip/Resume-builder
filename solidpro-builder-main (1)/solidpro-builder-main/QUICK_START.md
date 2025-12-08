# Quick Start - PDF Storage Setup

## Step 1: Apply Database Migration

You need to run the migration to add the `pdf_url` column and create the storage bucket.

### Option A: Using Supabase CLI (Recommended)

```bash
# Navigate to your project directory
cd "c:\Users\Jdeepancha\Downloads\solidpro-builder-main (1)\solidpro-builder-main"

# Apply the migration
supabase db push
```

### Option B: Using Supabase Dashboard (Manual)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `xujuckxhqsgxqmbqpqmy`
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy and paste the contents of `supabase/migrations/20241208_add_pdf_storage.sql`
6. Click **Run** to execute the migration

## Step 2: Verify Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. You should see a bucket named `resume-pdfs`
3. Click on it to verify it's set to **Public**
4. Check **Policies** tab to ensure upload/delete policies exist

## Step 3: Test the Implementation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the application in your browser

3. Fill out a resume form

4. Click **Generate PDF**
   - PDF should download to your computer
   - You should see "PDF generated and uploaded successfully!" message
   - Check browser console for the storage URL

5. Click **Save Resume**
   - Resume data should save with the PDF URL
   - Check Supabase Dashboard > Table Editor > resumes
   - The `pdf_url` column should contain the storage URL

## Step 4: Verify in Supabase

### Check Database
1. Go to **Table Editor** > `resumes`
2. Find your latest resume entry
3. Check the `pdf_url` column - it should contain a URL like:
   ```
   https://xujuckxhqsgxqmbqpqmy.supabase.co/storage/v1/object/public/resume-pdfs/1733649600000_John_Doe_Resume.pdf
   ```

### Check Storage
1. Go to **Storage** > `resume-pdfs`
2. You should see your uploaded PDF file
3. Click on it to preview or download

## Troubleshooting

### Migration Fails
- **Error: relation "resumes" does not exist**
  - Run the initial resume table migration first
  - Check `supabase/migrations/20241205_create_resumes_table.sql`

- **Error: bucket already exists**
  - This is fine, the migration uses `ON CONFLICT DO NOTHING`
  - The bucket won't be recreated

### Upload Fails
- **Check Console**: Open browser DevTools > Console for error messages
- **Check Network**: DevTools > Network tab, filter by "storage"
- **Verify Credentials**: Check `.env` file has correct Supabase credentials
- **Check Bucket**: Ensure `resume-pdfs` bucket exists in Storage

### PDF URL Not Saving
- **Check Migration**: Verify `pdf_url` column exists in database
- **Check Console**: Look for errors when saving resume
- **Check Data**: Verify `lastGeneratedPdfUrl` state has a value before saving

## What Changed

### Files Modified
1. ✅ `src/lib/pdfUtils.ts` - Returns PDF blob for upload
2. ✅ `src/integrations/supabase/resumeService.ts` - Accepts PDF URL parameter
3. ✅ `src/integrations/supabase/types.ts` - Added `pdf_url` field
4. ✅ `src/components/resume/ResumeForm.tsx` - Uploads PDF and saves URL

### Files Created
1. ✅ `supabase/migrations/20241208_add_pdf_storage.sql` - Database migration
2. ✅ `src/integrations/supabase/storageService.ts` - Storage operations
3. ✅ `PDF_STORAGE_IMPLEMENTATION.md` - Full documentation
4. ✅ `QUICK_START.md` - This file

## Next Steps

After successful testing:

1. **Add User Authentication** (if not already implemented)
   - Link PDFs to specific users
   - Update storage policies for user-specific access

2. **Add Cleanup Logic**
   - Delete old PDFs when resume is updated
   - Implement PDF versioning if needed

3. **Add Error Recovery**
   - Retry failed uploads
   - Handle network errors gracefully

4. **Monitor Storage Usage**
   - Free tier: 1GB storage limit
   - Set up alerts for quota usage

## Support

For detailed documentation, see `PDF_STORAGE_IMPLEMENTATION.md`

For issues:
1. Check browser console for errors
2. Check Supabase logs in Dashboard
3. Verify all environment variables are correct
4. Ensure migration was applied successfully
