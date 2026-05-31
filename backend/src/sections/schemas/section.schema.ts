import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

export type SectionDocument = Section & Document;

@Schema({ timestamps: true })
export class Section {
  @Prop({ type: Types.ObjectId, ref: 'Class', required: true })
  classRef: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false, default: true })
  isActive: boolean;
}

export const SectionSchema = SchemaFactory.createForClass(Section);
