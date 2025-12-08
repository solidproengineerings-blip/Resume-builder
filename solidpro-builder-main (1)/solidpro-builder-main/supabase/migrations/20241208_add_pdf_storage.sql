-- Add pdf_url column to resumes table
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.resumes.pdf_url IS 'URL to the stored PDF file in Supabase Storage';

-- Create storage bucket for resume PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('resume-pdfs', 'resume-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the bucket
CREATE POLICY "Allow public read access to resume PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'resume-pdfs');

CREATE POLICY "Allow authenticated users to upload resume PDFs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resume-pdfs');

CREATE POLICY "Allow authenticated users to update resume PDFs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'resume-pdfs');

CREATE POLICY "Allow authenticated users to delete resume PDFs"
ON storage.objects FOR DELETE
USING (bucket_id = 'resume-pdfs');
