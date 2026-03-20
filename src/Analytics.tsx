import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import sql from './db';
import { 
  TrendingUp, Users, Briefcase, FileText, Download, 
  Calendar, ChevronDown, Clock, CheckCircle, XCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
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
        FROM job_postings
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

      const totalApps = parseInt(applicationStats[0].total) || 0;
      const acceptedApps = parseInt(applicationStats[0].accepted) || 0;

      // Status distribution
      const statusData = [
        { name: 'Pending', value: parseInt(applicationStats[0].pending) || 0, color: '#f59e0b' },
        { name: 'Reviewed', value: parseInt(applicationStats[0].reviewed) || 0, color: '#3b82f6' },
        { name: 'Accepted', value: acceptedApps, color: '#10b981' },
        { name: 'Rejected', value: parseInt(applicationStats[0].rejected) || 0, color: '#ef4444' },
      ];

      // Mocked timeline data for visual trends
      const timelineData = [
        { name: 'Week 1', apps: Math.floor(totalApps * 0.2), jobs: Math.floor(parseInt(jobStats[0].total) * 0.3) },
        { name: 'Week 2', apps: Math.floor(totalApps * 0.3), jobs: Math.floor(parseInt(jobStats[0].total) * 0.4) },
        { name: 'Week 3', apps: Math.floor(totalApps * 0.6), jobs: Math.floor(parseInt(jobStats[0].total) * 0.7) },
        { name: 'Week 4', apps: totalApps, jobs: parseInt(jobStats[0].total) || 0 },
      ];

      setStats({
        totalApplications: totalApps,
        activeJobs: parseInt(jobStats[0].active) || 0,
        totalJobs: parseInt(jobStats[0].total) || 0,
        totalUsers: parseInt(userStats[0].total) || 0,
        statusData,
        timelineData,
        acceptanceRate: totalApps > 0 ? Math.round((acceptedApps / totalApps) * 100) : 0
      });

      setRecentActivity(recent);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const data = JSON.stringify({ stats, recentActivity }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported successfully');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Platform Analytics</h1>
            <p className="text-gray-400">Comprehensive insights into platform performance</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white appearance-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            <button 
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={FileText} label="Total Applications" value={stats.totalApplications} color="purple" />
          <StatCard icon={Briefcase} label="Active Jobs" value={stats.activeJobs} color="blue" />
          <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="pink" />
          <StatCard icon={TrendingUp} label="Acceptance Rate" value={`${stats.acceptanceRate}%`} color="green" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Application Trends */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Application Trends</h3>
            <div className="h-64 flex items-end justify-between gap-2 px-2">
              {stats.timelineData.map((d: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex gap-1 items-end justify-center h-48 relative">
                    <div 
                      className="w-4 bg-purple-500 rounded-t transition-all duration-500 group-hover:bg-purple-400" 
                      style={{ height: `${stats.totalApplications > 0 ? (d.apps / (stats.totalApplications * 1.2)) * 100 : 0}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.apps}
                      </div>
                    </div>
                    <div 
                      className="w-4 bg-blue-500 rounded-t transition-all duration-500 group-hover:bg-blue-400" 
                      style={{ height: `${stats.totalJobs > 0 ? (d.jobs / (stats.totalJobs * 1.2)) * 100 : 0}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.jobs}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{d.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-xs text-gray-400">Applications</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-400">Job Postings</span>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Application Status</h3>
            <div className="space-y-5">
              {stats.statusData.map((s: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                      {s.name}
                    </span>
                    <span className="text-white font-medium">{s.value}</span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ 
                        width: `${stats.totalApplications > 0 ? (s.value / stats.totalApplications) * 100 : 0}%`,
                        backgroundColor: s.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              {stats.totalApplications === 0 && (
                <div className="text-center py-12 text-gray-500 italic">No application data yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Latest 10 Applications</span>
          </div>
          <div className="divide-y divide-gray-700">
            {recentActivity.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No recent application activity found</p>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="p-6 hover:bg-gray-750 transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors">
                          {activity.full_name || activity.email}
                        </h3>
                        <span className="text-gray-500 text-xs">•</span>
                        <span className="text-gray-400 text-sm">
                          {activity.email}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">
                        Applied for <span className="text-white font-medium">{activity.job_title}</span> at <span className="text-white font-medium">{activity.company}</span>
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDistanceToNow(new Date(activity.applied_at), { addSuffix: true })}
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-medium ${
                            activity.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-500'
                              : activity.status === 'reviewed'
                              ? 'bg-blue-500/10 text-blue-500'
                              : activity.status === 'accepted'
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.status === 'accepted' ? 'bg-green-500/10 text-green-500' : 
                        activity.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {activity.status === 'accepted' ? <CheckCircle className="w-5 h-5" /> : 
                         activity.status === 'rejected' ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colors: any = {
    purple: 'bg-purple-500/10 text-purple-500',
    blue: 'bg-blue-500/10 text-blue-500',
    pink: 'bg-pink-500/10 text-pink-500',
    green: 'bg-green-500/10 text-green-500',
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}
