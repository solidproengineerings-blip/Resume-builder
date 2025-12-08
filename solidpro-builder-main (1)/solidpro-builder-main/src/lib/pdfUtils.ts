import html2pdf from "html2pdf.js";

// Type for html2pdf options with onclone callback
interface Html2PdfOptions {
  margin?: [number, number, number, number];
  filename?: string;
  image?: { type: string; quality: number };
  html2canvas?: {
    scale?: number;
    useCORS?: boolean;
    logging?: boolean;
    letterRendering?: boolean;
    allowTaint?: boolean;
  };
  jsPDF?: { unit: string; format: string; orientation: string };
  pagebreak?: {
    mode?: string[];
    before?: string;
    after?: string;
  };
  onclone?: (document: Document) => void;
}

export interface PdfGeneratorOptions {
  element: HTMLElement;
  filename: string;
  watermarkUrl?: string;
  logoUrl?: string;
}

// Image data interface
interface ImageData {
  dataUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
}

// Convert image URL to base64 with optional opacity
const loadImageAsBase64 = async (url: string, opacity: number = 1.0): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.globalAlpha = opacity;
        ctx.drawImage(img, 0, 0);
        resolve({
          dataUrl: canvas.toDataURL("image/png"),
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height
        });
      } else {
        reject(new Error("Failed to get canvas context"));
      }
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

// ... (keep the existing imports and interfaces at the top of the file)

export interface PdfGenerationResult {
  blob: Blob;
  filename: string;
}

export const generateResumePdf = async (options: PdfGeneratorOptions): Promise<PdfGenerationResult> => {
  const { element, filename } = options;

  // Header SVG Base64 (Updated to match user request)
  // ViewBox: 0 0 227 183
  const headerSvgBase64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjI3IiBoZWlnaHQ9IjE4MyIgdmlld0JveD0iMCAwIDIyNyAxODMiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHBhdGggZD0iTTE2Ny40NTkgMEgwVjE0MS4zNDdDNi4yMzg5IDQxLjIyNjMgMTE0LjE2OCA0LjY3NTE2IDE2Ny40NTkgMFoiIGZpbGw9IiMxNjQ2OUQiIC8+CiAgPHBhdGggZD0iTTIyNyAwQzU4LjgxMzYgNy44MTQ3NSA2LjQ0ODg2IDEyNC4wOTUgMCAxODEuMjU5VjE1Ny4zOFYxMzIuNDE3QzE4LjA1NjggMzMuNjQ2OSAxMTMuNSAzLjI1NjE1IDE1OS45MzIgMEgyMjdaIiBmaWxsPSIjRUQxQjJGIiAvPgo8L3N2Zz4=";

  // Load watermark and header images
  const watermarkUrl = "/solidpro.svg";
  let watermarkImage: ImageData | null = null;
  let headerImage: ImageData | null = null;

  try {
    const results = await Promise.all([
      loadImageAsBase64(watermarkUrl, 0.05).catch(e => {
        console.warn("Could not load watermark image:", e);
        return null;
      }),
      loadImageAsBase64(headerSvgBase64).catch(e => {
        console.warn("Could not load header image:", e);
        return null;
      })
    ]);
    watermarkImage = results[0];
    headerImage = results[1];
  } catch (e) {
    console.warn("Error loading images:", e);
  }

  // Create a clone of the element
  const elementClone = element.cloneNode(true) as HTMLElement;
  document.body.appendChild(elementClone);

  // Pre-process the clone to remove elements we'll inject manually
  // This ensures html2pdf doesn't render them, preventing duplicates
  const watermarks = elementClone.querySelectorAll('.watermark-container');
  watermarks.forEach(el => el.remove());

  const headers = elementClone.querySelectorAll('.svg-header-container');
  headers.forEach(el => el.remove());

  try {
    const pdfOptions: Omit<Html2PdfOptions, 'onclone'> = {
      margin: [5, 10, 10, 10], // Increased top margin to clear the 120px header on all pages
      filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: true,
        letterRendering: true,
        allowTaint: true
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after'
      }
    };

    const htmlOptions: Html2PdfOptions = {
      ...pdfOptions,
      onclone: (document: Document) => {
        // Ensure proper z-index for content
        const content = document.querySelector('.resume-document');
        if (content) {
          (content as HTMLElement).style.zIndex = '2';
          (content as HTMLElement).style.position = 'relative';
        }
      }
    };

    // Use .toPdf() to get access to the jsPDF instance
    const worker = html2pdf().set(htmlOptions as any).from(elementClone).toPdf();

    const pdfBlob = await worker.get('pdf').then((pdf: any) => {
      const totalPages = pdf.internal.getNumberOfPages();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        // 1. Add Header (Top of page)
        if (headerImage) {
          try {

            const headerHeight = (120 / 595) * pageWidth;
            const headerWidth = headerHeight * headerImage.aspectRatio;

            pdf.addImage(headerImage.dataUrl, 'PNG', 0, 0, headerWidth, headerHeight);
          } catch (err) {
            console.error("Failed to add header to PDF page " + i, err);
          }
        }

        // 2. Add Watermark (Centered full page)
        if (watermarkImage) {
          try {
            // CSS Requirement: width: 60%, top: 50%, left: 50%, transform: translate(-50%, -50%)
            const wmDisplayWidth = pageWidth * 0.6;
            const wmDisplayHeight = wmDisplayWidth / watermarkImage.aspectRatio;

            const x = (pageWidth - wmDisplayWidth) / 2;
            const y = (pageHeight - wmDisplayHeight) / 2;

            pdf.addImage(watermarkImage.dataUrl, 'PNG', x, y, wmDisplayWidth, wmDisplayHeight);
          } catch (err) {
            console.error("Failed to add watermark to PDF page " + i, err);
          }
        }
      }

      // Return the PDF as a blob instead of saving
      return pdf.output('blob');
    });

    // Also trigger download for user
    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdfBlob);
    link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    link.click();
    URL.revokeObjectURL(link.href);

    // Clean up
    if (elementClone.parentNode) {
      elementClone.parentNode.removeChild(elementClone);
    }

    return {
      blob: pdfBlob,
      filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`
    };

  } catch (error) {
    console.error("Error generating PDF:", error);
    // Clean up on error
    if (elementClone.parentNode) {
      elementClone.parentNode.removeChild(elementClone);
    }
    throw error;
  }
};

// ... (keep the rest of the file as is)
// Simple PDF generation without extra features (fallback)
export const generateSimplePdf = async (
  element: HTMLElement,
  filename: string
): Promise<void> => {
  const pdfOptions = {
    margin: [5, 10, 10, 10] as [number, number, number, number],
    filename,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
    },
    jsPDF: {
      unit: "mm" as const,
      format: "a4" as const,
      orientation: "portrait" as const,
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] as const },
  };

  await html2pdf().set(pdfOptions).from(element).save();
};
