import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubjectDocument = Subject & Document;

@Schema({ timestamps: true })
export class Subject {
  @Prop({ required: true })
  name: string;

  @Prop()
  code: string;

  @Prop({ type: Types.ObjectId, ref: 'Course' })
  course: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Teacher', default: [] })
  teachers: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
