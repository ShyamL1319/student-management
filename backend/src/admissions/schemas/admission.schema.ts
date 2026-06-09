import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdmissionApplicationDocument = AdmissionApplication & Document;

export enum AdmissionStage {
  SUBMITTED = 'Submitted',
  VERIFICATION = 'Verification',
  INTERVIEW = 'Interview',
  EVALUATION = 'Evaluation',
  APPROVAL = 'Approval',
  REJECTION = 'Rejection',
  ENROLLMENT = 'Enrollment',
}

@Schema({ _id: false })
export class ParentInfo {
  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true, index: true })
  email!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  relationship!: string; // 'Father' | 'Mother' | 'Guardian'

  @Prop()
  occupation?: string;
}

@Schema({ _id: false })
export class StudentInfo {
  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true })
  dob!: Date;

  @Prop({ required: true })
  gender!: string;

  @Prop()
  bloodGroup?: string;

  @Prop({ required: true })
  address!: string;
}

@Schema({ _id: false })
export class InterviewDetails {
  @Prop({ type: Date })
  scheduledDate?: Date;

  @Prop()
  scheduledTime?: string; // e.g. "10:30 AM"

  @Prop()
  interviewMode?: string; // 'Online' | 'In-person'

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  panelMembers?: Types.ObjectId[];
}

@Schema({ _id: false })
export class ScoringSystem {
  @Prop({ default: 0 })
  documentScore!: number;

  @Prop({ default: 0 })
  interviewScore!: number;

  @Prop({ default: 0 })
  entranceScore!: number;

  @Prop({ default: 0 })
  totalScore!: number;

  @Prop()
  evaluationRemarks?: string;
}

@Schema({ _id: false })
export class DocumentUpload {
  @Prop({ required: true })
  name!: string; // e.g., 'Birth Certificate'

  @Prop({ required: true })
  url!: string;
}

@Schema({ timestamps: true })
export class AdmissionApplication {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  school!: Types.ObjectId;

  @Prop({ required: true, type: StudentInfo })
  studentInfo!: StudentInfo;

  @Prop({ required: true, type: ParentInfo })
  parentInfo!: ParentInfo;

  @Prop({ required: true })
  gradeLevel!: string;

  @Prop({
    required: true,
    enum: AdmissionStage,
    default: AdmissionStage.SUBMITTED,
    index: true,
  })
  status!: AdmissionStage;

  @Prop({ type: [DocumentUpload], default: [] })
  documents!: DocumentUpload[];

  @Prop({ type: InterviewDetails, default: {} })
  interviewDetails!: InterviewDetails;

  @Prop({ type: ScoringSystem, default: {} })
  scoring!: ScoringSystem;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdStudentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdParentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Invoice', index: true })
  createdInvoiceId?: Types.ObjectId;
}

export const AdmissionApplicationSchema =
  SchemaFactory.createForClass(AdmissionApplication);

// Compound indexes for search optimization
AdmissionApplicationSchema.index({ school: 1, status: 1 });
AdmissionApplicationSchema.index({
  school: 1,
  'studentInfo.lastName': 1,
  'studentInfo.firstName': 1,
});
