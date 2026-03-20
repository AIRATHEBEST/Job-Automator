import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.VITE_DATABASE_URL);

async function migrate() {
  console.log('Starting migration...');
  try {
    // 1. Fix profiles table: Add 'role' column if it doesn't exist
    console.log('Checking profiles table...');
    await sql`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'job_seeker'
    `;
    console.log('Profiles table updated.');

    // 2. Create notifications table if it doesn't exist
    console.log('Checking notifications table...');
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        link TEXT,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Notifications table checked/created.');

    // 3. Create saved_jobs table if it doesn't exist
    console.log('Checking saved_jobs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS saved_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        job_id TEXT NOT NULL,
        job_title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT NOT NULL,
        job_type TEXT,
        salary_range TEXT,
        job_url TEXT,
        saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, job_id)
      )
    `;
    console.log('Saved_jobs table checked/created.');

    // 4. Create recruiters table if it doesn't exist
    console.log('Checking recruiters table...');
    await sql`
      CREATE TABLE IF NOT EXISTS recruiters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
        company_name TEXT NOT NULL,
        company_website TEXT,
        company_description TEXT,
        company_logo_url TEXT,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Recruiters table checked/created.');

    // 5. Create job_postings table if it doesn't exist
    console.log('Checking job_postings table...');
    await sql`
      CREATE TABLE IF NOT EXISTS job_postings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        recruiter_id UUID NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT NOT NULL,
        job_type TEXT NOT NULL,
        salary_min INTEGER,
        salary_max INTEGER,
        description TEXT NOT NULL,
        requirements TEXT[] DEFAULT '{}',
        benefits TEXT[] DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'active',
        views INTEGER DEFAULT 0,
        applications_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Job_postings table checked/created.');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
