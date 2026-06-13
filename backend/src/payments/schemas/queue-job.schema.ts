import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QueueJobDocument = QueueJob & Document;

@Schema({ timestamps: true })
export class QueueJob {
  @Prop({
    required: true,
    enum: ['PROCESS_WEBHOOK', 'RETRY_PAYMENT_ALERT', 'SYNC_INVOICE_STATUS'],
  })
  jobType: string;

  @Prop({ required: true, type: Object })
  payload: any;

  @Prop({
    required: true,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'PENDING',
  })
  status: string;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ default: 3 })
  maxAttempts: number;

  @Prop({ default: null })
  lastError: string;

  @Prop({ default: null })
  processAfter: Date;
}

export const QueueJobSchema = SchemaFactory.createForClass(QueueJob);

QueueJobSchema.index({ status: 1, processAfter: 1, createdAt: 1 });
