import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeacherDocument = Teacher & Document;

@Schema({ timestamps: true })
export class Teacher {
  @Prop({ required: true })
  name!: string;

  @Prop()
  email!: string;

  @Prop()
  phone!: string;

  @Prop({ type: [String], default: [] })
  subjects!: string[];

  @Prop({ type: [Types.ObjectId], ref: 'Class', default: [] })
  classes!: Types.ObjectId[];

  @Prop()
  profile!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
