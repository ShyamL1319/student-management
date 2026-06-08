import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SchoolDocument = School & Document;

@Schema({ timestamps: true })
export class School {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  address!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: false, default: true })
  isActive!: boolean;

  @Prop({ required: false, default: true })
  emailNotificationsEnabled?: boolean;

  @Prop({ required: false, default: false })
  smsAlertsEnabled?: boolean;

  @Prop({ required: false, default: true })
  autoBackupEnabled?: boolean;
}

export const SchoolSchema = SchemaFactory.createForClass(School);
