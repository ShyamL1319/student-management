import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MarkDocument = Mark & Document;

@Schema({ timestamps: true })
export class Mark {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  studentId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Subject', required: true })
  subjectId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Exam', required: true })
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
MarkSchema.index({ schoolId: 1, studentId: 1, examId: 1 });
MarkSchema.index({ schoolId: 1, subjectId: 1 });
