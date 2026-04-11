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
    <div className="p-3">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          id="search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by email..."
          className="flex-1 bg-chatwe-input text-chatwe-text text-sm px-4 py-2.5 rounded-lg
                     border border-chatwe-border/50 outline-none
                     focus:border-chatwe-green/50 transition-colors
                     placeholder:text-chatwe-textSec/60"
        />
        <button
          id="search-button"
          type="submit"
          disabled={searching}
          className="bg-chatwe-green text-white px-4 py-2.5 rounded-lg text-sm font-medium
                     hover:bg-chatwe-greenLight transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     active:scale-95"
        >
          {searching ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </form>

      {/* Status Message */}
      {message && (
        <p className={`text-xs mt-2 px-1 ${message.includes('✅') ? 'text-chatwe-green' : 'text-chatwe-textSec'}`}>
          {message}
        </p>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="mt-3 space-y-1">
          {results.map((foundUser) => (
            <div
              key={foundUser._id}
              className="flex items-center justify-between p-3 rounded-lg
                         bg-chatwe-input/50 hover:bg-chatwe-hover transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-chatwe-green/20 flex items-center justify-center">
                  <span className="text-chatwe-green text-sm font-semibold">
                    {foundUser.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-chatwe-text text-sm truncate max-w-[140px]">
                  {foundUser.email}
                </span>
              </div>
              <button
                onClick={() => handleSendRequest(foundUser._id)}
                className="text-xs bg-chatwe-green/20 text-chatwe-green px-3 py-1.5 rounded-full
                           hover:bg-chatwe-green/30 transition-colors font-medium"
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
