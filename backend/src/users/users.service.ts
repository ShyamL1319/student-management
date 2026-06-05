import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().populate('role').exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).populate('role').exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).populate('role').exec();
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
      .populate('role')
      .exec();
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateProfileDto, { new: true })
      .populate('role')
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateUserRole(id: string, roleId: string): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { role: roleId }, { new: true })
      .populate('role')
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
