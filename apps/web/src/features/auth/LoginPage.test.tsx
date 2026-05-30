import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { LoginPage } from './LoginPage';

function renderLogin() {
  const store = configureStore({ reducer: { auth: authReducer } });
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/students" element={<div>Students</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe('LoginPage', () => {
  it('renders the login form', () => {
    renderLogin();

    expect(screen.getByRole('heading', { name: /student management/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
});
