import {
  Controller,
  Post,
  Headers,
  Req,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueueJob, QueueJobDocument } from '../schemas/queue-job.schema';
import { Public } from '../../common/decorators/public.decorator';
import { Request } from 'express';

@ApiTags('Payment Webhooks')
@Controller('payments/webhook')
export class WebhookController {
  constructor(
    @InjectModel(QueueJob.name)
    private readonly queueModel: Model<QueueJobDocument>,
  ) {}

  @Post('stripe')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook listener endpoint' })
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Stripe Signature');
    }

    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      throw new BadRequestException(
        'Raw body not captured. Verify main.ts configuration.',
      );
    }

    // Queue webhook event for asynchronous background ingestion
    await this.queueModel.create({
      jobType: 'PROCESS_WEBHOOK',
      payload: {
        gateway: 'STRIPE',
        signature,
        body: rawBody.toString('utf8'),
      },
      status: 'PENDING',
    });

    return { received: true };
  }

  @Post('razorpay')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Razorpay webhook listener endpoint' })
  async handleRazorpayWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Req() req: Request,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Razorpay Signature');
    }

    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      throw new BadRequestException(
        'Raw body not captured. Verify main.ts configuration.',
      );
    }

    // Queue webhook event for asynchronous background ingestion
    await this.queueModel.create({
      jobType: 'PROCESS_WEBHOOK',
      payload: {
        gateway: 'RAZORPAY',
        signature,
        body: rawBody.toString('utf8'),
      },
      status: 'PENDING',
    });

    return { received: true };
  }

  @Post('phonepe')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'PhonePe webhook listener endpoint' })
  async handlePhonepeWebhook(
    @Headers('x-verify') signature: string,
    @Req() req: Request,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing X-VERIFY checksum header');
    }

    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      throw new BadRequestException(
        'Raw body not captured. Verify main.ts configuration.',
      );
    }

    // Queue webhook event for asynchronous background ingestion
    await this.queueModel.create({
      jobType: 'PROCESS_WEBHOOK',
      payload: {
        gateway: 'PHONEPE',
        signature,
        body: rawBody.toString('utf8'),
      },
      status: 'PENDING',
    });

    return { received: true };
  }
}
