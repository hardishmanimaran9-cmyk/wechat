// ============================================
// CHAT WINDOW - components/ChatWindow.jsx
// ============================================
// Main chat area displaying:
// - Header with selected user info + online status
// - Message history with auto-scroll
// - Message input at bottom
// - Empty state when no user selected

import { useState, useEffect, useRef } from 'react';
import MessageInput from './MessageInput';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const ChatWindow = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();

  // Auto-scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chat history when a user is selected
  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await API.get(`/messages/${selectedUser._id}`);
        setMessages(response.data.messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser?._id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for incoming messages via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage) => {
      // Only add message if it's from/to the currently selected user
      if (
        selectedUser &&
        (newMessage.sender._id === selectedUser._id ||
          newMessage.receiver._id === selectedUser._id)
      ) {
        setMessages((prev) => {
          // Prevent duplicate messages
          const exists = prev.some((m) => m._id === newMessage._id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, selectedUser?._id]);

  // Send a message
  const handleSendMessage = (messageText) => {
    if (!selectedUser || !socket) return;

    // Emit message via socket for real-time delivery
    socket.emit('send_message', {
      senderId: user._id,
      receiverId: selectedUser._id,
      message: messageText,
    });
  };

  // Check if selected user is online
  const isOnline = selectedUser && onlineUsers.includes(selectedUser._id);

  // Format timestamp
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ---- EMPTY STATE (no user selected) ----
  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-chatwe-dark">
        <div className="text-center fade-in">
          {/* Logo/Icon */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-chatwe-green/20 to-chatwe-greenDark/10
                          flex items-center justify-center">
            <svg className="w-12 h-12 text-chatwe-green/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>

          <h2 className="text-chatwe-text text-2xl font-semibold mb-2">Chatwe</h2>
          <p className="text-chatwe-textSec text-sm max-w-sm">
            Select a friend from the sidebar to start chatting.
            <br />
            Send and receive messages in real-time.
          </p>

          {/* Feature badges */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className="text-[11px] text-chatwe-textSec/50 bg-chatwe-input/50 px-3 py-1.5 rounded-full">
              🔒 End-to-end encrypted
            </span>
            <span className="text-[11px] text-chatwe-textSec/50 bg-chatwe-input/50 px-3 py-1.5 rounded-full">
              ⚡ Real-time messaging
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ---- CHAT VIEW ----
  return (
    <div className="flex-1 flex flex-col bg-chatwe-chat h-full">
      {/* ---- Chat Header ---- */}
      <div className="px-4 py-3 bg-chatwe-sidebar border-b border-chatwe-border/20 flex items-center gap-3">
        {/* User avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-chatwe-input flex items-center justify-center overflow-hidden">
            {selectedUser.profilePicture ? (
              <img src={selectedUser.profilePicture} alt="DP" className="w-full h-full object-cover" />
            ) : (
              <span className="text-chatwe-textSec font-semibold">
                {selectedUser.email.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-chatwe-green rounded-full
                             border-2 border-chatwe-sidebar online-dot" />
          )}
        </div>

        {/* User info */}
        <div className="flex-1">
          <p className="text-chatwe-text text-sm font-medium">{selectedUser.email}</p>
          <p className={`text-xs ${isOnline ? 'text-chatwe-green' : 'text-chatwe-textSec/60'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* ---- Messages Area ---- */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
           }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-3 border-chatwe-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-chatwe-green/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-chatwe-green/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <p className="text-chatwe-textSec text-sm">No messages yet</p>
              <p className="text-chatwe-textSec/50 text-xs mt-1">Say hello! 👋</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isMine = msg.sender._id === user._id || msg.sender === user._id;
              return (
                <div
                  key={msg._id || index}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'} message-enter`}
                  style={{ animationDelay: `${Math.min(index * 0.02, 0.5)}s` }}
                >
                  <div
                    className={`max-w-[65%] px-3 py-2 rounded-lg shadow-sm relative
                      ${isMine
                        ? 'bg-chatwe-bubble text-chatwe-text rounded-tr-none'
                        : 'bg-chatwe-bubbleIn text-chatwe-text rounded-tl-none'
                      }`}
                  >
                    <p className="text-[13.5px] leading-relaxed break-words">{msg.message}</p>
                    <p className={`text-[10px] mt-1 text-right
                      ${isMine ? 'text-chatwe-textSec/50' : 'text-chatwe-textSec/40'}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ---- Message Input ---- */}
      <MessageInput onSend={handleSendMessage} disabled={false} />
    </div>
  );
};

export default ChatWindow;
