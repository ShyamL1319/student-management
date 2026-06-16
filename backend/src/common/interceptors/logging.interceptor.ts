import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

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
        },
      }),
    );
  }
}
