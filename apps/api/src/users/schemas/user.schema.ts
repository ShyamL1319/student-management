import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum UserRole {
  Admin = 'admin',
  Teacher = 'teacher',
  Student = 'student',
  Staff = 'staff',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ required: true, select: false })
  passwordHash!: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.Student, index: true })
  role!: UserRole;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({ select: false })
  refreshTokenHash?: string;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
