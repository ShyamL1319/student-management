import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type StudentDocument = Student & Document;

@Schema()
export class Student extends User {
  @Prop({ required: true, unique: true, sparse: true })
  admissionNumber!: string;

  @Prop({ required: true, unique: true, sparse: true })
  rollNumber!: string;

  @Prop()
  dob!: Date;

  @Prop()
  gender!: string;

  @Prop({ required: false })
  bloodGroup?: string;

  @Prop()
  address!: string;

  @Prop({ required: false })
  parent?: string;

  @Prop({ type: Types.ObjectId, ref: 'Class', required: true })
  class!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Section', required: false })
  section?: Types.ObjectId;

  @Prop({
    type: [{ class: Types.ObjectId, section: Types.ObjectId, at: Date }],
    default: [],
  })
  history!: { class: Types.ObjectId; section?: Types.ObjectId; at: Date }[];
}

export const StudentSchema = SchemaFactory.createForClass(Student);
