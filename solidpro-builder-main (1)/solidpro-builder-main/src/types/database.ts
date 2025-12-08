/**
 * Database Types (snake_case) - Maps 1:1 with Supabase schema
 * These types represent exactly what's stored in the database
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// JSONB stored types (camelCase inside JSONB for frontend consistency)
export interface DbWorkExperience {
  id: string;
  companyName: string;
  jobTitle: string;
  startYear: string;
  endYear: string;
  responsibilities: string[];
}

export interface DbProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
}

export interface DbEducation {
  degree: string;
  institution: string;
  graduationYear: string;
}

export interface DbCertification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  link?: string;
}

// Database row type (snake_case column names)
export interface DbResumeRow {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  linkedin: string | null;
  location: string | null;
  summary: string | null;
  skills: string[] | null;
  work_experience: DbWorkExperience[] | null;
  projects: DbProject[] | null;
  education: DbEducation | null;
  certifications: DbCertification[] | null;
}

// Insert payload type (what we send to Supabase)
export interface DbResumeInsert {
  full_name: string;
  email: string;
  phone?: string | null;
  linkedin?: string | null;
  location?: string | null;
  summary?: string | null;
  skills?: string[] | null;
  work_experience?: Json | null;  // Changed from DbWorkExperience[]
  projects?: Json | null;         // Changed from DbProject[]
  education?: Json | null;        // Changed from DbEducation
  certifications?: Json | null;   // Array of DbCertification
  created_at?: string;
  updated_at?: string;
}

// Update payload type
export interface DbResumeUpdate {
  full_name?: string;
  email?: string;
  phone?: string | null;
  linkedin?: string | null;
  location?: string | null;
  summary?: string | null;
  skills?: string[] | null;
  work_experience?: DbWorkExperience[] | null;
  projects?: DbProject[] | null;
  education?: DbEducation | null;
  certifications?: DbCertification[] | null;
}
