import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ParentDocument = Parent & Document;

@Schema({ timestamps: true })
export class Parent {
  @Prop({ required: true })
  name!: string;

  @Prop()
  email!: string;

  @Prop()
  phone!: string;

  @Prop({ type: [Types.ObjectId], ref: 'Student', default: [] })
  students!: Types.ObjectId[];

  @Prop({ default: true })
  isActive!: boolean;
}

export const ParentSchema = SchemaFactory.createForClass(Parent);
