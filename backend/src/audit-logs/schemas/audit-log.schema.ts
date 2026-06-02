import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  READ = 'READ',
}

export enum AuditStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ required: true, enum: AuditAction })
  action!: AuditAction;

  @Prop({ type: String, required: false })
  entityType?: string;

  @Prop({ type: String, required: false })
  entityId?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  performedBy?: Types.ObjectId;

  @Prop({ type: Object, required: false })
  changes?: Record<string, any>;

  @Prop({ type: String, required: false })
  ipAddress?: string;

  @Prop({ type: String, required: false })
  userAgent?: string;

  @Prop({ required: true, enum: AuditStatus, default: AuditStatus.SUCCESS })
  status!: AuditStatus;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
