/*
  # Phase 4: Analytics Schema

  1. New Tables
    - `application_analytics`
      - `id` (uuid, primary key)
      - `date` (date)
      - `total_applications` (integer)
      - `pending_applications` (integer)
      - `reviewed_applications` (integer)
      - `accepted_applications` (integer)
      - `rejected_applications` (integer)
      - `created_at` (timestamp)

    - `job_analytics`
      - `id` (uuid, primary key)
      - `job_id` (uuid, foreign key to job_postings)
      - `date` (date)
      - `views` (integer)
      - `applications` (integer)
      - `created_at` (timestamp)

  2. Indexes
    - Index on application_analytics.date
    - Index on job_analytics.job_id
    - Index on job_analytics.date
*/

-- Create application_analytics table
CREATE TABLE IF NOT EXISTS application_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_applications INTEGER DEFAULT 0,
  pending_applications INTEGER DEFAULT 0,
  reviewed_applications INTEGER DEFAULT 0,
  accepted_applications INTEGER DEFAULT 0,
  rejected_applications INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- Create job_analytics table
CREATE TABLE IF NOT EXISTS job_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  applications INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_application_analytics_date ON application_analytics(date);
CREATE INDEX IF NOT EXISTS idx_job_analytics_job ON job_analytics(job_id);
CREATE INDEX IF NOT EXISTS idx_job_analytics_date ON job_analytics(date);

-- Function to update daily analytics
CREATE OR REPLACE FUNCTION update_daily_analytics()
RETURNS void AS $$
BEGIN
  INSERT INTO application_analytics (
    date,
    total_applications,
    pending_applications,
    reviewed_applications,
    accepted_applications,
    rejected_applications
  )
  SELECT 
    CURRENT_DATE,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'pending'),
    COUNT(*) FILTER (WHERE status = 'reviewed'),
    COUNT(*) FILTER (WHERE status = 'accepted'),
    COUNT(*) FILTER (WHERE status = 'rejected')
  FROM applications
  WHERE DATE(applied_at) = CURRENT_DATE
  ON CONFLICT (date) DO UPDATE SET
    total_applications = EXCLUDED.total_applications,
    pending_applications = EXCLUDED.pending_applications,
    reviewed_applications = EXCLUDED.reviewed_applications,
    accepted_applications = EXCLUDED.accepted_applications,
    rejected_applications = EXCLUDED.rejected_applications;
END;
$$ LANGUAGE plpgsql;
