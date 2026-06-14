import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  getUserModel() {
    return this.userModel;
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().populate('role').exec();
  }

  async suggest(q?: string): Promise<UserDocument[]> {
    const filter: any = {};
    if (q) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
      ];
    }
    return this.userModel
      .find(filter)
      .populate('role')
      .limit(50)
      .exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email })
      .setOptions({ bypassTenant: true })
      .populate('role')
      .exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findById(id)
      .setOptions({ bypassTenant: true })
      .populate('role')
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
      .populate('role')
      .exec();
  }

  async updateProfile(
    id: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateProfileDto, { new: true })
      .populate('role')
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
    const user = await this.userModel.findById(id).populate('role').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const RoleModel = this.userModel.db.model('Role');
    const newRole = await RoleModel.findById(roleId).exec();
    if (!newRole) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    const currentRoleName = (user.role as any)?.name || user.roleType;
    const newRoleName = newRole.name;

    if (currentRoleName === 'SUPER_ADMIN' || newRoleName === 'SUPER_ADMIN') {
      if (requester) {
        const requesterRoleName = requester.roleType || requester.role?.name;
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
        { role: newRole._id, roleType: newRoleName },
        { new: true },
      )
      .populate('role')
      .exec();
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }
}
