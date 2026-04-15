// ============================================
// SEARCH BAR - components/SearchBar.jsx
// ============================================
// Allows users to search for other users by email.
// Displays search results with "Send Request" button.

import { useState } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const SearchBar = ({ onRequestSent }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const { socket } = useSocket();

  // Search for users by email
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    setSearching(true);
    setMessage('');
    try {
      const response = await API.get(`/users/search?email=${searchQuery}`);
      setResults(response.data.users);
      if (response.data.users.length === 0) {
        setMessage('No users found with that email.');
      }
    } catch (error) {
      setMessage('Error searching users. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // Send a chat request to a user
  const handleSendRequest = async (receiverId) => {
    try {
      await API.post('/requests/send', { receiverId });

      // Notify the receiver via socket
      if (socket) {
        socket.emit('new_request', {
          receiverId,
          senderEmail: user.email,
        });
      }

      setMessage('Request sent successfully! ✅');
      setResults([]); // Clear search results
      setSearchQuery('');

      // Notify parent to refresh data
      if (onRequestSent) onRequestSent();
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Error sending request.'
      );
    }
  };

  return (
    <div className="p-4">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vibes..."
            className="w-full bg-white/5 text-slate-100 text-sm px-4 py-3 rounded-2xl
                       border border-white/5 outline-none
                       focus:border-violet-500/50 focus:bg-white/[0.08] transition-all
                       placeholder:text-slate-500 font-medium"
          />
        </div>
        <button
          id="search-button"
          type="submit"
          disabled={searching}
          className="bg-violet-600 text-white px-5 rounded-2xl text-sm font-bold shadow-[0_4px_10px_rgba(139,92,246,0.3)]
                     hover:brightness-110 hover:scale-105 transition-all duration-300
                     disabled:opacity-40 disabled:cursor-not-allowed
                     active:scale-95"
        >
          {searching ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </form>

      {/* Status Message */}
      {message && (
        <p className={`text-[11px] font-bold uppercase tracking-widest mt-3 px-1 ${message.includes('✅') ? 'text-green-400' : 'text-slate-500'}`}>
          {message}
        </p>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((foundUser) => (
            <div
              key={foundUser._id}
              className="flex items-center justify-between p-3.5 rounded-2xl
                         glass-light hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden rotate-2">
                  <span className="text-violet-400 text-base font-black -rotate-2">
                    {foundUser.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-slate-100 text-[13px] font-bold truncate max-w-[120px]">
                    {foundUser.email}
                  </p>
                  <p className="text-slate-500 text-[10px] uppercase font-black tracking-tighter">Available</p>
                </div>
              </div>
              <button
                onClick={() => handleSendRequest(foundUser._id)}
                className="text-[10px] font-black uppercase tracking-widest bg-violet-500/10 text-violet-400 px-4 py-2 rounded-full
                           hover:bg-violet-500 hover:text-white transition-all shadow-[0_2px_8px_rgba(139,92,246,0.1)] active:scale-90"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
