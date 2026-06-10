import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private globalRazorpay: Razorpay | null = null;

  constructor(private configService: ConfigService) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    if (keyId && keySecret) {
      this.globalRazorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    } else {
      this.logger.warn(
        'Razorpay credentials are not set globally. Fallback to per-tenant configuration is required.',
      );
    }
  }

  private getClient(keyId?: string, keySecret?: string): Razorpay {
    if (keyId && keySecret) {
      return new Razorpay({ key_id: keyId, key_secret: keySecret });
    }
    if (!this.globalRazorpay) {
      throw new BadRequestException(
        'Razorpay credentials not configured globally or for this school.',
      );
    }
    return this.globalRazorpay;
  }

  /**
   * Create Razorpay Order (pre-requisite for checkout)
   */
  async createOrder(
    amount: number, // In minor units (paise)
    currency: string,
    receipt: string,
    notes?: Record<string, string>,
    keyId?: string,
    keySecret?: string,
  ): Promise<any> {
    try {
      const razorpay = this.getClient(keyId, keySecret);
      return await razorpay.orders.create({
        amount,
        currency,
        receipt,
        notes,
      });
    } catch (error) {
      this.logger.error('Error creating Razorpay Order:', error);
      throw new BadRequestException(
        `Razorpay error: ${error.message || error}`,
      );
    }
  }

  /**
   * Validate Webhook Signature
   */
  verifySignature(
    rawBody: string,
    signature: string,
    webhookSecret?: string,
  ): boolean {
    try {
      const secret =
        webhookSecret ||
        this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
      if (!secret) {
        throw new BadRequestException(
          'Razorpay Webhook Secret not configured.',
        );
      }
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');
      return expectedSignature === signature;
    } catch (error) {
      this.logger.error('Razorpay webhook verification error:', error);
      return false;
    }
  }

  /**
   * Create Razorpay Customer
   */
  async createCustomer(
    name: string,
    email: string,
    contact?: string,
    notes?: Record<string, string>,
    keyId?: string,
    keySecret?: string,
  ): Promise<any> {
    try {
      const razorpay = this.getClient(keyId, keySecret);
      return await razorpay.customers.create({
        name,
        email,
        contact,
        notes,
      });
    } catch (error) {
      this.logger.error('Error creating Razorpay Customer:', error);
      throw new BadRequestException(
        `Razorpay error: ${error.message || error}`,
      );
    }
  }

  /**
   * Create Razorpay Subscription
   */
  async createSubscription(
    customerId: string,
    planId: string,
    totalCount: number,
    notes?: Record<string, string>,
    keyId?: string,
    keySecret?: string,
  ): Promise<any> {
    try {
      const razorpay = this.getClient(keyId, keySecret);
      return await razorpay.subscriptions.create({
        plan_id: planId,
        customer_id: customerId,
        total_count: totalCount,
        notes,
      } as any);
    } catch (error) {
      this.logger.error('Error creating Razorpay Subscription:', error);
      throw new BadRequestException(
        `Razorpay error: ${error.message || error}`,
      );
    }
  }

  /**
   * Cancel Razorpay Subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    keyId?: string,
    keySecret?: string,
  ): Promise<any> {
    try {
      const razorpay = this.getClient(keyId, keySecret);
      return await razorpay.subscriptions.cancel(subscriptionId, false); // false = cancel immediately
    } catch (error) {
      this.logger.error('Error cancelling Razorpay Subscription:', error);
      throw new BadRequestException(
        `Razorpay error: ${error.message || error}`,
      );
    }
  }

  /**
   * Refund a Razorpay Payment
   */
  async createRefund(
    paymentId: string,
    amount?: number, // Optional partial refund amount
    notes?: Record<string, string>,
    keyId?: string,
    keySecret?: string,
  ): Promise<any> {
    try {
      const razorpay = this.getClient(keyId, keySecret);
      const params: any = {
        notes,
      };
      if (amount) {
        params.amount = amount;
      }
      return await razorpay.payments.refund(paymentId, params);
    } catch (error) {
      this.logger.error('Error creating Razorpay Refund:', error);
      throw new BadRequestException(
        `Razorpay error: ${error.message || error}`,
      );
    }
  }
}
