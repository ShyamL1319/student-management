import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdmissionApplicationDocument = AdmissionApplication & Document;

@Schema({ timestamps: true })
export class AdmissionApplication {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  school!: Types.ObjectId;

  @Prop({ required: true })
  applicantName!: string;

  @Prop({ required: true })
  gradeLevel!: string;

  @Prop({ required: true, default: 0 })
  entranceScore!: number;

  @Prop({ required: true, default: 'Applied' })
  status!: string; // 'Applied', 'Verified', 'Interview Scheduled', 'Under Review', 'Approved', 'Deferred'

  @Prop({ required: true })
  parentEmail!: string;
}

export const AdmissionApplicationSchema = SchemaFactory.createForClass(AdmissionApplication);
