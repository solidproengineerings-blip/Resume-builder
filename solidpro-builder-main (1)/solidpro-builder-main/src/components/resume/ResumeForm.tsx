import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import PersonalInfoForm from "./PersonalInfoForm";
import { SummaryForm } from "./SummaryForm";
import { SkillsForm } from "./SkillsForm";
import { WorkExperienceForm } from "./WorkExperienceForm";
import { ProjectsForm } from "./ProjectsForm";
import { EducationForm } from "./EducationForm";
import { CertificationsForm } from "./CertificationsForm";
import { ResumePreview } from "./ResumePreview";
import { StepIndicator } from "./StepIndicator";
import { ResumeData, initialResumeData } from "@/types/resume";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Briefcase, Download, Eye, EyeOff, FileText, FolderCode, GraduationCap, Loader2, Save, User, Wrench, Award } from "lucide-react";
import { generateResumePdf } from "@/lib/pdfUtils";
import { saveResume } from "@/integrations/supabase/resumeService";
import { uploadPdfToStorage } from "@/integrations/supabase/storageService";

const steps = [
  { id: 1, title: "Personal", icon: <User className="w-4 h-4 sm:w-5 sm:h-5" /> },
  { id: 2, title: "Summary", icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> },
  { id: 3, title: "Skills", icon: <Wrench className="w-4 h-4 sm:w-5 sm:h-5" /> },
  { id: 4, title: "Experience", icon: <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" /> },
  { id: 5, title: "Projects", icon: <FolderCode className="w-4 h-4 sm:w-5 sm:h-5" /> },
  { id: 6, title: "Education", icon: <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" /> },
  { id: 7, title: "Certifications", icon: <Award className="w-4 h-4 sm:w-5 sm:h-5" /> },
];

export function ResumeForm() {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastGeneratedPdfUrl, setLastGeneratedPdfUrl] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleSaveResume = async () => {
    setIsSaving(true);
    try {
      const resumeId = await saveResume(resumeData, lastGeneratedPdfUrl || undefined);
      if (resumeId) {
        toast.success('Resume saved successfully to database');
      } else {
        toast.error('Failed to save resume to database');
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      setShowValidationErrors(false);
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      setShowValidationErrors(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateForm = (): boolean => {
    const { personalInfo, summary, skills, education } = resumeData;

    if (currentStep === 0) {
      if (!personalInfo.fullName.trim()) {
        toast.error("Please enter your full name");
        return false;
      }
      if (!personalInfo.email.trim()) {
        toast.error("Please enter your email");
        return false;
      }
      if (!personalInfo.phone.trim()) {
        toast.error("Please enter your phone number");
        return false;
      }
    }

    if (currentStep === 1) {
      if (!summary.trim()) {
        toast.error("Please add a professional summary");
        return false;
      }
    }

    if (currentStep === 2) {
      if (skills.length === 0) {
        toast.error("Please add at least one skill");
        return false;
      }
    }

    if (currentStep === 5) {
      if (!education.degree.trim()) {
        toast.error("Please add your education details");
        return false;
      }
    }

    return true;
  };

  const validateFullForm = (): boolean => {
    const { personalInfo, summary, skills, education } = resumeData;

    if (!personalInfo.fullName.trim() || !personalInfo.email.trim() || !personalInfo.phone.trim()) {
      toast.error("Please complete the Personal Information section.");
      return false;
    }
    if (!summary.trim()) {
      toast.error("Please add a Professional Summary.");
      return false;
    }
    if (skills.length === 0) {
      toast.error("Please add at least one Skill.");
      return false;
    }
    if (!education.degree.trim()) {
      toast.error("Please add your Education details.");
      return false;
    }

    return true;
  };

  const generatePdf = async () => {
    if (!validateFullForm()) {
      return;
    }

    if (!previewRef.current) {
      toast.error("Preview is not ready.");
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading("Generating PDF...");

    try {
      const element = previewRef.current;
      const filename = `${resumeData.personalInfo.fullName || 'Resume'}_Resume.pdf`;

      // Generate the PDF and get the blob
      const { blob, filename: pdfFilename } = await generateResumePdf({
        element,
        filename,
      });

      // Upload to Supabase Storage
      toast.loading("Uploading PDF to storage...", { id: loadingToast });
      const pdfUrl = await uploadPdfToStorage(blob, pdfFilename);

      if (pdfUrl) {
        setLastGeneratedPdfUrl(pdfUrl);
        toast.success("PDF generated and uploaded successfully!", { id: loadingToast });
        console.log('PDF stored at:', pdfUrl);
      } else {
        toast.warning("PDF generated but upload failed. You can still download it.", { id: loadingToast });
      }

    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF.", { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalInfoForm
            data={resumeData.personalInfo}
            onChange={(data) =>
              setResumeData({ ...resumeData, personalInfo: data })
            }
            showErrors={showValidationErrors}
          />
        );
      case 1:
        return (
          <SummaryForm
            value={resumeData.summary}
            onChange={(summary) => setResumeData({ ...resumeData, summary })}
          />
        );
      case 2:
        return (
          <SkillsForm
            skills={resumeData.skills}
            onChange={(skills) => setResumeData({ ...resumeData, skills })}
          />
        );
      case 3:
        return (
          <WorkExperienceForm
            experiences={resumeData.workExperience}
            onChange={(workExperience) =>
              setResumeData({ ...resumeData, workExperience })
            }
          />
        );
      case 4:
        return (
          <ProjectsForm
            projects={resumeData.projects}
            onChange={(projects) => setResumeData({ ...resumeData, projects })}
          />
        );
      case 5:
        return (
          <EducationForm
            data={resumeData.education}
            onChange={(education) => setResumeData({ ...resumeData, education })}
          />
        );
      case 6:
        return (
          <CertificationsForm
            certifications={resumeData.certifications}
            onChange={(certifications) => setResumeData({ ...resumeData, certifications })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-solidpro-red to-solidpro-blue bg-clip-text text-transparent">
              SolidPro Resume Builder
            </h1>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="hidden lg:flex"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Show Preview
                  </>
                )}
              </Button>
              <Button
                variant="gradient"
                size="lg"
                onClick={generatePdf}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />

        <div className={`grid gap-8 ${showPreview ? "lg:grid-cols-2" : "lg:grid-cols-1 max-w-2xl mx-auto"}`}>
          {/* Form Section */}
          <div className="bg-card rounded-2xl shadow-card p-6 lg:p-8">
            {renderCurrentStep()}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-border">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentStep === steps.length - 1}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-4">
                {currentStep === steps.length - 1 && (
                  <Button
                    variant="outline"
                    onClick={handleSaveResume}
                    disabled={isSaving || isLoading}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Resume
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="hidden lg:block sticky top-24">
              <div className="bg-muted rounded-2xl p-4 h-fit overflow-hidden">
                <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">
                  Live Preview
                </h3>
                <div className="flex justify-center">
                  <div className="transform scale-[0.55] origin-top" style={{ width: "595px", height: "auto" }}>
                    <ResumePreview data={resumeData} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden full-size preview for PDF generation - always rendered */}
        <div className="fixed -left-[9999px] top-0" style={{ width: "595px" }}>
          <ResumePreview ref={previewRef} data={resumeData} />
        </div>
      </main>
    </div>
  );
}
