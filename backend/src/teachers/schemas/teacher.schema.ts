import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type TeacherDocument = Teacher & Document;

@Schema()
export class Teacher extends User {
  @Prop({ type: [String], default: [] })
  subjects!: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Class' }], default: [] })
  classes!: Types.ObjectId[];

  @Prop()
  profile!: string;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
