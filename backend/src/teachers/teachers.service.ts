import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Teacher, TeacherDocument } from './schemas/teacher.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeachersService {
  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
  ) { }

  async create(data: any) {
    const RoleModel = this.teacherModel.db.model('Role');
    const teacherRole = await RoleModel.findOne({ name: 'TEACHER' }).lean().exec() as { _id: any } | null;
    if (!teacherRole) throw new NotFoundException('TEACHER role not found');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(process.env.DEFAULT_PASSWORD || 'ChangeMe123!', salt);

    const teacherData: Partial<Teacher> = {
      ...data,
      role: teacherRole._id,
      passwordHash,
      roleType: 'TEACHER',
    };
    return this.teacherModel.create(teacherData);
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
    const itemsQuery = this.teacherModel
      .find(q)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const [data, total] = await Promise.all([
      itemsQuery.exec(),
      this.teacherModel.countDocuments(q).exec(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const item = await this.teacherModel.findById(id).exec();
    if (!item) throw new NotFoundException('Teacher not found');
    return item;
  }

  async update(id: string, data: any) {
    const updated = await this.teacherModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Teacher not found');
    return updated;
  }

  async remove(id: string) {
    const removed = await this.teacherModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Teacher not found');
    return removed;
  }
}
