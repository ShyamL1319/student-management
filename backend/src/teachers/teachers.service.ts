import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Teacher, TeacherDocument } from './schemas/teacher.schema';

@Injectable()
export class TeachersService {
  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
  ) {}

  async create(data: any) {
    return this.teacherModel.create(data);
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, search } = query;
    const q: any = {};
    if (search) q.name = { $regex: search, $options: 'i' };
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
