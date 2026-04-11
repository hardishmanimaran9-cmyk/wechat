// ============================================
// SIDEBAR - components/Sidebar.jsx
// ============================================
// Left sidebar containing:
// - User info header
// - Search bar
// - Tab switcher (Friends / Requests)
// - Friends list with online status
// - Pending requests with Accept/Reject

import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Sidebar = ({ selectedUser, onSelectUser }) => {
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'requests'
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const { user, logout } = useAuth();
  const { socket, onlineUsers } = useSocket();

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

  return (
    <div className="w-full md:w-[380px] lg:w-[420px] h-full bg-chatwe-sidebar border-r border-chatwe-border/30 flex flex-col">
      {/* ---- Header ---- */}
      <div className="px-4 py-3 bg-chatwe-sidebar flex items-center justify-between border-b border-chatwe-border/20">
        <div className="flex items-center gap-3">
          {/* User avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-chatwe-green to-chatwe-greenDark
                          flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
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
          className={`flex-1 py-3 text-sm font-medium transition-all duration-200
            ${activeTab === 'friends'
              ? 'text-chatwe-green border-b-2 border-chatwe-green'
              : 'text-chatwe-textSec hover:text-chatwe-text'
            }`}
        >
          Friends {friends.length > 0 && `(${friends.length})`}
        </button>
        <button
          id="requests-tab"
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-3 text-sm font-medium transition-all duration-200 relative
            ${activeTab === 'requests'
              ? 'text-chatwe-green border-b-2 border-chatwe-green'
              : 'text-chatwe-textSec hover:text-chatwe-text'
            }`}
        >
          Requests
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
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-150
                      hover:bg-chatwe-hover
                      ${selectedUser?._id === friend._id ? 'bg-chatwe-hover' : ''}`}
                  >
                    {/* Avatar with online indicator */}
                    <div className="relative">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center
                        ${selectedUser?._id === friend._id
                          ? 'bg-chatwe-green/30'
                          : 'bg-chatwe-input'
                        }`}>
                        <span className={`text-base font-semibold
                          ${selectedUser?._id === friend._id
                            ? 'text-chatwe-green'
                            : 'text-chatwe-textSec'
                          }`}>
                          {friend.email.charAt(0).toUpperCase()}
                        </span>
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
                    className="flex items-center justify-between p-3 rounded-xl
                               bg-chatwe-input/30 hover:bg-chatwe-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <span className="text-blue-400 text-sm font-semibold">
                          {request.from?.email?.charAt(0).toUpperCase()}
                        </span>
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
                        className="bg-chatwe-green/20 text-chatwe-green px-3 py-1.5 rounded-full text-xs font-medium
                                   hover:bg-chatwe-green/30 transition-colors active:scale-95"
                      >
                        Accept
                      </button>
                      {/* Reject button */}
                      <button
                        onClick={() => handleRespond(request._id, 'rejected')}
                        className="bg-red-500/10 text-red-400 px-3 py-1.5 rounded-full text-xs font-medium
                                   hover:bg-red-500/20 transition-colors active:scale-95"
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
