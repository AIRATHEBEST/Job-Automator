import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './AuthContext';
import { SavedJobsProvider } from './SavedJobsContext';
import { NotificationProvider } from './NotificationContext';
import { JobProvider } from './JobContext';
import Navbar from './Navbar';
import Login from './Login';
import Register from './Register';
import JobListings from './JobListings';
import Dashboard from './Dashboard';
import RecruiterDashboard from './RecruiterDashboard';
import PostJob from './PostJob';
import AdminDashboard from './AdminDashboard';
import Analytics from './Analytics';
import Profile from './Profile';
import Applications from './Applications';
import SavedJobs from './SavedJobs';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SavedJobsProvider>
          <NotificationProvider>
            <JobProvider>
              <div className="min-h-screen bg-gray-900">
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3500,
                    style: {
                      background: '#1f2937',
                      color: '#f9fafb',
                      border: '1px solid #374151',
                      borderRadius: '16px',
                      padding: '14px 18px',
                      fontSize: '14px',
                      fontWeight: '500',
                    },
                    success: {
                      iconTheme: { primary: '#a855f7', secondary: '#fff' },
                    },
                    error: {
                      iconTheme: { primary: '#ef4444', secondary: '#fff' },
                    },
                  }}
                />
                <Navbar />
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<JobListings />} />
                  <Route path="/jobs" element={<JobListings />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected — any logged-in user */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/applications"
                    element={
                      <ProtectedRoute>
                        <Applications />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/saved-jobs"
                    element={
                      <ProtectedRoute>
                        <SavedJobs />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected — recruiter */}
                  <Route
                    path="/recruiter-dashboard"
                    element={
                      <ProtectedRoute requiredRole="recruiter">
                        <RecruiterDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/post-job"
                    element={
                      <ProtectedRoute requiredRole="recruiter">
                        <PostJob />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected — admin */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <Analytics />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </JobProvider>
          </NotificationProvider>
        </SavedJobsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
