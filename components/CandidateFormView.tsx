import React, { useState } from 'react';
import { ResumeData } from '../types';
import { ResumeForm } from './ResumeForm';
import { createNewResume } from '../services/storageService';
import { saveResumeToCloud } from '../services/cloudService';
import { supabase } from '../services/supabaseClient';
import { Download, CheckCircle, Send, CloudUpload, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

interface CandidateFormViewProps {
  onBack?: () => void; // Optional if we want to allow going back to dashboard
}

export const CandidateFormView: React.FC<CandidateFormViewProps> = ({ onBack }) => {
  const [data, setData] = useState<ResumeData>(createNewResume());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  const handleSubmit = async () => {
    if (!data.personalInfo.fullName) {
        alert("Please enter your full name.");
        return;
    }

    if (!supabase) {
        setSubmitError("Cloud service is not connected. Please download the file.");
        return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
        const submissionData: ResumeData = {
            ...data,
            title: `${data.personalInfo.fullName} - Candidate Profile`, // standard naming for submissions
            lastUpdated: Date.now()
        };

        await saveResumeToCloud(submissionData);
        setSubmitSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error(err);
        setSubmitError("Failed to submit profile. Please check your connection or download the file as a backup.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDownload = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${data.personalInfo.fullName || 'candidate'}_profile.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloaded(true);
  };

  if (submitSuccess) {
      return (
        <div className="h-screen overflow-y-auto custom-scrollbar bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-900">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg w-full text-center border border-gray-100">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile Submitted!</h2>
                <p className="text-gray-600 mb-8 text-lg">
                    Thank you, {data.personalInfo.fullName}. Your information has been securely sent to the recruiter.
                </p>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleDownload}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 hover:bg-gray-50 rounded-lg text-gray-700 font-medium transition-colors"
                    >
                        <Download size={20} /> Download Copy for your records
                    </button>
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 text-gray-400 hover:text-gray-600 text-sm"
                    >
                        <RefreshCw size={14} /> Submit another response
                    </button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="h-screen overflow-y-auto custom-scrollbar bg-gray-50 font-sans text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
             <div className="p-3 bg-blue-600 rounded-lg text-white shadow-lg">
               <Send size={32} />
             </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Resume Information Request</h1>
          <p className="mt-2 text-lg text-gray-600">
            Please fill out your professional details below. When finished, click the submit button to send your profile directly to us.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
          <div className="p-6 md:p-8 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
             <div>
                <h2 className="text-xl font-semibold text-gray-800">Candidate Profile</h2>
                <p className="text-sm text-gray-500">Auto-saved locally.</p>
             </div>
             {!supabase && (
                 <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg text-xs font-medium border border-amber-200">
                     <AlertTriangle size={14} /> Database Disconnected
                 </div>
             )}
          </div>
          
          <div className="p-6 md:p-8">
            <ResumeForm data={data} onChange={setData} />
          </div>

          {/* Footer / Action Area */}
          <div className="bg-gray-50 px-6 py-6 md:px-8 border-t border-gray-200">
            {submitError && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2 text-sm">
                    <AlertTriangle size={16} />
                    {submitError}
                </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500 order-2 sm:order-1">
                    {downloaded && (
                        <span className="flex items-center gap-2 text-green-600 font-medium">
                        <CheckCircle size={16} /> Downloaded
                        </span>
                    )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto order-1 sm:order-2">
                    {/* Secondary Action: Download */}
                    <button
                        onClick={handleDownload}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 px-6 py-3 rounded-lg transition-all font-medium"
                    >
                        <Download size={20} />
                        Download JSON
                    </button>

                    {/* Primary Action: Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !supabase}
                        className={`w-full sm:w-auto flex items-center justify-center gap-2 text-white px-8 py-3 rounded-lg transition-all shadow-lg font-bold
                            ${isSubmitting || !supabase 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'
                            }`}
                    >
                        {isSubmitting ? (
                            <><Loader2 size={20} className="animate-spin" /> Submitting...</>
                        ) : (
                            <><CloudUpload size={20} /> Submit Profile</>
                        )}
                    </button>
                </div>
            </div>
            {!supabase && (
                 <p className="text-xs text-center sm:text-right mt-2 text-gray-400">
                     * Submit unavailable. Please download the file and email it.
                 </p>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Powered by ResumeAI Builder</p>
        </div>

      </div>
    </div>
  );
};