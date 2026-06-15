import { Controller, Get, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Public } from '../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(@InjectConnection() private connection: Connection) {}

  @Public()
  @Get('live')
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
}
