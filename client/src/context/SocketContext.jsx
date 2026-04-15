// ============================================
// SOCKET CONTEXT - context/SocketContext.jsx
// ============================================
// Manages the Socket.IO connection across the app.
// Connects when user logs in, disconnects when they log out.

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

// Custom hook to use socket context
export const useSocket = () => {
  return useContext(SocketContext);
};

// Provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingStatus, setTypingStatus] = useState({}); // { userId: boolean }
  const [unreadCounts, setUnreadCounts] = useState({}); // { userId: count }
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only connect if user is logged in
    if (isAuthenticated && user) {
      // Determine the backend URL
      const socketURL = import.meta.env.VITE_SOCKET_URL || 
                        (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://wechat-1-vt2t.onrender.com');

      // Create new socket connection
      const newSocket = io(socketURL, {
        transports: ['websocket', 'polling'],
      });

      // When connected, tell the server who we are
      newSocket.on('connect', () => {
        console.log('🔌 Socket connected:', newSocket.id);
        newSocket.emit('user_connected', user._id);
      });

      // Listen for online users updates
      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      // Listen for typing events
      newSocket.on('user_typing', ({ userId }) => {
        setTypingStatus((prev) => ({ ...prev, [userId]: true }));
      });

      newSocket.on('user_stop_typing', ({ userId }) => {
        setTypingStatus((prev) => ({ ...prev, [userId]: false }));
      });

      // Listen for notification-worthy messages
      newSocket.on('receive_message', (message) => {
        // Notification logic: If message is from someone else, increment unread count
        // Note: The specific ChatWindow/Sidebar will handle the 'selectedUser' comparison
        // via a helper function or by checking the state globally.
        const senderId = message.sender._id || message.sender;
        if (senderId !== user?._id) {
           setUnreadCounts((prev) => ({
             ...prev,
             [senderId]: (prev[senderId] || 0) + 1
           }));
        }
      });

      // Handle disconnection
      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      setSocket(newSocket);

      // Cleanup: disconnect when component unmounts or user changes
      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    } else {
      // User logged out - disconnect socket
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [isAuthenticated, user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearUnread = (userId) => {
    setUnreadCounts((prev) => ({ ...prev, [userId]: 0 }));
  };

  const value = {
    socket,
    onlineUsers,
    typingStatus,
    unreadCounts,
    clearUnread,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
