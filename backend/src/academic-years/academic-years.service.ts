import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';
import {
  AcademicYear,
  AcademicYearDocument,
} from './schemas/academic-year.schema';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class AcademicYearsService {
  constructor(
    @InjectModel(AcademicYear.name)
    private academicyearModel: Model<AcademicYearDocument>,
  ) {}

  async create(
    createAcademicYearDto: CreateAcademicYearDto,
  ): Promise<AcademicYear> {
    return this.academicyearModel.create(createAcademicYearDto);
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
      this.academicyearModel
        .find(filter)
        .sort({ [sort]: order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.academicyearModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<AcademicYear> {
    const item = await this.academicyearModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException('AcademicYear not found');
    }
    return item;
  }

  async update(
    id: string,
    updateAcademicYearDto: UpdateAcademicYearDto,
  ): Promise<AcademicYear> {
    const updated = await this.academicyearModel
      .findByIdAndUpdate(id, updateAcademicYearDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('AcademicYear not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.academicyearModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('AcademicYear not found');
    }
  }
}
