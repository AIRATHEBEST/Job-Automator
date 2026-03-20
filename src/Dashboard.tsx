import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { useAuth } from './AuthContext';
import { useJobs } from './JobContext';
import { Link } from 'react-router-dom';
import { 
  Briefcase, FileText, TrendingUp, Clock, MapPin, 
  DollarSign, CheckCircle, XCircle, ChevronRight, Search 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { profile } = useAuth();
  const { jobs, applications, loading } = useJobs();

  const recentJobs = jobs.slice(0, 5);
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
  const rejectedApplications = applications.filter(app => app.status === 'rejected').length;

  if (loading && applications.length === 0) {
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
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {profile?.full_name || 'User'}!
            </h1>
            <p className="text-gray-400">Track your job search progress and find new opportunities</p>
          </div>
          <Link 
            to="/jobs" 
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors w-fit"
          >
            <Search className="w-5 h-5" />
            <span>Find New Jobs</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={FileText} 
            label="Total Applied" 
            value={applications.length} 
            color="purple" 
            trend="+12%" 
          />
          <StatCard 
            icon={Clock} 
            label="Pending Review" 
            value={pendingApplications} 
            color="yellow" 
          />
          <StatCard 
            icon={CheckCircle} 
            label="Accepted" 
            value={acceptedApplications} 
            color="green" 
          />
          <StatCard 
            icon={XCircle} 
            label="Rejected" 
            value={rejectedApplications} 
            color="red" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Application History</h2>
                <Link to="/applications" className="text-purple-500 hover:text-purple-400 text-sm font-medium">
                  View All History →
                </Link>
              </div>
              <div className="divide-y divide-gray-700">
                {applications.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>You haven't applied to any jobs yet.</p>
                    <Link to="/jobs" className="text-purple-500 hover:underline mt-2 inline-block">Browse available jobs</Link>
                  </div>
                ) : (
                  applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="p-6 hover:bg-gray-750 transition-colors group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg mb-1 group-hover:text-purple-400 transition-colors">
                            {app.job_title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-3">{app.company} • {app.location}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <Clock className="w-3.5 h-3.5" />
                              Applied {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full font-medium uppercase tracking-wider text-[10px] ${
                              app.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
                              app.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                              'bg-yellow-500/10 text-yellow-500'
                            }`}>
                              {app.status}
                            </span>
                          </div>
                        </div>
                        <Link 
                          to={`/jobs/${app.job_id}`}
                          className="p-2 bg-gray-700 rounded-lg text-gray-400 hover:bg-purple-600 hover:text-white transition-all"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recommended/Recent Jobs Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Latest Job Matches</h2>
              </div>
              <div className="divide-y divide-gray-700">
                {recentJobs.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <p>No new matches found yet.</p>
                  </div>
                ) : (
                  recentJobs.map((job) => (
                    <Link 
                      key={job.id} 
                      to={`/jobs/${job.id}`}
                      className="block p-4 hover:bg-gray-750 transition-colors"
                    >
                      <h4 className="text-white font-semibold text-sm mb-1 truncate">{job.title}</h4>
                      <p className="text-gray-400 text-xs mb-2">{typeof job.company === 'string' ? job.company : job.company.display_name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">{typeof job.location === 'string' ? job.location : job.location.display_name}</span>
                        <span className="text-[10px] text-purple-400 font-bold uppercase">View →</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              <div className="p-4 bg-gray-800/50 border-t border-gray-700 text-center">
                <Link to="/jobs" className="text-purple-500 text-xs font-bold hover:underline uppercase tracking-widest">
                  Explore More Jobs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon: Icon, label, value, color, trend }: any) {
  const colors: any = {
    purple: 'bg-purple-500/10 text-purple-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    green: 'bg-green-500/10 text-green-500',
    red: 'bg-red-500/10 text-red-500',
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}
