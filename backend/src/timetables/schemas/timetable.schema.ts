import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TimetableDocument = Timetable & Document;

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

@Schema({ timestamps: true })
export class Timetable {
  @Prop({ type: Types.ObjectId, ref: 'Class', required: true })
  class!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AcademicYear', required: true })
  academicYear!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Teacher', required: true })
  teacher!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subject!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Section' })
  section!: Types.ObjectId;

  @Prop({ enum: Object.values(DayOfWeek), required: true })
  dayOfWeek!: DayOfWeek;

  @Prop({ required: true })
  startTime!: string; // HH:mm format

  @Prop({ required: true })
  endTime!: string; // HH:mm format

  @Prop()
  room!: string;

  @Prop()
  notes!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const TimetableSchema = SchemaFactory.createForClass(Timetable);

// Index for faster queries
TimetableSchema.index({ class: 1, academicYear: 1, dayOfWeek: 1 });
TimetableSchema.index({ teacher: 1, academicYear: 1 });
TimetableSchema.index({ class: 1, dayOfWeek: 1, startTime: 1, endTime: 1 });
