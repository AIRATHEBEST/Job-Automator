import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import sql from './db';
import { getStoredUser } from './auth';
import { 
  Plus, Briefcase, Users, TrendingUp, 
  CheckCircle, XCircle, Clock, Eye, Trash2, Edit
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const user = await getStoredUser();
      if (!user) return;

      // Get recruiter profile
      const recruiterResult = await sql`SELECT id FROM recruiters WHERE profile_id = ${user.userId}`;
      if (recruiterResult.length === 0) {
        setLoading(false);
        return;
      }
      const recruiterId = recruiterResult[0].id;

      // Fetch jobs and applications
      const [jobList, appList] = await Promise.all([
        sql`SELECT * FROM job_postings WHERE recruiter_id = ${recruiterId} ORDER BY created_at DESC`,
        sql`SELECT a.*, p.full_name, p.email 
            FROM applications a 
            JOIN profiles p ON a.applicant_id = p.id 
            WHERE a.job_id IN (SELECT id::text FROM job_postings WHERE recruiter_id = ${recruiterId})
            ORDER BY a.applied_at DESC`
      ]);

      setJobs(jobList);
      setApplications(appList);
      
      setStats({
        totalJobs: jobList.length,
        activeJobs: jobList.filter((j: any) => j.status === 'active').length,
        totalApplications: appList.length,
        pendingApplications: appList.filter((a: any) => a.status === 'pending').length
      });
    } catch (error) {
      console.error('Failed to fetch recruiter data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateAppStatus = async (appId: string, status: string) => {
    try {
      await sql`UPDATE applications SET status = ${status}, updated_at = NOW() WHERE id = ${appId}`;
      toast.success(`Application ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting? This will also delete all related applications.')) return;
    try {
      await sql`DELETE FROM job_postings WHERE id = ${jobId}`;
      toast.success('Job deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete job');
    }
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
            <h1 className="text-3xl font-bold text-white mb-2">Recruiter Dashboard</h1>
            <p className="text-gray-400">Manage your job postings and review applicants</p>
          </div>
          <Link
            to="/post-job"
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Post New Job</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Briefcase} label="Total Jobs" value={stats.totalJobs} color="purple" />
          <StatCard icon={CheckCircle} label="Active Postings" value={stats.activeJobs} color="green" />
          <StatCard icon={Users} label="Total Applicants" value={stats.totalApplications} color="blue" />
          <StatCard icon={Clock} label="Pending Review" value={stats.pendingApplications} color="yellow" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Postings List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Your Job Postings</h2>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{jobs.length} Total</span>
              </div>
              <div className="divide-y divide-gray-700">
                {jobs.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>You haven't posted any jobs yet.</p>
                    <Link to="/post-job" className="text-purple-500 hover:underline mt-2 inline-block">Post your first job</Link>
                  </div>
                ) : (
                  jobs.map((job) => (
                    <div key={job.id} className="p-6 hover:bg-gray-750 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-white font-bold text-lg mb-1">{job.title}</h3>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(job.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {applications.filter(a => a.job_id === job.id).length} Applicants</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${job.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-700 text-gray-400'}`}>
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteJob(job.id)}
                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Applications Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Recent Applicants</h2>
              </div>
              <div className="divide-y divide-gray-700">
                {applications.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <p>No applications received yet.</p>
                  </div>
                ) : (
                  applications.slice(0, 8).map((app) => (
                    <div key={app.id} className="p-4 hover:bg-gray-750 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-white font-semibold text-sm">{app.full_name}</h4>
                          <p className="text-gray-400 text-xs truncate w-32">{app.job_title}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          app.status === 'accepted' ? 'text-green-500 bg-green-500/10' :
                          app.status === 'rejected' ? 'text-red-500 bg-red-500/10' :
                          'text-yellow-500 bg-yellow-500/10'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      {app.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <button 
                            onClick={() => updateAppStatus(app.id, 'accepted')}
                            className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded transition-colors"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => updateAppStatus(app.id, 'rejected')}
                            className="flex-1 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold rounded transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              {applications.length > 0 && (
                <div className="p-4 bg-gray-800/50 border-t border-gray-700 text-center">
                  <button className="text-purple-500 text-xs font-bold hover:underline">View All Applications</button>
                </div>
              )}
            </div>
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
    green: 'bg-green-500/10 text-green-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
      <div className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}
