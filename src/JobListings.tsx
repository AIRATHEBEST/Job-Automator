import { useState } from 'react';
import Layout from '../components/Layout';
import { useJobs } from './JobContext';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, DollarSign, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function JobListings() {
  const { jobs, loading } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote'];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Browse Jobs</h1>
          <p className="text-textSecondary">Find your next career opportunity</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textSecondary" />
              <input
                type="text"
                placeholder="Search jobs or companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textSecondary" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              >
                <option value="all">All Types</option>
                {jobTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textSecondary" />
              <input
                type="text"
                placeholder="Location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-textSecondary">
            Showing <span className="text-text font-semibold">{filteredJobs.length}</span> jobs
          </p>
        </div>

        {/* Job Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredJobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="block bg-surface border border-border rounded-2xl p-6 hover:border-primary transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-text mb-2">{job.title}</h3>
                    <p className="text-textSecondary font-medium">{job.company}</p>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </span>
                </div>

                <p className="text-textSecondary mb-4 line-clamp-2">{job.description}</p>

                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center text-textSecondary">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-textSecondary">
                    <Briefcase className="w-4 h-4 mr-1" />
                    {job.type}
                  </div>
                  {job.salary_min && job.salary_max && (
                    <div className="flex items-center text-textSecondary">
                      <DollarSign className="w-4 h-4 mr-1" />
                      ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {job.requirements.slice(0, 3).map((req, idx) => (
                    <span key={idx} className="px-3 py-1 bg-background text-textSecondary text-xs rounded-full">
                      {req}
                    </span>
                  ))}
                  {job.requirements.length > 3 && (
                    <span className="px-3 py-1 bg-background text-textSecondary text-xs rounded-full">
                      +{job.requirements.length - 3} more
                    </span>
                  )}
                </div>
              </Link>
            ))}

            {filteredJobs.length === 0 && (
              <div className="text-center py-12 bg-surface border border-border rounded-2xl">
                <Briefcase className="w-16 h-16 text-textSecondary mx-auto mb-4" />
                <p className="text-textSecondary">No jobs found matching your criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
