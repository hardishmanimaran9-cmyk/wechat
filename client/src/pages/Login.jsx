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
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl
                          bg-white/[0.03] border border-white/5 shadow-2xl mb-6 rotate-12 hover:rotate-0 transition-transform duration-500">
            <svg className="w-10 h-10 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-gradient tracking-tight">Chatwe</h1>
          <p className="text-slate-400 text-sm mt-3 font-medium">Next-gen vibes await. Sign in.</p>
        </div>

        {/* Login Form */}
        <div className="glass rounded-[2.5rem] p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest px-4 py-3 rounded-2xl">
                {error}
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="login-email" className="block text-slate-500 text-[10px] font-black mb-2 uppercase tracking-[0.2em]">
                Email
              </label>
              <input
                id="login-email"
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
              <label htmlFor="login-password" className="block text-slate-500 text-[10px] font-black mb-2 uppercase tracking-[0.2em]">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 text-slate-100 px-5 py-4 rounded-2xl text-sm
                           border border-white/5 outline-none
                           focus:border-violet-500/50 focus:bg-white/[0.08]
                           transition-all placeholder:text-slate-600 font-medium"
              />
            </div>

            {/* Submit button */}
            <button
              id="login-submit"
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
                  Loading...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Signup link */}
          <p className="text-center text-slate-500 text-sm mt-8 font-medium">
            New here?{' '}
            <Link to="/signup" className="text-violet-400 hover:text-pink-400 font-bold transition-colors">
              create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
