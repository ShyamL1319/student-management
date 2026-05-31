import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course, CourseDocument } from './schemas/course.schema';
import {
  Department,
  DepartmentDocument,
} from '../departments/schemas/department.schema';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
  ) {}

  private async validateDepartment(departmentId: string) {
    const d = await this.departmentModel.findById(departmentId).exec();
    if (!d) throw new NotFoundException('Department not found');
  }

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    await this.validateDepartment(createCourseDto.department);
    return this.courseModel.create(createCourseDto);
  }

  async findAll(query: PaginationQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sort = 'createdAt',
      order = 'desc',
      department,
      isActive,
    } = query as any;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (department) filter.department = department;
    if (typeof isActive !== 'undefined') filter.isActive = isActive;

    const [data, total] = await Promise.all([
      this.courseModel
        .find(filter)
        .sort({ [sort]: order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .populate('department')
        .exec(),
      this.courseModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Course> {
    const item = await this.courseModel
      .findById(id)
      .populate('department')
      .exec();
    if (!item) throw new NotFoundException('Course not found');
    return item;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    if (updateCourseDto.department)
      await this.validateDepartment(updateCourseDto.department);
    const updated = await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .populate('department')
      .exec();
    if (!updated) throw new NotFoundException('Course not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.courseModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Course not found');
  }
}
