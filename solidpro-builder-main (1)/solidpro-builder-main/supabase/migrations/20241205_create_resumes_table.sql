-- Create resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
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
    certifications JSONB
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_resumes_email ON public.resumes(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON public.resumes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on resumes" 
    ON public.resumes 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.resumes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.resumes IS 'Stores resume data for the SolidPro Resume Builder';
COMMENT ON COLUMN public.resumes.full_name IS 'Full name of the resume owner';
COMMENT ON COLUMN public.resumes.email IS 'Email address of the resume owner';
COMMENT ON COLUMN public.resumes.skills IS 'Array of skill strings';
COMMENT ON COLUMN public.resumes.work_experience IS 'JSONB array of work experience objects';
COMMENT ON COLUMN public.resumes.projects IS 'JSONB array of project objects';
COMMENT ON COLUMN public.resumes.education IS 'JSONB object containing education details';
COMMENT ON COLUMN public.resumes.certifications IS 'JSONB array of certification objects';
