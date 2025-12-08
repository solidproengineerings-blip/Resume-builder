import { generateResumePdf, generateSimplePdf, type PdfGeneratorOptions, type PdfGenerationResult } from '@/lib/pdfUtils';

/**
 * Generate a professional PDF from a resume element
 * Includes headers and watermarks with proper pagination
 */
export const generatePdfBlob = async (element: HTMLElement, filename: string = 'resume.pdf'): Promise<Blob> => {
  try {
    const result: PdfGenerationResult = await generateResumePdf({
      element,
      filename
    });
    return result.blob;
  } catch (error) {
    console.error("Error generating PDF blob:", error);
    throw error;
  }
};

/**
 * Generate and download a PDF resume with all features
 */
export const generateAndDownloadPdf = async (
  element: HTMLElement,
  filename: string = 'resume.pdf'
): Promise<void> => {
  try {
    await generateResumePdf({
      element,
      filename
    });
  } catch (error) {
    console.error("Error generating and downloading PDF:", error);
    throw error;
  }
};

/**
 * Simple PDF generation for fallback scenarios
 */
export const generateSimplePdfFile = async (
  element: HTMLElement,
  filename: string = 'resume.pdf'
): Promise<void> => {
  try {
    await generateSimplePdf(element, filename);
  } catch (error) {
    console.error("Error generating simple PDF:", error);
    throw error;
  }
};