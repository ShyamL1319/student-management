import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../../roles/schemas/role.schema';

export type UserDocument = User & Document;

@Schema({ 
  timestamps: true,
  discriminatorKey: 'roleType',
})
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: false })
  firstName!: string;

  @Prop({ required: false, default: '' })
  lastName!: string;

  @Prop()
  phone?: string;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  role!: Role;

  roleType!: string;

  @Prop({ type: Types.ObjectId, ref: 'School', required: false, index: true })
  schoolId?: Types.ObjectId;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: null })
  refreshTokenHash!: string;

  @Prop({ default: null })
  resetPasswordToken!: string;

  @Prop({ default: null })
  resetPasswordExpires!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
