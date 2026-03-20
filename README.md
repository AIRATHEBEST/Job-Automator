# Job Application Portal

A comprehensive job application portal built with React, TypeScript, Neon Database (PostgreSQL), and Adzuna API for real job listings.

## Features

- 🔐 **Authentication System**: Secure email/password authentication with JWT tokens
- 💼 **Real Job Listings**: Live job data from Adzuna API
- 🔍 **Advanced Search**: Filter by keywords, location, job type, and salary
- 📝 **Application Tracking**: Apply for jobs and track application status
- 👤 **Profile Management**: Update user profiles with skills and experience
- 🎨 **Modern UI**: Beautiful dark theme with responsive design
- ⚡ **Real-time Updates**: Instant updates across the application

## Prerequisites

- Node.js 18+ installed
- Neon Database account ([neon.tech](https://neon.tech))
- Adzuna API credentials ([developer.adzuna.com](https://developer.adzuna.com))

## Setup Instructions

### 1. Get Adzuna API Credentials

1. Go to [Adzuna Developer Portal](https://developer.adzuna.com)
2. Sign up for a free account
3. Create a new application
4. Copy your App ID and API Key

### 2. Database Setup

Your Neon database is already configured with the connection string:
```
postgresql://neondb_owner:npg_sQXm6dyhq4Sn@ep-lively-thunder-amhl66cl-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 3. Configure Environment Variables

Update the `.env` file with your Adzuna credentials:

```env
VITE_DATABASE_URL=postgresql://neondb_owner:npg_sQXm6dyhq4Sn@ep-lively-thunder-amhl66cl-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
VITE_JWT_SECRET=your_secure_random_jwt_secret_here
VITE_ADZUNA_APP_ID=your_adzuna_app_id_here
VITE_ADZUNA_API_KEY=your_adzuna_api_key_here
```

### 4. Run Database Migrations

Execute the migration file in your Neon SQL Editor:

```sql
-- Run: migrations/001_initial_schema.sql
```

This creates the necessary tables for user profiles and applications.

### 5. Install Dependencies

```bash
npm install
```

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## How It Works

### Job Listings
- Job data is fetched in real-time from Adzuna API
- No dummy data - all jobs are real and up-to-date
- Advanced search with multiple filters (keywords, location, salary, job type)
- Pagination support for browsing large result sets

### Applications
- When users apply for a job, the application is stored in your Neon database
- Job details (title, company, location, salary) are stored with the application
- Users can track their application status
- Applications link to the original job posting on Adzuna

### Database Schema
- **profiles**: User accounts with authentication and profile information
- **applications**: User job applications with job details and status

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Database**: Neon (PostgreSQL)
- **Job Data**: Adzuna API
- **Authentication**: JWT with bcrypt
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Rate Limits

Adzuna API free tier includes:
- 5,000 API calls per month
- Rate limit: 1 call per second

For production use, consider upgrading to a paid plan.

## Security Notes

- Passwords are hashed using bcrypt with salt rounds = 10
- JWT tokens expire after 7 days
- All database queries use parameterized statements to prevent SQL injection
- Environment variables should never be committed to version control
- API keys are stored securely in environment variables

## License

MIT

## Developer

Developed by **Emihle Ntshongwana**
Email: [Ntshongwanae@gmail.com](mailto:Ntshongwanae@gmail.com)
