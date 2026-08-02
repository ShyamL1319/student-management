import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../notificationAPI';
import './NotificationBell.css';

interface NotificationBellProps {
  onNotificationClick?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onNotificationClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationAPI.getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  };

  useEffect(() => {
    // defer first fetch to avoid synchronous setState in effect
    const t = setTimeout(() => void fetchUnreadCount(), 0);
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, []);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (onNotificationClick) {
      onNotificationClick();
    }
  };

  return (
    <div className='notification-bell'>
      <button className='bell-button' onClick={handleBellClick}>
        <i className='fas fa-bell'></i>
        {unreadCount > 0 && (
          <span className='notification-badge'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className='notification-dropdown'>
          <div className='dropdown-header'>
            <h3>Notifications</h3>
            <span className='unread-badge'>{unreadCount} unread</span>
          </div>
          <div className='dropdown-body'>
            <p>Click the notification icon to view all notifications</p>
          </div>
          <div className='dropdown-footer'>
            <a href='/notifications'>View All Notifications</a>
          </div>
        </div>
      )}
    </div>
  );
};
