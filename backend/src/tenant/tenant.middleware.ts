import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Tenant, TenantDocument } from './schemas/tenant.schema';
import { School, SchoolDocument } from '../schools/schemas/school.schema';
import { TenantContext } from './tenant.context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private static readonly contextCache = new Map<string, { data: { tenantId: string; schoolId: string; subdomain: string }; expiresAt: number }>();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(School.name) private schoolModel: Model<SchoolDocument>,
    private jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let resolvedIdentifier: string | null = null;

    // 1. X-Tenant-ID header
    const headerTenant = req.headers['x-tenant-id'] as string;
    if (headerTenant) {
      const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(headerTenant);
      if (!isIP && !Types.ObjectId.isValid(headerTenant)) {
        const parts = headerTenant.split('.');
        if (
          parts.length > 1 &&
          parts[0] !== 'www' &&
          parts[0] !== 'localhost'
        ) {
          if (parts[0] === 'api' && parts.length > 2) {
            resolvedIdentifier = parts[1];
          } else {
            resolvedIdentifier = parts[0];
          }
        } else {
          resolvedIdentifier = headerTenant;
        }
      } else {
        resolvedIdentifier = headerTenant;
      }
    }

    // 2. Subdomain extraction
    if (!resolvedIdentifier) {
      const host = req.headers.host || '';
      const hostname = host.split(':')[0];
      const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);

      if (!isIP) {
        const parts = hostname.split('.');
        if (
          parts.length > 1 &&
          parts[0] !== 'www' &&
          parts[0] !== 'localhost'
        ) {
          if (parts[0] === 'api' && parts.length > 2) {
            resolvedIdentifier = parts[1];
          } else {
            resolvedIdentifier = parts[0];
          }
        }
      }
    }

    // 3. JWT claims extraction (manual decode since passport auth executes later)
    if (!resolvedIdentifier) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.split(' ')[1];
          const decoded = this.jwtService.decode(token) as any;
          // In the database user record, we'll store schoolId. If they are authenticated, their claims will contain schoolId
          if (decoded && decoded.schoolId) {
            resolvedIdentifier = decoded.schoolId;
          } else if (decoded && decoded.school) {
            resolvedIdentifier = decoded.school;
          }
        } catch (err) {
          // Ignore decode errors, let JwtAuthGuard handle validation
        }
      }
    }

    if (!resolvedIdentifier) {
      return next();
    }

    // Check Cache
    const now = Date.now();
    const cached = TenantMiddleware.contextCache.get(resolvedIdentifier);
    if (cached && cached.expiresAt > now) {
      TenantContext.run(cached.data, () => {
        next();
      });
      return;
    }

    try {
      let tenant: TenantDocument | null = null;

      if (Types.ObjectId.isValid(resolvedIdentifier)) {
        // Find tenant by ID or resolve school's tenant if it is a schoolId
        tenant = await this.tenantModel.findById(resolvedIdentifier);
        if (!tenant) {
          // If not found as tenant, check if this is a School ID, and get its tenant
          const school = await this.schoolModel.findById(resolvedIdentifier);
          if (school) {
            tenant = await this.tenantModel.findById(school.tenantId);
          }
        }
      } else {
        // Check subdomain or custom domain
        tenant = await this.tenantModel.findOne({
          $or: [
            { subdomain: resolvedIdentifier.toLowerCase() },
            { customDomain: resolvedIdentifier.toLowerCase() },
          ],
        });
      }

      if (
        !tenant &&
        (resolvedIdentifier.toLowerCase() === 'localhost' ||
          resolvedIdentifier.toLowerCase() === 'localhost-dev')
      ) {
        // Fallback to the first tenant in local development
        tenant = await this.tenantModel.findOne().exec();
      }

      if (!tenant) {
        throw new NotFoundException(
          `Tenant not found for identifier: ${resolvedIdentifier}`,
        );
      }

      if (!tenant.isActive) {
        throw new BadRequestException('Tenant account is inactive');
      }

      const school = await this.schoolModel.findOne({ tenantId: tenant._id });
      if (!school) {
        throw new NotFoundException(
          `School record missing for tenant: ${tenant.name}`,
        );
      }

      const contextData = {
        tenantId: tenant._id.toString(),
        schoolId: school._id.toString(),
        subdomain: tenant.subdomain,
      };

      // Update cache
      TenantMiddleware.contextCache.set(resolvedIdentifier, {
        data: contextData,
        expiresAt: now + this.CACHE_TTL_MS,
      });

      TenantContext.run(contextData, () => {
        next();
      });
    } catch (error) {
      next(error);
    }
  }
}
