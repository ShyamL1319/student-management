import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { trace, context } from '@opentelemetry/api';
import { TenantContext } from '../../tenant/tenant.context';

const colors = {
  fatal: '\x1b[41m\x1b[37m', // bold white text on red background
  error: '\x1b[31m', // red
  warn: '\x1b[33m', // yellow
  info: '\x1b[32m', // green
  debug: '\x1b[34m', // blue
  trace: '\x1b[36m', // cyan
  verbose: '\x1b[36m', // cyan (mapped to trace color)
  reset: '\x1b[0m',
};

const customLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
  verbose: 5,
};

const injectContext = winston.format((info) => {
  // 1. Get Tenant & Request context from AsyncLocalStorage
  try {
    const store = TenantContext.get();
    if (store) {
      info.requestId = store.requestId;
      info.correlationId = store.correlationId;
      if (store.tenantId) info.tenantId = store.tenantId;
      if (store.userId) info.userId = store.userId;
    }
  } catch (err) {
    // Ignore to prevent logging failures
  }

  // 2. Get active OpenTelemetry span context
  try {
    const activeSpan = trace.getSpan(context.active());
    if (activeSpan) {
      const spanContext = activeSpan.spanContext();
      if (spanContext && spanContext.traceId) {
        info.traceId = spanContext.traceId;
        info.spanId = spanContext.spanId;
      }
    }
  } catch (err) {
    // Ignore to prevent logging failures
  }

  return info;
});

const SENSITIVE_KEYS = [
  'password',
  'secret',
  'token',
  'authorization',
  'ssn',
  'creditcard',
  'credit_card',
  'cvv',
  'api_key',
  'apikey',
  'private_key',
  'privatekey',
  'passphrase',
  'cookie',
];

const redact = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(redact);
  }

  const result: any = {};
  for (const key of Object.keys(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some((sensitiveWord) => lowerKey.includes(sensitiveWord));

    if (isSensitive && typeof obj[key] === 'string' && obj[key]) {
      result[key] = '[REDACTED]';
    } else if (typeof obj[key] === 'object') {
      result[key] = redact(obj[key]);
    } else {
      result[key] = obj[key];
    }
  }
  return result;
};

const redactFormat = winston.format((info) => {
  return redact(info);
});

@Injectable()
export class AppLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';

    const devFormat = winston.format.printf(({ timestamp, level, message, context: logContext, ...meta }) => {
      const lowerLevel = level.toLowerCase();
      const color = colors[lowerLevel as keyof typeof colors] || '';
      const reset = colors.reset;
      const formattedLevel = `${color}${level.toUpperCase().padEnd(5)}${reset}`;

      // Clean metadata
      const cleanMeta = { ...meta };
      delete cleanMeta.service;
      delete cleanMeta.environment;
      delete cleanMeta.version;

      let msgStr = message;
      if (typeof message === 'object' && message !== null) {
        const { message: innerMsg, ...restMsg } = message as Record<string, any>;
        msgStr = innerMsg || JSON.stringify(message);
        Object.assign(cleanMeta, restMsg);
      }

      let stackString = '';
      if (cleanMeta.stackTrace) {
        stackString = `\n${cleanMeta.stackTrace}`;
        delete cleanMeta.stackTrace;
      }

      // Format contextual trace identifiers if present
      let contextString = '';
      if (cleanMeta.traceId) {
        contextString = ` [traceId=${(cleanMeta.traceId as string).slice(0, 8)}]`;
        delete cleanMeta.traceId;
        delete cleanMeta.spanId;
      }

      const metaString = Object.keys(cleanMeta).length > 0 ? ` ${JSON.stringify(cleanMeta)}` : '';
      return `${timestamp} [${formattedLevel}] [${logContext || 'App'}]${contextString} ${msgStr}${metaString}${stackString}`;
    });

    this.logger = winston.createLogger({
      levels: customLevels,
      level: process.env.LOG_LEVEL || 'info',
      defaultMeta: {
        service: 'school-management-backend',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '0.0.1',
      },
      transports: [
        new winston.transports.Console({
          format: isProduction
            ? winston.format.combine(
              winston.format.timestamp(),
              injectContext(),
              redactFormat(),
              winston.format.json(),
            )
            : winston.format.combine(
              winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
              injectContext(),
              redactFormat(),
              devFormat,
            ),
        }),
      ],
    });
  }

  log(message: any, ...optionalParams: any[]) {
    const { context, meta } = this.parseParams(optionalParams);
    this.logger.info(message, { context, ...meta });
  }

  error(message: any, ...optionalParams: any[]) {
    const { context, meta, trace } = this.parseErrorParams(optionalParams);
    this.logger.error(message, { context, stackTrace: trace, ...meta });
  }

  warn(message: any, ...optionalParams: any[]) {
    const { context, meta } = this.parseParams(optionalParams);
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: any, ...optionalParams: any[]) {
    const { context, meta } = this.parseParams(optionalParams);
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: any, ...optionalParams: any[]) {
    const { context, meta } = this.parseParams(optionalParams);
    this.logger.verbose(message, { context, ...meta });
  }

  fatal(message: any, ...optionalParams: any[]) {
    const { context, meta } = this.parseParams(optionalParams);
    this.logger.log('fatal', message, { context, ...meta });
  }

  private parseParams(optionalParams: any[]) {
    let context: string | undefined;
    let meta: any = {};

    if (optionalParams.length > 0) {
      if (typeof optionalParams[optionalParams.length - 1] === 'string') {
        context = optionalParams[optionalParams.length - 1];
        if (optionalParams.length > 1) {
          meta = optionalParams[0];
        }
      } else {
        meta = optionalParams[0];
      }
    }
    return { context, meta };
  }

  private parseErrorParams(optionalParams: any[]) {
    let trace: string | undefined;
    let context: string | undefined;
    let meta: any = {};

    if (optionalParams.length > 0) {
      if (typeof optionalParams[0] === 'string') {
        trace = optionalParams[0];
        if (optionalParams.length > 1) {
          context = optionalParams[1];
        }
      } else {
        meta = optionalParams[0];
        if (optionalParams.length > 1) {
          trace = optionalParams[1];
          if (optionalParams.length > 2) {
            context = optionalParams[2];
          }
        }
      }
    }
    return { trace, context, meta };
  }
}
