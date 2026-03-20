import { createContext, useContext, useState, useEffect } from 'react';
import sql from './db';
import { searchJobs, type AdzunaJob, type AdzunaSearchParams, formatJobType, formatSalaryRange } from './adzuna';
import { useAuth } from './AuthContext';
import type { Application } from './database';

interface JobContextType {
  jobs: AdzunaJob[];
  applications: Application[];
  loading: boolean;
  searchParams: AdzunaSearchParams;
  totalJobs: number;
  fetchJobs: (params?: AdzunaSearchParams) => Promise<void>;
  fetchApplications: () => Promise<void>;
  applyForJob: (job: AdzunaJob, coverLetter: string) => Promise<void>;
  updateApplicationStatus: (applicationId: string, status: string) => Promise<void>;
  hasApplied: (jobId: string) => boolean;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<AdzunaJob[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<AdzunaSearchParams>({});
  const [totalJobs, setTotalJobs] = useState(0);
  const { user } = useAuth();

  const fetchJobs = async (params: AdzunaSearchParams = {}) => {
    setLoading(true);
    try {
      const response = await searchJobs(params);
      setJobs(response.results);
      setTotalJobs(response.count);
      setSearchParams(params);
    } catch (error) {
      console.error('Error fetching jobs from Adzuna:', error);
      // Set empty array on error to prevent app crash
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const result = await sql`
        SELECT * FROM applications
        WHERE applicant_id = ${user.userId}
        ORDER BY applied_at DESC
      `;

      setApplications(result as Application[]);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyForJob = async (job: AdzunaJob, coverLetter: string) => {
    if (!user) throw new Error('Must be logged in to apply');

    try {
      const applicationId = crypto.randomUUID();
      const salaryRange = formatSalaryRange(job);
      
      await sql`
        INSERT INTO applications (
          id, job_id, applicant_id, job_title, company, location, 
          job_type, salary_range, job_url, cover_letter, status
        )
        VALUES (
          ${applicationId}, 
          ${job.id}, 
          ${user.userId}, 
          ${job.title},
          ${job.company.display_name},
          ${job.location.display_name},
          ${formatJobType(job)},
          ${salaryRange},
          ${job.redirect_url},
          ${coverLetter}, 
          'pending'
        )
      `;
      
      await fetchApplications();
    } catch (error) {
      console.error('Error applying for job:', error);
      throw error;
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      await sql`
        UPDATE applications
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${applicationId}
      `;
      await fetchApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  };

  const hasApplied = (jobId: string): boolean => {
    return applications.some(app => app.job_id === jobId);
  };

  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchApplications();
    }
  }, [user]);

  return (
    <JobContext.Provider value={{ 
      jobs, 
      applications, 
      loading, 
      searchParams,
      totalJobs,
      fetchJobs, 
      fetchApplications, 
      applyForJob, 
      updateApplicationStatus,
      hasApplied
    }}>
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
}
