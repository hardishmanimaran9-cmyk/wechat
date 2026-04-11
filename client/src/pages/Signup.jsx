// ============================================
// SIGNUP PAGE - pages/Signup.jsx
// ============================================
// Registration form with email, password, and confirm password.
// On success, redirects to login page.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password);
      setSuccess('Account created successfully! Redirecting to login...');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-chatwe-text">Create account</h1>
          <p className="text-chatwe-textSec text-sm mt-2">Join Chatwe and start chatting</p>
        </div>

        {/* Signup Form */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="bg-chatwe-green/10 border border-chatwe-green/20 text-chatwe-green text-sm px-4 py-3 rounded-xl">
                {success}
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="signup-email" className="block text-chatwe-textSec text-xs font-medium mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                id="signup-email"
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
              <label htmlFor="signup-password" className="block text-chatwe-textSec text-xs font-medium mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                className="w-full bg-chatwe-input text-chatwe-text px-4 py-3 rounded-xl text-sm
                           border border-chatwe-border/30 outline-none
                           focus:border-chatwe-green/50 focus:ring-1 focus:ring-chatwe-green/20
                           transition-all placeholder:text-chatwe-textSec/40"
              />
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="signup-confirm" className="block text-chatwe-textSec text-xs font-medium mb-2 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                id="signup-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                className="w-full bg-chatwe-input text-chatwe-text px-4 py-3 rounded-xl text-sm
                           border border-chatwe-border/30 outline-none
                           focus:border-chatwe-green/50 focus:ring-1 focus:ring-chatwe-green/20
                           transition-all placeholder:text-chatwe-textSec/40"
              />
            </div>

            {/* Submit button */}
            <button
              id="signup-submit"
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
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-chatwe-textSec text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-chatwe-green hover:text-chatwe-greenLight font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
