import api from '../../../api/api';

export const leavesApi = {
  getLeaveRequests: async (params?: any) => {
    const response = await api.get('/leave-requests', { params });
    return response.data;
  },
  getLeaveBalances: async () => {
    const response = await api.get('/leave-requests/balances');
    return response.data;
  },
  createLeaveRequest: async (data: any) => {
    const response = await api.post('/leave-requests', data);
    return response.data;
  },
  updateLeaveRequestStatus: async (id: string, data: { status: string; remarks?: string }) => {
    const response = await api.patch(`/leave-requests/${id}/status`, data);
    return response.data;
  },
  cancelLeaveRequest: async (id: string) => {
    const response = await api.post(`/leave-requests/${id}/cancel`);
    return response.data;
  },
  getLeaveAnalytics: async () => {
    const response = await api.get('/leave-requests/analytics/summary');
    return response.data;
  },
};
