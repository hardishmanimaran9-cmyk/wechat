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
import ProfileModal from './ProfileModal';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Sidebar = ({ selectedUser, onSelectUser }) => {
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'requests'
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { socket, onlineUsers, unreadCounts, typingStatus, clearUnread } = useSocket();

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

    // Real-time update for last message preview in sidebar
    socket.on('receive_message', (newMessage) => {
      setFriends((prev) => 
        prev.map((friend) => {
          const isSender = (newMessage.sender._id || newMessage.sender) === friend._id;
          const isReceiver = (newMessage.receiver._id || newMessage.receiver) === friend._id;
          
          if (isSender || isReceiver) {
            return {
              ...friend,
              lastMessage: newMessage
            };
          }
          return friend;
        }).sort((a, b) => {
          const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(0);
          const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(0);
          return dateB - dateA;
        })
      );
    });

    return () => {
      socket.off('request_received');
      socket.off('request_updated');
      socket.off('receive_message');
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
    <div className="w-full md:w-[380px] lg:w-[420px] h-full glass border-r border-white/5 flex flex-col z-20">
      {/* ---- Header ---- */}
      <div className="px-4 py-4 bg-transparent flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          
          {/* User avatar (Simplified) */}
          <div 
            onClick={() => setIsProfileOpen(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500
                       flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)] select-none cursor-pointer hover:scale-105 transition-transform"
          >
             <span className="text-white font-bold text-lg">
               {(user?.username || user?.email)?.charAt(0).toUpperCase()}
             </span>
          </div>

          <div className="cursor-pointer" onClick={() => setIsProfileOpen(true)}>
            <p className="text-chatwe-text text-sm font-bold truncate max-w-[180px]">
              {user?.username || user?.email}
            </p>
            {user?.username && (
              <p className="text-chatwe-textSec/60 text-[10px] truncate max-w-[180px]">
                {user.email}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Profile Button */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="text-chatwe-icon hover:text-violet-400 transition-colors p-2 rounded-lg hover:bg-white/5"
            title="Profile Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Logout button */}
          <button
            id="logout-button"
            onClick={logout}
            className="text-chatwe-icon hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />

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
                    onClick={() => {
                      onSelectUser(friend);
                      clearUnread(friend._id);
                    }}
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
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-chatwe-text text-sm font-bold truncate">
                          {friend.username || friend.email}
                        </p>
                        {friend.lastMessage && (
                          <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                            {new Date(friend.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-0.5">
                        <div className="flex-1 min-w-0">
                          {typingStatus[friend._id] ? (
                            <p className="text-[11px] font-bold text-violet-400 animate-pulse uppercase tracking-widest">
                              Typing...
                            </p>
                          ) : (
                            <p className="text-chatwe-textSec/60 text-[12px] truncate font-medium">
                              {friend.lastMessage ? friend.lastMessage.message : 'No messages yet'}
                            </p>
                          )}
                        </div>
                        
                        {unreadCounts[friend._id] > 0 && selectedUser?._id !== friend._id && (
                          <span className="bg-violet-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg shadow-violet-500/20 flex-shrink-0 animate-bounce-short">
                            {unreadCounts[friend._id]}
                          </span>
                        )}
                      </div>
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
