// ============================================
// SIDEBAR - components/Sidebar.jsx
// ============================================
// Left sidebar containing:
// - User info header (with clickable profile picture)
// - Search bar
// - Tab switcher (Friends / Requests)
// - Friends list with online status
// - Pending requests with Accept/Reject

import { useState, useEffect, useRef } from 'react';
import SearchBar from './SearchBar';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Sidebar = ({ selectedUser, onSelectUser }) => {
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'requests'
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const { user, logout, updateUser } = useAuth();
  const { socket, onlineUsers } = useSocket();
  
  // Profile picture upload states
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch friends list
  const fetchFriends = async () => {
    setLoadingFriends(true);
    try {
      const response = await API.get('/users/friends');
      setFriends(response.data.friends);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  // Fetch pending requests
  const fetchRequests = async () => {
    try {
      const response = await API.get('/requests/pending');
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  // Fetch data on mount and when tab changes
  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, []);

  // Listen for real-time updates via socket
  useEffect(() => {
    if (!socket) return;

    // When a new request comes in
    socket.on('request_received', () => {
      fetchRequests();
    });

    // When a request we sent is accepted/rejected
    socket.on('request_updated', () => {
      fetchFriends();
      fetchRequests();
    });

    return () => {
      socket.off('request_received');
      socket.off('request_updated');
    };
  }, [socket]);

  // Handle accept/reject request
  const handleRespond = async (requestId, action) => {
    try {
      await API.post('/requests/respond', { requestId, action });

      // Notify sender via socket
      const request = requests.find((r) => r._id === requestId);
      if (socket && request) {
        socket.emit('request_response', {
          senderId: request.from._id,
          action,
        });
      }

      // Refresh data
      fetchFriends();
      fetchRequests();
    } catch (error) {
      console.error('Error responding to request:', error);
    }
  };

  // Check if a user is online
  const isOnline = (userId) => onlineUsers.includes(userId);

  // Handle user uploading a new profile picture
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    setUploadingImage(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        // Create canvas to shrink image
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 150;
        const MAX_HEIGHT = 150;
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions preserving aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 string
        const base64String = canvas.toDataURL('image/jpeg', 0.8);

        try {
          // Send to backend
          const response = await API.put('/users/profile-picture', { profilePicture: base64String });
          // Update global auth state instantly
          updateUser(response.data.user);
        } catch (error) {
          console.error("Error uploading image", error);
          alert("Failed to upload image");
        } finally {
          setUploadingImage(false);
          // Reset hidden file input
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full md:w-[380px] lg:w-[420px] h-full glass border-r border-white/5 flex flex-col z-20">
      {/* ---- Header ---- */}
      <div className="px-4 py-4 bg-transparent flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          
          {/* Hidden File Input for Avatar Upload */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />

          {/* User avatar (Clickable to upload) */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500
                       flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)] cursor-pointer hover:scale-105 transition-all relative group overflow-hidden"
            title="Upload Profile Picture"
          >
            {user?.profilePicture ? (
               <img src={user.profilePicture} alt="Profile DP" className="w-full h-full object-cover" />
            ) : (
               <span className="text-white font-bold text-lg">
                 {user?.email?.charAt(0).toUpperCase()}
               </span>
            )}
            
            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            
            {/* Loading Spinner */}
            {uploadingImage && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div>
            <p className="text-chatwe-text text-sm font-medium truncate max-w-[180px]">
              {user?.email}
            </p>
            <p className="text-chatwe-green text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-chatwe-green rounded-full online-dot"></span>
              Online
            </p>
          </div>
        </div>

        {/* Logout button */}
        <button
          id="logout-button"
          onClick={logout}
          className="text-chatwe-icon hover:text-red-400 transition-colors p-2 rounded-lg
                     hover:bg-red-400/10"
          title="Logout"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* ---- Search Bar ---- */}
      <SearchBar
        onRequestSent={() => {
          fetchRequests();
          fetchFriends();
        }}
      />

      {/* ---- Tab Switcher ---- */}
      <div className="flex border-b border-chatwe-border/20">
        <button
          id="friends-tab"
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-4 text-sm font-semibold transition-all duration-300 relative
            ${activeTab === 'friends'
              ? 'text-violet-400'
              : 'text-slate-500 hover:text-slate-300'
            }`}
        >
          Friends {friends.length > 0 && `(${friends.length})`}
          {activeTab === 'friends' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 to-pink-500" />}
        </button>
        <button
          id="requests-tab"
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-4 text-sm font-semibold transition-all duration-300 relative
            ${activeTab === 'requests'
              ? 'text-violet-400'
              : 'text-slate-500 hover:text-slate-300'
            }`}
        >
          Requests
          {activeTab === 'requests' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 to-pink-500" />}
          {/* Badge for pending requests */}
          {requests.length > 0 && (
            <span className="ml-1.5 bg-chatwe-green text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {/* ---- Content Area ---- */}
      <div className="flex-1 overflow-y-auto">
        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="fade-in">
            {loadingFriends ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-3 border-chatwe-green border-t-transparent rounded-full animate-spin" />
              </div>
            ) : friends.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-chatwe-green/10 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-chatwe-green/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-chatwe-textSec text-sm">No friends yet</p>
                <p className="text-chatwe-textSec/60 text-xs mt-1">Search for users and send a request!</p>
              </div>
            ) : (
              <div>
                {friends.map((friend) => (
                  <button
                    key={friend._id}
                    onClick={() => onSelectUser(friend)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-200
                      hover:bg-white/[0.03]
                      ${selectedUser?._id === friend._id ? 'bg-white/[0.05] border-l-4 border-violet-500' : 'border-l-4 border-transparent'}`}
                  >
                    {/* Avatar with online indicator */}
                    <div className="relative">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center overflow-hidden
                        ${selectedUser?._id === friend._id
                          ? 'bg-chatwe-green/30'
                          : 'bg-chatwe-input'
                        }`}>
                        {friend.profilePicture ? (
                           <img src={friend.profilePicture} alt="DP" className="w-full h-full object-cover" />
                        ) : (
                           <span className={`text-base font-semibold
                             ${selectedUser?._id === friend._id
                               ? 'text-chatwe-green'
                               : 'text-chatwe-textSec'
                             }`}>
                             {friend.email.charAt(0).toUpperCase()}
                           </span>
                        )}
                      </div>
                      {/* Online dot */}
                      {isOnline(friend._id) && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-chatwe-green rounded-full
                                         border-2 border-chatwe-sidebar online-dot" />
                      )}
                    </div>

                    {/* Friend info */}
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-chatwe-text text-sm font-medium truncate">
                        {friend.email}
                      </p>
                      <p className={`text-xs ${isOnline(friend._id) ? 'text-chatwe-green' : 'text-chatwe-textSec/60'}`}>
                        {isOnline(friend._id) ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="fade-in">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-chatwe-green/10 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-chatwe-green/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                  </svg>
                </div>
                <p className="text-chatwe-textSec text-sm">No pending requests</p>
                <p className="text-chatwe-textSec/60 text-xs mt-1">When someone sends you a request, it will appear here</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {requests.map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center justify-between p-4 rounded-2xl
                               glass-light hover:bg-white/[0.05] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center overflow-hidden">
                        {request.from?.profilePicture ? (
                           <img src={request.from.profilePicture} alt="DP" className="w-full h-full object-cover" />
                        ) : (
                           <span className="text-blue-400 text-sm font-semibold">
                             {request.from?.email?.charAt(0).toUpperCase()}
                           </span>
                        )}
                      </div>
                      <div>
                        <p className="text-chatwe-text text-sm truncate max-w-[120px]">
                          {request.from?.email}
                        </p>
                        <p className="text-chatwe-textSec/60 text-xs">Wants to chat</p>
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      {/* Accept button */}
                      <button
                        onClick={() => handleRespond(request._id, 'accepted')}
                        className="bg-violet-500 text-white px-4 py-2 rounded-full text-xs font-bold
                                   hover:scale-105 shadow-[0_4px_10px_rgba(139,92,246,0.3)] transition-all active:scale-95"
                      >
                        Accept
                      </button>
                      {/* Reject button */}
                      <button
                        onClick={() => handleRespond(request._id, 'rejected')}
                        className="bg-white/5 text-slate-400 px-4 py-2 rounded-full text-xs font-bold
                                   hover:bg-red-500/20 hover:text-red-400 transition-all active:scale-95"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
