import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private globalStripe: Stripe;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.globalStripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16' as any,
      });
    } else {
      this.logger.warn('Stripe SECRET_KEY is not set globally. Fallback to per-tenant configuration is required.');
    }
  }

  private getClient(apiKey?: string): Stripe {
    if (apiKey) {
      return new Stripe(apiKey, { apiVersion: '2023-10-16' as any });
    }
    if (!this.globalStripe) {
      throw new BadRequestException('Stripe credentials not configured globally or for this school.');
    }
    return this.globalStripe;
  }

  /**
   * Create a Stripe PaymentIntent for parent payments
   */
  async createPaymentIntent(
    amount: number, // In minor units (cents)
    currency: string,
    metadata: Record<string, string>,
    apiKey?: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const stripe = this.getClient(apiKey);
      return await stripe.paymentIntents.create({
        amount,
        currency: currency.toLowerCase(),
        metadata,
        payment_method_types: ['card'],
      });
    } catch (error) {
      this.logger.error('Error creating Stripe PaymentIntent:', error);
      throw new BadRequestException(`Stripe error: ${error.message}`);
    }
  }

  /**
   * Construct and validate Stripe Webhook event
   */
  async constructEvent(
    rawBody: string | Buffer,
    signature: string,
    webhookSecret?: string,
    apiKey?: string,
  ): Promise<Stripe.Event> {
    try {
      const stripe = this.getClient(apiKey);
      const secret = webhookSecret || this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
      if (!secret) {
        throw new BadRequestException('Stripe Webhook Secret not configured.');
      }
      return stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (error) {
      this.logger.error('Stripe webhook signature validation failed:', error);
      throw new BadRequestException(`Webhook signature verification failed: ${error.message}`);
    }
  }

  /**
   * Create Stripe Customer
   */
  async createCustomer(
    email: string,
    name: string,
    metadata?: Record<string, string>,
    apiKey?: string,
  ): Promise<Stripe.Customer> {
    try {
      const stripe = this.getClient(apiKey);
      return await stripe.customers.create({
        email,
        name,
        metadata,
      });
    } catch (error) {
      this.logger.error('Error creating Stripe customer:', error);
      throw new BadRequestException(`Stripe error: ${error.message}`);
    }
  }

  /**
   * Create Stripe Subscription for recurring fees
   */
  async createSubscription(
    customerId: string,
    priceId: string,
    metadata?: Record<string, string>,
    apiKey?: string,
  ): Promise<Stripe.Subscription> {
    try {
      const stripe = this.getClient(apiKey);
      return await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });
    } catch (error) {
      this.logger.error('Error creating Stripe subscription:', error);
      throw new BadRequestException(`Stripe error: ${error.message}`);
    }
  }

  /**
   * Cancel active Stripe Subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    apiKey?: string,
  ): Promise<Stripe.Subscription> {
    try {
      const stripe = this.getClient(apiKey);
      return await stripe.subscriptions.cancel(subscriptionId);
    } catch (error) {
      this.logger.error('Error cancelling Stripe subscription:', error);
      throw new BadRequestException(`Stripe error: ${error.message}`);
    }
  }

  /**
   * Refund Stripe Payment
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number, // Optional partial refund
    apiKey?: string,
  ): Promise<Stripe.Refund> {
    try {
      const stripe = this.getClient(apiKey);
      const params: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };
      if (amount) {
        params.amount = amount;
      }
      return await stripe.refunds.create(params);
    } catch (error) {
      this.logger.error('Error creating Stripe refund:', error);
      throw new BadRequestException(`Stripe error: ${error.message}`);
    }
  }
}
