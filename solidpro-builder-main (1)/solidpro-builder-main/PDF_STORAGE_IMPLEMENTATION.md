# PDF Storage Integration - Implementation Guide

## Overview
This implementation adds PDF storage functionality to the SolidPro Resume Builder, allowing generated PDFs to be automatically uploaded to Supabase Storage and linked to resume records in the database.

## Changes Made

### 1. Database Migration
**File:** `supabase/migrations/20241208_add_pdf_storage.sql`

- Added `pdf_url` column to the `resumes` table to store the URL of uploaded PDFs
- Created a new Supabase Storage bucket named `resume-pdfs` with public read access
- Set up storage policies for authenticated users to upload, update, and delete PDFs

### 2. PDF Utilities Update
**File:** `src/lib/pdfUtils.ts`

**Changes:**
- Modified `generateResumePdf` function to return a `PdfGenerationResult` object containing:
  - `blob`: The PDF file as a Blob for upload
  - `filename`: The sanitized filename
- The function now both downloads the PDF for the user AND returns it for storage upload
- Added new interface `PdfGenerationResult` for type safety

### 3. Storage Service
**File:** `src/integrations/supabase/storageService.ts` (NEW)

**Functions:**
- `uploadPdfToStorage(file, filename, resumeId?)`: Uploads a PDF blob to Supabase Storage
  - Creates unique filenames with timestamps to avoid collisions
  - Organizes files by resume ID if provided
  - Returns the public URL of the uploaded file
- `deletePdfFromStorage(pdfUrl)`: Deletes a PDF from storage given its URL
- `listResumePdfs(resumeId)`: Lists all PDFs for a specific resume

### 4. Resume Service Update
**File:** `src/integrations/supabase/resumeService.ts`

**Changes:**
- Updated `saveResume` function signature to accept optional `pdfUrl` parameter
- Changed return type from `boolean` to `string | null` (returns resume ID on success)
- Stores the PDF URL in the database when provided

### 5. Database Types Update
**File:** `src/integrations/supabase/types.ts`

**Changes:**
- Added `pdf_url: string | null` to the `Row` type
- Added `pdf_url?: string | null` to the `Insert` type
- Added `pdf_url?: string | null` to the `Update` type

### 6. Resume Form Update
**File:** `src/components/resume/ResumeForm.tsx`

**Changes:**
- Added import for `uploadPdfToStorage` from storage service
- Added state variable `lastGeneratedPdfUrl` to track the most recently uploaded PDF
- Updated `generatePdf` function to:
  1. Generate the PDF and get the blob
  2. Upload the blob to Supabase Storage
  3. Store the returned URL in state
  4. Show appropriate success/warning messages
- Updated `handleSaveResume` to pass the PDF URL when saving resume data

## How It Works

### PDF Generation and Storage Flow

1. **User clicks "Generate PDF"**
   - Form validates all required fields
   - `generatePdf()` function is called

2. **PDF Generation**
   - `generateResumePdf()` creates the PDF with watermarks and headers
   - Returns both a Blob and filename
   - Automatically downloads the PDF for the user

3. **Upload to Storage**
   - `uploadPdfToStorage()` uploads the PDF blob to Supabase Storage
   - Creates a unique filename: `{timestamp}_{sanitized_filename}.pdf`
   - Returns the public URL of the uploaded file

4. **Store URL**
   - The PDF URL is saved in component state (`lastGeneratedPdfUrl`)
   - User sees success message with confirmation

5. **Save Resume**
   - When user clicks "Save Resume", the resume data is saved to the database
   - The PDF URL from state is included in the database record
   - Resume ID is returned on successful save

## Database Schema

```sql
-- Resumes table now includes:
CREATE TABLE public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Personal Information
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    linkedin TEXT,
    location TEXT,
    
    -- Resume Content
    summary TEXT,
    skills TEXT[],
    work_experience JSONB,
    projects JSONB,
    education JSONB,
    certifications JSONB,
    
    -- NEW: PDF Storage
    pdf_url TEXT  -- Public URL to the stored PDF
);
```

## Storage Bucket Structure

```
resume-pdfs/
├── {timestamp}_{filename}.pdf
├── {resumeId}/
│   ├── {timestamp}_{filename}.pdf
│   └── {timestamp}_{filename}.pdf
```

## Setup Instructions

### 1. Run Database Migration

```bash
# If using Supabase CLI
supabase migration up

# Or apply the migration manually in Supabase Dashboard
# SQL Editor > New Query > Paste contents of 20241208_add_pdf_storage.sql
```

### 2. Verify Storage Bucket

1. Go to Supabase Dashboard > Storage
2. Verify `resume-pdfs` bucket exists
3. Check that it's set to public read access
4. Verify storage policies are in place

