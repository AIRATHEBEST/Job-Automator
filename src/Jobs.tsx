import { useState } from 'react';
import { Briefcase, MapPin, DollarSign, Search, Filter, Building2, ExternalLink, Heart, Globe } from 'lucide-react';
import { useJobs } from './JobContext';
import { useSavedJobs } from './SavedJobsContext';
import { SUPPORTED_COUNTRIES } from './adzuna';
import type { AdzunaJob } from './adzuna';

export default function Jobs() {
  const { jobs, loading, fetchJobs, applyForJob, hasApplied, totalJobs } = useJobs();
  const { isSaved, saveJob, unsaveJob } = useSavedJobs();
  const [selectedJob, setSelectedJob] = useState<AdzunaJob | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  
  // Search filters
  const [searchKeywords, setSearchKeywords] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('us');
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterSalaryMin, setFilterSalaryMin] = useState('');

  const handleSearch = () => {
    fetchJobs({
      country: selectedCountry,
      keywords: searchKeywords,
      location: searchLocation,
      contract_time: filterType,
      salary_min: filterSalaryMin ? parseInt(filterSalaryMin) : undefined,
      results_per_page: 20,
    });
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    
    setApplying(true);
    try {
      await applyForJob(selectedJob, coverLetter);
      setShowApplyModal(false);
      setCoverLetter('');
      alert('Application submitted successfully!');
    } catch (error) {
      alert('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleSaveToggle = async (job: AdzunaJob) => {
    try {
      if (isSaved(job.id)) {
        await unsaveJob(job.id);
      } else {
        await saveJob(job);
      }
    } catch (error) {
      alert('Failed to update saved jobs');
    }
  };

  const formatSalary = (job: AdzunaJob) => {
    if (job.salary_min && job.salary_max) {
      return `$${Math.round(job.salary_min).toLocaleString()} - $${Math.round(job.salary_max).toLocaleString()}`;
    }
    if (job.salary_min) {
      return `From $${Math.round(job.salary_min).toLocaleString()}`;
    }
    if (job.salary_max) {
      return `Up to $${Math.round(job.salary_max).toLocaleString()}`;
    }
    return 'Salary not specified';
  };

  const getJobType = (job: AdzunaJob) => {
    if (job.contract_time === 'full_time') return 'Full-time';
    if (job.contract_time === 'part_time') return 'Part-time';
    if (job.contract_type === 'contract') return 'Contract';
    return 'Full-time';
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">Find Your Dream Job</h1>
          <p className="text-xl text-purple-100">Browse thousands of job opportunities from top companies worldwide</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-neutral-800 rounded-lg shadow-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white appearance-none cursor-pointer"
                >
                  {SUPPORTED_COUNTRIES.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Job title, keywords..."
                  value={searchKeywords}
                  onChange={(e) => setSearchKeywords(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-neutral-400"
                />
              </div>
            </div>
            <div className="md:col-span-1">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Location..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-neutral-400"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-600 transition-all"
              >
                Search Jobs
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-neutral-700 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Job Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                >
                  <option value="">All Types</option>
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Minimum Salary</label>
                <input
                  type="number"
                  placeholder="e.g., 50000"
                  value={filterSalaryMin}
                  onChange={(e) => setFilterSalaryMin(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-neutral-400"
                />
              </div>
            </div>
          )}

          {totalJobs > 0 && (
            <div className="mt-4 text-neutral-400 text-sm">
              Found {totalJobs.toLocaleString()} jobs in {SUPPORTED_COUNTRIES.find(c => c.code === selectedCountry)?.name}
            </div>
          )}
        </div>
      </div>

      {/* Job Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-neutral-400">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 bg-neutral-800 rounded-lg">
            <Briefcase className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
            <p className="text-neutral-400">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-neutral-800 rounded-lg p-6 hover:shadow-xl transition-all border border-neutral-700 hover:border-purple-500/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{job.title}</h3>
                    <div className="flex items-center gap-2 text-neutral-300 mb-2">
                      <Building2 className="w-4 h-4" />
                      <span>{job.company.display_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveToggle(job)}
                      className={`p-2 rounded-lg transition-colors ${
                        isSaved(job.id)
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600'
                      }`}
                      title={isSaved(job.id) ? 'Remove from saved' : 'Save for later'}
                    >
                      <Heart className={`w-5 h-5 ${isSaved(job.id) ? 'fill-current' : ''}`} />
                    </button>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                      {getJobType(job)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location.display_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatSalary(job)}</span>
                  </div>
                </div>

                <p className="text-neutral-300 mb-4 line-clamp-3">
                  {job.description.replace(/<[^>]*>/g, '').substring(0, 200)}...
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setShowApplyModal(true);
                    }}
                    disabled={hasApplied(job.id)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      hasApplied(job.id)
                        ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600'
                    }`}
                  >
                    {hasApplied(job.id) ? 'Already Applied' : 'Apply Now'}
                  </button>
                  <a
                    href={job.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-800 rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Apply for {selectedJob.title}</h2>
            <p className="text-neutral-300 mb-4">at {selectedJob.company.display_name}</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Cover Letter
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-neutral-400"
                placeholder="Tell us why you're a great fit for this position..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-600 transition-all disabled:opacity-50"
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
              <button
                onClick={() => {
                  setShowApplyModal(false);
                  setCoverLetter('');
                }}
                className="px-6 py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
