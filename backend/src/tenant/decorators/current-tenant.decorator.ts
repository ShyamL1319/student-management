import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantContext } from '../tenant.context';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return TenantContext.get();
  },
);
