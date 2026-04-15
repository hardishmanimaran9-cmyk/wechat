import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { getFileUrl } from '../utils/helpers';

const NotificationToast = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slide in
    setIsVisible(true);

    // Auto-remove after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onRemove, 300); // Wait for slide out animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <div 
      className={`fixed top-6 right-6 z-[9999] w-80 glass border border-white/10 rounded-2xl shadow-2xl p-4
                 transition-all duration-300 transform
                 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white font-bold overflow-hidden shadow-lg">
          {notification.profilePicture ? (
            <img src={getFileUrl(notification.profilePicture)} alt="Sender" className="w-full h-full object-cover" />
          ) : (
            <span>{notification.sender.charAt(0).toUpperCase()}</span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-slate-100 text-sm font-bold">{notification.sender}</p>
          <p className="text-slate-400 text-xs truncate mt-0.5">{notification.text}</p>
        </div>

        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onRemove, 300);
          }}
          className="text-slate-500 hover:text-slate-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-violet-500/30 rounded-full overflow-hidden" style={{ width: 'calc(100% - 24px)', margin: '0 12px' }}>
        <div className="h-full bg-violet-500 animate-[notification-progress_5s_linear]" />
      </div>
    </div>
  );
};

export const NotificationCenter = () => {
  const { notifications, removeNotification } = useSocket();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((n) => (
        <NotificationToast 
          key={n.id} 
          notification={n} 
          onRemove={() => removeNotification(n.id)} 
        />
      ))}
    </div>
  );
};

export default NotificationCenter;
