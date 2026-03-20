import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, User, LayoutDashboard, BarChart } from 'lucide-react';
import { useAuth } from './AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.isAdmin) return '/admin';
    if (user.role === 'recruiter') return '/recruiter-dashboard';
    return '/dashboard';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Briefcase className="w-8 h-8 text-purple-500" />
            <span className="text-xl font-bold text-white">JobPortal</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/jobs"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Browse Jobs
            </Link>

            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>

                {user.isAdmin && (
                  <Link
                    to="/analytics"
                    className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
                  >
                    <BarChart className="w-5 h-5" />
                    <span>Analytics</span>
                  </Link>
                )}

                <NotificationBell />

                <Link
                  to="/profile"
                  className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
