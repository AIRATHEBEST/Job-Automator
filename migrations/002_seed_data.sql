/*
  # Seed Data for Job Application Portal

  This migration adds sample data for testing and demonstration purposes.

  1. Sample Admin User
    - Email: admin@jobportal.com
    - Password: admin123 (hashed)
    - Is Admin: true

  2. Sample Job Seeker
    - Email: user@example.com
    - Password: user123 (hashed)
    - Is Admin: false

  3. Sample Jobs (5 jobs)
    - Various positions across different companies
    - Different job types and locations

  4. Sample Applications
    - Applications from the sample user to various jobs
*/

-- Insert sample admin user (password: admin123)
-- Note: In production, passwords should be hashed using bcrypt with salt rounds = 10
INSERT INTO profiles (id, email, password_hash, full_name, is_admin, created_at, updated_at)
VALUES (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'admin@jobportal.com',
  '$2a$10$rOzJz5qF5xK5qF5xK5qF5.5xK5qF5xK5qF5xK5qF5xK5qF5xK5qF5u',
  'Admin User',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert sample job seeker (password: user123)
INSERT INTO profiles (id, email, password_hash, full_name, phone, skills, experience_years, is_admin, created_at, updated_at)
VALUES (
  'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
  'user@example.com',
  '$2a$10$rOzJz5qF5xK5qF5xK5qF5.5xK5qF5xK5qF5xK5qF5xK5qF5xK5qF5u',
  'John Doe',
  '(555) 123-4567',
  ARRAY['JavaScript', 'React', 'Node.js', 'TypeScript', 'PostgreSQL'],
  5,
  false,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert sample jobs
INSERT INTO jobs (id, title, company, location, type, salary_min, salary_max, description, requirements, benefits, posted_by, status, created_at, updated_at)
VALUES
  (
    'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f',
    'Senior Full Stack Developer',
    'TechCorp Inc.',
    'San Francisco, CA',
    'Full-time',
    120000,
    180000,
    'We are seeking an experienced Full Stack Developer to join our growing team. You will work on cutting-edge web applications using modern technologies and best practices.',
    ARRAY['5+ years of experience with React and Node.js', 'Strong understanding of TypeScript', 'Experience with PostgreSQL or similar databases', 'Excellent problem-solving skills', 'Strong communication abilities'],
    ARRAY['Competitive salary', 'Health, dental, and vision insurance', '401(k) matching', 'Flexible work hours', 'Remote work options', 'Professional development budget'],
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'active',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a',
    'Frontend Developer',
    'StartupXYZ',
    'Remote',
    'Remote',
    80000,
    120000,
    'Join our innovative startup as a Frontend Developer. Work on exciting projects that impact thousands of users daily.',
    ARRAY['3+ years of React experience', 'Proficiency in CSS and modern styling solutions', 'Experience with responsive design', 'Understanding of web performance optimization', 'Git version control'],
    ARRAY['Competitive salary', 'Fully remote position', 'Flexible schedule', 'Stock options', 'Learning stipend'],
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'active',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b',
    'Backend Engineer',
    'DataSolutions LLC',
    'New York, NY',
    'Full-time',
    100000,
    150000,
    'Looking for a skilled Backend Engineer to build scalable APIs and microservices. You will work with modern cloud technologies and databases.',
    ARRAY['4+ years of backend development experience', 'Strong knowledge of Node.js or Python', 'Experience with RESTful API design', 'Database design and optimization skills', 'Cloud platform experience (AWS, GCP, or Azure)'],
    ARRAY['Health insurance', 'Unlimited PTO', '401(k) with matching', 'Gym membership', 'Commuter benefits'],
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'active',
    NOW() - INTERVAL '1 week',
    NOW() - INTERVAL '1 week'
  ),
  (
    'f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c',
    'UI/UX Designer',
    'DesignStudio Pro',
    'Los Angeles, CA',
    'Contract',
    70000,
    100000,
    'We need a creative UI/UX Designer to craft beautiful and intuitive user experiences. Join our design team and make an impact.',
    ARRAY['3+ years of UI/UX design experience', 'Proficiency in Figma or Sketch', 'Strong portfolio demonstrating design skills', 'Understanding of user-centered design principles', 'Experience with design systems'],
    ARRAY['Competitive hourly rate', 'Flexible hours', 'Remote work options', 'Creative freedom', 'Collaborative team environment'],
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'active',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    'a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d',
    'DevOps Engineer',
    'CloudTech Systems',
    'Seattle, WA',
    'Full-time',
    110000,
    160000,
    'Seeking a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines. Help us scale our systems efficiently.',
    ARRAY['5+ years of DevOps experience', 'Strong knowledge of Docker and Kubernetes', 'Experience with CI/CD tools (Jenkins, GitLab CI, etc.)', 'Infrastructure as Code (Terraform, CloudFormation)', 'Monitoring and logging expertise'],
    ARRAY['Competitive salary', 'Health benefits', 'Stock options', '401(k) matching', 'Professional development', 'Relocation assistance'],
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'active',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample applications
INSERT INTO applications (id, job_id, applicant_id, cover_letter, status, applied_at, updated_at)
VALUES
  (
    'b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e',
    'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f',
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    'I am excited to apply for the Senior Full Stack Developer position. With over 5 years of experience in React and Node.js, I have successfully delivered multiple high-impact projects. I am passionate about building scalable web applications and would love to contribute to your team.',
    'pending',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f',
    'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a',
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    'I would like to apply for the Frontend Developer position at StartupXYZ. My experience with React and modern CSS frameworks makes me a great fit for this role. I am excited about the opportunity to work remotely and contribute to innovative projects.',
    'accepted',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (job_id, applicant_id) DO NOTHING;
