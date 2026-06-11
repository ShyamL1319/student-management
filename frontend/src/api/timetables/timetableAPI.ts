import api from '../api';

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
    const response = await api.post('/timetables', timetable);
    return response.data;
  },

  // Get all timetables with filters
  getAll: async (params: any = {}): Promise<TimetableResponse> => {
    const response = await api.get('/timetables', { params });
    return response.data;
  },

  // Get timetable by ID
  getById: async (id: string): Promise<Timetable> => {
    const response = await api.get(`/timetables/${id}`);
    return response.data;
  },

  // Update timetable
  update: async (id: string, timetable: Partial<Timetable>): Promise<Timetable> => {
    const response = await api.patch(`/timetables/${id}`, timetable);
    return response.data;
  },

  // Delete timetable
  delete: async (id: string): Promise<void> => {
    await api.delete(`/timetables/${id}`);
  },

  // Get class timetable
  getClassTimetable: async (classId: string, params: any = {}): Promise<any[]> => {
    const response = await api.get(`/timetables/class/${classId}`, { params });
    return response.data;
  },

  // Get weekly timetable for class
  getWeeklyTimetable: async (classId: string, params: any = {}): Promise<any> => {
    const response = await api.get(`/timetables/class/${classId}/weekly`, { params });
    return response.data;
  },

  // Get teacher timetable
  getTeacherTimetable: async (teacherId: string, params: any = {}): Promise<any[]> => {
    const response = await api.get(`/timetables/teacher/${teacherId}`, { params });
    return response.data;
  },

  // Check conflicts
  checkConflict: async (conflict: ConflictCheck): Promise<ConflictResponse> => {
    const response = await api.post('/timetables/check-conflict', conflict);
    return response.data;
  },

  // Bulk create
  bulkCreate: async (timetables: Timetable[]): Promise<Timetable[]> => {
    const response = await api.post('/timetables/bulk-create', timetables);
    return response.data;
  },
};
