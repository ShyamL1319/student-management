import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import * as Sentry from '@sentry/nestjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, originalUrl } = req;
    const startTime = Date.now();

    // Noise reduction: Skip health check probes and Prometheus metrics endpoints
    if (
      originalUrl === '/health/live' ||
      originalUrl === '/health/ready' ||
      originalUrl === '/metrics'
    ) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const durationMs = Date.now() - startTime;
          (this.logger as any).log(
            `${method} ${originalUrl} ${res.statusCode}`,
            {
              httpMethod: method,
              httpPath: originalUrl,
              httpStatusCode: res.statusCode,
              durationMs,
            },
            'HTTP',
          );

          // Track Sentry Metrics on successful request
          try {
            const routePath = req.route?.path || originalUrl;
            const tenant = req.headers['x-tenant-id'] || 'default';
            Sentry.metrics.count('http.requests.total', 1, {
              attributes: {
                method,
                path: routePath,
                status: String(res.statusCode),
                tenant: String(tenant),
              },
            });
            Sentry.metrics.distribution('http.request.duration', durationMs, {
              unit: 'millisecond',
              attributes: {
                method,
                path: routePath,
                status: String(res.statusCode),
                tenant: String(tenant),
              },
            });
          } catch (metricErr) {
            // Ignore metrics tracking errors
          }
        },
        error: (err: any) => {
          const durationMs = Date.now() - startTime;
          (this.logger as any).error(
            `${method} ${originalUrl} FAILED`,
            {
              httpMethod: method,
              httpPath: originalUrl,
              durationMs,
              error: err.message || String(err),
            },
            err instanceof Error ? err.stack : undefined,
            'HTTP',
          );

          // Track Sentry Metrics on failed request
          try {
            const routePath = req.route?.path || originalUrl;
            const tenant = req.headers['x-tenant-id'] || 'default';
            const status = err.status || err.statusCode || 500;
            Sentry.metrics.count('http.requests.total', 1, {
              attributes: {
                method,
                path: routePath,
                status: String(status),
                error: err.name || 'Error',
                tenant: String(tenant),
              },
            });
            Sentry.metrics.distribution('http.request.duration', durationMs, {
              unit: 'millisecond',
              attributes: {
                method,
                path: routePath,
                status: String(status),
                error: err.name || 'Error',
                tenant: String(tenant),
              },
            });
          } catch (metricErr) {
            // Ignore metrics tracking errors
          }
        },
      }),
    );
  }
}
