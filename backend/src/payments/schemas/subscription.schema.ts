import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Student' })
  studentId: Types.ObjectId;

  @Prop({ required: true, enum: ['STRIPE', 'RAZORPAY'] })
  gateway: string;

  @Prop({ required: true })
  gatewayCustomerId: string;

  @Prop({ required: true, unique: true })
  gatewaySubscriptionId: string;

  @Prop({
    required: true,
    enum: ['ACTIVE', 'PAST_DUE', 'CANCELLED', 'UNPAID', 'PENDING'],
    default: 'PENDING',
  })
  status: string;

  @Prop({ required: true })
  currentPeriodEnd: Date;

  @Prop({ required: true })
  planId: string; // Stripe Price ID or Razorpay Plan ID

  @Prop({ default: true })
  isActive: boolean;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
