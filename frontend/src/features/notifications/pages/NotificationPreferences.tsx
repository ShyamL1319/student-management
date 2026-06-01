import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../notificationAPI';
import type { NotificationPreference } from '../notificationAPI';
import './NotificationPreferences.css';

export const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const data = await notificationAPI.getPreferences();
      setPreferences(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updates: Partial<NotificationPreference>) => {
    try {
      const updated = await notificationAPI.updatePreferences(updates);
      setPreferences(updated);
      setSuccess('Preferences updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
    }
  };

  if (loading) {
    return <div className='notification-preferences loading'>Loading preferences...</div>;
  }

  if (!preferences) {
    return <div className='notification-preferences error'>Failed to load preferences</div>;
  }

  return (
    <div className='notification-preferences'>
      <h1>Notification Preferences</h1>

      {error && <div className='alert alert-danger'>{error}</div>}
      {success && <div className='alert alert-success'>{success}</div>}

      <div className='preferences-container'>
        {/* Channel Preferences */}
        <div className='preference-section'>
          <h2>Notification Channels</h2>
          <p className='section-description'>Choose how you want to receive notifications</p>

          <div className='preference-item'>
            <div className='preference-info'>
              <h3>Email Notifications</h3>
              <p>Receive notifications via email</p>
            </div>
            <label className='toggle-switch'>
              <input
                type='checkbox'
                checked={preferences.emailNotifications}
                onChange={(e) => handleUpdate({ emailNotifications: e.target.checked })}
              />
              <span className='slider'></span>
            </label>
          </div>

          <div className='preference-item'>
            <div className='preference-info'>
              <h3>SMS Notifications</h3>
              <p>Receive notifications via SMS</p>
            </div>
            <label className='toggle-switch'>
              <input
                type='checkbox'
                checked={preferences.smsNotifications}
                onChange={(e) => handleUpdate({ smsNotifications: e.target.checked })}
              />
              <span className='slider'></span>
            </label>
          </div>

          <div className='preference-item'>
            <div className='preference-info'>
              <h3>In-App Notifications</h3>
              <p>Receive notifications within the application</p>
            </div>
            <label className='toggle-switch'>
              <input
                type='checkbox'
                checked={preferences.inAppNotifications}
                onChange={(e) => handleUpdate({ inAppNotifications: e.target.checked })}
              />
              <span className='slider'></span>
            </label>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className='preference-section'>
          <h2>Quiet Hours</h2>
          <p className='section-description'>Configure times when you don't want to receive notifications</p>

          <div className='preference-item'>
            <div className='preference-info'>
              <h3>Quiet Hours Start Time</h3>
              <p>When to start quiet hours (HH:MM format)</p>
            </div>
            <input
              type='text'
              placeholder='HH:MM'
              value={preferences.notificationQuietHourStart || ''}
              onChange={(e) =>
                handleUpdate({ notificationQuietHourStart: e.target.value })
              }
              className='time-input'
            />
          </div>

          <div className='preference-item'>
            <div className='preference-info'>
              <h3>Quiet Hours End Time</h3>
              <p>When to end quiet hours (HH:MM format)</p>
            </div>
            <input
              type='text'
              placeholder='HH:MM'
              value={preferences.notificationQuietHourEnd || ''}
              onChange={(e) =>
                handleUpdate({ notificationQuietHourEnd: e.target.value })
              }
              className='time-input'
            />
          </div>

          <div className='preference-item'>
            <div className='preference-info'>
              <h3>Do Not Disturb</h3>
              <p>Disable all notifications temporarily</p>
            </div>
            <label className='toggle-switch'>
              <input
                type='checkbox'
                checked={preferences.doNotDisturb}
                onChange={(e) => handleUpdate({ doNotDisturb: e.target.checked })}
              />
              <span className='slider'></span>
            </label>
          </div>
        </div>

        {/* Event Preferences */}
        <div className='preference-section'>
          <h2>Notification Types</h2>
          <p className='section-description'>Choose which types of notifications you want to receive</p>

          <div className='preference-item'>
            <div className='preference-info'>
              <h3>Attendance Alerts</h3>
              <p>Get notified about attendance issues</p>
            </div>
            <label className='toggle-switch'>
              <input type='checkbox' defaultChecked />
              <span className='slider'></span>
            </label>
          </div>

          <div className='preference-item'>
            <div className='preference-info'>
              <h3>Fee Alerts</h3>
              <p>Get notified about pending fees</p>
            </div>
            <label className='toggle-switch'>
              <input type='checkbox' defaultChecked />
              <span className='slider'></span>
            </label>
          </div>

          <div className='preference-item'>
            <div className='preference-info'>
              <h3>Result Alerts</h3>
              <p>Get notified when results are published</p>
            </div>
            <label className='toggle-switch'>
              <input type='checkbox' defaultChecked />
              <span className='slider'></span>
            </label>
          </div>

          <div className='preference-item'>
            <div className='preference-info'>
              <h3>Announcements</h3>
              <p>Get notified about school announcements</p>
            </div>
            <label className='toggle-switch'>
              <input type='checkbox' defaultChecked />
              <span className='slider'></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
