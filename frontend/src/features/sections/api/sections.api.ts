import api from '../../../api/api';

export const sectionApi = {
  getSections: async (params: Record<string, any> = {}) => {
    const response = await api.get('/sections', { params });
    return response.data;
  },
  createSection: async (data: any) => {
    const response = await api.post('/sections', data);
    return response.data;
  },
  updateSection: async (id: string, data: any) => {
    const response = await api.patch(`/sections/${id}`, data);
    return response.data;
  },
  deleteSection: async (id: string) => {
    const response = await api.delete(`/sections/${id}`);
    return response.data;
  },
};
