import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StudentDocument = Student & Document;

@Schema({ timestamps: true })
export class Student {
  @Prop({ required: true, unique: true })
  admissionNumber!: string;

  @Prop({ required: false })
  rollNumber!: string;

  @Prop({ required: true })
  firstName!: string;

  @Prop()
  lastName!: string;

  @Prop()
  dob: Date;

  @Prop()
  gender!: string;

  @Prop()
  bloodGroup!: string;

  @Prop()
  address!: string;

  @Prop()
  email!: string;

  @Prop()
  phone!: string;

  @Prop({ type: Types.ObjectId, ref: 'Parent' })
  parent!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Class' })
  class!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Section' })
  section!: Types.ObjectId;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({
    type: [{ class: Types.ObjectId, section: Types.ObjectId, at: Date }],
    default: [],
  })
  history!: { class: Types.ObjectId; section: Types.ObjectId; at: Date }[];
}

export const StudentSchema = SchemaFactory.createForClass(Student);
