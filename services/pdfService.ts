import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const generatePdfBlob = async (element: HTMLElement): Promise<Blob> => {
  try {
    // Capture the element as a canvas
    // We use a scale of 2 for better quality (simulating retina display capture)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // A4 dimensions in mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // A4 width
    const pageHeight = 297; // A4 height
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add image to PDF. If content is longer than one page, simple scaling is used here.
    // For a strict single page resume:
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    
    return pdf.output('blob');
  } catch (error) {
    console.error("Error generating PDF blob:", error);
    throw error;
  }
};