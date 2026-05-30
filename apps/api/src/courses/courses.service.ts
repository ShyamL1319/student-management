import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Department, DepartmentDocument } from '../departments/schemas/department.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const department = await this.departmentModel.findById(createCourseDto.department).exec();
    if (!department) {
      throw new NotFoundException(`Department with ID ${createCourseDto.department} not found`);
    }

    const existingCourse = await this.courseModel.findOne({ courseCode: createCourseDto.courseCode }).exec();
    if (existingCourse) {
      throw new ConflictException(`Course with code ${createCourseDto.courseCode} already exists`);
    }

    const createdCourse = new this.courseModel(createCourseDto);
    return createdCourse.save();
  }

  async findAll(): Promise<Course[]> {
    return this.courseModel.find().populate('department', 'name code').exec();
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseModel.findById(id).populate('department', 'name code').exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    if (updateCourseDto.department) {
      const department = await this.departmentModel.findById(updateCourseDto.department).exec();
      if (!department) {
        throw new NotFoundException(`Department with ID ${updateCourseDto.department} not found`);
      }
    }

    const course = await this.courseModel.findByIdAndUpdate(
      id,
      updateCourseDto,
      { new: true },
    ).populate('department', 'name code').exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async remove(id: string): Promise<void> {
    const result = await this.courseModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }
}
