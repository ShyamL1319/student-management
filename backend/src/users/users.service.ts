import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-user.dto';
import { Role, RoleDocument } from '../roles/schemas/role.schema';

interface RequesterUser {
  roleType?: string;
  role?: string | { name?: string };
  roles?: Array<string | { name?: string }>;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  getUserModel() {
    return this.userModel;
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().populate('role roles').exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email })
      .setOptions({ bypassTenant: true })
      .populate('role roles')
      .exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findById(id)
      .setOptions({ bypassTenant: true })
      .populate('role roles')
      .exec();
  }

  async create(userData: Partial<User>): Promise<UserDocument> {
    const createdUser = new this.userModel(userData);
    return createdUser.save();
  }

  async update(
    id: string,
    updateData: Partial<User>,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .setOptions({ bypassTenant: true })
      .populate('role roles')
      .exec();
  }

  async updateProfile(
    id: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateProfileDto, { new: true })
      .populate('role roles')
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateUserRole(
    id: string,
    roleId: string,
    requester?: any,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findById(id)
      .populate('role roles')
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const RoleModel = this.userModel.db.model('Role') as Model<RoleDocument>;
    const newRole = await RoleModel.findById(roleId).exec();
    if (!newRole) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    const currentRoleName =
      (user.role as unknown as RoleDocument)?.name || user.roleType;
    const newRoleName = newRole.name;

    if (currentRoleName === 'SUPER_ADMIN' || newRoleName === 'SUPER_ADMIN') {
      if (requester) {
        const reqUser = requester as RequesterUser;
        let requesterRoleName = reqUser.roleType;
        if (!requesterRoleName && reqUser.role) {
          requesterRoleName =
            typeof reqUser.role === 'object' ? reqUser.role.name : reqUser.role;
        }
        if (requesterRoleName !== 'SUPER_ADMIN') {
          throw new ForbiddenException(
            'Only SUPER_ADMIN can assign, update, or remove the SUPER_ADMIN role',
          );
        }
      }
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        id,
        { role: newRole._id, roleType: newRoleName, roles: [newRole._id] },
        { new: true },
      )
      .populate('role roles')
      .exec();
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async addRole(
    id: string,
    roleId: string,
    requester?: any,
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(id).populate('roles').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const RoleModel = this.userModel.db.model('Role') as Model<RoleDocument>;
    const roleToAdd = await RoleModel.findById(roleId).exec();
    if (!roleToAdd) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    if (roleToAdd.name === 'SUPER_ADMIN') {
      if (requester) {
        const reqUser = requester as RequesterUser;
        const requesterRoles = reqUser.roles || [];
        const requesterRoleNames = requesterRoles
          .map((r) => (typeof r === 'string' ? r : r.name))
          .filter(Boolean);
        const requesterRoleType = reqUser.roleType;
        if (
          !requesterRoleNames.includes('SUPER_ADMIN') &&
          requesterRoleType !== 'SUPER_ADMIN'
        ) {
          throw new ForbiddenException(
            'Only SUPER_ADMIN can assign, update, or remove the SUPER_ADMIN role',
          );
        }
      }
    }

    const currentRoles = (user.roles as unknown as RoleDocument[]).map((r) =>
      String(r._id),
    );
    if (currentRoles.includes(roleId)) {
      return user;
    }

    user.roles.push(roleToAdd);
    return (await user.save()).populate('role roles');
  }

  async removeRole(
    id: string,
    roleId: string,
    requester?: any,
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(id).populate('roles').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const RoleModel = this.userModel.db.model('Role') as Model<RoleDocument>;
    const roleToRemove = await RoleModel.findById(roleId).exec();
    if (!roleToRemove) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    if (roleToRemove.name === 'SUPER_ADMIN') {
      if (requester) {
        const reqUser = requester as RequesterUser;
        const requesterRoles = reqUser.roles || [];
        const requesterRoleNames = requesterRoles
          .map((r) => (typeof r === 'string' ? r : r.name))
          .filter(Boolean);
        const requesterRoleType = reqUser.roleType;
        if (
          !requesterRoleNames.includes('SUPER_ADMIN') &&
          requesterRoleType !== 'SUPER_ADMIN'
        ) {
          throw new ForbiddenException(
            'Only SUPER_ADMIN can assign, update, or remove the SUPER_ADMIN role',
          );
        }
      }

      const totalSuperAdmins = await this.userModel.countDocuments({
        roles: roleId,
        isActive: true,
      } as any);
      if (totalSuperAdmins <= 1) {
        throw new ForbiddenException(
          'Cannot remove the last active SUPER_ADMIN from the system.',
        );
      }
    }

    user.roles = (user.roles as unknown as RoleDocument[]).filter(
      (r) => String(r._id) !== roleId,
    );
    return (await user.save()).populate('role roles');
  }

  async replaceRoles(
    id: string,
    roleIds: string[],
    requester?: any,
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(id).populate('roles').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const RoleModel = this.userModel.db.model('Role') as Model<RoleDocument>;
    const targetRoles = await RoleModel.find({ _id: { $in: roleIds } }).exec();
    if (targetRoles.length !== roleIds.length) {
      throw new NotFoundException(
        'One or more of the specified role IDs are invalid',
      );
    }

    const targetRoleNames = targetRoles.map((r) => r.name);
    const currentRoleNames = (user.roles as unknown as RoleDocument[]).map(
      (r) => r.name,
    );

    const isAddingSuperAdmin =
      targetRoleNames.includes('SUPER_ADMIN') &&
      !currentRoleNames.includes('SUPER_ADMIN');
    const isRemovingSuperAdmin =
      currentRoleNames.includes('SUPER_ADMIN') &&
      !targetRoleNames.includes('SUPER_ADMIN');

    if (isAddingSuperAdmin || isRemovingSuperAdmin) {
      if (requester) {
        const reqUser = requester as RequesterUser;
        const requesterRoles = reqUser.roles || [];
        const requesterRoleNames = requesterRoles
          .map((r) => (typeof r === 'string' ? r : r.name))
          .filter(Boolean);
        const requesterRoleType = reqUser.roleType;
        if (
          !requesterRoleNames.includes('SUPER_ADMIN') &&
          requesterRoleType !== 'SUPER_ADMIN'
        ) {
          throw new ForbiddenException(
            'Only SUPER_ADMIN can assign, update, or remove the SUPER_ADMIN role',
          );
        }
      }
    }

    if (isRemovingSuperAdmin) {
      const superAdminRole = await RoleModel.findOne({
        name: 'SUPER_ADMIN',
      }).exec();
      if (superAdminRole) {
        const totalSuperAdmins = await this.userModel.countDocuments({
          roles: superAdminRole._id,
          isActive: true,
        } as any);
        if (totalSuperAdmins <= 1) {
          throw new ForbiddenException(
            'Cannot remove the last active SUPER_ADMIN from the system.',
          );
        }
      }
    }

    user.roles = roleIds as unknown as Role[];
    return (await user.save()).populate('role roles');
  }

  async getUserRoles(id: string): Promise<Role[]> {
    const user = await this.userModel.findById(id).populate('roles').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user.roles;
  }
}
