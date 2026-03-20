import React, { useState } from 'react';
import Layout from './Layout';
import { useJobs } from './JobContext';
import { useSavedJobs } from './SavedJobsContext';
import { 
  Search, MapPin, Briefcase, DollarSign, Filter, 
  Globe, Heart, ExternalLink, CheckCircle, AlertCircle,
  Building2, XCircle
} from 'lucide-react';
import { SUPPORTED_COUNTRIES, type AdzunaJob } from './adzuna';
import toast from 'react-hot-toast';

export default function JobListings() {
  const { jobs, loading, fetchJobs, applyForJob, hasApplied, totalJobs } = useJobs();
  const { isSaved, saveJob, unsaveJob } = useSavedJobs();
  
  // Search filters
  const [searchKeywords, setSearchKeywords] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('us');
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterSalaryMin, setFilterSalaryMin] = useState('');
  
  const [selectedJob, setSelectedJob] = useState<AdzunaJob | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  const handleSearch = () => {
    fetchJobs({
      country: selectedCountry,
      keywords: searchKeywords,
      location: searchLocation,
      contract_time: filterType,
      salary_min: filterSalaryMin ? parseInt(filterSalaryMin) : undefined,
      results_per_page: 20,
    });
    toast.success('Search results updated');
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    
    setApplying(true);
    try {
      await applyForJob(selectedJob, coverLetter);
      setShowApplyModal(false);
      setCoverLetter('');
      toast.success(`Application sent to ${typeof selectedJob.company === 'string' ? selectedJob.company : selectedJob.company.display_name}`);
    } catch (error) {
      toast.error('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleSaveToggle = async (job: AdzunaJob) => {
    try {
      if (isSaved(job.id)) {
        await unsaveJob(job.id);
        toast.success('Job removed from saved');
      } else {
        await saveJob(job);
        toast.success('Job saved for later');
      }
    } catch (error) {
      toast.error('Failed to update saved jobs');
    }
  };

  const formatSalary = (job: AdzunaJob) => {
    if (job.salary_min && job.salary_max) {
      return `$${Math.round(job.salary_min).toLocaleString()} - $${Math.round(job.salary_max).toLocaleString()}`;
    }
    if (job.salary_min) return `From $${Math.round(job.salary_min).toLocaleString()}`;
    if (job.salary_max) return `Up to $${Math.round(job.salary_max).toLocaleString()}`;
    return 'Salary not specified';
  };

  const formatDistanceToNow = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 text-white pt-12 pb-24 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
              Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Next Big Career</span> Move
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Browse thousands of live job opportunities across 11 countries. Real-time data, instant applications.
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-90">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-purple-400 transition-colors" />
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full pl-12 pr-10 py-4 bg-gray-900 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white appearance-none cursor-pointer hover:border-gray-600 transition-all"
                  >
                    {SUPPORTED_COUNTRIES.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="md:col-span-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    value={searchKeywords}
                    onChange={(e) => setSearchKeywords(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 hover:border-gray-600 transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="City, state, or region"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 hover:border-gray-600 transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex gap-2">
                <button
                  onClick={handleSearch}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-2xl font-bold transition-all transform active:scale-95 shadow-lg shadow-purple-500/20"
                >
                  Search
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-4 rounded-2xl transition-all border ${
                    showFilters ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Job Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-white"
                  >
                    <option value="">All Employment Types</option>
                    <option value="full_time">Full-time</option>
                    <option value="part_time">Part-time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Minimum Annual Salary</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      placeholder="e.g. 60000"
                      value={filterSalaryMin}
                      onChange={(e) => setFilterSalaryMin(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {totalJobs > 0 && (
              <div className="mt-6 flex items-center justify-between text-gray-400 text-sm font-medium">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Showing {jobs.length} of {totalJobs.toLocaleString()} live vacancies
                </span>
                <span className="text-xs uppercase tracking-widest font-bold text-gray-500">
                  Adzuna API Integrated
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Job Listings Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="text-center py-24">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
              <p className="mt-6 text-gray-400 font-medium animate-pulse">Scanning global databases...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-24 bg-gray-800/50 border border-gray-800 rounded-3xl">
              <div className="bg-gray-900 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-700">
                <AlertCircle className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No matches found</h3>
              <p className="text-gray-400 max-w-md mx-auto">Try broadening your search keywords or adjusting your location filters.</p>
              <button 
                onClick={() => {
                  setSearchKeywords('');
                  setSearchLocation('');
                  setFilterType('');
                  setFilterSalaryMin('');
                  fetchJobs();
                }}
                className="mt-8 text-purple-400 font-bold hover:text-purple-300 transition-colors underline decoration-2 underline-offset-4"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="group bg-gray-800 border border-gray-700 rounded-3xl p-8 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-300 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
                          {job.contract_time === 'full_time' ? 'Full-Time' : job.contract_time === 'part_time' ? 'Part-Time' : 'Contract'}
                        </span>
                        <span className="text-gray-600 text-xs">•</span>
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-tighter">
                          {formatDistanceToNow(job.created)}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors leading-tight">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-400 font-semibold">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span>{typeof job.company === 'string' ? job.company : job.company.display_name}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSaveToggle(job)}
                      className={`p-3 rounded-2xl transition-all duration-300 ${
                        isSaved(job.id)
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                          : 'bg-gray-900 text-gray-500 border border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <Heart className={`w-6 h-6 ${isSaved(job.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-2xl border border-gray-700/50">
                      <MapPin className="w-5 h-5 text-purple-500" />
                      <div className="overflow-hidden">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Location</p>
                        <p className="text-sm text-gray-200 font-bold truncate">
                          {typeof job.location === 'string' ? job.location : job.location.display_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-2xl border border-gray-700/50">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <div className="overflow-hidden">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Salary</p>
                        <p className="text-sm text-gray-200 font-bold truncate">
                          {formatSalary(job)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 mb-8 line-clamp-3 text-sm leading-relaxed">
                    {job.description.replace(/<[^>]*>/g, '')}
                  </p>

                  <div className="mt-auto flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setShowApplyModal(true);
                      }}
                      disabled={hasApplied(job.id)}
                      className={`flex-1 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                        hasApplied(job.id)
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/20'
                      }`}
                    >
                      {hasApplied(job.id) ? (
                        <span className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Applied
                        </span>
                      ) : 'Instant Apply'}
                    </button>
                    <a
                      href={job.redirect_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-4 bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 rounded-2xl transition-all flex items-center justify-center"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Apply Modal */}
        {showApplyModal && selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-md">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-gray-700">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-white mb-2 leading-tight">{selectedJob.title}</h2>
                    <p className="text-purple-400 font-bold flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {typeof selectedJob.company === 'string' ? selectedJob.company : selectedJob.company.display_name}
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowApplyModal(false)}
                    className="p-2 hover:bg-gray-700 rounded-xl transition-colors text-gray-500 hover:text-white"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700/50">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Job Type</p>
                    <p className="text-sm text-white font-bold">{selectedJob.contract_time === 'full_time' ? 'Full-Time' : 'Other'}</p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700/50">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Salary</p>
                    <p className="text-sm text-white font-bold">{formatSalary(selectedJob)}</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                  Why are you a great fit? (Cover Letter)
                </label>
                <textarea
                  rows={6}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell the recruiter about your experience and passion for this role..."
                  className="w-full px-6 py-4 bg-gray-900 border border-gray-700 rounded-2xl text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                />
                
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="flex-1 px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="flex-[2] px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
