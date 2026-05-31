import api from '../../../api/api';

export const staffApi = {
  getStaff: async (params: Record<string, any> = {}) => {
    const response = await api.get('/staff', { params });
    return response.data;
  },
  createStaff: async (data: any) => {
    const response = await api.post('/staff', data);
    return response.data;
  },
  updateStaff: async (id: string, data: any) => {
    const response = await api.patch(`/staff/${id}`, data);
    return response.data;
  },
  deleteStaff: async (id: string) => {
    const response = await api.delete(`/staff/${id}`);
    return response.data;
  },
};
