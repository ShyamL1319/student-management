import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const existingDepartment = await this.departmentModel.findOne({
      $or: [{ name: createDepartmentDto.name }, { code: createDepartmentDto.code }],
    }).exec();

    if (existingDepartment) {
      throw new ConflictException('Department with this name or code already exists');
    }

    const createdDepartment = new this.departmentModel(createDepartmentDto);
    return createdDepartment.save();
  }

  async findAll(): Promise<Department[]> {
    return this.departmentModel.find().exec();
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentModel.findById(id).exec();
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.departmentModel.findByIdAndUpdate(
      id,
      updateDepartmentDto,
      { new: true },
    ).exec();
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return department;
  }

  async remove(id: string): Promise<void> {
    const result = await this.departmentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
  }
}
