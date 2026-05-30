import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Department } from '../../departments/schemas/department.schema';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true, unique: true })
  courseCode!: string;

  @Prop({ required: true })
  courseName!: string;

  @Prop({ required: true })
  creditHours!: number;

  @Prop()
  description!: string;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  department!: Department;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
