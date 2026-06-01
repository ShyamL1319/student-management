import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeeStructureDocument = FeeStructure & Document;

@Schema({ timestamps: true })
export class FeeStructure {
  @Prop({ required: true })
  classId: Types.ObjectId;

  @Prop({ required: true })
  academicYearId: Types.ObjectId;

  @Prop({ required: true })
  feeName: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ default: 'MONTHLY' })
  frequency: string; // MONTHLY, QUARTERLY, SEMESTER, ANNUAL

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, enum: ['APPLICABLE', 'OPTIONAL'] })
  applicability: string;

  @Prop({ default: null })
  description: string;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const FeeStructureSchema = SchemaFactory.createForClass(FeeStructure);
