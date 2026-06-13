import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

type RequestWithUserRole = Request & {
  user?: {
    roles?: Array<string | { name?: RoleEnum }>;
    role?: string | { name?: RoleEnum };
    roleType?: string;
  };
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const req = context.switchToHttp().getRequest<RequestWithUserRole>();
    const user = req.user;
    if (!user) return false;

    const roleNames = new Set<string>();

    if (user.roles && Array.isArray(user.roles)) {
      user.roles.forEach((r: any) => {
        if (typeof r === 'string') {
          roleNames.add(r);
        } else if (r && typeof r.name === 'string') {
          roleNames.add(r.name);
        }
      });
    }

    if (user.role) {
      if (typeof user.role === 'string') {
        roleNames.add(user.role);
      } else if (user.role.name) {
        roleNames.add(user.role.name);
      }
    }

    if (user.roleType) {
      roleNames.add(user.roleType);
    }

    // Grant full access to SUPER_ADMIN regardless of required roles
    if (roleNames.has(RoleEnum.SUPER_ADMIN)) {
      return true;
    }

    return requiredRoles.some((role) => roleNames.has(role));
  }
}
