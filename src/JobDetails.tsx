import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { useJobs } from './JobContext';
import { supabase } from './supabase';
import { MapPin, Briefcase, DollarSign, Calendar, CheckCircle, Building, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applyForJob, applications } = useJobs();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);

  const hasApplied = applications.some(app => app.job_id === id);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await applyForJob(id!, coverLetter);
      setShowApplyModal(false);
      setCoverLetter('');
    } catch (error: any) {
      alert(error.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-textSecondary">Job not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/jobs')}
          className="flex items-center text-textSecondary hover:text-text mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </button>

        <div className="bg-surface border border-border rounded-2xl p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-text mb-2">{job.title}</h1>
              <div className="flex items-center text-textSecondary mb-4">
                <Building className="w-5 h-5 mr-2" />
                <span className="text-lg">{job.company}</span>
              </div>
            </div>
            {hasApplied ? (
              <span className="px-4 py-2 bg-success/10 text-success rounded-lg font-medium flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Applied
              </span>
            ) : (
              <button
                onClick={() => setShowApplyModal(true)}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors"
              >
                Apply Now
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center text-textSecondary">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center text-textSecondary">
              <Briefcase className="w-5 h-5 mr-2" />
              <span>{job.type}</span>
            </div>
            {job.salary_min && job.salary_max && (
              <div className="flex items-center text-textSecondary">
                <DollarSign className="w-5 h-5 mr-2" />
                <span>${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center text-textSecondary">
              <Calendar className="w-5 h-5 mr-2" />
              <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-text mb-3">Job Description</h2>
              <p className="text-textSecondary leading-relaxed">{job.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text mb-3">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((req: string, idx: number) => (
                  <li key={idx} className="flex items-start text-textSecondary">
                    <CheckCircle className="w-5 h-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text mb-3">Benefits</h2>
              <ul className="space-y-2">
                {job.benefits.map((benefit: string, idx: number) => (
                  <li key={idx} className="flex items-start text-textSecondary">
                    <CheckCircle className="w-5 h-5 mr-2 text-success flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-text mb-4">Apply for {job.title}</h2>
            <p className="text-textSecondary mb-6">
              Submit your application with a cover letter explaining why you're a great fit for this position.
            </p>

            <div className="mb-6">
              <label htmlFor="coverLetter" className="block text-sm font-medium text-text mb-2">
                Cover Letter
              </label>
              <textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Tell us why you're interested in this position..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 px-6 py-3 bg-background border border-border text-text font-medium rounded-lg hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying || !coverLetter.trim()}
                className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
