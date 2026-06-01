import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExamDocument = Exam & Document;

@Schema({ _id: false })
export class ExamSchedule {
  @Prop({ required: true })
  date!: Date;

  @Prop()
  startTime?: string;

  @Prop()
  endTime?: string;

  @Prop({ type: Types.ObjectId, ref: 'Subject' })
  subject?: Types.ObjectId;

  @Prop()
  maxMarks?: number;

  @Prop()
  passingMarks?: number;
}

export const ExamScheduleSchema = SchemaFactory.createForClass(ExamSchedule);

@Schema({ timestamps: true })
export class Exam {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  type!: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'AcademicYear' })
  academicYear?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Class' })
  class?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Section' })
  section?: Types.ObjectId;

  @Prop({ type: [ExamScheduleSchema], _id: false })
  schedule?: ExamSchedule[];

  @Prop({ default: false })
  isPublished!: boolean;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);
