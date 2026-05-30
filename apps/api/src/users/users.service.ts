import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createDto: Partial<User>): Promise<UserDocument> {
    const createdUser = new this.userModel(createDto);
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+passwordHash').exec();
  }

  async findByIdWithRefreshToken(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('+refreshTokenHash').exec();
  }

  async findActiveById(id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ _id: id, isActive: true }).exec();
  }

  async update(id: string, updateDto: Partial<User>): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }
}
