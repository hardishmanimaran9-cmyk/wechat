import { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';

const MessageInput = ({ onSend, disabled, editMode, onCancelEdit }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef(null);

  // If in edit mode, populate the message input
  useEffect(() => {
    if (editMode) {
      setMessage(editMode.message);
    } else {
      setMessage('');
    }
  }, [editMode]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Don't send empty messages
    if (!message.trim() || disabled) return;

    if (editMode) {
      onSend(message.trim()); // Pass null as image for edits
    } else {
      onSend(message.trim());
    }
    
    setMessage(''); // Clear input after sending
    setShowEmojiPicker(false);
  };

  // Also send on Enter key (without Shift)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
  };

  return (
    <div className="px-6 py-4 glass-light border-t border-white/5 relative z-20">

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div ref={pickerRef} className="absolute bottom-full left-4 mb-2 z-50 shadow-2xl">
          <EmojiPicker 
            onEmojiClick={onEmojiClick}
            theme="dark"
            searchDisabled
            skinTonesDisabled
            height={350}
            width={300}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* Emoji toggle button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          disabled={disabled}
          className={`transition-colors ${showEmojiPicker ? 'text-chatwe-green' : 'text-chatwe-icon hover:text-chatwe-textSec'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Message input */}
        <div className="flex-1 relative flex items-center">
          <input
            id="message-input"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Select a friend..." : editMode ? "Edit your message..." : "Type a message..."}
            disabled={disabled}
            className="w-full bg-white/5 text-slate-100 text-sm px-5 py-3.5 rounded-2xl
                       border border-white/5 outline-none
                       focus:border-violet-500/50 focus:bg-white/[0.08] transition-all
                       placeholder:text-slate-500 font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {editMode && (
            <button 
              type="button"
              onClick={onCancelEdit}
              className="absolute right-3 text-chatwe-textSec/40 hover:text-chatwe-text transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        {/* Send button */}
        <button
          id="send-button"
          type="submit"
          disabled={!message.trim() || disabled}
          className={`${editMode ? 'bg-amber-500 shadow-[0_4px_15px_rgba(245,158,11,0.3)]' : 'bg-gradient-to-r from-violet-600 to-pink-600 shadow-[0_4px_15px_rgba(139,92,246,0.3)]'} 
                     text-white p-3.5 rounded-2xl
                     hover:scale-105 hover:brightness-110 active:scale-90 transition-all
                     disabled:opacity-20 disabled:cursor-not-allowed`}
        >
          {editMode ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
