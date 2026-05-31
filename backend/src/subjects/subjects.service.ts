/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Subject, SubjectDocument } from './schemas/subject.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { Teacher, TeacherDocument } from '../teachers/schemas/teacher.schema';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
  ) {}

  private async validateCourse(courseId?: string) {
    if (!courseId) return;
    const c = await this.courseModel.findById(courseId).exec();
    if (!c) throw new NotFoundException('Course not found');
  }

  private async validateTeachers(teacherIds?: string[]) {
    if (!teacherIds || !teacherIds.length) return;
    const count = await this.teacherModel
      .countDocuments({ _id: { $in: teacherIds } })
      .exec();
    if (count !== teacherIds.length)
      throw new NotFoundException('One or more teachers not found');
  }

  async create(dto: CreateSubjectDto): Promise<Subject> {
    await this.validateCourse(dto.course);
    await this.validateTeachers(dto.teachers);
    return this.subjectModel.create(dto as any);
  }

  async findAll(query: PaginationQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sort = 'createdAt',
      order = 'desc',
      course,
      isActive,
    } = query as any;
    const skip = (page - 1) * limit;
    const filter: Record<string, any> = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (course) filter.course = course;
    if (typeof isActive !== 'undefined') filter.isActive = isActive;

    const [data, total] = await Promise.all([
      this.subjectModel
        .find(filter)
        .sort({ [sort]: order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .populate('course')
        .populate('teachers')
        .exec(),
      this.subjectModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Subject> {
    const item = await this.subjectModel
      .findById(id)
      .populate('course')
      .populate('teachers')
      .exec();
    if (!item) throw new NotFoundException('Subject not found');
    return item;
  }

  async update(id: string, dto: UpdateSubjectDto): Promise<Subject> {
    if (dto.course) await this.validateCourse(dto.course);
    if (dto.teachers) await this.validateTeachers(dto.teachers);
    const updated = await this.subjectModel
      .findByIdAndUpdate(id, dto as any, { new: true })
      .populate('course')
      .populate('teachers')
      .exec();
    if (!updated) throw new NotFoundException('Subject not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.subjectModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Subject not found');
  }
}
