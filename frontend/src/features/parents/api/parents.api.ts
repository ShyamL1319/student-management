import api from '../../../api/api';

export const parentsApi = {
  getParents: async (params: Record<string, any> = {}) => {
    const response = await api.get('/parents', { params });
    return response.data;
  },
  createParent: async (data: any) => {
    const response = await api.post('/parents', data);
    return response.data;
  },
  updateParent: async (id: string, data: any) => {
    const response = await api.patch(`/parents/${id}`, data);
    return response.data;
  },
  deleteParent: async (id: string) => {
    const response = await api.delete(`/parents/${id}`);
    return response.data;
  },
};
