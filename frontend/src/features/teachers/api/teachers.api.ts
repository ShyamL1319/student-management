import api from '../../../api/api';

export const teachersApi = {
  getTeachers: async (params: Record<string, any> = {}) => {
    const response = await api.get('/teachers', { params });
    return response.data;
  },
  createTeacher: async (data: any) => {
    const response = await api.post('/teachers', data);
    return response.data;
  },
  updateTeacher: async (id: string, data: any) => {
    const response = await api.patch(`/teachers/${id}`, data);
    return response.data;
  },
  deleteTeacher: async (id: string) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },
};
