import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { useJobs } from './JobContext';
import { useSavedJobs } from './SavedJobsContext';
import { useAuth } from './AuthContext';
import {
  Search, MapPin, Briefcase, DollarSign, Filter,
  Globe, Heart, ExternalLink, CheckCircle, AlertCircle,
  Building2, XCircle, ChevronLeft, ChevronRight, Clock,
  Tag, TrendingUp, Sparkles, Eye, FileText, SortAsc,
  Zap, ArrowUpRight, Share2, Copy, X
} from 'lucide-react';
import { SUPPORTED_COUNTRIES, JOB_CATEGORIES, getCountryInfo, type AdzunaJob } from './adzuna';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const RESULTS_PER_PAGE = 20;

export default function JobListings() {
  const { jobs, loading, fetchJobs, applyForJob, hasApplied, totalJobs } = useJobs();
  const { isSaved, saveJob, unsaveJob } = useSavedJobs();
  const { user } = useAuth();

  // Search filters
  const [searchKeywords, setSearchKeywords] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('us');
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSalaryMin, setFilterSalaryMin] = useState('');
  const [filterSortBy, setFilterSortBy] = useState<'relevance' | 'date' | 'salary'>('relevance');
  const [filterMaxDays, setFilterMaxDays] = useState('30');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Job detail modal
  const [selectedJob, setSelectedJob] = useState<AdzunaJob | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'apply'>('view');

  // Apply
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  const countryInfo = getCountryInfo(selectedCountry);

  const handleSearch = (page = 1) => {
    setCurrentPage(page);
    fetchJobs({
      country: selectedCountry,
      keywords: searchKeywords,
      location: searchLocation,
      contract_time: filterType,
      category: filterCategory,
      salary_min: filterSalaryMin ? parseInt(filterSalaryMin) : undefined,
      sort_by: filterSortBy,
      max_days_old: parseInt(filterMaxDays),
      results_per_page: RESULTS_PER_PAGE,
      page,
    });
    if (page !== currentPage) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    if (!user) {
      toast.error('Please sign in to apply for jobs');
      return;
    }
    setApplying(true);
    try {
      await applyForJob(selectedJob, coverLetter);
      setViewMode('view');
      setCoverLetter('');
      const company = typeof selectedJob.company === 'string' ? selectedJob.company : selectedJob.company.display_name;
      toast.success(`🎉 Application submitted to ${company}!`);
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleSaveToggle = async (job: AdzunaJob, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user) { toast.error('Sign in to save jobs'); return; }
    try {
      if (isSaved(job.id)) {
        await unsaveJob(job.id);
        toast.success('Removed from saved jobs');
      } else {
        await saveJob(job);
        toast.success('Job saved! ❤️');
      }
    } catch {
      toast.error('Failed to update saved jobs');
    }
  };

  const handleShare = async (job: AdzunaJob, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(job.redirect_url);
      toast.success('Job link copied to clipboard!');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const formatSalary = (job: AdzunaJob) => {
    const sym = countryInfo.symbol;
    if (job.salary_min && job.salary_max) {
      return `${sym}${Math.round(job.salary_min).toLocaleString()} – ${sym}${Math.round(job.salary_max).toLocaleString()}`;
    }
    if (job.salary_min) return `From ${sym}${Math.round(job.salary_min).toLocaleString()}`;
    if (job.salary_max) return `Up to ${sym}${Math.round(job.salary_max).toLocaleString()}`;
    return 'Competitive';
  };

  const getJobType = (job: AdzunaJob) => {
    if (job.contract_time === 'full_time') return 'Full-Time';
    if (job.contract_time === 'part_time') return 'Part-Time';
    if (job.contract_type === 'contract') return 'Contract';
    if (job.contract_type === 'permanent') return 'Permanent';
    return 'Full-Time';
  };

  const getJobTypeBadgeColor = (job: AdzunaJob) => {
    if (job.contract_time === 'full_time') return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    if (job.contract_time === 'part_time') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (job.contract_type === 'contract') return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  };

  const totalPages = Math.ceil(totalJobs / RESULTS_PER_PAGE);

  const clearAllFilters = () => {
    setSearchKeywords('');
    setSearchLocation('');
    setFilterType('');
    setFilterCategory('');
    setFilterSalaryMin('');
    setFilterSortBy('relevance');
    setFilterMaxDays('30');
    setCurrentPage(1);
    fetchJobs({ country: selectedCountry, results_per_page: RESULTS_PER_PAGE });
    toast.success('Filters cleared');
  };

  const activeFilterCount = [filterType, filterCategory, filterSalaryMin, filterSortBy !== 'relevance', filterMaxDays !== '30']
    .filter(Boolean).length;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 text-white pt-12 pb-28 overflow-hidden border-b border-gray-800">
          {/* Decorative orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <Zap className="w-3.5 h-3.5" />
              Live Job Data from Adzuna API
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Dream Job</span>
              <br />Today
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Explore thousands of real, live job postings across {SUPPORTED_COUNTRIES.length} countries. Apply in seconds.
            </p>
            <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-500">
              {[
                { icon: TrendingUp, text: '50K+ Live Jobs' },
                { icon: Globe, text: `${SUPPORTED_COUNTRIES.length} Countries` },
                { icon: Zap, text: 'Instant Apply' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-purple-500" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
          <div className="bg-gray-800/95 border border-gray-700 rounded-3xl shadow-2xl shadow-black/40 p-6 md:p-8 backdrop-blur-sm">
            {/* Main Search Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
              <div className="md:col-span-3">
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-purple-400 transition-colors" />
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 bg-gray-900 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white appearance-none cursor-pointer hover:border-gray-600 transition-all text-sm font-medium"
                  >
                    {SUPPORTED_COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Job title, skills, or company..."
                    value={searchKeywords}
                    onChange={(e) => setSearchKeywords(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(1)}
                    className="w-full pl-10 pr-4 py-3.5 bg-gray-900 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 hover:border-gray-600 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="City, state, or remote..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(1)}
                    className="w-full pl-10 pr-4 py-3.5 bg-gray-900 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 hover:border-gray-600 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex gap-2">
                <button
                  onClick={() => handleSearch(1)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-3.5 rounded-2xl font-bold transition-all transform active:scale-95 shadow-lg shadow-purple-500/20 text-sm"
                >
                  Search
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`relative px-4 py-3.5 rounded-2xl transition-all border text-sm ${
                    showFilters || activeFilterCount > 0
                      ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                      : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-purple-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="mt-5 pt-5 border-t border-gray-700 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest">Job Type</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-white text-sm"
                    >
                      <option value="">All Types</option>
                      <option value="full_time">Full-time</option>
                      <option value="part_time">Part-time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest">Category</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-white text-sm"
                    >
                      {JOB_CATEGORIES.map(cat => (
                        <option key={cat.tag} value={cat.tag}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest">
                      Min Salary ({countryInfo.symbol})
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                      <input
                        type="number"
                        placeholder="e.g. 50000"
                        value={filterSalaryMin}
                        onChange={(e) => setFilterSalaryMin(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-600 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest">Sort By</label>
                    <div className="relative">
                      <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                      <select
                        value={filterSortBy}
                        onChange={(e) => setFilterSortBy(e.target.value as any)}
                        className="w-full pl-8 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-white text-sm"
                      >
                        <option value="relevance">Most Relevant</option>
                        <option value="date">Most Recent</option>
                        <option value="salary">Highest Salary</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Posted within:</label>
                    {[7, 14, 30, 90].map(days => (
                      <button
                        key={days}
                        onClick={() => setFilterMaxDays(days.toString())}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          filterMaxDays === days.toString()
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {days}d
                      </button>
                    ))}
                  </div>
                  {activeFilterCount > 0 && (
                    <button onClick={clearAllFilters} className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 transition-colors">
                      <X className="w-3 h-3" /> Clear all filters
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Results summary bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                {loading ? (
                  <span className="flex items-center gap-2 text-purple-400">
                    <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    Searching live databases...
                  </span>
                ) : totalJobs > 0 ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-white font-bold">{totalJobs.toLocaleString()}</span>
                    <span>live vacancies in</span>
                    <span className="text-purple-400 font-bold">{countryInfo.flag} {countryInfo.name}</span>
                  </span>
                ) : (
                  <span className="text-gray-500">Search to discover opportunities</span>
                )}
              </div>
              {totalPages > 1 && (
                <span className="text-xs text-gray-500 font-medium">
                  Page {currentPage} of {totalPages.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Category Pills */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {JOB_CATEGORIES.slice(1, 9).map(cat => (
              <button
                key={cat.tag}
                onClick={() => {
                  setFilterCategory(cat.tag);
                  handleSearch(1);
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border ${
                  filterCategory === cat.tag
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Job Listings Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-800 border border-gray-700 rounded-3xl p-8 animate-pulse">
                  <div className="flex gap-4 mb-6">
                    <div className="w-14 h-14 bg-gray-700 rounded-2xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-700 rounded w-1/3" />
                      <div className="h-5 bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="h-12 bg-gray-700 rounded-xl" />
                    <div className="h-12 bg-gray-700 rounded-xl" />
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="h-3 bg-gray-700 rounded" />
                    <div className="h-3 bg-gray-700 rounded w-5/6" />
                    <div className="h-3 bg-gray-700 rounded w-4/6" />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 h-11 bg-gray-700 rounded-2xl" />
                    <div className="w-11 h-11 bg-gray-700 rounded-2xl" />
                    <div className="w-11 h-11 bg-gray-700 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-24 bg-gray-800/30 border border-gray-800 rounded-3xl">
              <div className="bg-gray-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-700">
                <AlertCircle className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No jobs found</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-8">
                Try different keywords, a broader location, or use the search above to start discovering opportunities.
              </p>
              <button onClick={clearAllFilters} className="px-8 py-3 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all">
                Start Fresh Search
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {jobs.map((job) => {
                  const company = typeof job.company === 'string' ? job.company : job.company.display_name;
                  const location = typeof job.location === 'string' ? job.location : job.location.display_name;
                  const applied = hasApplied(job.id);
                  const saved = isSaved(job.id);

                  return (
                    <div
                      key={job.id}
                      onClick={() => { setSelectedJob(job); setViewMode('view'); }}
                      className="group bg-gray-800 border border-gray-700 rounded-3xl p-6 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-300 flex flex-col cursor-pointer relative overflow-hidden"
                    >
                      {/* Hover glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/[0.03] group-hover:to-blue-500/[0.03] transition-all duration-300 rounded-3xl pointer-events-none" />

                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-4 flex-1 min-w-0">
                          {/* Company Avatar */}
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl flex items-center justify-center text-lg font-black text-white border border-gray-600 group-hover:border-purple-500/30 transition-colors">
                            {company.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getJobTypeBadgeColor(job)}`}>
                                {getJobType(job)}
                              </span>
                              <span className="text-gray-600 text-xs">•</span>
                              <span className="text-gray-500 text-[10px] font-bold uppercase flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {formatDistanceToNow(new Date(job.created), { addSuffix: true })}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors leading-snug truncate">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-1.5 text-gray-400 text-sm font-medium">
                              <Building2 className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                              <span className="truncate">{company}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleSaveToggle(job, e)}
                          className={`flex-shrink-0 ml-2 p-2.5 rounded-xl transition-all duration-300 ${
                            saved
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                              : 'bg-gray-900/80 text-gray-500 border border-gray-700 hover:border-red-500/30 hover:text-red-400'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Location & Salary */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2.5 p-3 bg-gray-900/60 rounded-xl border border-gray-700/50">
                          <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          <div className="overflow-hidden">
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Location</p>
                            <p className="text-xs text-gray-200 font-bold truncate">{location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 bg-gray-900/60 rounded-xl border border-gray-700/50">
                          <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <div className="overflow-hidden">
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Salary</p>
                            <p className="text-xs text-gray-200 font-bold truncate">{formatSalary(job)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Category tag */}
                      {job.category && (
                        <div className="mb-3">
                          <span className="inline-flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                            <Tag className="w-3 h-3" />
                            {job.category.label}
                          </span>
                        </div>
                      )}

                      {/* Description preview */}
                      <p className="text-gray-400 mb-5 line-clamp-2 text-sm leading-relaxed">
                        {job.description.replace(/<[^>]*>/g, '').substring(0, 180)}...
                      </p>

                      {/* Actions */}
                      <div className="mt-auto flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJob(job);
                            setViewMode(applied ? 'view' : 'apply');
                          }}
                          disabled={applied}
                          className={`flex-1 px-4 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                            applied
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default'
                              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/20 active:scale-95'
                          }`}
                        >
                          {applied ? (
                            <span className="flex items-center justify-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5" /> Applied
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-1.5">
                              <Zap className="w-3.5 h-3.5" /> Quick Apply
                            </span>
                          )}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedJob(job); setViewMode('view'); }}
                          className="px-3 py-3 bg-gray-900/80 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 rounded-2xl transition-all"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleShare(job, e)}
                          className="px-3 py-3 bg-gray-900/80 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 rounded-2xl transition-all"
                          title="Copy job link"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleSearch(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-2xl font-bold disabled:opacity-40 hover:border-gray-500 transition-all text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  
                  <div className="flex gap-1.5">
                    {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                      let page: number;
                      if (totalPages <= 7) {
                        page = i + 1;
                      } else if (currentPage <= 4) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        page = totalPages - 6 + i;
                      } else {
                        page = currentPage - 3 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => handleSearch(page)}
                          className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                            page === currentPage
                              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                              : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handleSearch(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-2xl font-bold disabled:opacity-40 hover:border-gray-500 transition-all text-sm"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ============ JOB DETAIL / APPLY MODAL ============ */}
        {selectedJob && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-md"
            onClick={() => setSelectedJob(null)}
          >
            <div
              className="bg-gray-800 border border-gray-700 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
                      {(typeof selectedJob.company === 'string' ? selectedJob.company : selectedJob.company.display_name).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border mb-1 ${getJobTypeBadgeColor(selectedJob)}`}>
                        {getJobType(selectedJob)}
                      </span>
                      <h2 className="text-xl font-black text-white leading-tight">{selectedJob.title}</h2>
                      <p className="text-purple-400 font-bold text-sm flex items-center gap-1.5 mt-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {typeof selectedJob.company === 'string' ? selectedJob.company : selectedJob.company.display_name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="flex-shrink-0 p-2 hover:bg-gray-700 rounded-xl transition-colors text-gray-500 hover:text-white"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { icon: MapPin, label: 'Location', value: typeof selectedJob.location === 'string' ? selectedJob.location : selectedJob.location.display_name, color: 'text-purple-500' },
                    { icon: DollarSign, label: 'Salary', value: formatSalary(selectedJob), color: 'text-green-500' },
                    { icon: Clock, label: 'Posted', value: formatDistanceToNow(new Date(selectedJob.created), { addSuffix: true }), color: 'text-blue-500' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="bg-gray-900/60 p-3 rounded-xl border border-gray-700/50">
                      <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1 flex items-center gap-1">
                        <Icon className={`w-3 h-3 ${color}`} />{label}
                      </p>
                      <p className="text-xs text-white font-bold truncate">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Tab switcher */}
                <div className="flex gap-1 mt-4 bg-gray-900/50 p-1 rounded-xl border border-gray-700/50">
                  <button
                    onClick={() => setViewMode('view')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'view' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <span className="flex items-center justify-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Job Details</span>
                  </button>
                  <button
                    onClick={() => setViewMode('apply')}
                    disabled={hasApplied(selectedJob.id)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'apply' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'} ${hasApplied(selectedJob.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      {hasApplied(selectedJob.id) ? <><CheckCircle className="w-3.5 h-3.5" /> Applied</> : <><Zap className="w-3.5 h-3.5" /> Quick Apply</>}
                    </span>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto flex-1 p-6">
                {viewMode === 'view' ? (
                  <div className="space-y-5">
                    {selectedJob.category && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-300 font-medium">{selectedJob.category.label}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Job Description</h3>
                      <div
                        className="text-sm text-gray-300 leading-relaxed prose prose-invert max-w-none prose-p:text-gray-300 prose-li:text-gray-300"
                        dangerouslySetInnerHTML={{
                          __html: selectedJob.description
                            .replace(/<br\s*\/?>/gi, '\n')
                            .replace(/<\/p>/gi, '</p>')
                            .replace(/\n{3,}/g, '\n\n')
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-sm text-blue-300">
                      <p className="font-bold mb-1 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Pro Tip</p>
                      <p className="text-blue-300/80">Personalise your cover letter by referencing specific skills from the job description above. This dramatically increases your response rate.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                        Cover Letter <span className="text-gray-600 normal-case">(optional but recommended)</span>
                      </label>
                      <textarea
                        rows={7}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder={`Hi, I'm excited to apply for the ${selectedJob.title} role at ${typeof selectedJob.company === 'string' ? selectedJob.company : selectedJob.company.display_name}.\n\nMy experience with [relevant skills] makes me a strong candidate because...\n\nI look forward to discussing how I can contribute to your team.`}
                        className="w-full px-5 py-4 bg-gray-900 border border-gray-700 rounded-2xl text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none text-sm leading-relaxed"
                      />
                      <p className="text-right text-xs text-gray-600 mt-1">{coverLetter.length} characters</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-700 flex-shrink-0">
                <div className="flex gap-3">
                  <a
                    href={selectedJob.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl font-bold text-sm transition-all"
                  >
                    <ArrowUpRight className="w-4 h-4" /> Source
                  </a>
                  <button
                    onClick={(e) => handleSaveToggle(selectedJob, e)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all border ${
                      isSaved(selectedJob.id)
                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isSaved(selectedJob.id) ? 'fill-current' : ''}`} />
                    {isSaved(selectedJob.id) ? 'Saved' : 'Save'}
                  </button>
                  {viewMode === 'view' ? (
                    <button
                      onClick={() => setViewMode('apply')}
                      disabled={hasApplied(selectedJob.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                        hasApplied(selectedJob.id)
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default'
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/20'
                      }`}
                    >
                      {hasApplied(selectedJob.id) ? <><CheckCircle className="w-4 h-4" /> Already Applied</> : <><Zap className="w-4 h-4" /> Apply Now</>}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setViewMode('view')}
                        className="px-5 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl font-bold text-sm transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleApply}
                        disabled={applying}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                      >
                        {applying ? (
                          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                        ) : (
                          <><Zap className="w-4 h-4" /> Submit Application</>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
