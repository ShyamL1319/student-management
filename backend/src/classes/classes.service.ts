import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { Class, ClassDocument } from './schemas/class.schema';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Department, DepartmentDocument } from '../departments/schemas/department.schema';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
  ) {}

  private async validateDepartment(departmentId: string) {
    const department = await this.departmentModel.findById(departmentId).exec();
    if (!department) {
      throw new NotFoundException('Department not found');
    }
  }

  async create(createClassDto: CreateClassDto): Promise<Class> {
    await this.validateDepartment(createClassDto.department);
    return this.classModel.create(createClassDto);
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
    } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (department) {
      filter.department = department;
    }
    if (typeof isActive !== 'undefined') {
      filter.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.classModel
        .find(filter)
        .sort({ [sort]: order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .populate('department')
        .exec(),
      this.classModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Class> {
    const item = await this.classModel
      .findById(id)
      .populate('department')
      .exec();
    if (!item) {
      throw new NotFoundException('Class not found');
    }
    return item;
  }

  async update(id: string, updateClassDto: UpdateClassDto): Promise<Class> {
    if (updateClassDto.department) {
      await this.validateDepartment(updateClassDto.department);
    }
    const updated = await this.classModel
      .findByIdAndUpdate(id, updateClassDto, { new: true })
      .populate('department')
      .exec();
    if (!updated) {
      throw new NotFoundException('Class not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.classModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Class not found');
    }
  }
}
