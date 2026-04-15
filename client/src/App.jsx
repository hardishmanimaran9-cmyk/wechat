// ============================================
// APP COMPONENT - App.jsx
// ============================================
// Main application component with routing setup.
// Wraps everything in AuthProvider and SocketProvider.

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChatDashboard from './pages/ChatDashboard';
import NotificationCenter from './components/NotificationCenter';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationCenter />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected route - only accessible when logged in */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ChatDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
