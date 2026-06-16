import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantContext } from './tenant.context';
import { RoleEnum } from '../common/enums/role.enum';

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new UnauthorizedException('Tenant context is missing or invalid');
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Resolve userId for telemetry tracking
    let resolvedUserId = user?._id?.toString() || user?.id?.toString();
    if (!resolvedUserId) {
      const authHeader = request?.headers?.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.split(' ')[1];
          const payloadPart = token.split('.')[1];
          if (payloadPart) {
            const payload = JSON.parse(
              Buffer.from(payloadPart, 'base64').toString(),
            );
            resolvedUserId = payload.sub || payload.id || payload._id;
          }
        } catch (e) {
          // Ignore token parsing failure, authentication guards handle verification
        }
      }
    }

    if (resolvedUserId) {
      TenantContext.setUserId(resolvedUserId);
    }

    let userSchoolId =
      user?.schoolId?.toString() ||
      user?.school?.toString() ||
      user?.school?._id?.toString();
    let isSuperAdmin = user?.role?.name === RoleEnum.SUPER_ADMIN;

    // If request.user is not populated yet (global guard execution order), extract from JWT
    if (!userSchoolId) {
      const authHeader = request?.headers?.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.split(' ')[1];
          const payloadPart = token.split('.')[1];
          if (payloadPart) {
            const payload = JSON.parse(
              Buffer.from(payloadPart, 'base64').toString(),
            );
            userSchoolId = payload.schoolId || payload.school;
            const roleName = payload.role?.name || payload.role;
            isSuperAdmin = roleName === RoleEnum.SUPER_ADMIN;
          }
        } catch (e) {
          this.logger.warn('Failed to decode JWT payload in TenantGuard', e);
          // Ignore decoding errors, let JwtAuthGuard handle token validation
        }
      }
    }

    // Validate boundaries if we have resolved the user's school
    if (userSchoolId) {
      if (isSuperAdmin) {
        return true;
      }

      if (userSchoolId !== schoolId) {
        this.logger.error(
          `SECURITY ALERT: User attempted cross-tenant access. User School: ${userSchoolId}, Target School: ${schoolId}`,
        );
        throw new ForbiddenException(
          'Access Denied: Cross-tenant access detected',
        );
      }
    }

    return true;
  }
}
