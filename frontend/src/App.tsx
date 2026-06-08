import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import { Layout } from './components/common/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { LoginPage } from './features/auth/pages/LoginPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage';
import { ProfilePage } from './features/users/pages/ProfilePage';
import { RoleManagementPage } from './features/users/pages/RoleManagementPage';

import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { StudentsPage } from './features/students/pages/StudentsPage';
import { TeachersPage } from './features/teachers/pages/TeachersPage';
import { StaffPage } from './features/staff/pages/StaffPage';
import { ClassesPage } from './features/classes/pages/ClassesPage';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { SchoolsPage } from './features/schools/pages/SchoolsPage';
import { AcademicYearsPage } from './features/academic-years/pages/AcademicYearsPage';
import { DepartmentsPage } from './features/departments/pages/DepartmentsPage';
import { SectionsPage } from './features/sections/pages/SectionsPage';
import { CoursesPage } from './features/courses/pages/CoursesPage';
import { SubjectsPage } from './features/subjects/pages/SubjectsPage';
import TimetablePage from './features/timetables/pages/TimetablePage';
import { AttendancePage } from './features/attendance/pages/AttendancePage';
import { ExamsPage } from './features/examinations/pages/ExamsPage';
import FeeStructurePage from './features/fees/pages/FeeStructurePage';
import FeeCollectionPage from './features/fees/pages/FeeCollectionPage';
import PendingFeesPage from './features/fees/pages/PendingFeesPage';
import ReceiptsPage from './features/fees/pages/ReceiptsPage';
import InvoiceGenerationPage from './features/fees/pages/InvoiceGenerationPage';
import MarksPage from './features/marks/MarksPage';
import { NotificationCenter } from './features/notifications/pages/NotificationCenter';
import { NotificationPreferences } from './features/notifications/pages/NotificationPreferences';
import { ReportsPage } from './features/reports/pages/ReportsPage';
import { AuditLogsPage } from './features/audit-logs';
import ParentDashboard from './features/dashboard/pages/ParentDashboard';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;

  if (allowedRoles) {
    const roleName = typeof user?.role === 'string' ? user.role : (user?.role as { name?: string })?.name;
    if (!roleName || !allowedRoles.includes(roleName)) {
      return <Navigate to="/" />;
    }
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
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
