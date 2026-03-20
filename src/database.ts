export interface Profile {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  phone: string | null;
  resume_url: string | null;
  skills: string[] | null;
  experience_years: number | null;
  is_admin: boolean;
  role: 'job_seeker' | 'recruiter' | 'admin';
  email_verified: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface Recruiter {
  id: string;
  profile_id: string;
  company_name: string;
  company_website: string | null;
  company_description: string | null;
  company_logo_url: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobPosting {
  id: string;
  recruiter_id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  description: string;
  requirements: string[];
  benefits: string[] | null;
  status: 'active' | 'closed' | 'draft';
  views: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  job_title: string;
  company: string;
  location: string;
  job_type: string;
  salary_range: string;
  job_url: string;
  cover_letter: string | null;
  status: string;
  applied_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'application' | 'status_change' | 'new_job' | 'message';
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface EmailVerification {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  verified_at: string | null;
  created_at: string;
}

export interface PasswordReset {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface ApplicationAnalytics {
  id: string;
  date: string;
  total_applications: number;
  pending_applications: number;
  reviewed_applications: number;
  accepted_applications: number;
  rejected_applications: number;
  created_at: string;
}

export interface JobAnalytics {
  id: string;
  job_id: string;
  date: string;
  views: number;
  applications: number;
  created_at: string;
}
