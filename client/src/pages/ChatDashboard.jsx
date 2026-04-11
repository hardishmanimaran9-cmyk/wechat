// ============================================
// CHAT DASHBOARD - pages/ChatDashboard.jsx
// ============================================
// Main chat interface with sidebar and chat window.
// This is the protected page users see after logging in.

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const ChatDashboard = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // Intercept hardware back button on mobile
  useEffect(() => {
    const handlePopState = (e) => {
      if (window.innerWidth < 768 && !showSidebar) {
        setShowSidebar(true);
        setSelectedUser(null);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showSidebar]);

  // Handle selecting a user to chat with
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    // On mobile, hide sidebar when a user is selected
    if (window.innerWidth < 768) {
      setShowSidebar(false);
      window.history.pushState({ chatOpen: true }, '');
    }
  };

  // Handle back button on mobile
  const handleBack = () => {
    if (window.history.state?.chatOpen) {
      window.history.back();
    } else {
      setShowSidebar(true);
      setSelectedUser(null);
    }
  };

  return (
    <div className="h-screen w-screen flex bg-chatwe-darker overflow-hidden">
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-chatwe-green/10 z-0" />

      {/* Main container */}
      <div className="relative z-10 flex w-full h-full max-w-[1600px] mx-auto shadow-2xl">
        {/* ---- Sidebar ---- */}
        <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex h-full`}>
          <Sidebar
            selectedUser={selectedUser}
            onSelectUser={handleSelectUser}
          />
        </div>

        {/* ---- Chat Window ---- */}
        <div className={`${!showSidebar || selectedUser ? 'flex' : 'hidden'} md:flex flex-1 h-full`}>
          {/* Mobile back button */}
          {!showSidebar && (
            <button
              onClick={handleBack}
              className="absolute top-4 left-4 z-20 md:hidden bg-chatwe-sidebar/80 text-chatwe-text
                         p-2 rounded-full backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <ChatWindow selectedUser={selectedUser} />
        </div>
      </div>
    </div>
  );
};

export default ChatDashboard;
