import { Heart, MapPin, DollarSign, Briefcase, ExternalLink, Trash2 } from 'lucide-react';
import { useSavedJobs } from '../contexts/SavedJobsContext';

export default function SavedJobs() {
  const { savedJobs, loading, unsaveJob } = useSavedJobs();

  const handleUnsave = async (jobId: string) => {
    try {
      await unsaveJob(jobId);
    } catch (error) {
      alert('Failed to remove saved job');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-10 h-10 fill-current" />
            <h1 className="text-4xl font-bold">Saved Jobs</h1>
          </div>
          <p className="text-xl text-purple-100">
            {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved for later
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-neutral-400">Loading saved jobs...</p>
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="text-center py-12 bg-neutral-800 rounded-lg">
            <Heart className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No saved jobs yet</h3>
            <p className="text-neutral-400 mb-6">Start saving jobs you're interested in to view them here</p>
            <a
              href="/jobs"
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-600 transition-all"
            >
              Browse Jobs
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {savedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-neutral-800 rounded-lg p-6 hover:shadow-xl transition-all border border-neutral-700 hover:border-purple-500/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{job.job_title}</h3>
                    <div className="flex items-center gap-2 text-neutral-300 mb-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{job.company}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                    {job.job_type}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <DollarSign className="w-4 h-4" />
                    <span>{job.salary_range}</span>
                  </div>
                </div>

                <div className="text-sm text-neutral-500 mb-4">
                  Saved {new Date(job.saved_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>

                <div className="flex gap-2">
                  <a
                    href={job.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-600 transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Job
                  </a>
                  <button
                    onClick={() => handleUnsave(job.job_id)}
                    className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
