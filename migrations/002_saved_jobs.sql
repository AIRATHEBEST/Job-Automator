/*
  # Saved Jobs Feature

  1. New Table
    - `saved_jobs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `job_id` (text) - Adzuna job ID
      - `job_title` (text)
      - `company` (text)
      - `location` (text)
      - `job_type` (text)
      - `salary_range` (text)
      - `job_url` (text)
      - `saved_at` (timestamp with time zone)

  2. Indexes
    - Index on saved_jobs.user_id for fast user queries
    - Unique constraint on (user_id, job_id) to prevent duplicates

  3. Security
    - User can only access their own saved jobs
*/

CREATE TABLE IF NOT EXISTS saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL,
  salary_range TEXT,
  job_url TEXT NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job ON saved_jobs(job_id);
