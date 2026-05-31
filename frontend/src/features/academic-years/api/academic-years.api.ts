import api from '../../../api/api';

export const academicYearApi = {
  getAcademicYears: async (params: Record<string, any> = {}) => {
    const response = await api.get('/academic-years', { params });
    return response.data;
  },
  createAcademicYear: async (data: any) => {
    const response = await api.post('/academic-years', data);
    return response.data;
  },
  updateAcademicYear: async (id: string, data: any) => {
    const response = await api.patch(`/academic-years/${id}`, data);
    return response.data;
  },
  deleteAcademicYear: async (id: string) => {
    const response = await api.delete(`/academic-years/${id}`);
    return response.data;
  },
};
