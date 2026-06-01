import api from '../api';

export const attendanceApi = {
  getAttendances: async (params: Record<string, any> = {}) => {
    const response = await api.get('/attendances', { params });
    return response.data;
  },
  createAttendance: async (data: Record<string, any>) => {
    const response = await api.post('/attendances', data);
    return response.data;
  },
  updateAttendance: async (id: string, data: Record<string, any>) => {
    const response = await api.patch(`/attendances/${id}`, data);
    return response.data;
  },
  deleteAttendance: async (id: string) => {
    const response = await api.delete(`/attendances/${id}`);
    return response.data;
  },
  getDailyReport: async (params: Record<string, any> = {}) => {
    const response = await api.get('/attendances/daily-report', { params });
    return response.data;
  },
  getMonthlyReport: async (params: Record<string, any> = {}) => {
    const response = await api.get('/attendances/monthly-report', { params });
    return response.data;
  },
};
