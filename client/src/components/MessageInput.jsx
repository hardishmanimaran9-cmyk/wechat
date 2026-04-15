import { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';

const MessageInput = ({ onSend, disabled, editMode, onCancelEdit }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const pickerRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large (max 5MB)");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Don't send empty messages unless there's an image
    if ((!message.trim() && !selectedImage) || disabled) return;

    if (editMode) {
      onSend(message.trim(), null); // Pass null as image for edits
    } else {
      onSend(message.trim(), selectedImage);
      removeImage();
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
      {/* Image Preview */}
      {imagePreview && (
        <div className="absolute bottom-full left-6 mb-4 p-2.5 glass shadow-2xl rounded-2xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="relative group">
            <img src={imagePreview} alt="Preview" className="max-h-40 rounded-xl object-contain shadow-lg" />
            <button 
              onClick={removeImage}
              className="absolute -top-3 -right-3 bg-red-500/80 backdrop-blur-md text-white rounded-full p-1.5 shadow-xl hover:bg-red-600 transition-all scale-0 group-hover:scale-100"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

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

        {/* Attachment button */}
        {!editMode && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="text-chatwe-icon hover:text-chatwe-textSec transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

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
          disabled={(!message.trim() && !selectedImage) || disabled}
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
