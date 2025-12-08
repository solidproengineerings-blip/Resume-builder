import { supabase } from './client';

/**
 * Upload a PDF file to Supabase Storage
 * @param file - The PDF file blob to upload
 * @param filename - The name of the file
 * @param resumeId - Optional resume ID to associate with the file
 * @returns The public URL of the uploaded file or null on error
 */
export const uploadPdfToStorage = async (
    file: Blob,
    filename: string,
    resumeId?: string
): Promise<string | null> => {
    try {
        // Create a unique filename to avoid collisions
        const timestamp = new Date().getTime();
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueFilename = resumeId
            ? `${resumeId}/${timestamp}_${sanitizedFilename}`
            : `${timestamp}_${sanitizedFilename}`;

        console.log('Uploading PDF to storage:', uniqueFilename);

        // Upload the file to the resume-pdfs bucket
        const { data, error } = await supabase.storage
            .from('resume-pdfs')
            .upload(uniqueFilename, file, {
                contentType: 'application/pdf',
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error uploading PDF to storage:', error);
            return null;
        }

        console.log('PDF uploaded successfully:', data);

        // Get the public URL for the uploaded file
        const { data: urlData } = supabase.storage
            .from('resume-pdfs')
            .getPublicUrl(uniqueFilename);

        console.log('PDF public URL:', urlData.publicUrl);
        return urlData.publicUrl;

    } catch (error) {
        console.error('Unexpected error uploading PDF:', error);
        return null;
    }
};

/**
 * Delete a PDF file from Supabase Storage
 * @param pdfUrl - The public URL of the PDF to delete
 * @returns true if successful, false otherwise
 */
export const deletePdfFromStorage = async (pdfUrl: string): Promise<boolean> => {
    try {
        // Extract the file path from the URL
        const url = new URL(pdfUrl);
        const pathParts = url.pathname.split('/resume-pdfs/');
        if (pathParts.length < 2) {
            console.error('Invalid PDF URL format');
            return false;
        }
        const filePath = pathParts[1];

        console.log('Deleting PDF from storage:', filePath);

        const { error } = await supabase.storage
            .from('resume-pdfs')
            .remove([filePath]);

        if (error) {
            console.error('Error deleting PDF from storage:', error);
            return false;
        }

        console.log('PDF deleted successfully');
        return true;

    } catch (error) {
        console.error('Unexpected error deleting PDF:', error);
        return false;
    }
};

/**
 * List all PDFs for a specific resume
 * @param resumeId - The resume ID
 * @returns Array of file objects or empty array on error
 */
export const listResumePdfs = async (resumeId: string) => {
    try {
        const { data, error } = await supabase.storage
            .from('resume-pdfs')
            .list(resumeId);

        if (error) {
            console.error('Error listing PDFs:', error);
            return [];
        }

        return data;
    } catch (error) {
        console.error('Unexpected error listing PDFs:', error);
        return [];
    }
};
