import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttendanceDocument = Attendance & Document;

export enum AttendanceType {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  STAFF = 'STAFF',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LEAVE = 'LEAVE',
}

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ enum: Object.values(AttendanceType), required: true })
  attendeeType!: AttendanceType;

  @Prop({ type: Types.ObjectId, required: true })
  attendeeId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Student', required: false })
  student?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Teacher', required: false })
  teacher?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Staff', required: false })
  staff?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'School', required: false })
  school?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AcademicYear', required: false })
  academicYear?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Class', required: false })
  class?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Section', required: false })
  section?: Types.ObjectId;

  @Prop({ type: Date, required: true })
  date!: Date;

  @Prop({ enum: Object.values(AttendanceStatus), required: true })
  status!: AttendanceStatus;

  @Prop({ required: false })
  remarks?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  recordedBy?: Types.ObjectId;

  @Prop({ default: true })
  isActive!: boolean;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
AttendanceSchema.index(
  { attendeeType: 1, attendeeId: 1, date: 1 },
  { unique: true },
);
AttendanceSchema.index({ date: 1, status: 1, attendeeType: 1 });
