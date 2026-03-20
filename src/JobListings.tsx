import { useState } from 'react';
import Layout from './Layout';
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
    const companyName = typeof job.company === 'string' ? job.company : job.company.display_name;
    const locationName = typeof job.location === 'string' ? job.location : job.location.display_name;
    const jobType = (job as any).type || (job as any).contract_time || 'Full-time';

    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || jobType === typeFilter;
    const matchesLocation = !locationFilter || locationName.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote'];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Jobs</h1>
          <p className="text-gray-400">Find your next career opportunity</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs or companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Types</option>
                {jobTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing <span className="text-white font-semibold">{filteredJobs.length}</span> jobs
          </p>
        </div>

        {/* Job Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredJobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="block bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-purple-500 transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
                    <p className="text-gray-400 font-medium">
                      {typeof job.company === 'string' ? job.company : job.company.display_name}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-sm font-medium rounded-full">
                    {formatDistanceToNow(new Date((job as any).created_at || job.created), { addSuffix: true })}
                  </span>
                </div>

                <p className="text-gray-400 mb-4 line-clamp-2">{job.description}</p>

                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center text-gray-400">
                    <MapPin className="w-4 h-4 mr-1" />
                    {typeof job.location === 'string' ? job.location : job.location.display_name}
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Briefcase className="w-4 h-4 mr-1" />
                    {(job as any).type || (job as any).contract_time || 'Full-time'}
                  </div>
                  {job.salary_min && job.salary_max && (
                    <div className="flex items-center text-gray-400">
                      <DollarSign className="w-4 h-4 mr-1" />
                      ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                    </div>
                  )}
                </div>

                {(job as any).requirements && (job as any).requirements.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(job as any).requirements.slice(0, 3).map((req: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-gray-900 text-gray-400 text-xs rounded-full">
                        {req}
                      </span>
                    ))}
                    {(job as any).requirements.length > 3 && (
                      <span className="px-3 py-1 bg-gray-900 text-gray-400 text-xs rounded-full">
                        +{(job as any).requirements.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}

            {filteredJobs.length === 0 && (
              <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-2xl">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No jobs found matching your criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
