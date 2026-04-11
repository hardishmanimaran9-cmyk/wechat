// ============================================
// PROTECTED ROUTE - components/ProtectedRoute.jsx
// ============================================
// Wraps routes that require authentication.
// Redirects to /login if user is not logged in.

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-chatwe-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-chatwe-green border-t-transparent rounded-full animate-spin"></div>
          <p className="text-chatwe-textSec text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, show the protected content
  return children;
};

export default ProtectedRoute;
