import api from '../../api/api';

export interface AuditLog {
  _id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  performedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: string;
  createdAt: string;
}

export interface AuditLogFilters {
  action?: string;
  entityType?: string;
  performedBy?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const getAuditLogs = async (filters?: AuditLogFilters): Promise<AuditLog[]> => {
  const response = await api.get<AuditLog[]>('/audit-logs', { params: filters });
  return response.data;
};
