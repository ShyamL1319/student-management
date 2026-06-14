import api from '../../../api/api';

export const studentsApi = {
  getStudents: async (params: Record<string, any> = {}) => {
    const response = await api.get('/students', { params });
    return response.data;
  },
  createStudent: async (data: any) => {
    const response = await api.post('/students', data);
    return response.data;
  },
  updateStudent: async (id: string, data: any) => {
    const response = await api.patch(`/students/${id}`, data);
    return response.data;
  },
  deleteStudent: async (id: string) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },
  promoteStudent: async (id: string, data: any) => {
    const response = await api.post(`/students/${id}/promote`, data);
    return response.data;
  },
  transferStudent: async (id: string, data: any) => {
    const response = await api.post(`/students/${id}/transfer`, data);
    return response.data;
  },
  suggestStudents: async (q: string) => {
    const response = await api.get('/students/suggest', { params: { q } });
    return response.data;
  },
};
