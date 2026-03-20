import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { query } = req;
    const appId = process.env.VITE_ADZUNA_APP_ID || '3e1d8472';
    const apiKey = process.env.VITE_ADZUNA_API_KEY || 'c2bfdf16f9ce970c96e66bfa9f02bf69';

    // Build Adzuna API URL
    const baseUrl = 'https://api.adzuna.com/v1/api/jobs';
    const country = query.country || 'us';
    const searchQuery = query.what || '';
    const location = query.where || '';
    const page = query.page || '1';
    const resultsPerPage = query.results_per_page || '20';
    const sortBy = query.sort_by || 'relevance';
    const salaryMin = query.salary_min || '';
    const salaryMax = query.salary_max || '';
    const fullTime = query.full_time || '';
    const partTime = query.part_time || '';
    const contract = query.contract || '';
    const permanent = query.permanent || '';

    let url = `${baseUrl}/${country}/search/${page}?app_id=${appId}&app_key=${apiKey}&results_per_page=${resultsPerPage}&what=${encodeURIComponent(searchQuery)}&where=${encodeURIComponent(location)}&sort_by=${sortBy}`;

    if (salaryMin) url += `&salary_min=${salaryMin}`;
    if (salaryMax) url += `&salary_max=${salaryMax}`;
    if (fullTime) url += `&full_time=${fullTime}`;
    if (partTime) url += `&part_time=${partTime}`;
    if (contract) url += `&contract=${contract}`;
    if (permanent) url += `&permanent=${permanent}`;

    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error('Adzuna API Error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs from Adzuna API' });
  }
}
