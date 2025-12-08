import { supabase } from './supabaseClient';
import { ResumeData } from '../types';

/**
 * Saves resume JSON data to Supabase Database
 * Assumes a table 'resumes' exists with columns: id, data (jsonb), title, last_updated
 */
export const saveResumeToCloud = async (data: ResumeData): Promise<void> => {
  if (!supabase) throw new Error("Supabase not configured");

  const { error } = await supabase
    .from('resumes')
    .upsert({
      id: data.id,
      title: data.title,
      data: data,
      last_updated: new Date(data.lastUpdated).toISOString(),
    }, { onConflict: 'id' });

  if (error) {
    console.error("Supabase DB Error:", error);
    throw error;
  }
};

/**
 * Uploads a PDF Blob to Supabase Storage
 * Assumes a bucket 'resume-pdfs' exists
 */
export const uploadResumePdf = async (id: string, pdfBlob: Blob): Promise<string> => {
  if (!supabase) throw new Error("Supabase not configured");

  const fileName = `${id}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from('resume-pdfs')
    .upload(fileName, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (uploadError) {
    console.error("Supabase Storage Error:", uploadError);
    throw uploadError;
  }

  // Get Public URL
  const { data } = supabase.storage
    .from('resume-pdfs')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

/**
 * Updates the Resume record with the PDF URL
 */
export const updateResumePdfUrl = async (id: string, url: string): Promise<void> => {
    if (!supabase) return;
    
    const { error } = await supabase
        .from('resumes')
        .update({ pdf_url: url })
        .eq('id', id);

    if (error) throw error;
};

/**
 * Fetches all resumes from the cloud database
 */
export const fetchCloudResumes = async (): Promise<ResumeData[]> => {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .order('last_updated', { ascending: false });

  if (error) {
    console.error("Error fetching cloud resumes:", error);
    return [];
  }
  
  return data.map((row: any) => {
      // The JSONB column 'data' holds the ResumeData structure
      const resume = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      
      // Ensure specific fields from the table columns (like pdf_url) override or augment the JSON blob if needed
      return {
          ...resume,
          id: row.id, // Ensure ID matches DB record
          pdfUrl: row.pdf_url || resume.pdfUrl 
      };
  });
};