import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MarkDocument = Mark & Document;

@Schema({ timestamps: true })
export class Mark {
  @Prop({ required: true })
  studentId: string;

  @Prop({ required: true })
  subjectId: string;

  @Prop({ required: true })
  examId: string;

  @Prop({ required: true })
  marksObtained: number;

  @Prop({ required: true })
  maxMarks: number;

  @Prop()
  grade?: string;

  @Prop()
  gpa?: number;
}

export const MarkSchema = SchemaFactory.createForClass(Mark);

MarkSchema.index({ studentId: 1, subjectId: 1 });
MarkSchema.index({ examId: 1, studentId: 1 });
