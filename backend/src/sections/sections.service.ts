import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Section, SectionDocument } from './schemas/section.schema';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Class, ClassDocument } from '../classes/schemas/class.schema';

@Injectable()
export class SectionsService {
  constructor(
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
  ) {}

  private async validateClass(classId: string) {
    const cls = await this.classModel.findById(classId).exec();
    if (!cls) {
      throw new NotFoundException('Class not found');
    }
  }

  async create(createSectionDto: CreateSectionDto): Promise<Section> {
    await this.validateClass(createSectionDto.classRef);
    return this.sectionModel.create(createSectionDto);
  }

  async findAll(query: PaginationQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sort = 'createdAt',
      order = 'desc',
      classRef,
      isActive,
    } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (classRef) {
      filter.classRef = classRef;
    }
    if (typeof isActive !== 'undefined') {
      filter.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.sectionModel
        .find(filter)
        .sort({ [sort]: order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .populate('classRef')
        .exec(),
      this.sectionModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Section> {
    const item = await this.sectionModel
      .findById(id)
      .populate('classRef')
      .exec();
    if (!item) {
      throw new NotFoundException('Section not found');
    }
    return item;
  }

  async update(
    id: string,
    updateSectionDto: UpdateSectionDto,
  ): Promise<Section> {
    if (updateSectionDto.classRef) {
      await this.validateClass(updateSectionDto.classRef);
    }
    const updated = await this.sectionModel
      .findByIdAndUpdate(id, updateSectionDto, { new: true })
      .populate('classRef')
      .exec();
    if (!updated) {
      throw new NotFoundException('Section not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.sectionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Section not found');
    }
  }
}
