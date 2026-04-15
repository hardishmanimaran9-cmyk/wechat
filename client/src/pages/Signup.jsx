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
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl
                          bg-white/[0.03] border border-white/5 shadow-2xl mb-6 rotate-12 hover:rotate-0 transition-transform duration-500">
            <svg className="w-10 h-10 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-gradient tracking-tight">Join Chatwe</h1>
          <p className="text-slate-400 text-sm mt-3 font-medium">Start your next-gen chat journey.</p>
        </div>

        {/* Signup Form */}
        <div className="glass rounded-[2.5rem] p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest px-4 py-3 rounded-2xl">
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest px-4 py-3 rounded-2xl">
                {success}
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="signup-email" className="block text-slate-500 text-[10px] font-black mb-2 uppercase tracking-[0.2em]">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@vibe.com"
                required
                className="w-full bg-white/5 text-slate-100 px-5 py-4 rounded-2xl text-sm
                           border border-white/5 outline-none
                           focus:border-violet-500/50 focus:bg-white/[0.08]
                           transition-all placeholder:text-slate-600 font-medium"
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="signup-password" className="block text-slate-500 text-[10px] font-black mb-2 uppercase tracking-[0.2em]">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 vibes"
                required
                className="w-full bg-white/5 text-slate-100 px-5 py-4 rounded-2xl text-sm
                           border border-white/5 outline-none
                           focus:border-violet-500/50 focus:bg-white/[0.08]
                           transition-all placeholder:text-slate-600 font-medium"
              />
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="signup-confirm" className="block text-slate-500 text-[10px] font-black mb-2 uppercase tracking-[0.2em]">
                Confirm Password
              </label>
              <input
                id="signup-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat the vibe"
                required
                className="w-full bg-white/5 text-slate-100 px-5 py-4 rounded-2xl text-sm
                           border border-white/5 outline-none
                           focus:border-violet-500/50 focus:bg-white/[0.08]
                           transition-all placeholder:text-slate-600 font-medium"
              />
            </div>

            {/* Submit button */}
            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600 text-white
                         py-4 rounded-2xl font-black text-sm uppercase tracking-widest
                         hover:scale-[1.02] hover:brightness-110 transition-all duration-300
                         disabled:opacity-40 disabled:cursor-not-allowed
                         shadow-2xl shadow-violet-500/20 active:scale-95"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-slate-500 text-sm mt-8 font-medium">
            Already a member?{' '}
            <Link to="/login" className="text-violet-400 hover:text-pink-400 font-bold transition-colors">
              sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
