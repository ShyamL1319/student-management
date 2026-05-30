import { Provider } from 'react-redux';
import { render, screen, waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../auth/authSlice';
import { StudentsPage } from './StudentsPage';
import * as studentsService from './studentsService';

vi.mock('./studentsService');

describe('StudentsPage', () => {
  it('renders empty state', async () => {
    vi.mocked(studentsService.listStudents).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 10,
    });
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          token: 'token',
          user: { id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin' as const },
          status: 'idle' as const,
          error: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <StudentsPage />
      </Provider>,
    );

    await waitFor(() => expect(screen.getByText(/no students found/i)).toBeInTheDocument());
  });
});
