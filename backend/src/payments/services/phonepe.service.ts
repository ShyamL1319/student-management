import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PhonepeService {
  private readonly logger = new Logger(PhonepeService.name);
  private globalMerchantId: string;
  private globalSaltKey: string;
  private globalSaltIndex: string;
  private globalHostUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.globalMerchantId =
      this.configService.get<string>('PHONEPE_MERCHANT_ID') || '';
    this.globalSaltKey =
      this.configService.get<string>('PHONEPE_SALT_KEY') || '';
    this.globalSaltIndex =
      this.configService.get<string>('PHONEPE_SALT_INDEX') || '1';
    this.globalHostUrl =
      this.configService.get<string>('PHONEPE_HOST_URL') ||
      'https://api-preprod.phonepe.com/apis/pg-sandbox';
  }

  private getSettings(settings?: {
    merchantId?: string;
    saltKey?: string;
    saltIndex?: string;
    hostUrl?: string;
  }) {
    return {
      merchantId: settings?.merchantId || this.globalMerchantId,
      saltKey: settings?.saltKey || this.globalSaltKey,
      saltIndex: settings?.saltIndex || this.globalSaltIndex,
      hostUrl: settings?.hostUrl || this.globalHostUrl,
    };
  }

  /**
   * Generates X-VERIFY checksum for PhonePe header
   */
  private calculateChecksum(
    payload: string,
    apiEndpoint: string,
    saltKey: string,
    saltIndex: string,
  ): string {
    const stringToHash = payload + apiEndpoint + saltKey;
    const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    return `${hash}###${saltIndex}`;
  }

  /**
   * Initialize a PhonePe Standard Checkout Page request
   */
  async createPaymentRequest(
    amount: number, // In minor units (paise)
    transactionId: string,
    merchantUserId: string,
    redirectUrl: string,
    callbackUrl: string,
    schoolSettings?: any,
  ): Promise<{ redirectUrl: string; transactionId: string }> {
    const config = this.getSettings(schoolSettings);
    if (!config.merchantId || !config.saltKey) {
      throw new BadRequestException(
        'PhonePe merchant credentials are not configured.',
      );
    }

    const payload = {
      merchantId: config.merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: merchantUserId,
      amount: amount,
      redirectUrl: redirectUrl,
      redirectMode: 'POST',
      callbackUrl: callbackUrl,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
      'base64',
    );
    const apiEndpoint = '/pg/v1/pay';
    const xVerify = this.calculateChecksum(
      base64Payload,
      apiEndpoint,
      config.saltKey,
      config.saltIndex,
    );

    try {
      const response = await fetch(`${config.hostUrl}${apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
        },
        body: JSON.stringify({ request: base64Payload }),
      });

      const data = await response.json();

      if (data?.success && data?.data?.instrumentResponse?.redirectInfo?.url) {
        return {
          redirectUrl: data.data.instrumentResponse.redirectInfo.url,
          transactionId,
        };
      } else {
        this.logger.error('PhonePe pay response error:', data);
        throw new Error(data?.message || 'Initiation failed');
      }
    } catch (error) {
      this.logger.error('Error invoking PhonePe Merchant Pay API:', error);
      throw new BadRequestException(`PhonePe error: ${error.message}`);
    }
  }

  /**
   * Verify response payload signature
   */
  verifySignature(
    base64Response: string,
    xVerifyHeader: string,
    schoolSettings?: any,
  ): boolean {
    try {
      const config = this.getSettings(schoolSettings);
      const calculatedVerify = this.calculateChecksum(
        base64Response,
        '',
        config.saltKey,
        config.saltIndex,
      );
      return calculatedVerify === xVerifyHeader;
    } catch (error) {
      this.logger.error('PhonePe signature verification failed:', error);
      return false;
    }
  }

  /**
   * Verify status of a PhonePe transaction manually
   */
  async checkTransactionStatus(
    transactionId: string,
    schoolSettings?: any,
  ): Promise<{
    success: boolean;
    amount: number;
    paymentId?: string;
    message?: string;
  }> {
    const config = this.getSettings(schoolSettings);
    const apiEndpoint = `/pg/v1/status/${config.merchantId}/${transactionId}`;
    const xVerify = this.calculateChecksum(
      '',
      apiEndpoint,
      config.saltKey,
      config.saltIndex,
    );

    try {
      const response = await fetch(`${config.hostUrl}${apiEndpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': config.merchantId,
        },
      });

      const data = await response.json();

      if (data?.success && data?.code === 'PAYMENT_SUCCESS') {
        return {
          success: true,
          amount: data.data.amount,
          paymentId: data.data.transactionId,
          message: 'Success',
        };
      }

      return {
        success: false,
        amount: data?.data?.amount || 0,
        message: data?.message || 'Payment failed or pending',
      };
    } catch (error) {
      this.logger.error('Error checking PhonePe transaction status:', error);
      return { success: false, amount: 0, message: error.message };
    }
  }

  /**
   * Refund a PhonePe payment
   */
  async createRefund(
    originalTransactionId: string,
    refundTransactionId: string,
    amount: number, // In paise
    schoolSettings?: any,
  ): Promise<any> {
    const config = this.getSettings(schoolSettings);
    const payload = {
      merchantId: config.merchantId,
      merchantTransactionId: refundTransactionId,
      originalTransactionId: originalTransactionId,
      amount: amount,
      callbackUrl: `${this.configService.get<string>('VITE_API_BASE_URL') || 'https://api.psei.school.com:3000'}/payments/webhook/phonepe`,
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
      'base64',
    );
    const apiEndpoint = '/pg/v1/refund';
    const xVerify = this.calculateChecksum(
      base64Payload,
      apiEndpoint,
      config.saltKey,
      config.saltIndex,
    );

    try {
      const response = await fetch(`${config.hostUrl}${apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
        },
        body: JSON.stringify({ request: base64Payload }),
      });

      const data = await response.json();

      if (data?.success) {
        return {
          id: data.data.merchantTransactionId,
          status: 'SUCCESS',
        };
      } else {
        throw new Error(data?.message || 'Refund failed');
      }
    } catch (error) {
      this.logger.error('Error invoking PhonePe Refund API:', error);
      throw new BadRequestException(`PhonePe refund error: ${error.message}`);
    }
  }
}
