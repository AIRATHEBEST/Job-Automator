import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SavedJobsProvider>
          <NotificationProvider>
            <JobProvider>
              <div className="min-h-screen bg-gray-900">
                <Navbar />
                <Routes>
                  <Route path="/" element={<JobListings />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/jobs" element={<JobListings />} />
                  
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  
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
                  
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  
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
