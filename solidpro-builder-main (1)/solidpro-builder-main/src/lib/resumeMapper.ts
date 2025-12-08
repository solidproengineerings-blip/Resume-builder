/**
 * Resume Mapper - Transforms between Database (snake_case) and Frontend (camelCase)
 * 
 * Naming Convention:
 * - Database: snake_case for column names
 * - JSONB content: camelCase (stored as-is from frontend)
 * - Frontend/TypeScript: camelCase everywhere
 */

import type { ResumeData, WorkExperience, Project, Education, Certification } from '@/types/resume';
import type { DbResumeRow, DbResumeInsert, DbWorkExperience, DbProject, DbEducation, Json } from '@/types/database';

/**
 * Transform database row to frontend ResumeData
 */
export function dbToResume(row: DbResumeRow): ResumeData {
  return {
    personalInfo: {
      fullName: row.full_name,
      email: row.email,
      phone: row.phone ?? '',
      linkedin: row.linkedin ?? '',
      location: row.location ?? '',
    },
    summary: row.summary ?? '',
    skills: row.skills ?? [],
    workExperience: parseJsonbArray<WorkExperience>(row.work_experience),
    projects: parseJsonbArray<Project>(row.projects),
    education: parseJsonbObject<Education>(row.education, {
      degree: '',
      institution: '',
      graduationYear: '',
    }),
    certifications: parseJsonbArray<Certification>(row.certifications),
    selectedSvg: 'solidpro',
  };
}

/**
 * Transform frontend ResumeData to database insert payload
 */
// In resumeMapper.ts, update the resumeToDb function
export function resumeToDb(resume: ResumeData): DbResumeInsert {
  return {
    full_name: resume.personalInfo.fullName,
    email: resume.personalInfo.email,
    phone: resume.personalInfo.phone || null,
    linkedin: resume.personalInfo.linkedin || null,
    location: resume.personalInfo.location || null,
    summary: resume.summary || null,
    skills: resume.skills.length > 0 ? resume.skills : null,
    work_experience: resume.workExperience.length > 0
      ? resume.workExperience as unknown as Json
      : null,
    projects: resume.projects.length > 0
      ? resume.projects as unknown as Json
      : null,
    education: resume.education?.degree || resume.education?.institution
      ? resume.education as unknown as Json
      : null,
    certifications: resume.certifications?.length > 0
      ? resume.certifications as unknown as Json
      : null,
  };
}

/**
 * Safely parse JSONB array - handles both parsed objects and string JSON
 */
function parseJsonbArray<T>(value: unknown): T[] {
  if (!value) return [];
  
  // If it's already an array, return it
  if (Array.isArray(value)) {
    return value as T[];
  }
  
  // If it's a string (shouldn't happen with Supabase, but just in case)
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      console.warn('Failed to parse JSONB array string:', value);
      return [];
    }
  }
  
  return [];
}

/**
 * Safely parse JSONB object - handles both parsed objects and string JSON
 */
function parseJsonbObject<T>(value: unknown, defaultValue: T): T {
  if (!value) return defaultValue;
  
  // If it's already an object, return it
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as T;
  }
  
  // If it's a string (shouldn't happen with Supabase, but just in case)
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      console.warn('Failed to parse JSONB object string:', value);
      return defaultValue;
    }
  }
  
  return defaultValue;
}
