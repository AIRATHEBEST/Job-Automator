import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, LayoutDashboard, FileText, User, LogOut, Plus, Shield } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="min-h-screen bg-background">
      <nav className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-text">JobPortal</span>
              </Link>
            </div>

            <div className="flex items-center space-x-1">
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-primary text-white'
                    : 'text-textSecondary hover:bg-surface hover:text-text'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
              </Link>

              <Link
                to="/jobs"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/jobs')
                    ? 'bg-primary text-white'
                    : 'text-textSecondary hover:bg-surface hover:text-text'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4" />
                  <span>Jobs</span>
                </div>
              </Link>

              <Link
                to="/applications"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/applications')
                    ? 'bg-primary text-white'
                    : 'text-textSecondary hover:bg-surface hover:text-text'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Applications</span>
                </div>
              </Link>

              {profile?.is_admin && (
                <Link
                  to="/admin"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/admin')
                      ? 'bg-primary text-white'
                      : 'text-textSecondary hover:bg-surface hover:text-text'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </div>
                </Link>
              )}

              <Link
                to="/profile"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/profile')
                    ? 'bg-primary text-white'
                    : 'text-textSecondary hover:bg-surface hover:text-text'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </div>
              </Link>

              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg text-textSecondary hover:bg-surface hover:text-text transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
