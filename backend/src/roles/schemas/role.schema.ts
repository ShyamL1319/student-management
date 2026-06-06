import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RoleEnum } from '../../common/enums/role.enum';
import { Permission } from '../../permissions/schemas/permission.schema';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop()
  description!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Permission' }] })
  permissions!: Permission[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
