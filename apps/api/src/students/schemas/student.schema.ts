import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Department } from '../../departments/schemas/department.schema';

export enum StudentGender {
  Female = 'female',
  Male = 'male',
  Other = 'other',
}

export enum StudentStatus {
  Active = 'active',
  Inactive = 'inactive',
  Graduated = 'graduated',
}

export type StudentDocument = Student & Document;

@Schema({ timestamps: true })
export class Student {
  @Prop({ required: true, unique: true, index: true })
  studentId!: string;

  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ required: true, trim: true })
  lastName!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ required: true, trim: true })
  phone!: string;

  @Prop({ required: true, enum: StudentGender })
  gender!: StudentGender;

  @Prop({ required: true })
  dateOfBirth!: Date;

  @Prop({ required: true, trim: true })
  address!: string;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  department!: Department;

  @Prop({ required: true })
  enrollmentDate!: Date;

  @Prop({ required: true, enum: StudentStatus, default: StudentStatus.Active, index: true })
  status!: StudentStatus;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;

  @Prop()
  deletedAt?: Date;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
StudentSchema.index({ firstName: 'text', lastName: 'text', email: 'text', studentId: 'text' });
