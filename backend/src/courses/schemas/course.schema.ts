import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  department!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop()
  code?: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
