import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getStoredUser } from './auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'job_seeker' | 'recruiter' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await getStoredUser();
    if (user) {
      setIsAuthenticated(true);
      // Check role from database
      const { query } = await import('./db');
      const result = await query('SELECT role, is_admin FROM profiles WHERE id = $1', [user.userId]);
      if (result.length > 0) {
        const profile = result[0];
        setUserRole(profile.is_admin ? 'admin' : profile.role);
      }
    } else {
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
