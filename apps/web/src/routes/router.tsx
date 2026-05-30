import { Navigate, createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '../features/auth/LoginPage';
import { StudentsPage } from '../features/students/StudentsPage';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/students',
    element: (
      <ProtectedRoute>
        <StudentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/students" replace />,
  },
]);
