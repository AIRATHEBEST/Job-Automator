import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Adzuna API credentials (server-side only)
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;
const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs';

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Proxy Server Running' });
});

// Proxy endpoint for Adzuna job search
app.get('/api/jobs/:country/search', async (req, res) => {
  try {
    const { country } = req.params;
    const queryParams = new URLSearchParams(req.query);
    
    // Add API credentials
    queryParams.set('app_id', ADZUNA_APP_ID);
    queryParams.set('app_key', ADZUNA_API_KEY);

    const url = `${ADZUNA_BASE_URL}/${country}/search/1?${queryParams}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch jobs',
      message: error.message 
    });
  }
});

// Proxy endpoint for Adzuna categories
app.get('/api/jobs/:country/categories', async (req, res) => {
  try {
    const { country } = req.params;
    
    const url = `${ADZUNA_BASE_URL}/${country}/categories?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Proxy Server running on http://localhost:${PORT}`);
  console.log(`✅ Adzuna API credentials loaded`);
});
