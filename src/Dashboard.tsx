import React, { useState, useMemo } from 'react';
import Layout from './Layout';
import { useAuth } from './AuthContext';
import { useJobs } from './JobContext';
import { useSavedJobs } from './SavedJobsContext';
import { Link } from 'react-router-dom';
import {
  Briefcase, FileText, TrendingUp, Clock, MapPin,
  DollarSign, CheckCircle, XCircle, ChevronRight, Search,
  Target, Flame, Heart, Bell, Zap, BarChart2, Calendar,
  Star, ArrowUpRight, RefreshCw, Award, AlertCircle,
  Building2, Users
} from 'lucide-react';
import { formatDistanceToNow, format, subDays, isWithinInterval } from 'date-fns';

export default function Dashboard() {
  const { profile } = useAuth();
  const { jobs, applications, loading, fetchJobs } = useJobs();
  const { savedJobs } = useSavedJobs();
  const [refreshing, setRefreshing] = useState(false);

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const acceptedApplications = applications.filter(app => app.status === 'accepted');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');
  const reviewingApplications = applications.filter(app => app.status === 'reviewing');

  // Response rate
  const responseRate = applications.length > 0
    ? Math.round(((acceptedApplications.length + rejectedApplications.length + reviewingApplications.length) / applications.length) * 100)
    : 0;

  // Activity streak — count consecutive days with at least one application
  const streak = useMemo(() => {
    if (applications.length === 0) return 0;
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const day = subDays(today, i);
      const start = new Date(day.setHours(0, 0, 0, 0));
      const end = new Date(day.setHours(23, 59, 59, 999));
      const applied = applications.some(app =>
        isWithinInterval(new Date(app.applied_at), { start, end })
      );
      if (applied) count++;
      else if (i > 0) break;
    }
    return count;
  }, [applications]);

  // Last 7 days application activity for mini chart
  const weekActivity = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(new Date(), 6 - i);
      const start = new Date(day); start.setHours(0, 0, 0, 0);
      const end = new Date(day); end.setHours(23, 59, 59, 999);
      return {
        day: format(day, 'EEE'),
        count: applications.filter(a =>
          isWithinInterval(new Date(a.applied_at), { start, end })
        ).length
      };
    });
  }, [applications]);

  const maxActivity = Math.max(...weekActivity.map(d => d.count), 1);

  // Profile completeness
  const profileFields = [
    { label: 'Full Name', done: !!profile?.full_name },
    { label: 'Phone', done: !!(profile as any)?.phone },
    { label: 'Location', done: !!(profile as any)?.location },
    { label: 'Bio', done: !!(profile as any)?.bio },
    { label: 'Skills', done: (profile?.skills?.length ?? 0) > 0 },
    { label: 'Experience', done: (profile?.experience_years ?? 0) > 0 },
    { label: 'LinkedIn', done: !!(profile as any)?.linkedin },
    { label: 'Resume', done: !!profile?.resume_url },
  ];
  const profileComplete = Math.round((profileFields.filter(f => f.done).length / profileFields.length) * 100);
  const nextProfileTask = profileFields.find(f => !f.done);

  const recentJobs = jobs.slice(0, 6);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  if (loading && applications.length === 0 && jobs.length === 0) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Welcome Banner ── */}
        <div className="relative bg-gradient-to-br from-purple-900/60 via-gray-800 to-blue-900/40 border border-gray-700 rounded-3xl p-6 md:p-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg shadow-purple-500/20">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Welcome back,</p>
                  <h1 className="text-2xl md:text-3xl font-black text-white">
                    {profile?.full_name || 'Job Seeker'} 👋
                  </h1>
                </div>
              </div>
              <p className="text-gray-400 mt-1 ml-1">
                {applications.length === 0
                  ? 'Your job search journey starts here. Browse live jobs below!'
                  : `You have ${pendingApplications.length} pending application${pendingApplications.length !== 1 ? 's' : ''} awaiting review.`}
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                to="/jobs"
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 text-sm"
              >
                <Search className="w-4 h-4" />
                Find Jobs
              </Link>
            </div>
          </div>
        </div>

        {/* ── Profile Completion Alert ── */}
        {profileComplete < 100 && (
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-white font-bold text-sm">
                  Profile {profileComplete}% complete
                  {nextProfileTask && <span className="text-yellow-400"> — Add your {nextProfileTask.label}</span>}
                </p>
                <div className="mt-1.5 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-green-500 rounded-full transition-all duration-700"
                    style={{ width: `${profileComplete}%` }}
                  />
                </div>
              </div>
            </div>
            <Link
              to="/profile"
              className="flex-shrink-0 text-xs font-black text-yellow-400 hover:text-yellow-300 uppercase tracking-widest flex items-center gap-1 transition-colors"
            >
              Update <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Total Applied"
            value={applications.length}
            color="purple"
            sub={applications.length > 0 ? `Last: ${formatDistanceToNow(new Date(applications[0]?.applied_at), { addSuffix: true })}` : 'No applications yet'}
          />
          <StatCard
            icon={Clock}
            label="Under Review"
            value={pendingApplications.length + reviewingApplications.length}
            color="yellow"
            sub={`${reviewingApplications.length} actively reviewing`}
          />
          <StatCard
            icon={CheckCircle}
            label="Accepted"
            value={acceptedApplications.length}
            color="green"
            sub={acceptedApplications.length > 0 ? '🎉 Congratulations!' : 'Keep applying!'}
          />
          <StatCard
            icon={Heart}
            label="Saved Jobs"
            value={savedJobs.length}
            color="red"
            sub="Ready to apply"
            link="/saved-jobs"
          />
        </div>

        {/* ── Secondary Stats Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Response Rate */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="text-gray-400 text-sm font-bold">Response Rate</span>
              </div>
              <span className={`text-2xl font-black ${responseRate >= 50 ? 'text-green-400' : responseRate >= 20 ? 'text-yellow-400' : 'text-gray-400'}`}>
                {responseRate}%
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${responseRate >= 50 ? 'bg-green-500' : responseRate >= 20 ? 'bg-yellow-500' : 'bg-gray-500'}`}
                style={{ width: `${responseRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {responseRate >= 50 ? 'Great results!' : responseRate >= 20 ? 'Above average' : 'Keep applying — volume is key'}
            </p>
          </div>

          {/* Streak */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-gray-400 text-sm font-bold">Activity Streak</span>
              </div>
              <span className="text-2xl font-black text-orange-400">{streak}d</span>
            </div>
            <div className="flex gap-1">
              {weekActivity.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-gray-700 rounded-sm overflow-hidden" style={{ height: '32px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-sm transition-all duration-500"
                      style={{ height: `${(d.count / maxActivity) * 100}%`, marginTop: `${100 - (d.count / maxActivity) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-gray-600 font-bold">{d.day[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Success Metrics */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-purple-500" />
              <span className="text-gray-400 text-sm font-bold">Outcomes</span>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Accepted', count: acceptedApplications.length, color: 'bg-green-500' },
                { label: 'Reviewing', count: reviewingApplications.length, color: 'bg-blue-500' },
                { label: 'Pending', count: pendingApplications.length, color: 'bg-yellow-500' },
                { label: 'Rejected', count: rejectedApplications.length, color: 'bg-red-500' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />
                  <span className="text-xs text-gray-400 flex-1">{label}</span>
                  <span className="text-xs text-white font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Content: Applications + Sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application History */}
          <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                Application History
              </h2>
              <Link to="/applications" className="text-xs text-purple-400 hover:text-purple-300 font-bold uppercase tracking-widest flex items-center gap-1 transition-colors">
                View All <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-700/50">
              {applications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700">
                    <FileText className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-400 font-medium mb-1">No applications yet</p>
                  <p className="text-gray-600 text-sm mb-5">Start applying to jobs to track your progress here.</p>
                  <Link to="/jobs" className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl text-sm hover:bg-purple-700 transition-all">
                    <Zap className="w-4 h-4" /> Browse Jobs
                  </Link>
                </div>
              ) : (
                applications.slice(0, 8).map((app) => (
                  <div key={app.id} className="px-5 py-4 hover:bg-gray-750 transition-colors group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gray-900 border border-gray-700 rounded-xl flex items-center justify-center flex-shrink-0 text-base font-black text-gray-400 group-hover:border-purple-500/30 transition-colors">
                          {app.company?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-sm mb-0.5 group-hover:text-purple-400 transition-colors truncate">
                            {app.job_title}
                          </h3>
                          <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {app.company}
                            {app.location && <><span className="text-gray-700">•</span><MapPin className="w-3 h-3" />{app.location}</>}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] border ${getStatusStyle(app.status)}`}>
                              {app.status}
                            </span>
                            <span className="text-[10px] text-gray-600 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}
                            </span>
                            {app.salary_range && app.salary_range !== 'Competitive' && (
                              <span className="text-[10px] text-gray-600 flex items-center gap-1">
                                <DollarSign className="w-2.5 h-2.5" />{app.salary_range}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {app.job_url && (
                        <a
                          href={app.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 p-2 bg-gray-700 rounded-lg text-gray-400 hover:bg-purple-600 hover:text-white transition-all"
                          title="View original posting"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Job Matches */}
            <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-sm font-black text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Latest Job Matches
                </h2>
                <button onClick={handleRefresh} className="text-gray-500 hover:text-gray-300 transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="divide-y divide-gray-700/50">
                {recentJobs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No matches loaded yet.</p>
                  </div>
                ) : (
                  recentJobs.map((job) => {
                    const company = typeof job.company === 'string' ? job.company : job.company.display_name;
                    const location = typeof job.location === 'string' ? job.location : job.location.display_name;
                    return (
                      <Link
                        key={job.id}
                        to="/jobs"
                        className="block px-4 py-3.5 hover:bg-gray-750 transition-colors group"
                      >
                        <h4 className="text-white font-bold text-xs mb-1 truncate group-hover:text-purple-400 transition-colors">{job.title}</h4>
                        <p className="text-gray-400 text-[10px] mb-1 truncate flex items-center gap-1">
                          <Building2 className="w-2.5 h-2.5" /> {company}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-600 flex items-center gap-0.5">
                            <MapPin className="w-2 h-2" /> {location.split(',')[0]}
                          </span>
                          <span className="text-[9px] text-purple-400 font-bold uppercase flex items-center gap-0.5">
                            View <ChevronRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
              <div className="p-3 bg-gray-800/50 border-t border-gray-700 text-center">
                <Link to="/jobs" className="text-[10px] text-purple-400 font-black hover:text-purple-300 uppercase tracking-widest transition-colors">
                  Explore All Jobs →
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
              <h2 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-500" />
                Quick Actions
              </h2>
              <div className="space-y-2">
                {[
                  { icon: Search, label: 'Browse Live Jobs', to: '/jobs', color: 'text-purple-500' },
                  { icon: Heart, label: `Saved Jobs (${savedJobs.length})`, to: '/saved-jobs', color: 'text-red-500' },
                  { icon: FileText, label: 'All Applications', to: '/applications', color: 'text-blue-500' },
                  { icon: Users, label: 'Update Profile', to: '/profile', color: 'text-green-500' },
                ].map(({ icon: Icon, label, to, color }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-3 p-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-all group border border-transparent hover:border-gray-600"
                  >
                    <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors font-medium">{label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-600 ml-auto group-hover:text-gray-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon: Icon, label, value, color, sub, link }: {
  icon: any; label: string; value: number; color: string; sub?: string; link?: string;
}) {
  const colors: Record<string, string> = {
    purple: 'bg-purple-500/10 text-purple-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    green: 'bg-green-500/10 text-green-500',
    red: 'bg-red-500/10 text-red-500',
    blue: 'bg-blue-500/10 text-blue-500',
  };

  const content = (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 hover:border-gray-600 transition-all h-full">
      <div className={`w-10 h-10 ${colors[color]} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-3xl font-black text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
      {sub && <p className="text-[10px] text-gray-600 font-medium">{sub}</p>}
    </div>
  );

  if (link) {
    return <Link to={link} className="block">{content}</Link>;
  }
  return content;
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'accepted': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'reviewing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
  }
}
