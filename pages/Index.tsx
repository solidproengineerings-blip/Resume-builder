import { useState, useEffect } from 'react';
import { HomeView } from '@/components/HomeView';
import { EditorView } from '@/components/EditorView';
import { CandidateFormView } from '@/components/CandidateFormView';
import { ResumeData } from '@/types';
import {
  getResumes,
  saveResume,
  deleteResume,
  createNewResume,
  getResume,
  duplicateResume
} from '@/services/storageService';

const Index = () => {
  const [view, setView] = useState<'home' | 'editor' | 'candidate-form'>('home');
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [resumes, setResumes] = useState<ResumeData[]>([]);

  // Load resumes and check URL params on mount
  useEffect(() => {
    refreshResumes();

    // Check for shared form mode
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'form') {
      setView('candidate-form');
    }
  }, []);

  const refreshResumes = () => {
    setResumes(getResumes());
  };

  const handleCreate = () => {
    const newResume = createNewResume();
    saveResume(newResume);
    refreshResumes();
    setActiveResumeId(newResume.id);
    setView('editor');
  };

  const handleEdit = (id: string) => {
    setActiveResumeId(id);
    setView('editor');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this resume?')) {
      deleteResume(id);
      refreshResumes();
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateResume(id);
    refreshResumes();
  };

  const handleSave = (data: ResumeData) => {
    saveResume(data);
    refreshResumes(); // Keep list updated in background
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        handleDataImport(json);
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handleDataImport = (data: Partial<ResumeData>) => {
    // Basic validation check
    if (data.personalInfo) {
      const importedResume = {
        ...createNewResume(),
        ...data,
        id: data.id || crypto.randomUUID(),
        title: data.title || "Imported Resume",
        lastUpdated: Date.now()
      } as ResumeData;

      saveResume(importedResume);
      refreshResumes();
    } else {
      alert("Invalid resume data format.");
    }
  };

  const handleBack = () => {
    setView('home');
    setActiveResumeId(null);
    document.title = 'ResumeAI Builder';
    // Clear URL params if we were in form mode
    window.history.pushState({}, '', window.location.pathname);
  };

  // Candidate Intake Form View
  if (view === 'candidate-form') {
    return <CandidateFormView />;
  }

  // Editor View
  if (view === 'editor' && activeResumeId) {
    const activeData = getResume(activeResumeId);
    if (activeData) {
      return (
        <EditorView
          initialData={activeData}
          onSave={handleSave}
          onBack={handleBack}
        />
      );
    }
  }

  // Home View (Dashboard)
  return (
    <HomeView
      resumes={resumes}
      onCreate={handleCreate}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onImport={handleImport}
      onDataImport={handleDataImport}
    />
  );
};

export default Index;
