// ============================================
// LOGIN PAGE - pages/Login.jsx
// ============================================
// Email and password login form.
// On success, stores JWT token and redirects to chat dashboard.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/'); // Redirect to chat dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen auth-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-gradient-to-br from-chatwe-green to-chatwe-greenDark shadow-lg shadow-chatwe-green/20 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-chatwe-text">Welcome back</h1>
          <p className="text-chatwe-textSec text-sm mt-2">Sign in to continue to Chatwe</p>
        </div>

        {/* Login Form */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="login-email" className="block text-chatwe-textSec text-xs font-medium mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full bg-chatwe-input text-chatwe-text px-4 py-3 rounded-xl text-sm
                           border border-chatwe-border/30 outline-none
                           focus:border-chatwe-green/50 focus:ring-1 focus:ring-chatwe-green/20
                           transition-all placeholder:text-chatwe-textSec/40"
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="login-password" className="block text-chatwe-textSec text-xs font-medium mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full bg-chatwe-input text-chatwe-text px-4 py-3 rounded-xl text-sm
                           border border-chatwe-border/30 outline-none
                           focus:border-chatwe-green/50 focus:ring-1 focus:ring-chatwe-green/20
                           transition-all placeholder:text-chatwe-textSec/40"
              />
            </div>

            {/* Submit button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-chatwe-green to-chatwe-greenDark text-white
                         py-3 rounded-xl font-medium text-sm
                         hover:from-chatwe-greenLight hover:to-chatwe-green transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-lg shadow-chatwe-green/20 hover:shadow-chatwe-green/30
                         active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Signup link */}
          <p className="text-center text-chatwe-textSec text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-chatwe-green hover:text-chatwe-greenLight font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
