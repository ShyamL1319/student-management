/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import {
  AuditAction,
  AuditStatus,
} from '../../audit-logs/schemas/audit-log.schema';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  private redactSecrets(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.redactSecrets(item));
    }

    const redacted: any = {};
    for (const key of Object.keys(obj)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = [
        'password',
        'secret',
        'token',
        'key',
        'credential',
        'auth',
        'pass',
        'api_key',
      ].some((sensitiveWord) => lowerKey.includes(sensitiveWord));

      if (isSensitive && typeof obj[key] === 'string' && obj[key]) {
        redacted[key] = '******';
      } else if (typeof obj[key] === 'object') {
        redacted[key] = this.redactSecrets(obj[key]);
      } else {
        redacted[key] = obj[key];
      }
    }
    return redacted;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const { method, originalUrl, body, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';

    // Determine Action
    let action = AuditAction.READ;
    if (method === 'POST') {
      if (originalUrl.includes('login')) action = AuditAction.LOGIN;
      else if (originalUrl.includes('logout')) action = AuditAction.LOGOUT;
      else action = AuditAction.CREATE;
    } else if (method === 'PUT' || method === 'PATCH') {
      action = AuditAction.UPDATE;
    } else if (method === 'DELETE') {
      action = AuditAction.DELETE;
    }

    // Skip GET requests unless we specifically want to track reads
    // Often we don't log every single READ to avoid db bloat
    const shouldLog = action !== AuditAction.READ;

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          if (shouldLog) {
            const user = request.user;
            let entityType = originalUrl.split('/')[1] || 'unknown';
            if (entityType.includes('?')) entityType = entityType.split('?')[0];

            this.auditLogsService
              .create({
                action,
                entityType,
                entityId: data?._id || data?.id || body?._id || body?.id,
                performedBy: user?._id || user?.id,
                changes:
                  action !== AuditAction.LOGIN
                    ? this.redactSecrets(body)
                    : undefined,
                ipAddress: ip,
                userAgent,
                status: AuditStatus.SUCCESS,
              })
              .catch((err) => console.error('Failed to create audit log', err));
          }
        },
        error: (error: any) => {
          if (shouldLog) {
            const user = request.user;
            let entityType = originalUrl.split('/')[1] || 'unknown';
            if (entityType.includes('?')) entityType = entityType.split('?')[0];

            this.auditLogsService
              .create({
                action,
                entityType,
                performedBy: user?._id || user?.id,
                changes:
                  action !== AuditAction.LOGIN
                    ? this.redactSecrets(body)
                    : undefined,
                ipAddress: ip,
                userAgent,
                status: AuditStatus.FAILURE,
              })
              .catch((err) =>
                console.error('Failed to create audit log on error', err),
              );
          }
        },
      }),
    );
  }
}
