import './instrument'; // MUST be first
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Sentry from '@sentry/react';
import { reactErrorHandler } from '@sentry/react';
import { ThemeModeProvider } from './contexts/ThemeContext.tsx';
import App from './App.tsx';
import './index.css';



// Initialize and sync correlation ID for session tracing
let correlationId = localStorage.getItem('sessionCorrelationId');
if (!correlationId) {
  correlationId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  localStorage.setItem('sessionCorrelationId', correlationId);
}

Sentry.setTag('correlationId', correlationId);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 1000, // 10 seconds default stale time
      refetchOnWindowFocus: false, // Prevent window focus refetch storms
      retry: 1, // Limit retries on error to reduce network load
    },
  },
});

createRoot(document.getElementById('root')!, {
  onUncaughtError: reactErrorHandler(),
  onCaughtError: reactErrorHandler(),
  onRecoverableError: reactErrorHandler(),
}).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <App />
      </ThemeModeProvider>
    </QueryClientProvider>
  </StrictMode>
);
