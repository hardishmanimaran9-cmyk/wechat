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
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only connect if user is logged in
    if (isAuthenticated && user) {
      // Create new socket connection
      const newSocket = io('https://wechat-2s9k.onrender.com', {
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

  const value = {
    socket,
    onlineUsers,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
