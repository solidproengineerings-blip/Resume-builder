import type { ResumeData } from '@/types/resume';
import type { DbResumeRow } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { dbToResume, resumeToDb } from '@/lib/resumeMapper';
import type { Json } from './types';

/**
 * Get the most recent resume from Supabase
 * DB (snake_case) → Frontend (camelCase)
 */
export const getResume = async (): Promise<ResumeData | null> => {
  console.log('Fetching resume from database...');

  try {
    const { data, error, status } = await supabase
      .from('resumes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    console.log('Supabase response:', { status, error, hasData: !!data });

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        console.log('No resume found in the database');
        return null;
      }
      console.error('Error fetching resume:', error);
      return null;
    }

    if (!data) {
      console.log('No resume data found');
      return null;
    }

    console.log('Raw data from database:', data);

    // Supabase returns JSONB as parsed objects, not strings
    const dbRow = data as unknown as DbResumeRow;
    console.log('Fetched resume (DB format):', JSON.stringify(dbRow, null, 2));

    const resume = dbToResume(dbRow);
    console.log('Transformed resume (Frontend format):', JSON.stringify(resume, null, 2));

    return resume;
  } catch (error) {
    console.error('Unexpected error in getResume:', error);
    return null;
  }
};

/**
 * Save resume to Supabase
 * Frontend (camelCase) → DB (snake_case)
 */
// In resumeService.ts, update the saveResume function
// In resumeService.ts, update the saveResume function
export const saveResume = async (
  resumeData: ResumeData,
  pdfUrl?: string
): Promise<string | null> => {
  console.log('Saving resume (Frontend format):', JSON.stringify(resumeData, null, 2));
  if (pdfUrl) {
    console.log('PDF URL to save:', pdfUrl);
  }

  // Use the resumeToDb function to transform the data
  const dbPayload = resumeToDb(resumeData);

  // Add PDF URL if provided
  const payloadWithPdf = pdfUrl
    ? { ...dbPayload, pdf_url: pdfUrl }
    : dbPayload;

  console.log('Prepared payload (DB format):', JSON.stringify(payloadWithPdf, null, 2));

  try {
    const { data, error } = await supabase
      .from('resumes')
      .insert(payloadWithPdf)  // Remove the array brackets
      .select();

    if (error) {
      console.error('Error saving resume:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return null;
    }

    console.log('Successfully saved resume:', data);

    // Return the resume ID
    if (data && data.length > 0) {
      return data[0].id;
    }

    return null;
  } catch (error) {
    console.error('Unexpected error saving resume:', error);
    return null;
  }
};

// Subscribe to resume changes
/**
 * List all resumes in the database (for debugging purposes)
 */
export const listAllResumes = async () => {
  console.log('=== FETCHING ALL RESUMES FROM SUPABASE DATABASE ===');

  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching resumes:', error);
      return [];
    }

    console.log(`\n📊 TOTAL RESUMES FOUND: ${data.length}`);
    console.log('='.repeat(80));

    // Print summary table
    console.log('\n📋 RESUME SUMMARY TABLE:');
    console.table(data.map((resume, index) => ({
      '#': index + 1,
      'ID': resume.id.substring(0, 8) + '...',
      'Name': resume.full_name || '(empty)',
      'Email': resume.email || '(empty)',
      'Phone': resume.phone || '(empty)',
      'Created': new Date(resume.created_at).toLocaleString(),
      'Has Skills': resume.skills ? 'Yes' : 'No',
      'Has Experience': resume.work_experience ? 'Yes' : 'No',
      'Has Projects': resume.projects ? 'Yes' : 'No',
      'Has Education': resume.education ? 'Yes' : 'No',
    })));

    // Print detailed information for each resume
    console.log('\n📝 DETAILED RESUME DATA:');
    console.log('='.repeat(80));
    data.forEach((resume, index) => {
      console.log(`\n--- RESUME #${index + 1} ---`);
      console.log(`ID: ${resume.id}`);
      console.log(`Created: ${new Date(resume.created_at).toLocaleString()}`);
      console.log(`Updated: ${new Date(resume.updated_at).toLocaleString()}`);
      console.log(`\nPersonal Info:`);
      console.log(`  - Full Name: ${resume.full_name || '(empty)'}`);
      console.log(`  - Email: ${resume.email || '(empty)'}`);
      console.log(`  - Phone: ${resume.phone || '(empty)'}`);
      console.log(`  - LinkedIn: ${resume.linkedin || '(empty)'}`);
      console.log(`  - Location: ${resume.location || '(empty)'}`);
      console.log(`\nContent:`);
      console.log(`  - Summary: ${resume.summary ? resume.summary.substring(0, 100) + '...' : '(empty)'}`);
      console.log(`  - Skills: ${resume.skills ? resume.skills.length + ' skills' : 'None'}`);
      console.log(`  - Work Experience: ${resume.work_experience ? JSON.parse(JSON.stringify(resume.work_experience)).length + ' entries' : 'None'}`);
      console.log(`  - Projects: ${resume.projects ? JSON.parse(JSON.stringify(resume.projects)).length + ' entries' : 'None'}`);
      console.log(`  - Education: ${resume.education ? 'Yes' : 'No'}`);
      if (resume.education) {
        const edu = resume.education as any;
        console.log(`    Degree: ${edu.degree || '(empty)'}`);
        console.log(`    Institution: ${edu.institution || '(empty)'}`);
        console.log(`    Year: ${edu.graduationYear || '(empty)'}`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('📦 FULL JSON DATA (for debugging):');
    console.log(JSON.stringify(data, null, 2));
    console.log('='.repeat(80));

    return data;
  } catch (error) {
    console.error('❌ Unexpected error listing resumes:', error);
    return [];
  }
};

export const subscribeToResumeChanges = (
  callback: (resume: ResumeData | null) => void
) => {
  const subscription = supabase
    .channel('resume_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'resumes',
      },
      async () => {
        const resume = await getResume();
        callback(resume);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};
