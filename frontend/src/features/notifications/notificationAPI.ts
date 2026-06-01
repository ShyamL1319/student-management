import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}`,
  withCredentials: true,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Notification {
  _id?: string;
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  eventType: string;
  channel: string;
  subject: string;
  message: string;
  templateId?: string;
  templateData?: Record<string, any>;
  status: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  failureReason?: string;
  retryCount?: number;
  isRead: boolean;
  metadata?: Record<string, any>;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationTemplate {
  _id?: string;
  name: string;
  eventType: string;
  channel: string;
  subject: string;
  message: string;
  htmlContent?: string;
  variables?: string[];
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationPreference {
  _id?: string;
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  notificationQuietHourStart?: string;
  notificationQuietHourEnd?: string;
  doNotDisturb: boolean;
  channelPreferences?: Map<string, boolean>;
  eventPreferences?: Map<string, boolean>;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationEvent {
  _id?: string;
  eventType: string;
  triggeredBy: string;
  relatedEntityId: string;
  relatedEntityType: string;
  notificationIds?: string[];
  eventData: Record<string, any>;
  successCount: number;
  failureCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationFilter {
  eventType?: string;
  channel?: string;
  status?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  skip?: number;
}

export const notificationAPI = {
  // Notifications
  create: async (notification: Notification): Promise<Notification> => {
    const response = await apiClient.post('/notifications', notification);
    return response.data;
  },

  getAll: async (params?: NotificationFilter): Promise<Notification[]> => {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Notification> => {
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data;
  },

  update: async (id: string, notification: Partial<Notification>): Promise<Notification> => {
    const response = await apiClient.patch(`/notifications/${id}`, notification);
    return response.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ modifiedCount: number }> => {
    const response = await apiClient.patch('/notifications/read/all');
    return response.data;
  },

  retryFailed: async (id: string): Promise<Notification> => {
    const response = await apiClient.post(`/notifications/${id}/retry`);
    return response.data;
  },

  delete: async (id: string): Promise<{ acknowledged: boolean }> => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },

  clearAll: async (): Promise<{ deletedCount: number }> => {
    const response = await apiClient.delete('/notifications');
    return response.data;
  },

  getUnreadCount: async (): Promise<{ unreadCount: number }> => {
    const response = await apiClient.get('/notifications/unread/count');
    return response.data;
  },

  getStatistics: async (): Promise<any> => {
    const response = await apiClient.get('/notifications/statistics');
    return response.data;
  },

  // Notification Preferences
  getPreferences: async (): Promise<NotificationPreference> => {
    const response = await apiClient.get('/notification-preferences');
    return response.data;
  },

  updatePreferences: async (preferences: Partial<NotificationPreference>): Promise<NotificationPreference> => {
    const response = await apiClient.patch('/notification-preferences', preferences);
    return response.data;
  },

  enableChannel: async (channel: string): Promise<NotificationPreference> => {
    const response = await apiClient.patch(`/notification-preferences/channel/${channel}/enable`);
    return response.data;
  },

  disableChannel: async (channel: string): Promise<NotificationPreference> => {
    const response = await apiClient.patch(`/notification-preferences/channel/${channel}/disable`);
    return response.data;
  },

  enableEvent: async (eventType: string): Promise<NotificationPreference> => {
    const response = await apiClient.patch(`/notification-preferences/event/${eventType}/enable`);
    return response.data;
  },

  disableEvent: async (eventType: string): Promise<NotificationPreference> => {
    const response = await apiClient.patch(`/notification-preferences/event/${eventType}/disable`);
    return response.data;
  },

  // Notification Templates
  createTemplate: async (template: NotificationTemplate): Promise<NotificationTemplate> => {
    const response = await apiClient.post('/notification-templates', template);
    return response.data;
  },

  getTemplates: async (filters?: { eventType?: string; channel?: string }): Promise<NotificationTemplate[]> => {
    const response = await apiClient.get('/notification-templates', { params: filters });
    return response.data;
  },

  getTemplateById: async (id: string): Promise<NotificationTemplate> => {
    const response = await apiClient.get(`/notification-templates/${id}`);
    return response.data;
  },

  updateTemplate: async (id: string, template: Partial<NotificationTemplate>): Promise<NotificationTemplate> => {
    const response = await apiClient.patch(`/notification-templates/${id}`, template);
    return response.data;
  },

  deleteTemplate: async (id: string): Promise<{ acknowledged: boolean }> => {
    const response = await apiClient.delete(`/notification-templates/${id}`);
    return response.data;
  },

  // Notification Events
  triggerAttendanceAlert: async (data: any): Promise<NotificationEvent> => {
    const response = await apiClient.post('/notification-events/attendance-alert', data);
    return response.data;
  },

  triggerFeeAlert: async (data: any): Promise<NotificationEvent> => {
    const response = await apiClient.post('/notification-events/fee-alert', data);
    return response.data;
  },

  triggerResultAlert: async (data: any): Promise<NotificationEvent> => {
    const response = await apiClient.post('/notification-events/result-alert', data);
    return response.data;
  },

  getEvents: async (filters?: { eventType?: string; relatedEntityType?: string }): Promise<NotificationEvent[]> => {
    const response = await apiClient.get('/notification-events', { params: filters });
    return response.data;
  },

  getEventById: async (id: string): Promise<NotificationEvent> => {
    const response = await apiClient.get(`/notification-events/${id}`);
    return response.data;
  },

  getEventStatistics: async (): Promise<any> => {
    const response = await apiClient.get('/notification-events/statistics');
    return response.data;
  },
};
