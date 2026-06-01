import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../notificationAPI';
import type { Notification } from '../notificationAPI';
import './NotificationCenter.css';

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<string>('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationAPI.getAll({ limit: 50 });
      setNotifications(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationAPI.getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch unread count');
    }
  };

  const fetchStatistics = async () => {
    try {
      const data = await notificationAPI.getStatistics();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch statistics');
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchNotifications();
      await fetchUnreadCount();
      await fetchStatistics();
    };
    loadInitialData();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (err) {
      setError('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (err) {
      setError('Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationAPI.delete(id);
      await fetchNotifications();
    } catch (err) {
      setError('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        await notificationAPI.clearAll();
        await fetchNotifications();
        await fetchUnreadCount();
      } catch (err) {
        setError('Failed to clear notifications');
      }
    }
  };

  const handleRetry = async (id: string) => {
    try {
      await notificationAPI.retryFailed(id);
      await fetchNotifications();
    } catch (err) {
      setError('Failed to retry notification');
    }
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : filter === 'failed'
      ? notifications.filter((n) => n.status === 'failed')
      : notifications;

  return (
    <div className='notification-center'>
      <div className='notification-header'>
        <h1>Notification Center</h1>
        <div className='notification-actions'>
          {unreadCount > 0 && (
            <button className='btn btn-secondary' onClick={handleMarkAllAsRead}>
              Mark All as Read
            </button>
          )}
          {notifications.length > 0 && (
            <button className='btn btn-danger' onClick={handleClearAll}>
              Clear All
            </button>
          )}
        </div>
      </div>

      {error && <div className='alert alert-danger'>{error}</div>}

      {stats && (
        <div className='notification-stats'>
          <div className='stat-card'>
            <div className='stat-value'>{stats.total}</div>
            <div className='stat-label'>Total</div>
          </div>
          <div className='stat-card'>
            <div className='stat-value'>{stats.unread}</div>
            <div className='stat-label'>Unread</div>
          </div>
          <div className='stat-card'>
            <div className='stat-value'>{stats.sent}</div>
            <div className='stat-label'>Sent</div>
          </div>
          <div className='stat-card'>
            <div className='stat-value'>{stats.failed}</div>
            <div className='stat-label'>Failed</div>
          </div>
        </div>
      )}

      <div className='notification-filters'>
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={`filter-btn ${filter === 'failed' ? 'active' : ''}`}
          onClick={() => setFilter('failed')}
        >
          Failed
        </button>
      </div>

      <div className='notification-list'>
        {loading ? (
          <div className='loading'>Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className='empty-state'>No notifications found</div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.isRead ? 'unread' : ''} ${notification.status}`}
            >
              <div className='notification-icon'>
                {notification.channel === 'email' && <i className='fas fa-envelope'></i>}
                {notification.channel === 'sms' && <i className='fas fa-comments'></i>}
                {notification.channel === 'in-app' && <i className='fas fa-bell'></i>}
              </div>

              <div className='notification-content'>
                <div className='notification-title'>{notification.subject}</div>
                <div className='notification-message'>{notification.message}</div>
                <div className='notification-meta'>
                  <span className='event-type'>{notification.eventType}</span>
                  <span className='channel'>{notification.channel}</span>
                  <span className='status'>{notification.status}</span>
                  <span className='date'>
                    {new Date(notification.createdAt || '').toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className='notification-actions-item'>
                {!notification.isRead && (
                  <button
                    className='btn btn-sm btn-primary'
                    onClick={() => handleMarkAsRead(notification._id!)}
                  >
                    Mark as Read
                  </button>
                )}

                {notification.status === 'failed' && (
                  <button
                    className='btn btn-sm btn-warning'
                    onClick={() => handleRetry(notification._id!)}
                  >
                    Retry
                  </button>
                )}

                <button
                  className='btn btn-sm btn-danger'
                  onClick={() => handleDelete(notification._id!)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
