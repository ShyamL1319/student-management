import * as Sentry from '@sentry/nestjs';

const integrations: any[] = [];
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { nodeProfilingIntegration } = require('@sentry/profiling-node');
  integrations.push(nodeProfilingIntegration());
} catch (error) {
  console.warn('Failed to load @sentry/profiling-node, profiling will be disabled:', error);
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment:
    process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development',
  release: process.env.SENTRY_RELEASE,
  integrations,
  // Data collection (SDK ≥ 10.57.0 — replaces deprecated sendDefaultPii)
  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment/configure the options below:
    // userInfo: false,
    // httpBodies: [],
  },
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Set sampling rate for profiling (SDK 10.x uses profileSessionSampleRate)
  profileSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profileLifecycle: 'trace',
  // Structured logs
  enableLogs: true,
});
