import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AssignmentDocument = Assignment & Document;

@Schema({ timestamps: true })
export class Assignment {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  school!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subject!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Class', required: true })
  class!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacher!: Types.ObjectId;

  @Prop({ required: true })
  dueDate!: Date;

  @Prop({ required: true, default: 100 })
  maxMarks!: number;

  @Prop({ required: false })
  attachmentUrl?: string;

  @Prop({ required: true, default: true })
  isPublished!: boolean;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
