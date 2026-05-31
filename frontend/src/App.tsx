import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import { Layout } from './components/common/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './features/auth/pages/LoginPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage';
import { ProfilePage } from './features/users/pages/ProfilePage';

import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { StudentsPage } from './features/students/pages/StudentsPage';
import { TeachersPage } from './features/teachers/pages/TeachersPage';
import { StaffPage } from './features/staff/pages/StaffPage';
import { ParentsPage } from './features/parents/pages/ParentsPage';
import { ClassesPage } from './features/classes/pages/ClassesPage';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { SchoolsPage } from './features/schools/pages/SchoolsPage';
import { AcademicYearsPage } from './features/academic-years/pages/AcademicYearsPage';
import { DepartmentsPage } from './features/departments/pages/DepartmentsPage';
import { SectionsPage } from './features/sections/pages/SectionsPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Protected Routes */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
        <Route path="/teachers" element={<ProtectedRoute><TeachersPage /></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute><StaffPage /></ProtectedRoute>} />
        <Route path="/parents" element={<ProtectedRoute><ParentsPage /></ProtectedRoute>} />
        <Route path="/schools" element={<ProtectedRoute><SchoolsPage /></ProtectedRoute>} />
        <Route path="/academic-years" element={<ProtectedRoute><AcademicYearsPage /></ProtectedRoute>} />
        <Route path="/departments" element={<ProtectedRoute><DepartmentsPage /></ProtectedRoute>} />
        <Route path="/classes" element={<ProtectedRoute><ClassesPage /></ProtectedRoute>} />
        <Route path="/sections" element={<ProtectedRoute><SectionsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        
        <Route path="*" element={<Typography variant="h5">404 - Not Found</Typography>} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
