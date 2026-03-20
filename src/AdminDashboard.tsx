import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import { supabase } from './supabase';
import { useJobs } from './JobContext';
import { Plus, Users, Briefcase, FileText, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { jobs } = useJobs();
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    totalUsers: 0,
    pendingApplications: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [jobsCount, applicationsCount, usersCount, pendingCount] = await Promise.all([
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setStats({
        totalJobs: jobsCount.count || 0,
        totalApplications: applicationsCount.count || 0,
        totalUsers: usersCount.count || 0,
        pendingApplications: pendingCount.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Admin Dashboard</h1>
            <p className="text-textSecondary">Manage jobs and applications</p>
          </div>
          <Link
            to="/admin/post-job"
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Post New Job
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <h3 className="text-2xl font-bold text-text mb-1">{stats.totalJobs}</h3>
            <p className="text-textSecondary text-sm">Total Jobs</p>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-text mb-1">{stats.totalApplications}</h3>
            <p className="text-textSecondary text-sm">Total Applications</p>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-text mb-1">{stats.totalUsers}</h3>
            <p className="text-textSecondary text-sm">Total Users</p>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-warning" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-text mb-1">{stats.pendingApplications}</h3>
            <p className="text-textSecondary text-sm">Pending Applications</p>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold text-text mb-6">Recent Job Postings</h2>
          <div className="space-y-4">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="p-4 bg-background border border-border rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-text mb-1">{job.title}</h3>
                    <p className="text-textSecondary text-sm">{job.company} • {job.location}</p>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
