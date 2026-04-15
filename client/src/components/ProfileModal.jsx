import { useState, useRef } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Helper to get image URL
  const getImageUrl = (filename) => {
    if (!filename) return null;
    const baseURL = import.meta.env.VITE_API_URL || 
                    (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://wechat-1-vt2t.onrender.com');
    // Remove /api if present at the end of baseURL
    const cleanBaseURL = baseURL.replace(/\/api$/, '');
    return `${cleanBaseURL}/uploads/${filename}`;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await API.put('/users/profile', { username, bio });
      updateUser(response.data.user);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large (max 5MB)');
      return;
    }

    setUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await API.post('/users/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(response.data.user);
      setSuccess('Profile picture updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const profilePicUrl = getImageUrl(user?.profilePicture);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md glass p-8 rounded-3xl shadow-2xl fade-in overflow-hidden border border-white/10">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-600/20 rounded-full blur-[80px]" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-600/20 rounded-full blur-[80px]" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-gradient tracking-tight">Profile</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-all font-bold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div 
                className={`w-28 h-28 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl relative transition-all
                           ${uploading ? 'opacity-50' : 'group-hover:border-violet-500/50'}`}
              >
                {profilePicUrl ? (
                  <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center text-3xl font-black text-violet-400">
                    {(user?.username || user?.email)?.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Upload Overlay */}
                <button 
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploading}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>

                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-4">Click avatar to change</p>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Email (Locked)</label>
              <div className="w-full px-4 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-slate-400 font-medium">
                {user?.email}
              </div>
            </div>

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

            {error && <p className="text-red-400 text-xs font-bold ml-1 animate-pulse">{error}</p>}
            {success && <p className="text-emerald-400 text-xs font-bold ml-1 animate-pulse">{success}</p>}

            <button
              type="submit"
              disabled={loading || uploading}
              className={`w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-black 
                         tracking-tight shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all
                         ${(loading || uploading) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-violet-500/25'}`}
            >
              {(loading || uploading) ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                'Save Profile'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
