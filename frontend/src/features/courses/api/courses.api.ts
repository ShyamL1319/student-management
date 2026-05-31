import api from '../../../api/api';

export const coursesApi = {
  getCourses: async (params: Record<string, any> = {}) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },
  createCourse: async (data: any) => {
    const response = await api.post('/courses', data);
    return response.data;
  },
  updateCourse: async (id: string, data: any) => {
    const response = await api.patch(`/courses/${id}`, data);
    return response.data;
  },
  deleteCourse: async (id: string) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
};
