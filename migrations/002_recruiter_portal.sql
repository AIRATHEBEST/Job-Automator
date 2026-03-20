/*
  # Phase 2: Recruiter Portal Schema

  1. New Tables
    - `recruiters`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key to profiles)
      - `company_name` (text)
      - `company_website` (text, nullable)
      - `company_description` (text, nullable)
      - `company_logo_url` (text, nullable)
      - `verified` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `job_postings`
      - `id` (uuid, primary key)
      - `recruiter_id` (uuid, foreign key to recruiters)
      - `title` (text)
      - `company` (text)
      - `location` (text)
      - `job_type` (text)
      - `salary_min` (integer, nullable)
      - `salary_max` (integer, nullable)
      - `description` (text)
      - `requirements` (text array)
      - `benefits` (text array, nullable)
      - `status` (text, default 'active')
      - `views` (integer, default 0)
      - `applications_count` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `type` (text) - 'application', 'status_change', 'new_job', 'message'
      - `title` (text)
      - `message` (text)
      - `link` (text, nullable)
      - `read` (boolean, default false)
      - `created_at` (timestamp)

  2. Indexes
    - Index on recruiters.profile_id
    - Index on job_postings.recruiter_id
    - Index on job_postings.status
    - Index on notifications.user_id
    - Index on notifications.read
*/

-- Create recruiters table
CREATE TABLE IF NOT EXISTS recruiters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_website TEXT,
  company_description TEXT,
  company_logo_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- Create job_postings table
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  description TEXT NOT NULL,
  requirements TEXT[] NOT NULL,
  benefits TEXT[],
  status TEXT DEFAULT 'active',
  views INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recruiters_profile ON recruiters(profile_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_recruiter ON job_postings(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Update profiles table to add role
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'job_seeker';
  END IF;
END $$;

-- Add trigger to update applications_count
CREATE OR REPLACE FUNCTION update_applications_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE job_postings 
    SET applications_count = applications_count + 1 
    WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE job_postings 
    SET applications_count = applications_count - 1 
    WHERE id = OLD.job_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_applications_count
AFTER INSERT OR DELETE ON applications
FOR EACH ROW
EXECUTE FUNCTION update_applications_count();
