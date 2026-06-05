import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { School, SchoolDocument } from '../schools/schemas/school.schema';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
    @InjectModel(School.name)
    private schoolModel: Model<SchoolDocument>,
  ) {}

  private async validateSchool(schoolId: string) {
    const school = await this.schoolModel.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundException('School not found');
    }
  }

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    await this.validateSchool(createDepartmentDto.school);
    const code = createDepartmentDto.code || createDepartmentDto.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
    const departmentData = {
      ...createDepartmentDto,
      code,
    };
    return this.departmentModel.create(departmentData);
  }

  async findAll(query: PaginationQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sort = 'createdAt',
      order = 'desc',
      school,
      isActive,
    } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (school) {
      filter.school = school;
    }
    if (typeof isActive !== 'undefined') {
      filter.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.departmentModel
        .find(filter)
        .sort({ [sort]: order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .populate('school')
        .exec(),
      this.departmentModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Department> {
    const item = await this.departmentModel
      .findById(id)
      .populate('school')
      .exec();
    if (!item) {
      throw new NotFoundException('Department not found');
    }
    return item;
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    if (updateDepartmentDto.school) {
      await this.validateSchool(updateDepartmentDto.school);
    }
    const current = await this.findOne(id);
    const code = updateDepartmentDto.code || (updateDepartmentDto.name ? updateDepartmentDto.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() : current.code);
    const updateData = {
      ...updateDepartmentDto,
      code,
    };
    const updated = await this.departmentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('school')
      .exec();
    if (!updated) {
      throw new NotFoundException('Department not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.departmentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Department not found');
    }
  }
}
