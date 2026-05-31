import api from '../../../api/api';

export const classesApi = {
  getClasses: async (params: Record<string, any> = {}) => {
    const response = await api.get('/classes', { params });
    return response.data;
  },
  createClass: async (data: any) => {
    const response = await api.post('/classes', data);
    return response.data;
  },
  updateClass: async (id: string, data: any) => {
    const response = await api.patch(`/classes/${id}`, data);
    return response.data;
  },
  deleteClass: async (id: string) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },
};
