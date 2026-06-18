import { Controller, Get, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

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
    const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];
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
  @ApiOperation({ summary: 'Trigger a simulated internal server error (500) to test Sentry exception capture' })
  triggerError() {
    this.logger.warn('Triggering simulated internal server error for Sentry verification.');
    throw new Error('Simulated Backend Sentry Test Error');
  }
}
