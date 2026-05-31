import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { School, SchoolDocument } from './schemas/school.schema';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectModel(School.name) private schoolModel: Model<SchoolDocument>,
  ) {}

  async create(createSchoolDto: CreateSchoolDto): Promise<School> {
    return this.schoolModel.create(createSchoolDto);
  }

  async findAll(query: PaginationQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sort = 'createdAt',
      order = 'desc',
      isActive,
    } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (typeof isActive !== 'undefined') {
      filter.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.schoolModel
        .find(filter)
        .sort({ [sort]: order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.schoolModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<School> {
    const item = await this.schoolModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException('School not found');
    }
    return item;
  }

  async update(id: string, updateSchoolDto: UpdateSchoolDto): Promise<School> {
    const updated = await this.schoolModel
      .findByIdAndUpdate(id, updateSchoolDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('School not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.schoolModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('School not found');
    }
  }
}
