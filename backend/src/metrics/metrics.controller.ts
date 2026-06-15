import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { register, collectDefaultMetrics } from 'prom-client';
import { Public } from '../common/decorators/public.decorator';

// Initialize default metrics collection
collectDefaultMetrics();

@Controller('metrics')
export class MetricsController {
  @Public()
  @Get()
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.send(metrics);
  }
}
