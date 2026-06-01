import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReceiptDocument = Receipt & Document;

@Schema({ timestamps: true })
export class Receipt {
  @Prop({ required: true, unique: true })
  receiptNumber: string;

  @Prop({ required: true })
  studentId: Types.ObjectId;

  @Prop({ required: true })
  feeCollectionId: Types.ObjectId;

  @Prop({ required: true })
  amountReceived: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ required: true })
  paymentDate: Date;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop({ default: null })
  transactionId: string;

  @Prop({ default: null })
  chequeNumber: string;

  @Prop({ type: String, enum: ['ISSUED', 'CANCELLED'] })
  status: string;

  @Prop({ required: true })
  receivedBy: string; // Staff/Admin who received payment

  @Prop({ default: null })
  remarks: string;

  @Prop({ type: Object, default: {} })
  feeDetails: any; // JSON containing fee structure details at time of receipt

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);
