import api from '../../../api/api';

export const schoolApi = {
  getSchools: async (params: Record<string, any> = {}) => {
    const response = await api.get('/schools', { params });
    return response.data;
  },
  getSchool: async (id: string) => {
    const response = await api.get(`/schools/${id}`);
    return response.data;
  },
  createSchool: async (data: any) => {
    const response = await api.post('/schools', data);
    return response.data;
  },
  updateSchool: async (id: string, data: any) => {
    const response = await api.patch(`/schools/${id}`, data);
    return response.data;
  },
  deleteSchool: async (id: string) => {
    const response = await api.delete(`/schools/${id}`);
    return response.data;
  },
};
