import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type StaffDocument = Staff & Document;

@Schema()
export class Staff extends User {
  @Prop({ type: Types.ObjectId, ref: 'Department' })
  department!: Types.ObjectId;

  @Prop({ type: String, required: true })
  name!: string;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
