/*
  # Initial Database Schema for Job Application Portal

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `full_name` (text, nullable)
      - `phone` (text, nullable)
      - `resume_url` (text, nullable)
      - `skills` (text array, nullable)
      - `experience_years` (integer, nullable)
      - `is_admin` (boolean, default false)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

    - `applications`
      - `id` (uuid, primary key)
      - `job_id` (text) - Adzuna job ID
      - `applicant_id` (uuid, foreign key to profiles)
      - `job_title` (text)
      - `company` (text)
      - `location` (text)
      - `job_type` (text)
      - `salary_range` (text)
      - `job_url` (text) - Adzuna redirect URL
      - `cover_letter` (text, nullable)
      - `status` (text, default 'pending')
      - `applied_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Indexes
    - Index on profiles.email for fast lookups
    - Index on applications.applicant_id for user application queries
    - Index on applications.job_id for checking if user applied
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  resume_url TEXT,
  skills TEXT[],
  experience_years INTEGER,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table (simplified for Adzuna integration)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY,
  job_id TEXT NOT NULL,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL,
  salary_range TEXT,
  job_url TEXT NOT NULL,
  cover_letter TEXT,
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, applicant_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
