import api from '../api';

export const examinationsApi = {
  getExams: async (params: Record<string, any> = {}) => {
    const res = await api.get('/exams', { params });
    return res.data;
  },
  getExam: async (id: string) => {
    const res = await api.get(`/exams/${id}`);
    return res.data;
  },
  createExam: async (data: Record<string, any>) => {
    const res = await api.post('/exams', data);
    return res.data;
  },
  updateExam: async (id: string, data: Record<string, any>) => {
    const res = await api.patch(`/exams/${id}`, data);
    return res.data;
  },
  deleteExam: async (id: string) => {
    const res = await api.delete(`/exams/${id}`);
    return res.data;
  },
  publishExam: async (id: string) => {
    const res = await api.post(`/exams/${id}/publish`);
    return res.data;
  },
};
