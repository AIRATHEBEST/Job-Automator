import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Briefcase, CheckCircle, XCircle, Clock } from 'lucide-react';
import sql from './db';
import { formatDistanceToNow } from 'date-fns';

interface Stats {
  totalApplications: number;
  pendingApplications: number;
  reviewedApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  totalJobs: number;
  activeJobs: number;
  totalUsers: number;
}

export default function Analytics() {
  const [stats, setStats] = useState<Stats>({
    totalApplications: 0,
    pendingApplications: 0,
    reviewedApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalUsers: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch application stats
      const applicationStats = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed,
          COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected
        FROM applications
      `;

      // Fetch job stats
      const jobStats = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'active') as active
        FROM jobs
      `;

      // Fetch user count
      const userStats = await sql`SELECT COUNT(*) as total FROM profiles`;

      // Fetch recent applications
      const recent = await sql`
        SELECT 
          a.*,
          p.full_name,
          p.email
        FROM applications a
        JOIN profiles p ON a.applicant_id = p.id
        ORDER BY a.applied_at DESC
        LIMIT 10
      `;

      setStats({
        totalApplications: parseInt(applicationStats[0].total),
        pendingApplications: parseInt(applicationStats[0].pending),
        reviewedApplications: parseInt(applicationStats[0].reviewed),
        acceptedApplications: parseInt(applicationStats[0].accepted),
        rejectedApplications: parseInt(applicationStats[0].rejected),
        totalJobs: parseInt(jobStats[0].total),
        activeJobs: parseInt(jobStats[0].active),
        totalUsers: parseInt(userStats[0].total),
      });

      setRecentActivity(recent);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const acceptanceRate = stats.totalApplications > 0
    ? ((stats.acceptedApplications / stats.totalApplications) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Platform insights and performance metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-6 rounded-lg border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">{stats.totalApplications}</span>
            </div>
            <p className="text-gray-300 text-sm font-medium">Total Applications</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-6 rounded-lg border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">{stats.activeJobs}</span>
            </div>
            <p className="text-gray-300 text-sm font-medium">Active Jobs</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-6 rounded-lg border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-white">{stats.totalUsers}</span>
            </div>
            <p className="text-gray-300 text-sm font-medium">Total Users</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-6 rounded-lg border border-yellow-500/30">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-white">{acceptanceRate}%</span>
            </div>
            <p className="text-gray-300 text-sm font-medium">Acceptance Rate</p>
          </div>
        </div>

        {/* Application Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6">Application Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">Pending</span>
                </div>
                <span className="text-white font-semibold">{stats.pendingApplications}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Reviewed</span>
                </div>
                <span className="text-white font-semibold">{stats.reviewedApplications}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Accepted</span>
                </div>
                <span className="text-white font-semibold">{stats.acceptedApplications}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="text-gray-300">Rejected</span>
                </div>
                <span className="text-white font-semibold">{stats.rejectedApplications}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6">Job Postings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">Total Jobs</span>
                </div>
                <span className="text-white font-semibold">{stats.totalJobs}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Active</span>
                </div>
                <span className="text-white font-semibold">{stats.activeJobs}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">Closed</span>
                </div>
                <span className="text-white font-semibold">{stats.totalJobs - stats.activeJobs}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Recent Applications</h2>
          </div>
          <div className="divide-y divide-gray-700">
            {recentActivity.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                No recent activity
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="p-6 hover:bg-gray-750 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">
                        {activity.full_name || activity.email}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        Applied for {activity.job_title} at {activity.company}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatDistanceToNow(new Date(activity.applied_at), { addSuffix: true })}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            activity.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : activity.status === 'reviewed'
                              ? 'bg-blue-500/20 text-blue-400'
                              : activity.status === 'accepted'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
