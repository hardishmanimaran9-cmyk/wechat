import { useState } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await API.put('/users/profile', { username, bio });
      updateUser(response.data.user);
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md glass p-8 rounded-3xl shadow-2xl fade-in overflow-hidden border border-white/10">
        {/* Decorative background glows */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-600/20 rounded-full blur-[80px]" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-600/20 rounded-full blur-[80px]" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-gradient tracking-tight">Profile</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Email (Locked)</label>
              <div className="w-full px-4 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-slate-400 font-medium">
                {user?.email}
              </div>
            </div>

            {/* Username Input */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-violet-400 mb-2 ml-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="How should we call you?"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:border-violet-500/50 
                           focus:ring-2 focus:ring-violet-500/10 transition-all outline-none text-slate-100 font-medium placeholder:text-slate-600"
              />
            </div>

            {/* Bio Input */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-pink-400 mb-2 ml-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a bit about yourself..."
                rows={3}
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:border-pink-500/50 
                           focus:ring-2 focus:ring-pink-500/10 transition-all outline-none text-slate-100 font-medium placeholder:text-slate-600 resize-none"
              />
            </div>

            {/* Messages */}
            {error && <p className="text-red-400 text-xs font-bold ml-1 animate-pulse">{error}</p>}
            {success && <p className="text-emerald-400 text-xs font-bold ml-1 animate-pulse">{success}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-black 
                         tracking-tight shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all
                         ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-violet-500/25'}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
