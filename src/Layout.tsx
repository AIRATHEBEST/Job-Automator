import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { 
  Briefcase, LayoutDashboard, FileText, User, LogOut, Shield, 
  ChevronRight, Home, Twitter, Linkedin, Github, Mail 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <nav className="bg-gray-800 border-b border-gray-700 fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">JobPortal</span>
              </Link>
            </div>

            <div className="flex items-center space-x-1">
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden md:inline">Dashboard</span>
                </div>
              </Link>

              <Link
                to="/jobs"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/jobs')
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4" />
                  <span className="hidden md:inline">Jobs</span>
                </div>
              </Link>

              <Link
                to="/applications"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/applications')
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden md:inline">Applications</span>
                </div>
              </Link>

              {(user as any)?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/admin')
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span className="hidden md:inline">Admin</span>
                  </div>
                </Link>
              )}

              <Link
                to="/profile"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/profile')
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">Profile</span>
                </div>
              </Link>

              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Sign Out</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumbs */}
      {pathnames.length > 0 && (
        <div className="bg-gray-800/50 border-b border-gray-800 pt-20">
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
      <footer className="bg-gray-800 border-t border-gray-700 pt-12 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center font-bold text-white">
                  J
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  JobPortal
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Connecting top talent with the world's best companies. Your career journey starts here.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/jobs" className="hover:text-purple-400 transition-colors">Browse Jobs</Link></li>
                <li><Link to="/dashboard" className="hover:text-purple-400 transition-colors">Dashboard</Link></li>
                <li><Link to="/profile" className="hover:text-purple-400 transition-colors">My Profile</Link></li>
                <li><Link to="/saved-jobs" className="hover:text-purple-400 transition-colors">Saved Jobs</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:bg-purple-600 hover:text-white transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:bg-purple-600 hover:text-white transition-all">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:bg-purple-600 hover:text-white transition-all">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:bg-purple-600 hover:text-white transition-all">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Job Application Portal. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                System Operational
              </span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
