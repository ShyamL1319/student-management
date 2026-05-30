import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { ProtectedRoute } from './ProtectedRoute';

describe('ProtectedRoute', () => {
  it('does not render children without a token', () => {
    const store = configureStore({ reducer: { auth: authReducer } });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
  });
});
