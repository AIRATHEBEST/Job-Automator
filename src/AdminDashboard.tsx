import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import sql from './db';
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
        sql`SELECT count(*) FROM jobs`,
        sql`SELECT count(*) FROM applications`,
        sql`SELECT count(*) FROM profiles`,
        sql`SELECT count(*) FROM applications WHERE status = 'pending'`,
      ]);

      setStats({
        totalJobs: parseInt(jobsCount[0].count) || 0,
        totalApplications: parseInt(applicationsCount[0].count) || 0,
        totalUsers: parseInt(usersCount[0].count) || 0,
        pendingApplications: parseInt(pendingCount[0].count) || 0,
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
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage jobs and applications</p>
          </div>
          <Link
            to="/admin/post-job"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Post New Job
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalJobs}</h3>
            <p className="text-gray-400 text-sm">Total Jobs</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalApplications}</h3>
            <p className="text-gray-400 text-sm">Total Applications</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-pink-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalUsers}</h3>
            <p className="text-gray-400 text-sm">Total Users</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.pendingApplications}</h3>
            <p className="text-gray-400 text-sm">Pending Applications</p>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recent Job Postings</h2>
          <div className="space-y-4">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="p-4 bg-gray-900 border border-gray-700 rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{job.title}</h3>
                    <p className="text-gray-400 text-sm">{job.company.display_name} • {job.location.display_name}</p>
                  </div>
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-xs font-medium rounded-full">
                    Active
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
