import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, Users, Eye, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { query } from '../lib/db';
import { getStoredUser } from '../lib/auth';
import { JobPosting } from '../types/database';

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalViews: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = await getStoredUser();
      if (!user) return;

      // Get recruiter ID
      const recruiterResult = await query(
        'SELECT id FROM recruiters WHERE profile_id = $1',
        [user.userId]
      );
      
      if (recruiterResult.length === 0) {
        setLoading(false);
        return;
      }

      const recruiterId = recruiterResult[0].id;

      // Fetch jobs
      const jobsResult = await query(
        'SELECT * FROM job_postings WHERE recruiter_id = $1 ORDER BY created_at DESC',
        [recruiterId]
      ) as JobPosting[];

      setJobs(jobsResult);

      // Calculate stats
      const totalViews = jobsResult.reduce((sum, job) => sum + job.views, 0);
      const totalApplications = jobsResult.reduce((sum, job) => sum + job.applications_count, 0);
      const activeJobs = jobsResult.filter(job => job.status === 'active').length;

      setStats({
        totalJobs: jobsResult.length,
        activeJobs,
        totalViews,
        totalApplications,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      await query('DELETE FROM job_postings WHERE id = $1', [jobId]);
      await fetchData();
    } catch (error) {
      console.error('Failed to delete job:', error);
      alert('Failed to delete job posting');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Recruiter Dashboard</h1>
            <p className="text-gray-400">Manage your job postings and track applications</p>
          </div>
          <Link
            to="/post-job"
            className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Post New Job
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">{stats.totalJobs}</span>
            </div>
            <p className="text-gray-400 text-sm">Total Jobs</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-white">{stats.activeJobs}</span>
            </div>
            <p className="text-gray-400 text-sm">Active Jobs</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">{stats.totalViews}</span>
            </div>
            <p className="text-gray-400 text-sm">Total Views</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-white">{stats.totalApplications}</span>
            </div>
            <p className="text-gray-400 text-sm">Applications</p>
          </div>
        </div>

        {/* Job Listings */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Your Job Postings</h2>
          </div>

          {jobs.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No job postings yet</h3>
              <p className="text-gray-400 mb-6">Start by creating your first job posting</p>
              <Link
                to="/post-job"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {jobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-gray-750 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            job.status === 'active'
                              ? 'bg-green-500/20 text-green-400'
                              : job.status === 'closed'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>
                      <p className="text-gray-400 mb-3">{job.company} • {job.location}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {job.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {job.applications_count} applications
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/edit-job/${job.id}`}
                        className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
                        title="Edit job"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete job"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
