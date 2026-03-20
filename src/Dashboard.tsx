import Layout from './Layout';
import { useAuth } from './AuthContext';
import { useJobs } from './JobContext';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, TrendingUp, Clock, MapPin, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { profile } = useAuth();
  const { jobs, applications } = useJobs();

  const recentJobs = jobs.slice(0, 5);
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const acceptedApplications = applications.filter(app => app.status === 'accepted').length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-gray-400">Here's what's happening with your job search</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{jobs.length}</h3>
            <p className="text-gray-400 text-sm">Active Jobs</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{pendingApplications}</h3>
            <p className="text-gray-400 text-sm">Pending Applications</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{acceptedApplications}</h3>
            <p className="text-gray-400 text-sm">Accepted Applications</p>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Job Postings</h2>
            <Link to="/jobs" className="text-purple-500 hover:text-purple-400 text-sm font-medium">
              View All →
            </Link>
          </div>

          <div className="space-y-4">
            {recentJobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="block p-4 bg-gray-900 border border-gray-700 rounded-xl hover:border-purple-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{job.title}</h3>
                    <p className="text-gray-400 mb-3">
                      {typeof job.company === 'string' ? job.company : job.company.display_name}
                    </p>
                    
                    <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {typeof job.location === 'string' ? job.location : job.location.display_name}
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {(job as any).type || (job as any).contract_time || 'Full-time'}
                      </div>
                      {job.salary_min && job.salary_max && (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-purple-500/10 text-purple-500 text-xs font-medium rounded-full">
                      {formatDistanceToNow(new Date((job as any).created_at || job.created), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {recentJobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No jobs available yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
