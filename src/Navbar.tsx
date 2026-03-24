import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, LogOut, User, LayoutDashboard, BarChart, Search, Heart, Menu, X, Shield } from 'lucide-react';
import { useAuth } from './AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    signOut();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  // Determine role from profile (which has the actual role field)
  const userRole = profile?.role || 'job_seeker';
  const isAdmin = profile?.is_admin || user?.isAdmin || false;

  const getDashboardLink = () => {
    if (!user) return '/';
    if (isAdmin) return '/admin';
    if (userRole === 'recruiter') return '/recruiter-dashboard';
    return '/dashboard';
  };

  const navLinks = user ? [
    { to: getDashboardLink(), label: 'Dashboard', icon: LayoutDashboard },
    { to: '/jobs', label: 'Find Jobs', icon: Search },
    { to: '/applications', label: 'Applications', icon: BarChart },
    { to: '/saved-jobs', label: 'Saved', icon: Heart },
  ] : [
    { to: '/jobs', label: 'Browse Jobs', icon: Search },
  ];

  if (isAdmin) {
    navLinks.push({ to: '/analytics', label: 'Analytics', icon: BarChart });
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? getDashboardLink() : '/'} className="flex items-center space-x-2.5 group flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white hidden sm:block">
              JOB<span className="text-purple-500">PORTAL</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  isActive(link.to)
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}

            {user ? (
              <>
                <div className="h-5 w-px bg-gray-800 mx-1.5" />
                <div className="flex items-center gap-1.5">
                  <NotificationBell />
                  <Link
                    to="/profile"
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                      isActive('/profile')
                        ? 'text-purple-400 bg-purple-500/10 border border-purple-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                    title="My Profile"
                  >
                    {/* Avatar with initials */}
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
                      {initials}
                    </div>
                    <span className="text-sm font-bold hidden lg:block truncate max-w-[100px]">
                      {profile?.full_name?.split(' ')[0] || 'Profile'}
                    </span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={`p-2 rounded-xl transition-all ${isActive('/admin') ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800'}`}
                      title="Admin Panel"
                    >
                      <Shield className="w-4 h-4" />
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-gray-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20"
                >
                  Get Started →
                </Link>
              </div>
            )}
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-3">
            {user && <NotificationBell />}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive(link.to)
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <div className="h-px bg-gray-800 my-2" />
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 font-bold hover:bg-gray-800 hover:text-white transition-all"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-[10px] font-black text-white">
                    {initials}
                  </div>
                  <div>
                    <div className="text-sm text-white">{profile?.full_name || 'My Profile'}</div>
                    <div className="text-[10px] text-gray-500">{user.email}</div>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 font-bold hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 text-center text-gray-400 font-bold hover:text-white bg-gray-800 rounded-xl text-sm transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl text-sm"
                >
                  Get Started →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
