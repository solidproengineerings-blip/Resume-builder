import React, { useState, useEffect, useRef } from "react";
import { ResumeForm } from "./ResumeForm";
import { ResumePreview } from "./ResumePreview";
import { ResumeData } from "../types";
import {
  Printer,
  Sparkles,
  FileText,
  ArrowLeft,
  Save,
  CloudUpload,
  Loader2,
} from "lucide-react";
import { supabase } from "../services/supabaseClient";
import {
  saveResumeToCloud,
  uploadResumePdf,
  updateResumePdfUrl,
} from "../services/cloudService";
import { generateResumePdf } from "../lib/pdfUtils";

interface EditorViewProps {
  initialData: ResumeData;
  onSave: (data: ResumeData) => void;
  onBack: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
  initialData,
  onSave,
  onBack,
}) => {
  const [resumeData, setResumeData] = useState<ResumeData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [isCloudSaving, setIsCloudSaving] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Auto-save debouncer for LocalStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      onSave(resumeData);
      setIsSaving(false);
    }, 1000);

    setIsSaving(true);
    return () => clearTimeout(timer);
  }, [resumeData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrint = async () => {
    try {
      const wrapperElement = previewRef.current;
      if (!wrapperElement) {
        console.error("Preview wrapper element not found");
        return;
      }

      // Get the actual resume-document element
      const element = wrapperElement.querySelector(
        ".resume-document"
      ) as HTMLElement;
      if (!element) {
        console.error("Resume document element not found");
        return;
      }

      const filename = `${
        resumeData.personalInfo?.fullName || "Resume"
      }_Resume.pdf`;

      // Generate PDF using solidpro's advanced logic
      await generateResumePdf({
        element,
        filename,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeData((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleCloudSave = async () => {
    if (!supabase) {
      alert("Supabase credentials are missing. Check environment variables.");
      return;
    }

    setIsCloudSaving(true);

    try {
      // 1. Save Data
      await saveResumeToCloud(resumeData);

      // 2. Generate PDF Snapshot
      if (previewRef.current) {
        const elementToCapture = previewRef.current.querySelector(
          ".a4-paper"
        ) as HTMLElement;

        if (elementToCapture) {
          // Use your ADVANCED PDF generator, which already returns a Blob
          const pdfResult = await generateResumePdf({
            element: elementToCapture,
            filename: `${resumeData.title || "Resume"}.pdf`,
          });

          const blob = pdfResult.blob;

          // 3. Upload PDF file to supabase storage
          const publicUrl = await uploadResumePdf(resumeData.id, blob);

          // 4. Update table record
          await updateResumePdfUrl(resumeData.id, publicUrl);

          setResumeData((prev) => ({ ...prev, pdfUrl: publicUrl }));
        }
      }

      alert("Saved to Cloud & PDF Uploaded Successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save to cloud.");
    } finally {
      setIsCloudSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans text-gray-900 overflow-hidden">
      {/* Navbar */}
      <nav className="flex-none bg-white border-b-2 border-solidpro-blue px-4 py-3 z-50 no-print shadow-sm">
        <div className="max-w-full mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>

            {/* <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg text-white shadow-md">
               <Sparkles size={20} />
             </div> */}

            <div className="flex flex-col">
              <h3 className="font-medium">Resume</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {supabase && (
              <button
                onClick={handleCloudSave}
                disabled={isCloudSaving}
                className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-2 rounded-lg transition-all text-sm font-medium"
                title="Save Data & Upload PDF Snapshot to Supabase"
              >
                {isCloudSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CloudUpload size={16} />
                )}
                <span className="hidden sm:inline">
                  {isCloudSaving ? "Uploading..." : "Save to Cloud"}
                </span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gradient-to-r from-solidpro-red to-solidpro-blue text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl hover:opacity-90 font-medium text-sm"
              title="Download Resume as PDF"
            >
              <Printer size={18} />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content - Split Screen */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Panel: Editor Sidebar (Scrollable) */}
        <div className="w-full lg:w-1/2 h-full overflow-y-auto custom-scrollbar bg-white border-r border-gray-200 no-print flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
          <div className="p-6 md:p-8 pb-32">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Resume Details
              </h2>
              <p className="text-gray-500 text-sm">
                Fill in the sections below.
              </p>
            </div>
            <ResumeForm data={resumeData} onChange={setResumeData} />
          </div>
        </div>

        {/* Right Panel: Preview Area (Scrollable Background) */}
        <div className="w-full lg:w-1/2 h-full overflow-y-auto custom-scrollbar bg-gray-100/80 p-4 md:p-8 flex justify-center items-start print:p-0 print:bg-white print:overflow-visible print:block print:w-full print:h-auto">
          {/* Resume Container with Scale for viewing */}
          <div
            className="relative print:static print:w-full mt-4 lg:mt-8 mb-20 print:mt-0 print:mb-0"
            ref={previewRef}
          >
            <div className="bg-white shadow-2xl print:shadow-none transform origin-top scale-[0.5] sm:scale-[0.6] md:scale-[0.7] lg:scale-[0.6] xl:scale-[0.75] 2xl:scale-[0.85] print:scale-100 print:transform-none print:m-0 print:p-0 transition-transform duration-200">
              <ResumePreview data={resumeData} />
            </div>
          </div>

          <style>{`
            @media print {
              body {
                margin: 0;
                padding: 0;
                background: white;
              }
              * {
                margin: 0;
                padding: 0;
              }
              html, body {
                width: 100%;
                height: 100%;
              }
            }
          `}</style>
        </div>
      </main>
    </div>
  );
};
