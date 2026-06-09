import api from '../../../api/api';

export const assignmentsApi = {
  getAssignments: async (params?: any) => {
    const response = await api.get('/assignments', { params });
    return response.data;
  },
  getAssignmentDetails: async (id: string) => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },
  createAssignment: async (data: any) => {
    const response = await api.post('/assignments', data);
    return response.data;
  },
  updateAssignment: async (id: string, data: any) => {
    const response = await api.patch(`/assignments/${id}`, data);
    return response.data;
  },
  deleteAssignment: async (id: string) => {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
  },
  publishAssignment: async (id: string) => {
    const response = await api.post(`/assignments/${id}/publish`);
    return response.data;
  },
  getPresignedUrl: async (assignmentId: string, fileName: string) => {
    const response = await api.get(`/assignments/${assignmentId}/presign-upload`, {
      params: { fileName },
    });
    return response.data;
  },
  submitAssignment: async (assignmentId: string, data: { fileUrl: string; fileName: string; fileSize: number }) => {
    const response = await api.post(`/assignments/${assignmentId}/submit`, data);
    return response.data;
  },
  getSubmissions: async (assignmentId: string) => {
    const response = await api.get(`/assignments/${assignmentId}/submissions`);
    return response.data;
  },
  gradeSubmission: async (submissionId: string, data: { marksObtained: number; feedback?: string }) => {
    const response = await api.patch(`/assignments/submissions/${submissionId}/grade`, data);
    return response.data;
  },
  bulkGradeSubmissions: async (assignmentId: string, data: { grades: Array<{ submissionId: string; marksObtained: number; feedback?: string }> }) => {
    const response = await api.post(`/assignments/${assignmentId}/submissions/bulk-grade`, data);
    return response.data;
  },
  getAssignmentAnalytics: async (id: string) => {
    const response = await api.get(`/assignments/${id}/analytics`);
    return response.data;
  },
};
