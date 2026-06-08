import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  senderId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  recipientId!: Types.ObjectId;

  @Prop({ required: false })
  subject?: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ default: false })
  isRead!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'School', required: false, index: true })
  schoolId?: Types.ObjectId;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
