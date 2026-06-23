import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

type RequestWithUserRole = Request & {
  user?: {
    role?: {
      name?: RoleEnum;
    } | string;
    roleType?: RoleEnum;
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
    // Resolve role name from either roleType (JWT string) or role.name (populated object)
    const roleName =
      req.user?.roleType ||
      (typeof req.user?.role === 'object' ? req.user?.role?.name : undefined);
    if (!roleName) return false;
    // Grant full access to SUPER_ADMIN regardless of required roles
    if (roleName === RoleEnum.SUPER_ADMIN) return true;
    return requiredRoles.includes(roleName);
  }
}

