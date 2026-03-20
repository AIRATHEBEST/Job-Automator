const API_PROXY_URL = import.meta.env.VITE_API_PROXY_URL || 'http://localhost:3001';

export interface AdzunaJob {
  id: string;
  title: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
    area: string[];
  };
  category: {
    label: string;
    tag: string;
  };
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string;
  description: string;
  contract_type?: string;
  contract_time?: string;
  created: string;
  redirect_url: string;
}

export interface AdzunaSearchParams {
  country?: string;
  location?: string;
  keywords?: string;
  category?: string;
  page?: number;
  results_per_page?: number;
  sort_by?: 'relevance' | 'date' | 'salary';
  max_days_old?: number;
  salary_min?: number;
  salary_max?: number;
  contract_type?: string;
  full_time?: boolean;
  part_time?: boolean;
}

export interface AdzunaSearchResponse {
  results: AdzunaJob[];
  count: number;
  mean: number;
}

export const SUPPORTED_COUNTRIES = [
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'za', name: 'South Africa', flag: '🇿🇦' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
];

export async function searchJobs(params: AdzunaSearchParams = {}): Promise<AdzunaSearchResponse> {
  const {
    country = 'us',
    location = '',
    keywords = '',
    category = '',
    page = 1,
    results_per_page = 20,
    sort_by = 'relevance',
    max_days_old = 30,
    salary_min,
    salary_max,
    contract_type,
    full_time,
    part_time,
  } = params;

  const queryParams = new URLSearchParams({
    results_per_page: results_per_page.toString(),
    page: page.toString(),
    sort_by,
    max_days_old: max_days_old.toString(),
  });

  if (keywords) queryParams.append('what', keywords);
  if (location) queryParams.append('where', location);
  if (category) queryParams.append('category', category);
  if (salary_min) queryParams.append('salary_min', salary_min.toString());
  if (salary_max) queryParams.append('salary_max', salary_max.toString());
  if (contract_type) queryParams.append('contract_type', contract_type);
  if (full_time !== undefined) queryParams.append('full_time', full_time ? '1' : '0');
  if (part_time !== undefined) queryParams.append('part_time', part_time ? '1' : '0');

  try {
    const response = await fetch(`${API_PROXY_URL}/api/jobs/${country}/search?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`API Proxy error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
}

export async function getJobCategories(country: string = 'us'): Promise<any> {
  try {
    const response = await fetch(`${API_PROXY_URL}/api/jobs/${country}/categories`);
    
    if (!response.ok) {
      throw new Error(`API Proxy error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export function formatJobType(job: AdzunaJob): string {
  if (job.contract_time === 'full_time') return 'Full-time';
  if (job.contract_time === 'part_time') return 'Part-time';
  if (job.contract_type === 'contract') return 'Contract';
  if (job.contract_type === 'permanent') return 'Permanent';
  return 'Full-time';
}

export function formatSalaryRange(job: AdzunaJob): string {
  if (job.salary_min && job.salary_max) {
    return `$${Math.round(job.salary_min).toLocaleString()} - $${Math.round(job.salary_max).toLocaleString()}`;
  }
  if (job.salary_min) {
    return `From $${Math.round(job.salary_min).toLocaleString()}`;
  }
  if (job.salary_max) {
    return `Up to $${Math.round(job.salary_max).toLocaleString()}`;
  }
  return 'Not specified';
}
