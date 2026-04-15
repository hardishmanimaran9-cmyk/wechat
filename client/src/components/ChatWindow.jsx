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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const { user } = useAuth();
  const { socket, onlineUsers, typingStatus } = useSocket();

  // Auto-scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chat history when a user is selected
  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      setLoading(true);
      setHasMore(true);
      try {
        const response = await API.get(`/messages/${selectedUser._id}`);
        setMessages(response.data.messages);
        setHasMore(response.data.hasMore);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
        setTimeout(scrollToBottom, 50);
      }
    };

    fetchMessages();
  }, [selectedUser?._id]);

  // Handle scrolling to top to load more
  const handleScroll = async (e) => {
    if (e.target.scrollTop === 0 && hasMore && !loadingMore && messages.length > 0) {
      setLoadingMore(true);
      const oldestMessageTimestamp = messages[0].createdAt;
      const scrollHeightBefore = e.target.scrollHeight;

      try {
        const response = await API.get(`/messages/${selectedUser._id}?before=${oldestMessageTimestamp}`);
        const olderMessages = response.data.messages;
        
        if (olderMessages.length > 0) {
          setMessages((prev) => [...olderMessages, ...prev]);
          setHasMore(response.data.hasMore);
          
          // Small delay to let DOM update before adjusting scroll
          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight - scrollHeightBefore;
            }
          }, 0);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error loading older messages:', error);
      } finally {
        setLoadingMore(false);
      }
    }
  };

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

    const handleMessageUpdated = (data) => {
      setMessages((prev) => 
        prev.map((msg) => 
          msg._id === data.messageId 
            ? { ...msg, message: data.newMessage, isEdited: true } 
            : msg
        )
      );
    };

    const handleMessageDeleted = (data) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== data.messageId));
    };

    socket.on('message_updated', handleMessageUpdated);
    socket.on('message_deleted', handleMessageDeleted);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_updated', handleMessageUpdated);
      socket.off('message_deleted', handleMessageDeleted);
    };
  }, [socket, selectedUser?._id]);

  // Send or Edit a message
  const handleSendMessage = async (messageText) => {
    if (!selectedUser) return;

    try {
      if (editingMessage) {
        // Handle Edit
        await API.put(`/messages/${editingMessage._id}`, { newMessage: messageText });
        setEditingMessage(null);
      } else {
        // Handle Send (Text Only)
        await API.post('/messages/send', {
          receiverId: selectedUser._id,
          message: messageText,
          replyTo: replyingTo?._id || null
        });
      }
    } catch (error) {
      console.error('Error sending/editing message:', error);
    }
    
    setReplyingTo(null);
    setTimeout(scrollToBottom, 50);
  };

  // Delete/Unsend a message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to unsend this message?")) return;
    try {
      await API.delete(`/messages/${messageId}`);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Check if selected user is online
  const isOnline = selectedUser && onlineUsers.includes(selectedUser._id);
  const isTyping = selectedUser && typingStatus[selectedUser._id];

  // Format timestamp
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-chatwe-dark relative overflow-hidden">
        {/* Animated background glows */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

        <div className="text-center fade-in z-10">
          {/* Logo/Icon */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-white/[0.03] border border-white/5
                          flex items-center justify-center rotate-12 hover:rotate-0 transition-transform duration-500 shadow-2xl">
            <svg className="w-12 h-12 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>

          <h2 className="text-4xl font-black mb-2 text-gradient tracking-tight">Chatwe</h2>
          <p className="text-slate-400 text-sm max-w-sm font-medium">
            Next-gen messaging for the bold.
            <br />
            Select a friend to start the vibe.
          </p>

          {/* Feature badges */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className="text-[11px] text-slate-400 bg-white/5 border border-white/5 px-4 py-2 rounded-full font-bold">
              🔒 Encrypted
            </span>
            <span className="text-[11px] text-slate-400 bg-white/5 border border-white/5 px-4 py-2 rounded-full font-bold">
              ⚡ Real-time
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ---- CHAT VIEW ----
  return (
    <div className="flex-1 flex flex-col bg-chatwe-chat h-full relative">
      {/* ---- Chat Header ---- */}
      <div className="px-6 py-4 glass-light border-b border-white/5 flex items-center gap-4 z-10">
        {/* User avatar */}
        <div className="relative">
          <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden rotate-3">
            <span className="text-violet-400 font-bold text-lg -rotate-3">
              {(selectedUser.username || selectedUser.email).charAt(0).toUpperCase()}
            </span>
          </div>
          {isOnline && (
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-violet-500 rounded-full
                             border-2 border-[#020617] online-dot" />
          )}
        </div>

        {/* User info */}
        <div className="flex-1">
          <p className="text-slate-100 text-sm font-bold tracking-tight">{selectedUser.username || selectedUser.email}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isTyping ? (
              <p className="text-[11px] font-bold uppercase tracking-widest text-violet-400 animate-pulse">
                Typing...
              </p>
            ) : (
              <>
                <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-violet-500' : 'bg-slate-600'}`}></div>
                <p className={`text-[11px] font-bold uppercase tracking-widest ${isOnline ? 'text-violet-400' : 'text-slate-500'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---- Messages Area ---- */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scroll-smooth"
           ref={scrollContainerRef}
           onScroll={handleScroll}
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
           }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {loadingMore && (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              </div>
            )}
            
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center py-20">
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-violet-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <p className="text-slate-400 text-sm">No messages yet</p>
                  <p className="text-slate-500 text-xs mt-1">Say hello! 👋</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => {
                  const isMine = msg.sender._id === user._id || msg.sender === user._id;
                  return (
                    <div
                      key={msg._id || index}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'} message-enter group relative`}
                      style={{ animationDelay: `${Math.min(index * 0.02, 0.5)}s` }}
                      onTouchStart={(e) => {
                        e.currentTarget.dataset.startX = e.touches[0].clientX;
                        e.currentTarget.style.transition = 'none';
                      }}
                      onTouchMove={(e) => {
                        const startX = parseFloat(e.currentTarget.dataset.startX);
                        const currentX = e.touches[0].clientX;
                        const diff = currentX - startX;
                        if (diff > 0 && diff < 80) { // Only right swipe
                          e.currentTarget.style.transform = `translateX(${diff}px)`;
                        }
                      }}
                      onTouchEnd={(e) => {
                        e.currentTarget.style.transition = 'transform 0.2s';
                        e.currentTarget.style.transform = 'translateX(0)';
                        const startX = parseFloat(e.currentTarget.dataset.startX);
                        const endX = e.changedTouches[0].clientX;
                        if (endX - startX > 50) {
                          setReplyingTo(msg);
                        }
                      }}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-xl relative group-hover:scale-[1.01] transition-transform
                          ${isMine
                            ? 'bg-gradient-to-br from-violet-600 to-pink-600 text-white rounded-tr-none'
                            : 'glass-light text-slate-100 rounded-tl-none border border-white/5'
                          }`}
                      >
                        {msg.replyTo && (
                          <div className={`rounded-xl p-2.5 mb-2.5 text-xs border-l-4 backdrop-blur-md
                            ${isMine ? 'bg-white/10 border-white/30' : 'bg-black/20 border-violet-500'}`}>
                            <span className="font-bold block truncate mb-0.5">
                              {msg.replyTo.sender?._id === user._id || msg.replyTo.sender === user._id ? 'You' : msg.replyTo.sender?.username || msg.replyTo.sender?.email || "Someone"}
                            </span>
                            <span className="truncate block opacity-70 italic">{msg.replyTo.message}</span>
                          </div>
                        )}
                        
                        <p className="text-[14px] leading-relaxed font-medium tracking-tight whitespace-pre-wrap">{msg.message}</p>
                        
                        <div className="flex items-center justify-end gap-2 mt-1.5">
                          {msg.isEdited && (
                            <span className={`text-[9px] font-bold uppercase tracking-widest opacity-40`}>
                              edited
                            </span>
                          )}
                          <p className={`text-[10px] font-bold opacity-40`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>

                        {/* Edit/Delete Actions */}
                        {isMine && (
                          <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button 
                              onClick={() => setEditingMessage(msg)}
                              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-violet-400 hover:border-violet-400/50 backdrop-blur-md transition-all active:scale-90"
                              title="Edit"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteMessage(msg._id)}
                              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-400/50 backdrop-blur-md transition-all active:scale-90"
                              title="Unsend"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </>
        )}
      </div>

      {/* ---- Message Input ---- */}
      {replyingTo && (
        <div className="bg-white/5 px-6 py-2 flex items-center justify-between border-t border-white/5 backdrop-blur-lg">
          <div className="flex flex-col flex-1 min-w-0 border-l-2 border-violet-500 pl-3">
            <span className="text-violet-400 text-[10px] font-black uppercase tracking-widest">Replying to {replyingTo.sender?._id === user._id || replyingTo.sender === user._id ? 'yourself' : replyingTo.sender?.username || replyingTo.sender?.email || 'someone'}</span>
            <span className="text-slate-300 text-xs truncate font-medium">{replyingTo.message}</span>
          </div>
          <button onClick={() => setReplyingTo(null)} className="text-slate-500 hover:text-slate-100 p-2 ml-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
      <MessageInput 
        onSend={handleSendMessage} 
        disabled={false} 
        editMode={editingMessage}
        onCancelEdit={() => setEditingMessage(null)}
        selectedUser={selectedUser}
      />
    </div>
  );
};

export default ChatWindow;
