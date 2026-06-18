import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/nestjs';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    (this.logger as any).error(
      `Unhandled exception: ${message}`,
      {
        httpMethod: request.method,
        httpPath: request.originalUrl,
        httpStatusCode: status,
        errorType: exception?.constructor?.name,
      },
      exception instanceof Error ? exception.stack : undefined,
      'AllExceptionsFilter',
    );

    if (status >= 500) {
      Sentry.captureException(exception, {
        extra: {
          requestId: (request as any).requestId,
          correlationId: (request as any).correlationId,
          httpMethod: request.method,
          httpPath: request.originalUrl,
          userId: (request as any).user?._id,
        },
      });
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
      requestId: (request as any).requestId,
    });
  }
}
