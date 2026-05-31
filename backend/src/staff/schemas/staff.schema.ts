import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StaffDocument = Staff & Document;

@Schema({ timestamps: true })
export class Staff {
  @Prop({ required: true })
  name!: string;

  @Prop()
  email!: string;

  @Prop()
  phone!: string;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  department!: Types.ObjectId;

  @Prop({ default: true })
  isActive!: boolean;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
