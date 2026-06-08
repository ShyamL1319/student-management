import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type ParentDocument = Parent & Document;

@Schema()
export class Parent extends User {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  children!: Types.ObjectId[];

  @Prop({ required: false })
  occupation?: string;

  @Prop({ required: false })
  relationshipType?: string; // Father, Mother, Guardian

  @Prop({ required: false })
  address?: string;
}

export const ParentSchema = SchemaFactory.createForClass(Parent);
