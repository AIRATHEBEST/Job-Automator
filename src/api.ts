const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface Job {
  id: string;
  title: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
    area?: string[];
  };
  description: string;
  created: string;
  salary_min?: number;
  salary_max?: number;
  contract_time?: string;
  redirect_url: string;
  category?: {
    label: string;
    tag: string;
  };
}

export interface JobSearchParams {
  what?: string;
  where?: string;
  country?: string;
  page?: number;
  results_per_page?: number;
  sort_by?: 'relevance' | 'date' | 'salary';
  salary_min?: number;
  salary_max?: number;
  full_time?: boolean;
  part_time?: boolean;
  contract?: boolean;
  permanent?: boolean;
}

export interface JobSearchResponse {
  results: Job[];
  count: number;
  mean?: number;
}

export async function searchJobs(params: JobSearchParams): Promise<JobSearchResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(`${API_BASE_URL}/jobs?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
}

export async function getJobById(id: string): Promise<Job | null> {
  try {
    const response = await searchJobs({ results_per_page: 100 });
    return response.results.find(job => job.id === id) || null;
  } catch (error) {
    console.error('Error fetching job:', error);
    return null;
  }
}
