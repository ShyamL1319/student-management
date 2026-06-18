import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
  integrations: [
    nodeProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Set sampling rate for profiling (SDK 10.x uses profileSessionSampleRate)
  profileSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profileLifecycle: 'trace',
  // Structured logs
  enableLogs: true,
});
