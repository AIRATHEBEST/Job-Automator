import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { query } from '../lib/db';
import type { AdzunaJob } from '../lib/adzuna';

interface SavedJob {
  id: string;
  job_id: string;
  job_title: string;
  company: string;
  location: string;
  job_type: string;
  salary_range: string;
  job_url: string;
  saved_at: string;
}

interface SavedJobsContextType {
  savedJobs: SavedJob[];
  loading: boolean;
  isSaved: (jobId: string) => boolean;
  saveJob: (job: AdzunaJob) => Promise<void>;
  unsaveJob: (jobId: string) => Promise<void>;
  fetchSavedJobs: () => Promise<void>;
}

const SavedJobsContext = createContext<SavedJobsContextType | undefined>(undefined);

export function SavedJobsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSavedJobs = async () => {
    if (!user) {
      setSavedJobs([]);
      return;
    }

    setLoading(true);
    try {
      const results = await query(
        'SELECT * FROM saved_jobs WHERE user_id = $1 ORDER BY saved_at DESC',
        [user.id]
      );
      setSavedJobs(results as SavedJob[]);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, [user]);

  const isSaved = (jobId: string): boolean => {
    return savedJobs.some(job => job.job_id === jobId);
  };

  const saveJob = async (job: AdzunaJob) => {
    if (!user) throw new Error('Must be logged in to save jobs');

    try {
      const salaryRange = job.salary_min && job.salary_max
        ? `$${Math.round(job.salary_min).toLocaleString()} - $${Math.round(job.salary_max).toLocaleString()}`
        : job.salary_min
        ? `From $${Math.round(job.salary_min).toLocaleString()}`
        : job.salary_max
        ? `Up to $${Math.round(job.salary_max).toLocaleString()}`
        : 'Not specified';

      const jobType = job.contract_time === 'full_time' ? 'Full-time' :
                     job.contract_time === 'part_time' ? 'Part-time' :
                     job.contract_type === 'contract' ? 'Contract' : 'Full-time';

      await query(
        `INSERT INTO saved_jobs (user_id, job_id, job_title, company, location, job_type, salary_range, job_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (user_id, job_id) DO NOTHING`,
        [
          user.id,
          job.id,
          job.title,
          job.company.display_name,
          job.location.display_name,
          jobType,
          salaryRange,
          job.redirect_url
        ]
      );

      await fetchSavedJobs();
    } catch (error) {
      console.error('Error saving job:', error);
      throw error;
    }
  };

  const unsaveJob = async (jobId: string) => {
    if (!user) throw new Error('Must be logged in');

    try {
      await query(
        'DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
        [user.id, jobId]
      );

      await fetchSavedJobs();
    } catch (error) {
      console.error('Error unsaving job:', error);
      throw error;
    }
  };

  return (
    <SavedJobsContext.Provider value={{ 
      savedJobs, 
      loading, 
      isSaved, 
      saveJob, 
      unsaveJob,
      fetchSavedJobs 
    }}>
      {children}
    </SavedJobsContext.Provider>
  );
}

export function useSavedJobs() {
  const context = useContext(SavedJobsContext);
  if (!context) {
    throw new Error('useSavedJobs must be used within SavedJobsProvider');
  }
  return context;
}
