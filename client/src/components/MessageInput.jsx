// ============================================
// MESSAGE INPUT - components/MessageInput.jsx
// ============================================
// Text input field for sending messages.
// Sends via Socket.IO for real-time delivery.

import { useState } from 'react';

const MessageInput = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Don't send empty messages
    if (!message.trim() || disabled) return;

    onSend(message.trim());
    setMessage(''); // Clear input after sending
  };

  // Also send on Enter key (without Shift)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="px-4 py-3 bg-chatwe-sidebar border-t border-chatwe-border/30">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* Emoji placeholder button */}
        <button
          type="button"
          className="text-chatwe-icon hover:text-chatwe-textSec transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Message input */}
        <input
          id="message-input"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Select a friend to start chatting" : "Type a message..."}
          disabled={disabled}
          className="flex-1 bg-chatwe-input text-chatwe-text text-sm px-4 py-3 rounded-lg
                     border border-chatwe-border/30 outline-none
                     focus:border-chatwe-green/40 transition-colors
                     placeholder:text-chatwe-textSec/50
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Send button */}
        <button
          id="send-button"
          type="submit"
          disabled={!message.trim() || disabled}
          className="bg-chatwe-green text-white p-3 rounded-lg
                     hover:bg-chatwe-greenLight transition-all duration-200
                     disabled:opacity-30 disabled:cursor-not-allowed
                     active:scale-90"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
