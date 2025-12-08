import { ResumeData } from '../types';

const STORAGE_KEY = 'resume_ai_data_v1';

export const getResumes = (): ResumeData[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load resumes", e);
    return [];
  }
};

export const getResume = (id: string): ResumeData | undefined => {
  const resumes = getResumes();
  return resumes.find((r) => r.id === id);
};

export const saveResume = (resume: ResumeData): void => {
  const resumes = getResumes();
  const index = resumes.findIndex((r) => r.id === resume.id);
  
  const updatedResume = { ...resume, lastUpdated: Date.now() };

  if (index >= 0) {
    resumes[index] = updatedResume;
  } else {
    resumes.push(updatedResume);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
};

export const deleteResume = (id: string): void => {
  const resumes = getResumes().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
};

export const createNewResume = (): ResumeData => {
  return {
    id: crypto.randomUUID(),
    title: 'Untitled Resume',
    lastUpdated: Date.now(),
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
      jobTitle: '',
      summary: '',
    },
    experiences: [],
    education: [],
    skills: [],
    projects: []
  };
};

export const duplicateResume = (id: string): ResumeData | null => {
  const resume = getResume(id);
  if (!resume) return null;
  
  const newResume = {
    ...resume,
    id: crypto.randomUUID(),
    title: `${resume.title} (Copy)`,
    lastUpdated: Date.now()
  };
  
  saveResume(newResume);
  return newResume;
};