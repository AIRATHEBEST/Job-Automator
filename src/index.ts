export interface User {
  id: string;
  email: string;
  role: 'job_seeker' | 'recruiter' | 'admin';
  full_name?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience_years?: number;
  education?: string;
  resume_url?: string;
  created_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  user_id: string;
  status: 'pending' | 'reviewing' | 'interviewed' | 'offered' | 'rejected' | 'accepted' | 'withdrawn';
  cover_letter?: string;
  resume_url?: string;
  applied_at: string;
  updated_at: string;
  notes?: string;
}

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  job_url: string;
  saved_at: string;
  notes?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'application_status' | 'new_job' | 'message' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
}

export interface JobPosting {
  id: string;
  recruiter_id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary_min?: number;
  salary_max?: number;
  description: string;
  requirements: string[];
  benefits?: string[];
  status: 'draft' | 'active' | 'closed';
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface Recruiter {
  id: string;
  user_id: string;
  company_name: string;
  company_website?: string;
  company_description?: string;
  industry?: string;
  company_size?: string;
  verified: boolean;
  created_at: string;
}
