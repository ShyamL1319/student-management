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
    const staffRole = await RoleModel.findOne({ name: 'STAFF' });
    if (!staffRole) throw new NotFoundException('STAFF role not found');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('ChangeMe123!', salt);

    let firstName = data.firstName;
    let lastName = data.lastName;
    if (data.name && !firstName) {
      const parts = data.name.trim().split(/\s+/);
      firstName = parts[0] || 'N/A';
      lastName = parts.slice(1).join(' ') || 'N/A';
    }

    const staffData = {
      ...data,
      firstName: firstName || 'N/A',
      lastName: lastName || 'N/A',
      role: staffRole._id,
      passwordHash,
      roleType: 'STAFF',
    };
    // Delete legacy single name field
    delete staffData.name;

    return this.staffModel.create(staffData);
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, search } = query;
    const q: any = {};
    if (search) {
      q.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
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
