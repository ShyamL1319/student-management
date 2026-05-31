import api from '../../../api/api';

export const subjectsApi = {
  getSubjects: async (params: Record<string, any> = {}) => {
    const response = await api.get('/subjects', { params });
    return response.data;
  },
  createSubject: async (data: any) => {
    const response = await api.post('/subjects', data);
    return response.data;
  },
  updateSubject: async (id: string, data: any) => {
    const response = await api.patch(`/subjects/${id}`, data);
    return response.data;
  },
  deleteSubject: async (id: string) => {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  },
};
