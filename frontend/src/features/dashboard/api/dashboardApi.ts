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
}

export interface DashboardResponse {
  widgets: DashboardWidgets;
  charts?: Record<string, any>;
  recentActivity?: any[];
}

export const fetchDashboardData = async (): Promise<DashboardResponse> => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};
