import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContext } from './tenant.context';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    const subdomain = TenantContext.getSubdomain();
    const schoolId = TenantContext.getSchoolId();

    if (response && response.setHeader && subdomain && schoolId) {
      response.setHeader('X-Resolved-Tenant', subdomain);
      response.setHeader('X-Resolved-School-ID', schoolId);
    }

    return next.handle();
  }
}
