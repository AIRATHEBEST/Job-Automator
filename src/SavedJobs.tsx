import React, { useState } from 'react';
import Layout from './Layout';
import { Heart, MapPin, DollarSign, Briefcase, ExternalLink, Trash2, Search, Clock, Zap } from 'lucide-react';
import { useSavedJobs } from './SavedJobsContext';
import { useJobs } from './JobContext';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function SavedJobs() {
  const { savedJobs, loading, unsaveJob } = useSavedJobs();
  const { applyForJob, hasApplied } = useJobs();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [applying, setApplying] = useState<string | null>(null);

  const filtered = savedJobs.filter(job => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      job.job_title?.toLowerCase().includes(q) ||
      job.company?.toLowerCase().includes(q) ||
      job.location?.toLowerCase().includes(q)
    );
  });

  const handleUnsave = async (jobId: string) => {
    try {
      await unsaveJob(jobId);
      toast.success('Removed from saved jobs');
    } catch {
      toast.error('Failed to remove saved job');
    }
  };

  const handleApplyFromSaved = async (job: any) => {
    if (!user) { toast.error('Please sign in to apply'); return; }
    setApplying(job.job_id);
    try {
      // Build a minimal AdzunaJob-like object from saved job data
      const fakeJob: any = {
        id: job.job_id,
        title: job.job_title,
        company: { display_name: job.company },
        location: { display_name: job.location, area: [] },
        category: { label: job.job_type, tag: '' },
        salary_min: undefined,
        salary_max: undefined,
        description: '',
        contract_time: job.job_type === 'Full-time' ? 'full_time' : undefined,
        contract_type: job.job_type === 'Contract' ? 'contract' : undefined,
        created: job.saved_at,
        redirect_url: job.job_url,
      };
      await applyForJob(fakeJob, '');
      toast.success(`Applied to ${job.job_title} at ${job.company}!`);
    } catch (err: any) {
      if (err?.message?.includes('duplicate') || err?.message?.includes('already')) {
        toast.error('You have already applied for this job');
      } else {
        toast.error('Failed to apply — try applying directly on the source page');
      }
    } finally {
      setApplying(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-1 flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500 fill-current" />
              Saved Jobs
            </h1>
            <p className="text-gray-400 text-sm">
              {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved · Ready to apply when you are
            </p>
          </div>
          <Link
            to="/jobs"
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-500/20"
          >
            <Search className="w-4 h-4" />
            Find More Jobs
          </Link>
        </div>

        {/* Search */}
        {savedJobs.length > 0 && (
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Filter by title, company, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 outline-none text-sm hover:border-gray-600 transition-all"
            />
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400 text-sm font-medium">Loading saved jobs...</p>
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="text-center py-20 bg-gray-800/30 border border-gray-800 rounded-3xl">
            <div className="w-20 h-20 bg-gray-800 border border-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Heart className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">No saved jobs yet</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              Save jobs you're interested in and they'll appear here for easy access.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              <Search className="w-4 h-4" /> Browse Jobs
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No saved jobs match "<span className="text-white">{search}</span>"
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filtered.map((job) => {
              const applied = hasApplied(job.job_id);
              return (
                <div
                  key={job.id}
                  className="bg-gray-800 border border-gray-700 rounded-3xl p-6 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/5 transition-all flex flex-col"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl flex items-center justify-center text-xl font-black text-white border border-gray-600">
                        {job.company?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-lg mb-1 leading-snug truncate">{job.job_title}</h3>
                        <div className="flex items-center gap-1.5 text-gray-400 text-sm font-medium">
                          <Briefcase className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{job.company}</span>
                        </div>
                      </div>
                    </div>
                    <span className="flex-shrink-0 px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
                      {job.job_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 p-2.5 bg-gray-900/60 rounded-xl border border-gray-700/50">
                      <MapPin className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Location</p>
                        <p className="text-xs text-gray-200 font-bold truncate">{job.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-gray-900/60 rounded-xl border border-gray-700/50">
                      <DollarSign className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Salary</p>
                        <p className="text-xs text-gray-200 font-bold truncate">{job.salary_range}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-gray-600 mb-4">
                    <Clock className="w-3 h-3" />
                    Saved {formatDistanceToNow(new Date(job.saved_at), { addSuffix: true })}
                  </div>

                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() => handleApplyFromSaved(job)}
                      disabled={applied || applying === job.job_id}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                        applied
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default'
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/20'
                      }`}
                    >
                      {applying === job.job_id ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : applied ? (
                        <>✓ Applied</>
                      ) : (
                        <><Zap className="w-3.5 h-3.5" /> Quick Apply</>
                      )}
                    </button>
                    <a
                      href={job.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2.5 bg-gray-900/80 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 rounded-2xl transition-all flex items-center justify-center"
                      title="View on source site"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleUnsave(job.job_id)}
                      className="px-3 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-2xl transition-all flex items-center justify-center"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
