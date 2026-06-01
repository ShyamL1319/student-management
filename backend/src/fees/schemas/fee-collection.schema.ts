import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeeCollectionDocument = FeeCollection & Document;

@Schema({ timestamps: true })
export class FeeCollection {
  @Prop({ required: true })
  studentId: Types.ObjectId;

  @Prop({ required: true })
  feeStructureId: Types.ObjectId;

  @Prop({ required: true })
  classId: Types.ObjectId;

  @Prop({ required: true })
  academicYearId: Types.ObjectId;

  @Prop({ required: true })
  amountDue: number;

  @Prop({ default: 0 })
  amountPaid: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ default: null })
  paymentDate: Date;

  @Prop({ type: String, enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE'] })
  status: string;

  @Prop({ default: null })
  paymentMethod: string; // CASH, CHEQUE, ONLINE, etc.

  @Prop({ default: null })
  transactionId: string;

  @Prop({ default: null })
  remarks: string;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const FeeCollectionSchema = SchemaFactory.createForClass(FeeCollection);
