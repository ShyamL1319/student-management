import { Controller, Get, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import * as Sentry from '@sentry/nestjs';

@ApiTags('Health / Diagnostics')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(@InjectConnection() private connection: Connection) {}

  @Public()
  @Get('live')
  @ApiOperation({ summary: 'Liveness probe health check' })
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('ready')
  async readiness() {
    const dbState = this.connection.readyState; // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    const stateNames = [
      'disconnected',
      'connected',
      'connecting',
      'disconnecting',
    ];
    const dbStateName = stateNames[dbState] || 'unknown';

    if (dbState !== 1) {
      this.logger.error({
        message: `Readiness probe failed. Reason: MongoDB connection state is ${dbState} (${dbStateName})`,
        dbState,
        dbStateName,
      });
      throw new Error('Database not ready');
    }
    return {
      status: 'ok',
      database: dbStateName,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('trigger-error')
  @ApiOperation({
    summary:
      'Trigger a simulated internal server error (500) to test Sentry exception capture',
  })
  triggerError() {
    this.logger.warn(
      'Triggering simulated internal server error for Sentry verification.',
    );
    throw new Error('Simulated Backend Sentry Test Error');
  }

  @Public()
  @Get('trigger-metric')
  @ApiOperation({
    summary:
      'Trigger custom backend Sentry metrics (count and distribution) for verification',
  })
  triggerMetric() {
    this.logger.log(
      'Triggering simulated backend Sentry metrics for verification.',
    );

    try {
      // Increment metric count
      Sentry.metrics.count('backend.test_metric.count', 1, {
        attributes: {
          source: 'health_controller',
          stage: 'verification',
        },
      });

      // Track metric distribution
      const duration = Math.floor(Math.random() * 200) + 10;
      Sentry.metrics.distribution('backend.test_metric.duration', duration, {
        unit: 'millisecond',
        attributes: {
          source: 'health_controller',
          stage: 'verification',
        },
      });

      return {
        status: 'ok',
        message: 'Simulated Sentry metrics triggered successfully',
        metrics: {
          count: 'backend.test_metric.count',
          distribution: 'backend.test_metric.duration',
          simulatedValue: `${duration}ms`,
        },
      };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to trigger Sentry metrics: ${errMsg}`);
      throw err;
    }
  }
}
