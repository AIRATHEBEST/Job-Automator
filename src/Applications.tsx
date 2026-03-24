import React, { useState } from 'react';
import Layout from './Layout';
import { useJobs } from './JobContext';
import { 
  FileText, Clock, CheckCircle, XCircle, Search, 
  Building2, MapPin, DollarSign, ArrowUpRight, 
  Filter, ChevronDown, Briefcase, Eye
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { id: 'all', label: 'All', color: 'text-white' },
  { id: 'pending', label: 'Pending', color: 'text-yellow-400' },
  { id: 'reviewing', label: 'Reviewing', color: 'text-blue-400' },
  { id: 'accepted', label: 'Accepted', color: 'text-green-400' },
  { id: 'rejected', label: 'Rejected', color: 'text-red-400' },
];

export default function Applications() {
  const { applications, loading } = useJobs();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const filtered = applications
    .filter(app => activeTab === 'all' || app.status === activeTab)
    .filter(app => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        app.job_title?.toLowerCase().includes(q) ||
        app.company?.toLowerCase().includes(q) ||
        app.location?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const aDate = new Date(a.applied_at).getTime();
      const bDate = new Date(b.applied_at).getTime();
      return sortBy === 'newest' ? bDate - aDate : aDate - bDate;
    });

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  function getStatusStyle(status: string) {
    switch (status) {
      case 'accepted': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'reviewing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'accepted': return CheckCircle;
      case 'rejected': return XCircle;
      case 'reviewing': return Eye;
      default: return Clock;
    }
  }

  if (loading && applications.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-1 flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-500" />
              My Applications
            </h1>
            <p className="text-gray-400 text-sm">
              Track and manage all your job applications in one place
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide bg-gray-800 border border-gray-700 rounded-2xl p-1.5">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-gray-700 text-white shadow'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-lg font-black ${
                activeTab === tab.id ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                {counts[tab.id as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by job title, company, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 outline-none text-sm transition-all hover:border-gray-600"
          />
        </div>

        {/* Applications List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-gray-800/30 border border-gray-800 rounded-3xl">
            <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700">
              <Briefcase className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {searchQuery ? 'No matches found' : activeTab === 'all' ? 'No applications yet' : `No ${activeTab} applications`}
            </h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              {searchQuery
                ? 'Try a different search term.'
                : activeTab === 'all'
                ? 'Browse jobs and start applying to see your applications here.'
                : `You have no ${activeTab} applications right now.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(app => {
              const StatusIcon = getStatusIcon(app.status);
              const isExpanded = expandedApp === app.id;
              return (
                <div
                  key={app.id}
                  className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden hover:border-gray-600 transition-all"
                >
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => setExpandedApp(isExpanded ? null : app.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1 min-w-0">
                        {/* Company Avatar */}
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl flex items-center justify-center text-xl font-black text-white border border-gray-600">
                          {app.company?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                            <h3 className="text-white font-bold text-base truncate">{app.job_title}</h3>
                            <span className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(app.status)}`}>
                              <StatusIcon className="w-3 h-3" />
                              {app.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-gray-500" />
                              {app.company}
                            </span>
                            {app.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gray-500" />
                                {app.location}
                              </span>
                            )}
                            {app.job_type && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3 text-gray-500" />
                                {app.job_type}
                              </span>
                            )}
                            {app.salary_range && app.salary_range !== 'Competitive' && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-gray-500" />
                                {app.salary_range}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              Applied {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}
                            </span>
                            <span className="text-gray-700">·</span>
                            <span>{format(new Date(app.applied_at), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-700/50 pt-4 space-y-4">
                      {/* Application Timeline */}
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Application Timeline</p>
                        <div className="flex items-center gap-0">
                          {[
                            { label: 'Applied', done: true, current: app.status === 'pending' },
                            { label: 'Review', done: ['reviewing', 'accepted', 'rejected'].includes(app.status), current: app.status === 'reviewing' },
                            { label: 'Decision', done: ['accepted', 'rejected'].includes(app.status), current: ['accepted', 'rejected'].includes(app.status) },
                          ].map((step, i) => (
                            <React.Fragment key={step.label}>
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                                  step.done
                                    ? app.status === 'rejected' && step.label === 'Decision'
                                      ? 'bg-red-500/20 border-red-500 text-red-400'
                                      : 'bg-green-500/20 border-green-500 text-green-400'
                                    : 'bg-gray-900 border-gray-700 text-gray-600'
                                }`}>
                                  {step.done ? (
                                    app.status === 'rejected' && step.label === 'Decision'
                                      ? <XCircle className="w-4 h-4" />
                                      : <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    i + 1
                                  )}
                                </div>
                                <span className={`text-[9px] font-bold mt-1 ${step.current ? 'text-purple-400' : step.done ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {step.label}
                                </span>
                              </div>
                              {i < 2 && (
                                <div className={`flex-1 h-0.5 mb-4 mx-1 ${step.done ? 'bg-green-500/30' : 'bg-gray-700'}`} />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {/* Cover letter preview */}
                      {app.cover_letter && (
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Your Cover Letter</p>
                          <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-4 text-xs text-gray-300 leading-relaxed line-clamp-4 italic">
                            "{app.cover_letter}"
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-1">
                        {app.job_url && (
                          <a
                            href={app.job_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold text-xs transition-all"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" /> View Original Job
                          </a>
                        )}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`Applied for: ${app.job_title} at ${app.company} on ${format(new Date(app.applied_at), 'MMM d, yyyy')}`);
                            toast.success('Copied to clipboard');
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-900/60 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl font-bold text-xs transition-all border border-gray-700"
                        >
                          Copy Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
