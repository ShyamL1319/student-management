import axios from 'axios';
import * as Sentry from '@sentry/react';

const generateUUID = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Retrieve or initialize correlation ID for session tracing
let sessionCorrelationId = localStorage.getItem('sessionCorrelationId');
if (!sessionCorrelationId) {
  sessionCorrelationId = generateUUID();
  localStorage.setItem('sessionCorrelationId', sessionCorrelationId);
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://edusphere-api-dev.com:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Inject headers for distributed tracing
  if (config.headers) {
    config.headers['X-Correlation-ID'] = sessionCorrelationId;
    config.headers['X-Request-ID'] = generateUUID();
  }

  // Attach start time to measure request duration
  (config as any).metadata = { startTime: Date.now() };

  return config;
});

api.interceptors.response.use(
  (response) => {
    // Track Sentry Metrics for successful API response
    const startTime = (response.config as any).metadata?.startTime;
    if (startTime) {
      const durationMs = Date.now() - startTime;
      const url = response.config.url || 'unknown';
      const method = response.config.method || 'get';
      const status = response.status;

      try {
        Sentry.metrics.count('frontend.api.requests', 1, {
          attributes: {
            url,
            method,
            status: String(status),
            state: 'success',
          },
        });
        Sentry.metrics.distribution('frontend.api.duration', durationMs, {
          unit: 'millisecond',
          attributes: {
            url,
            method,
            status: String(status),
            state: 'success',
          },
        });
      } catch (metricErr) {
        // Ignore Sentry metrics errors
      }
    }
    return response;
  },
  (error) => {
    // Track Sentry Metrics for failed API response
    const startTime = (error.config as any)?.metadata?.startTime;
    if (startTime) {
      const durationMs = Date.now() - startTime;
      const url = error.config?.url || 'unknown';
      const method = error.config?.method || 'get';
      const status = error.response?.status || 'network_error';

      try {
        Sentry.metrics.count('frontend.api.requests', 1, {
          attributes: {
            url,
            method,
            status: String(status),
            state: 'error',
          },
        });
        Sentry.metrics.distribution('frontend.api.duration', durationMs, {
          unit: 'millisecond',
          attributes: {
            url,
            method,
            status: String(status),
            state: 'error',
          },
        });
      } catch (metricErr) {
        // Ignore Sentry metrics errors
      }
    }

    const requestId = error.response?.headers?.['x-request-id'] || error.response?.headers?.['X-Request-ID'];

    console.error('[API Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message,
      requestId,
    });

    const status = error.response?.status;
    if (!status || status >= 500) {
      Sentry.captureException(error, {
        tags: {
          requestId,
          httpStatus: status || 'network_error',
          apiPath: error.config?.url,
          apiMethod: error.config?.method,
        },
        extra: {
          errorMessage: error.response?.data?.message || error.message,
        },
      });
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
