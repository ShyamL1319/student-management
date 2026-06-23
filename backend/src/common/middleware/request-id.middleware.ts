import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = (req.headers['x-request-id'] as string) || randomUUID();
    const correlationId =
      (req.headers['x-correlation-id'] as string) || requestId;

    // Attach IDs to request for downstream handlers (logging, tracing)
    (req as any).requestId = requestId;
    (req as any).correlationId = correlationId;

    res.setHeader('X-Request-ID', requestId);
    res.setHeader('X-Correlation-ID', correlationId);

    // No tenant scoping needed for single‑school deployment; proceed directly
    next();
  }
}
