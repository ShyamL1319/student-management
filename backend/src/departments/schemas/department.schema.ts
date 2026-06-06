import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true })
export class Department {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: false })
  code?: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false, default: true })
  isActive!: boolean;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
