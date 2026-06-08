import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AssignmentSubmissionDocument = AssignmentSubmission & Document;

@Schema({ timestamps: true })
export class AssignmentSubmission {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  school!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Assignment', required: true, index: true })
  assignment!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  student!: Types.ObjectId;

  @Prop({ required: false })
  fileUrl?: string;

  @Prop({ required: true, default: () => new Date() })
  submittedAt!: Date;

  @Prop({ required: true, default: 'Submitted' })
  status!: string; // 'Submitted', 'Graded'

  @Prop({ required: false })
  marksObtained?: number;

  @Prop({ required: false })
  feedback?: string;
}

export const AssignmentSubmissionSchema = SchemaFactory.createForClass(AssignmentSubmission);
export const AssignmentSubmissionModel = 'AssignmentSubmission';
