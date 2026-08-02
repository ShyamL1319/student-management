import api from "../../../api/api";


export interface DashboardWidgets {
  totalSchools?: number;
  totalUsers?: number;
  totalStudents?: number;
  totalTeachers?: number;
  globalRevenue?: number;
  totalClasses?: number;
  totalRevenue?: number;
  myClasses?: number;
  upcomingExams?: number;
  attendancePercentage?: number;
  totalMarksRecords?: number;
  pendingFees?: number;
  childrenCount?: number;
  classesToday?: number;
  pendingAttendance?: number;
  assignmentsPendingReview?: number;
  unreadMessages?: number;
  pendingRequests?: number;
  [key: string]: any;
}

export interface ScheduleItem {
  id: string;
  subject: string;
  gradeClass?: string;
  time: string;
  location?: string;
  room?: string;
  status: string;
  link?: string;
  color?: string;
}

export interface AssignmentItem {
  id: string;
  title: string;
  subject: string;
  class: string;
  submitted: number;
  total: number;
  status: string;
  daysLeft?: number | null;
}

export interface LeaveRequestItem {
  id: string;
  studentName: string;
  class: string;
  reason: string;
  date: string;
  status: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  type: string;
  class: string;
  size: string;
}

export interface CommunicationItem {
  name: string;
  role: string;
  msg: string;
  time: string;
  unread: boolean | number;
  color?: string;
}

export interface ChartDataPoint {
  name: string;
  count?: number;
  rate?: number;
  gpa?: number;
  score?: number;
  [key: string]: any;
}

export interface DashboardResponse {
  widgets: DashboardWidgets;
  charts?: Record<string, ChartDataPoint[]>;
  student?: any;
  scheduleToday?: ScheduleItem[];
  assignments?: AssignmentItem[];
  leaveRequests?: LeaveRequestItem[];
  resources?: ResourceItem[];
  communications?: CommunicationItem[];
  exams?: any[];
  attendanceBreakdown?: any[];
  fees?: any;
  announcements?: any[];
  achievements?: any[];
  rank?: any;
  recentActivity?: any[];
  [key: string]: any;
}

export const fetchDashboardData = async (): Promise<DashboardResponse> => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};
