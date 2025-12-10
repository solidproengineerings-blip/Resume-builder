export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string; // Bullet points separated by newlines
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  graduationYear: string;
  isopen: boolean; // For UI collapse/expand state
}

export interface ResumeData {
  id: string;
  title: string;
  lastUpdated: number; // Timestamp
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
    jobTitle: string; // Target job title
    summary: string;
  };
  experiences: Experience[];
  education: Education[];
  skills: string[]; // List of strings
  projects: {
    id: string;
    name: string;
    description: string;
    link: string;
  }[];
  pdfUrl?: string; // Optional URL to the stored PDF in cloud
}

export enum GeneratorType {
  SUMMARY = "SUMMARY",
  EXPERIENCE_BULLET = "EXPERIENCE_BULLET",
}
