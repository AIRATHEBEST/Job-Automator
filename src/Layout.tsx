import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Briefcase, Twitter, Linkedin, Github, Mail, Home, ChevronRight
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Breadcrumbs */}
      {pathnames.length > 0 && (
        <div className="bg-gray-800/50 border-b border-gray-800 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center space-x-2 text-sm text-gray-400">
              <Link to="/" className="hover:text-purple-400 transition-colors flex items-center">
                <Home className="w-4 h-4 mr-1" />
                <span>Home</span>
              </Link>
              {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const name = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
                return (
                  <React.Fragment key={to}>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                    {last ? (
                      <span className="text-purple-400 font-medium">{name}</span>
                    ) : (
                      <Link to={to} className="hover:text-purple-400 transition-colors">
                        {name}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <main className={`flex-grow ${pathnames.length === 0 ? 'pt-16' : ''}`}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800/60 border-t border-gray-700 pt-12 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tighter text-white">
                  JOB<span className="text-purple-500">PORTAL</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Connecting top talent with the world's best companies. Real jobs. Real opportunities. Real careers.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500 font-medium">Live — Powered by Adzuna API</span>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Job Seekers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/jobs" className="hover:text-purple-400 transition-colors">Browse Jobs</Link></li>
                <li><Link to="/dashboard" className="hover:text-purple-400 transition-colors">Dashboard</Link></li>
                <li><Link to="/saved-jobs" className="hover:text-purple-400 transition-colors">Saved Jobs</Link></li>
                <li><Link to="/applications" className="hover:text-purple-400 transition-colors">My Applications</Link></li>
                <li><Link to="/profile" className="hover:text-purple-400 transition-colors">Profile Settings</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Employers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/post-job" className="hover:text-purple-400 transition-colors">Post a Job</Link></li>
                <li><Link to="/recruiter-dashboard" className="hover:text-purple-400 transition-colors">Recruiter Dashboard</Link></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Talent Search</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Pricing Plans</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Connect</h4>
              <div className="flex space-x-3 mb-4">
                <a href="#" className="w-9 h-9 bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:bg-purple-600 hover:text-white transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-600 hover:text-white transition-all">
                  <Github className="w-4 h-4" />
                </a>
                <a href="mailto:Ntshongwanae@gmail.com" className="w-9 h-9 bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:bg-purple-600 hover:text-white transition-all">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
              <p className="text-xs text-gray-500">
                Built by <span className="text-purple-400 font-medium">Emihle Ntshongwana</span>
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} JobPortal by Emihle Ntshongwana. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-xs text-gray-500">
              <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                All Systems Operational
              </span>
              <span className="text-gray-600">v2.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
