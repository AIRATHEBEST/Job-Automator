import React from 'react';
import { useJobs } from './JobContext';
import { Briefcase, MapPin, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function Applications() {
  const { applications, loading } = useJobs();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'accepted':
        return 'bg-green-500/20 text-green-300';
      case 'rejected':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-400">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">My Applications</h1>
          <p className="text-xl text-purple-100">Track the status of your job applications</p>
        </div>
      </div>

      {/* Applications List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {applications.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No applications yet</h3>
            <p className="text-gray-400 mb-6">Start applying to jobs to see them here</p>
            <a
              href="/jobs"
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-600 transition-all"
            >
              Browse Jobs
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {application.job_title}
                    </h3>
                    <p className="text-gray-300 mb-2">{application.company}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{application.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Briefcase className="w-4 h-4" />
                    <span>{application.job_type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <DollarSign className="w-4 h-4" />
                    <span>{application.salary_range}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>Applied on {format(new Date(application.applied_at), 'MMM dd, yyyy')}</span>
                </div>

                {application.cover_letter && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Cover Letter</h4>
                    <p className="text-gray-400 text-sm bg-gray-900 p-4 rounded-lg">
                      {application.cover_letter}
                    </p>
                  </div>
                )}

                <a
                  href={application.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Original Job Posting
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
