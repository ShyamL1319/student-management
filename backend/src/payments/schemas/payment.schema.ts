import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Student' })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'School', index: true })
  schoolId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Invoice', default: null })
  invoiceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'FeeCollection', default: null })
  feeCollectionId: Types.ObjectId;

  @Prop({ required: true })
  amount: number; // Stored in minor units (cents / paise)

  @Prop({ required: true, default: 'INR' })
  currency: string;

  @Prop({ required: true, enum: ['STRIPE', 'RAZORPAY', 'PHONEPE', 'CASH', 'CHEQUE'] })
  gateway: string;

  @Prop({ required: true, unique: true })
  gatewayTransactionId: string; // PaymentIntent ID or Razorpay Order ID

  @Prop({ default: null })
  gatewayPaymentId: string; // Stripe Charge ID or Razorpay Payment ID

  @Prop({
    required: true,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
    default: 'PENDING',
  })
  status: string;

  @Prop({ type: Object, default: {} })
  gatewayResponse: any;

  @Prop({ default: null })
  failureReason: string;

  @Prop({ default: 0 })
  refundedAmount: number;

  @Prop({ type: [Object], default: [] })
  refunds: any[];
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
