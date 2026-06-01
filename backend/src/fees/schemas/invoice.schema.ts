import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true, unique: true })
  invoiceNumber: string;

  @Prop({ required: true })
  studentId: Types.ObjectId;

  @Prop({ required: true })
  classId: Types.ObjectId;

  @Prop({ required: true })
  academicYearId: Types.ObjectId;

  @Prop({ required: true })
  invoiceDate: Date;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ type: [Object], default: [] })
  feeItems: any[]; // Array of fee structures with amounts

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: 0 })
  totalDiscount: number;

  @Prop({ required: true })
  netAmount: number;

  @Prop({ default: 0 })
  paidAmount: number;

  @Prop()
  pendingAmount: number;

  @Prop({ type: String, enum: ['DRAFT', 'ISSUED', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'] })
  status: string;

  @Prop({ default: null })
  notes: string;

  @Prop({ default: null })
  issuedBy: string; // Staff/Admin who issued invoice

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
