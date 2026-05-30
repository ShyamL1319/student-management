import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

interface HttpExceptionBody {
  message?: string | string[];
  error?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body = exception instanceof HttpException ? exception.getResponse() : undefined;
    const normalized = this.normalizeBody(body);

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    const payload: ApiErrorResponse = {
      success: false,
      message: normalized.message,
      errors: normalized.errors,
    };

    response.status(status).json(payload);
  }

  private normalizeBody(body: string | object | undefined): { message: string; errors: string[] } {
    if (typeof body === 'string') {
      return { message: body, errors: [] };
    }

    const typedBody = body as HttpExceptionBody | undefined;
    const rawMessage = typedBody?.message ?? typedBody?.error ?? 'Internal server error';
    const errors = Array.isArray(rawMessage) ? rawMessage : [];
    const message = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage;

    return { message, errors };
  }
}
