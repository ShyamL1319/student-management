import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Staff, StaffDocument } from './schemas/staff.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name) private staffModel: Model<StaffDocument>,
  ) {}

  async create(data: any) {
    const RoleModel = this.staffModel.db.model('Role');
    const staffRole = (await RoleModel.findOne({ name: 'STAFF' })
      .lean()
      .exec()) as { _id: any } | null;
    if (!staffRole) throw new NotFoundException('STAFF role not found');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(
      process.env.DEFAULT_PASSWORD || 'ChangeMe123!',
      salt,
    );

    const staffData = {
      ...data,
      roles: [staffRole._id],
      passwordHash,
      roleType: 'STAFF',
    };

    return this.staffModel.create(staffData);
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, search } = query;
    const q: Record<string, any> = {};
    if (search) {
      q.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search as string, $options: 'i' } },
      ];
    }
    const itemsQuery = this.staffModel
      .find(q)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const [data, total] = await Promise.all([
      itemsQuery.exec(),
      this.staffModel.countDocuments(q).exec(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const item = await this.staffModel.findById(id).exec();
    if (!item) throw new NotFoundException('Staff not found');
    return item;
  }

  async update(id: string, data: any) {
    const updated = await this.staffModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Staff not found');
    return updated;
  }

  async remove(id: string) {
    const removed = await this.staffModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Staff not found');
    return removed;
  }
}
