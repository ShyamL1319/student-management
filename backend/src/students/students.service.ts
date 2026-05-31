import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Student, StudentDocument } from './schemas/student.schema';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) {}

  async create(data: any) {
    return this.studentModel.create(data);
  }

  async findAll(query: any) {
    const {
      page = 1,
      limit = 10,
      search,
      class: classId,
      section,
      parent,
      isActive,
    } = query;
    const q: any = {};
    if (search)
      q.$or = [
        { admissionNumber: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    if (classId) q.class = Types.ObjectId.isValid(classId) ? classId : classId;
    if (section)
      q.section = Types.ObjectId.isValid(section) ? section : section;
    if (parent) q.parent = Types.ObjectId.isValid(parent) ? parent : parent;
    if (typeof isActive !== 'undefined')
      q.isActive = isActive === 'true' || isActive === true;

    const itemsQuery = this.studentModel
      .find(q)
      .populate('parent')
      .populate('class')
      .populate('section')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const [data, total] = await Promise.all([
      itemsQuery.exec(),
      this.studentModel.countDocuments(q).exec(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const item = await this.studentModel
      .findById(id)
      .populate('parent')
      .populate('class')
      .populate('section')
      .exec();
    if (!item) throw new NotFoundException('Student not found');
    return item;
  }

  async update(id: string, data: any) {
    const updated = await this.studentModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Student not found');
    return updated;
  }

  async remove(id: string) {
    const removed = await this.studentModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Student not found');
    return removed;
  }

  async promote(id: string, payload: { class?: string; section?: string }) {
    const student = await this.studentModel.findById(id).exec();
    if (!student) throw new NotFoundException('Student not found');
    student.history = student.history || [];
    student.history.push({
      class: student.class,
      section: student.section,
      at: new Date(),
    });
    if (payload.class) student.class = payload.class as any;
    if (payload.section) student.section = payload.section as any;
    await student.save();
    return this.findOne(id);
  }

  async transfer(id: string, payload: { class?: string; section?: string }) {
    // For now transfer behaves similarly to promote but could be expanded
    return this.promote(id, payload);
  }
}
