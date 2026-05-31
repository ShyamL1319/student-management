import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Timetable {
  _id?: string;
  class: string;
  academicYear: string;
  teacher: string;
  subject: string;
  section?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room?: string;
  notes?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimetableResponse {
  data: any[];
  total: number;
}

export interface ConflictCheck {
  teacher: string;
  class: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  excludeTimetableId?: string;
}

export interface ConflictResponse {
  hasConflict: boolean;
  conflicts: Array<{
    timetableId: string;
    class: string;
    teacher: string;
    subject: string;
    startTime: string;
    endTime: string;
    dayOfWeek: string;
    conflictType: 'TEACHER_DOUBLE_BOOKING' | 'CLASS_OVERLAP';
  }>;
}

export const timetableAPI = {
  // Create timetable
  create: async (timetable: Timetable): Promise<Timetable> => {
    const response = await apiClient.post('/timetables', timetable);
    return response.data;
  },

  // Get all timetables with filters
  getAll: async (params: any = {}): Promise<TimetableResponse> => {
    const response = await apiClient.get('/timetables', { params });
    return response.data;
  },

  // Get timetable by ID
  getById: async (id: string): Promise<Timetable> => {
    const response = await apiClient.get(`/timetables/${id}`);
    return response.data;
  },

  // Update timetable
  update: async (id: string, timetable: Partial<Timetable>): Promise<Timetable> => {
    const response = await apiClient.patch(`/timetables/${id}`, timetable);
    return response.data;
  },

  // Delete timetable
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/timetables/${id}`);
  },

  // Get class timetable
  getClassTimetable: async (classId: string, params: any = {}): Promise<any[]> => {
    const response = await apiClient.get(`/timetables/class/${classId}`, { params });
    return response.data;
  },

  // Get weekly timetable for class
  getWeeklyTimetable: async (classId: string, params: any = {}): Promise<any> => {
    const response = await apiClient.get(`/timetables/class/${classId}/weekly`, { params });
    return response.data;
  },

  // Get teacher timetable
  getTeacherTimetable: async (teacherId: string, params: any = {}): Promise<any[]> => {
    const response = await apiClient.get(`/timetables/teacher/${teacherId}`, { params });
    return response.data;
  },

  // Check conflicts
  checkConflict: async (conflict: ConflictCheck): Promise<ConflictResponse> => {
    const response = await apiClient.post('/timetables/check-conflict', conflict);
    return response.data;
  },

  // Bulk create
  bulkCreate: async (timetables: Timetable[]): Promise<Timetable[]> => {
    const response = await apiClient.post('/timetables/bulk-create', timetables);
    return response.data;
  },
};
