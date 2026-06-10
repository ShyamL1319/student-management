import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RefundDocument = Refund & Document;

@Schema({ timestamps: true })
export class Refund {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Payment' })
  paymentId: Types.ObjectId;

  @Prop({ required: true })
  amount: number; // In minor units (cents/paise)

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true, unique: true })
  gatewayRefundId: string;

  @Prop({
    required: true,
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    default: 'PENDING',
  })
  status: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ type: Object, default: {} })
  gatewayResponse: any;
}

export const RefundSchema = SchemaFactory.createForClass(Refund);