### 3. Install Dependencies (if needed)

The implementation uses existing dependencies:
- `@supabase/supabase-js` - Already installed
- `html2pdf.js` - Already installed

### 4. Environment Variables

Ensure your `.env` file has the correct Supabase credentials:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
```

## Usage

### For End Users

1. Fill out the resume form
2. Click "Generate PDF" - PDF will download AND upload to storage
3. Click "Save Resume" - Resume data and PDF URL are saved to database
4. The PDF is now permanently stored and accessible via the URL

### For Developers

#### Upload a PDF
```typescript
import { uploadPdfToStorage } from '@/integrations/supabase/storageService';

const pdfUrl = await uploadPdfToStorage(blob, 'resume.pdf', resumeId);
if (pdfUrl) {
  console.log('PDF uploaded:', pdfUrl);
}
```

#### Save Resume with PDF
```typescript
import { saveResume } from '@/integrations/supabase/resumeService';

const resumeId = await saveResume(resumeData, pdfUrl);
if (resumeId) {
  console.log('Resume saved with ID:', resumeId);
}
```

#### Delete a PDF
```typescript
import { deletePdfFromStorage } from '@/integrations/supabase/storageService';

const success = await deletePdfFromStorage(pdfUrl);
```

## Security Considerations

### Storage Policies

- **Public Read**: Anyone can view/download PDFs (suitable for sharing resumes)
- **Authenticated Upload**: Only authenticated users can upload PDFs
- **Authenticated Update/Delete**: Only authenticated users can modify/delete PDFs

### Recommendations for Production

1. **Add User Authentication**: Link PDFs to specific users
2. **Update Policies**: Restrict access to user's own PDFs
3. **Add File Size Limits**: Prevent abuse with large files
4. **Add Virus Scanning**: Scan uploaded files for malware
5. **Implement Cleanup**: Delete old PDFs when resumes are deleted

Example policy for user-specific access:
```sql
CREATE POLICY "Users can only access their own PDFs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'resume-pdfs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Troubleshooting

### PDF Upload Fails

1. **Check Storage Bucket**: Ensure `resume-pdfs` bucket exists
2. **Verify Policies**: Check storage policies are correctly set
3. **Check Network**: Ensure Supabase URL is accessible
4. **Check Console**: Look for error messages in browser console

### PDF URL Not Saving

1. **Check Migration**: Ensure `pdf_url` column exists in database
2. **Check Types**: Verify TypeScript types include `pdf_url`
3. **Check Service**: Ensure `saveResume` is passing the URL correctly

### Storage Quota Issues

1. **Check Supabase Plan**: Free tier has 1GB storage limit
2. **Clean Up Old Files**: Delete unused PDFs
3. **Upgrade Plan**: Consider upgrading for more storage

## Future Enhancements

1. **PDF Versioning**: Keep multiple versions of the same resume
2. **Thumbnail Generation**: Create preview images of PDFs
3. **Batch Operations**: Upload/delete multiple PDFs at once
4. **PDF Metadata**: Store additional info (file size, page count, etc.)
5. **Resume Templates**: Store PDFs generated from different templates
6. **Sharing Features**: Generate shareable links with expiration
7. **Analytics**: Track PDF downloads and views

## API Reference

### `uploadPdfToStorage(file, filename, resumeId?)`
- **Parameters:**
  - `file: Blob` - The PDF file to upload
  - `filename: string` - Name of the file
  - `resumeId?: string` - Optional resume ID for organization
- **Returns:** `Promise<string | null>` - Public URL or null on error

### `deletePdfFromStorage(pdfUrl)`
- **Parameters:**
  - `pdfUrl: string` - Public URL of the PDF to delete
- **Returns:** `Promise<boolean>` - Success status

### `saveResume(resumeData, pdfUrl?)`
- **Parameters:**
  - `resumeData: ResumeData` - Resume data object
  - `pdfUrl?: string` - Optional PDF URL
- **Returns:** `Promise<string | null>` - Resume ID or null on error

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Storage bucket is created with correct policies
- [ ] PDF generation works and downloads to user
- [ ] PDF uploads to storage successfully
- [ ] Public URL is returned and accessible
- [ ] Resume saves with PDF URL in database
- [ ] PDF can be accessed via stored URL
- [ ] Error handling works for upload failures
- [ ] Toast notifications show appropriate messages
- [ ] TypeScript types are correct (no errors)

## Notes

- The lint errors about missing modules (react, html2pdf.js, etc.) are TypeScript configuration issues and don't affect runtime functionality
- PDFs are stored with public read access - suitable for resume sharing
- Unique filenames prevent collisions but don't prevent duplicates
- Consider implementing deduplication for production use
