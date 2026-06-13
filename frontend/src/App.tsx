import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Typography, CircularProgress, Box } from '@mui/material';
import { Suspense, lazy } from 'react';
import { Layout } from './components/common/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';

// Lazy loaded page components
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import('./features/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./features/auth/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const OAuthCallbackPage = lazy(() => import('./features/auth/pages/OAuthCallbackPage').then(m => ({ default: m.OAuthCallbackPage })));
const ProfilePage = lazy(() => import('./features/users/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const RoleManagementPage = lazy(() => import('./features/users/pages/RoleManagementPage').then(m => ({ default: m.RoleManagementPage })));

const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const StudentsPage = lazy(() => import('./features/students/pages/StudentsPage').then(m => ({ default: m.StudentsPage })));
const TeachersPage = lazy(() => import('./features/teachers/pages/TeachersPage').then(m => ({ default: m.TeachersPage })));
const StaffPage = lazy(() => import('./features/staff/pages/StaffPage').then(m => ({ default: m.StaffPage })));
const ClassesPage = lazy(() => import('./features/classes/pages/ClassesPage').then(m => ({ default: m.ClassesPage })));
const SettingsPage = lazy(() => import('./features/settings/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const SchoolsPage = lazy(() => import('./features/schools/pages/SchoolsPage').then(m => ({ default: m.SchoolsPage })));
const AcademicYearsPage = lazy(() => import('./features/academic-years/pages/AcademicYearsPage').then(m => ({ default: m.AcademicYearsPage })));
const DepartmentsPage = lazy(() => import('./features/departments/pages/DepartmentsPage').then(m => ({ default: m.DepartmentsPage })));
const SectionsPage = lazy(() => import('./features/sections/pages/SectionsPage').then(m => ({ default: m.SectionsPage })));
const CoursesPage = lazy(() => import('./features/courses/pages/CoursesPage').then(m => ({ default: m.CoursesPage })));
const SubjectsPage = lazy(() => import('./features/subjects/pages/SubjectsPage').then(m => ({ default: m.SubjectsPage })));
const TimetablePage = lazy(() => import('./features/timetables/pages/TimetablePage'));
const AttendancePage = lazy(() => import('./features/attendance/pages/AttendancePage').then(m => ({ default: m.AttendancePage })));
const ExamsPage = lazy(() => import('./features/examinations/pages/ExamsPage').then(m => ({ default: m.ExamsPage })));
const FeeStructurePage = lazy(() => import('./features/fees/pages/FeeStructurePage'));
const FeeCollectionPage = lazy(() => import('./features/fees/pages/FeeCollectionPage'));
const PendingFeesPage = lazy(() => import('./features/fees/pages/PendingFeesPage'));
const ReceiptsPage = lazy(() => import('./features/fees/pages/ReceiptsPage'));
const InvoiceGenerationPage = lazy(() => import('./features/fees/pages/InvoiceGenerationPage'));
const MarksPage = lazy(() => import('./features/marks/MarksPage'));
const NotificationCenter = lazy(() => import('./features/notifications/pages/NotificationCenter').then(m => ({ default: m.NotificationCenter })));
const NotificationPreferences = lazy(() => import('./features/notifications/pages/NotificationPreferences').then(m => ({ default: m.NotificationPreferences })));
const ReportsPage = lazy(() => import('./features/reports/pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const AuditLogsPage = lazy(() => import('./features/audit-logs').then(m => ({ default: m.AuditLogsPage })));
const ParentDashboard = lazy(() => import('./features/dashboard/pages/ParentDashboard'));
const LeavesPage = lazy(() => import('./features/leaves/pages/LeavesPage').then(m => ({ default: m.LeavesPage })));
const AssignmentsPage = lazy(() => import('./features/assignments/pages/AssignmentsPage').then(m => ({ default: m.AssignmentsPage })));

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, hasAnyRole } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;

  if (allowedRoles) {
    if (!hasAnyRole(allowedRoles)) {
      return <Navigate to="/" />;
    }
  }

  return <>{children}</>;
};

const LoadingScreen = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
    <CircularProgress size={40} />
  </Box>
);

function AppRoutes() {
  return (
    <Layout>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <StudentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers"
            element={
              <ProtectedRoute>
                <TeachersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parents"
            element={
              <ProtectedRoute>
                <ParentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <StaffPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/schools"
            element={
              <ProtectedRoute>
                <SchoolsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/academic-years"
            element={
              <ProtectedRoute>
                <AcademicYearsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/departments"
            element={
              <ProtectedRoute>
                <DepartmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CoursesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects"
            element={
              <ProtectedRoute>
                <SubjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes"
            element={
              <ProtectedRoute>
                <ClassesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sections"
            element={
              <ProtectedRoute>
                <SectionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exams"
            element={
              <ProtectedRoute>
                <ExamsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marks"
            element={
              <ProtectedRoute>
                <MarksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendances"
            element={
              <ProtectedRoute>
                <AttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaves"
            element={
              <ProtectedRoute>
                <LeavesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <AssignmentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/timetables"
            element={
              <ProtectedRoute>
                <TimetablePage />
              </ProtectedRoute>
            }
          />{' '}
          <Route
            path="/fee-structures"
            element={
              <ProtectedRoute>
                <FeeStructurePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fee-collections"
            element={
              <ProtectedRoute>
                <FeeCollectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pending-fees"
            element={
              <ProtectedRoute>
                <PendingFeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receipts"
            element={
              <ProtectedRoute>
                <ReceiptsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <InvoiceGenerationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications/preferences"
            element={
              <ProtectedRoute>
                <NotificationPreferences />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/roles"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                <RoleManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Typography variant="h5">404 - Not Found</Typography>} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <TenantProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </TenantProvider>
  );
}

export default App;
