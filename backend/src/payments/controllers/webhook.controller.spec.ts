import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { WebhookController } from './webhook.controller';
import { QueueJob } from '../schemas/queue-job.schema';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';

describe('WebhookController', () => {
  let controller: WebhookController;
  let mockQueueModel: any;

  beforeEach(async () => {
    mockQueueModel = jest.fn();
    mockQueueModel.create = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        {
          provide: getModelToken(QueueJob.name),
          useValue: mockQueueModel,
        },
      ],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleStripeWebhook', () => {
    it('should queue Stripe webhook job successfully when rawBody is valid', async () => {
      const mockReq = {
        rawBody: Buffer.from(
          JSON.stringify({ id: 'evt_123', type: 'payment_intent.succeeded' }),
        ),
      } as unknown as Request;

      mockQueueModel.create.mockResolvedValue({
        _id: 'job123',
      });

      const result = await controller.handleStripeWebhook(
        'signature_123',
        mockReq,
      );

      expect(result).toEqual({ received: true });
      expect(mockQueueModel.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if stripe-signature is missing', async () => {
      const mockReq = {
        rawBody: Buffer.from('payload'),
      } as unknown as Request;

      await expect(controller.handleStripeWebhook('', mockReq)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if rawBody is missing on request', async () => {
      const mockReq = {} as Request; // missing rawBody

      await expect(
        controller.handleStripeWebhook('sig_123', mockReq),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleRazorpayWebhook', () => {
    it('should queue Razorpay webhook job successfully when rawBody is valid', async () => {
      const mockReq = {
        rawBody: Buffer.from(JSON.stringify({ event: 'order.paid' })),
      } as unknown as Request;

      mockQueueModel.create.mockResolvedValue({
        _id: 'job456',
      });

      const result = await controller.handleRazorpayWebhook(
        'razorpay_sig_123',
        mockReq,
      );

      expect(result).toEqual({ received: true });
      expect(mockQueueModel.create).toHaveBeenCalled();
    });
  });
});
