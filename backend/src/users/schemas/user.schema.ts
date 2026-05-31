import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../../roles/schemas/role.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  role!: Role;

  @Prop({ default: null })
  refreshTokenHash!: string;

  @Prop({ default: null })
  resetPasswordToken!: string;

  @Prop({ default: null })
  resetPasswordExpires!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
