import api from '../../../api/api';

export const departmentApi = {
  getDepartments: async (params: Record<string, any> = {}) => {
    const response = await api.get('/departments', { params });
    return response.data;
  },
  createDepartment: async (data: any) => {
    const response = await api.post('/departments', data);
    return response.data;
  },
  updateDepartment: async (id: string, data: any) => {
    const response = await api.patch(`/departments/${id}`, data);
    return response.data;
  },
  deleteDepartment: async (id: string) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },
};
