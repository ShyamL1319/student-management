import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

type RequestWithUserRole = Request & {
  user?: {
    role?: {
      name?: RoleEnum;
    };
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
    const roleName = req.user?.role?.name;
    if (!roleName) return false;
    // Grant full access to SUPER_ADMIN regardless of required roles
    if (roleName === RoleEnum.SUPER_ADMIN) return true;
    return requiredRoles.includes(roleName);
  }
}
