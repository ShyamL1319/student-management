import api from "../../../api/api";

export interface LinkChildDto {
  admissionNumber: string;
  dob: string;
}

export interface RegisterParentDto {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  relationshipType?: string;
}

export interface SendParentMessageDto {
  recipientId: string;
  subject?: string;
  content: string;
}

export const parentsApi = {
  getDashboard: async () => {
    const res = await api.get('/parents/dashboard');
    return res.data;
  },

  getChildren: async () => {
    const res = await api.get('/parents/children');
    return res.data;
  },

  linkChild: async (dto: LinkChildDto) => {
    const postRes = await api.post('/parents/link-child', dto);
    return postRes.data;
  },

  getChildAttendance: async (studentId: string, page = 1, limit = 20) => {
    const res = await api.get(`/parents/children/${studentId}/attendance`, {
      params: { page, limit }
    });
    return res.data;
  },

  getChildAcademic: async (studentId: string) => {
    const res = await api.get(`/parents/children/${studentId}/academic`);
    return res.data;
  },

  getChildFees: async (studentId: string) => {
    const res = await api.get(`/parents/children/${studentId}/fees`);
    return res.data;
  },

  getChildExams: async (studentId: string) => {
    const res = await api.get(`/parents/children/${studentId}/exams`);
    return res.data;
  },

  getNotifications: async () => {
    const res = await api.get('/parents/notifications');
    return res.data;
  },

  getMessages: async () => {
    const res = await api.get('/parents/messages');
    return res.data;
  },

  sendMessage: async (dto: SendParentMessageDto) => {
    const res = await api.post('/parents/messages', dto);
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/parents/profile');
    return res.data;
  },

  updateProfile: async (dto: Partial<RegisterParentDto>) => {
    const res = await api.patch('/parents/profile', dto);
    return res.data;
  },

  getParents: async (params: Record<string, unknown> = {}) => {
    const response = await api.get('/parents', { params });
    return response.data;
  },
  createParent: async (data: unknown) => {
    const response = await api.post('/parents', data);
    return response.data;
  },
  updateParent: async (id: string, data: unknown) => {
    const response = await api.patch(`/parents/${id}`, data);
    return response.data;
  },
  deleteParent: async (id: string) => {
    const response = await api.delete(`/parents/${id}`);
    return response.data;
  },
  getParent: async (id: string) => {
    const response = await api.get(`/parents/${id}`);
    return response.data;
  },

  initiatePayment: async (dto: { studentId: string; invoiceId: string; gateway: 'STRIPE' | 'RAZORPAY' | 'PHONEPE' }) => {
    const res = await api.post('/payments/initiate', dto);
    return res.data;
  },

  simulatePaymentSuccess: async (dto: { paymentId: string }) => {
    const res = await api.post('/payments/simulate-success', dto);
    return res.data;
  }
};

