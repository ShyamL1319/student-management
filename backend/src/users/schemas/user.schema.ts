/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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

  @Prop({ required: false })
  passwordHash?: string;

  @Prop({ index: { sparse: true } })
  googleId?: string;

  @Prop({ index: { sparse: true } })
  facebookId?: string;

  @Prop({ index: { sparse: true } })
  githubId?: string;

  @Prop()
  avatar?: string;

  @Prop({ type: [String], default: [] })
  oauthProviders!: string[];

  @Prop({ type: Object, default: {} })
  providerMetadata?: Record<string, any>;

  @Prop({ required: false })
  firstName!: string;

  @Prop({ required: false, default: '' })
  lastName!: string;

  @Prop()
  phone?: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Role' }],
    required: true,
    default: [],
  })
  roles!: Role[];

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

  @Prop({ default: null })
  mfaSecret?: string;

  @Prop({ default: false })
  mfaEnabled!: boolean;

  @Prop({ type: [String], default: [] })
  mfaBackupCodes!: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ schoolId: 1, firstName: 1, lastName: 1 });
UserSchema.index({ schoolId: 1, lastName: 1 });
UserSchema.index({ schoolId: 1, email: 1 });
UserSchema.index({ schoolId: 1, roles: 1 });

UserSchema.pre('save', async function () {
  const self = this as any;

  if (self.roles && self.roles.length > 0) {
    // Prevent duplicate role IDs
    const roleIds = self.roles.map((id: any) => id.toString());
    const uniqueIds = Array.from(new Set<string>(roleIds)).map(
      (id) => new Types.ObjectId(id),
    );
    self.roles = uniqueIds;

    // Fetch role documents to determine name and primary roleType
    const RoleModel = self.$model('Role');
    const roles = await RoleModel.find({ _id: { $in: self.roles } }).exec();

    // Normalize role names
    const roleNames = roles.map((r: any) => r.name);

    // Prioritize discriminators: STUDENT, TEACHER, STAFF, PARENT, others
    const priority = ['STUDENT', 'TEACHER', 'STAFF', 'PARENT'];
    let primaryRoleName = 'USER';

    // Find highest priority discriminator role name
    for (const p of priority) {
      if (roleNames.includes(p)) {
        primaryRoleName = p;
        break;
      }
    }

    // If none of priority roles are present, fallback to ADMIN, SUPER_ADMIN or first role
    if (!roleNames.includes(primaryRoleName)) {
      if (roleNames.includes('SUPER_ADMIN')) {
        primaryRoleName = 'SUPER_ADMIN';
      } else if (roleNames.includes('ADMIN')) {
        primaryRoleName = 'ADMIN';
      } else {
        primaryRoleName = roleNames[0] || 'USER';
      }
    }

    const primaryRole =
      roles.find((r: any) => r.name === primaryRoleName) || roles[0];
    if (primaryRole) {
      self.roleType = primaryRole.name;
    }
  } else {
    // If no roles specified at all, default to USER role
    const RoleModel = self.$model('Role');
    let userRole = await RoleModel.findOne({ name: 'USER' }).exec();
    if (!userRole) {
      userRole = await RoleModel.create({
        name: 'USER',
        description: 'Standard registered user with basic access',
        permissions: [],
      });
    }
    self.roles = [userRole._id];
    self.roleType = 'USER';
  }
});
