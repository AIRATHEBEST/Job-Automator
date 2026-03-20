# Deployment Guide

## Prerequisites
1. GitHub account
2. Vercel account (sign up at vercel.com)
3. Neon Database credentials
4. Adzuna API credentials

## Step 1: Push to GitHub

### Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: Job Application Portal"
```

### Create GitHub Repository
1. Go to https://github.com/new
2. Create a new repository named `job-application-portal`
3. Choose Public or Private
4. DO NOT initialize with README (we already have one)

### Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/job-application-portal.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Option B: Deploy via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

## Step 3: Configure Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add:

### Required Variables:
```
VITE_DATABASE_URL=postgresql://neondb_owner:npg_sQXm6dyhq4Sn@ep-lively-thunder-amhl66cl-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

VITE_JWT_SECRET=your_secure_random_jwt_secret_here

VITE_ADZUNA_APP_ID=3e1d8472

VITE_ADZUNA_API_KEY=c2bfdf16f9ce970c96e66bfa9f02bf69
```

**IMPORTANT**: 
- Add these to ALL environments (Production, Preview, Development)
- Generate a strong JWT secret (use: `openssl rand -base64 32`)

## Step 4: Database Setup

### Run Migrations on Production Database
1. Go to your Neon Console: https://console.neon.tech
2. Select your database
3. Open SQL Editor
4. Run the migration file: `migrations/001_initial_schema.sql`
5. Verify all 11 tables are created:
   - profiles
   - applications
   - saved_jobs
   - recruiters
   - job_postings
   - notifications
   - refresh_tokens
   - email_verifications
   - password_resets
   - application_analytics
   - job_analytics

## Step 5: Verify Deployment

### Check Build Logs
1. Go to Vercel Dashboard → Deployments
2. Click on your latest deployment
3. Check build logs for errors

### Test Production Site
1. Visit your Vercel URL (e.g., `your-app.vercel.app`)
2. Test key features:
   - ✅ Sign up / Login
   - ✅ Job search
   - ✅ Save jobs
   - ✅ Apply for jobs
   - ✅ View applications
   - ✅ Profile management
   - ✅ Recruiter portal (if applicable)
   - ✅ Admin dashboard

## Step 6: Custom Domain (Optional)

### Add Custom Domain in Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as instructed by Vercel
4. Wait for SSL certificate provisioning

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies are in package.json
- Ensure TypeScript compilation succeeds locally

### Environment Variables Not Working
- Verify variables are set in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Database Connection Issues
- Verify Neon connection string is correct
- Check Neon database is not paused
- Ensure SSL mode is enabled

### API Proxy Issues
- Verify `/api/jobs.js` serverless function is deployed
- Check Adzuna API credentials are valid
- Monitor API rate limits (5,000 calls/month free tier)

## Post-Deployment Checklist

- [ ] GitHub repository created and code pushed
- [ ] Vercel project deployed successfully
- [ ] Environment variables configured
- [ ] Database migrations executed
- [ ] Production site accessible
- [ ] Authentication working
- [ ] Job search functioning
- [ ] Applications can be submitted
- [ ] All features tested
- [ ] Custom domain configured (if applicable)

## Monitoring

### Vercel Analytics
- Enable Vercel Analytics for performance monitoring
- Track Core Web Vitals
- Monitor serverless function usage

### Database Monitoring
- Monitor Neon database usage in console
- Set up alerts for connection limits
- Track query performance

## Security Notes

- ✅ Environment variables stored securely in Vercel
- ✅ Database credentials never exposed in frontend
- ✅ API keys protected via serverless functions
- ✅ JWT tokens expire after 7 days
- ✅ Passwords hashed with bcrypt
- ✅ HTTPS enforced by Vercel

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review Neon database logs
3. Verify Adzuna API status
4. Check browser console for frontend errors

## Next Steps

After successful deployment:
1. Monitor application performance
2. Set up error tracking (e.g., Sentry)
3. Configure analytics (e.g., Google Analytics)
4. Plan feature enhancements
5. Gather user feedback

---

**Congratulations! Your Job Application Portal is now live! 🎉**
