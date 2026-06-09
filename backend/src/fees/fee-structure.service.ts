import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  FeeStructure,
  FeeStructureDocument,
} from './schemas/fee-structure.schema';
import {
  CreateFeeStructureDto,
  UpdateFeeStructureDto,
  FeeStructureQueryDto,
} from './dto/fee-structure.dto';

@Injectable()
export class FeeStructureService {
  constructor(
    @InjectModel(FeeStructure.name)
    private feeStructureModel: Model<FeeStructureDocument>,
  ) {}

  async create(dto: CreateFeeStructureDto) {
    const feeStructure = new this.feeStructureModel(dto);
    return feeStructure.save();
  }

  async findAll(query: FeeStructureQueryDto = {}) {
    const cleanQuery: any = {};
    if (query.classId) {
      cleanQuery.classId = query.classId;
    }
    if (query.academicYearId) {
      cleanQuery.academicYearId = query.academicYearId;
    }
    if (query.isActive !== undefined) {
      cleanQuery.isActive = String(query.isActive) === 'true' || query.isActive === true;
    }
    return this.feeStructureModel.find(cleanQuery).lean();
  }

  async findById(id: string) {
    const feeStructure = await this.feeStructureModel.findById(id).lean();
    if (!feeStructure) {
      throw new NotFoundException(`Fee Structure with ID ${id} not found`);
    }
    return feeStructure;
  }

  async findByClass(classId: string, academicYearId?: string) {
    const query: any = { classId, isActive: true };
    if (academicYearId) {
      query.academicYearId = academicYearId;
    }
    return this.feeStructureModel.find(query).lean();
  }

  async update(id: string, dto: UpdateFeeStructureDto) {
    const feeStructure = await this.feeStructureModel.findByIdAndUpdate(
      id,
      dto,
      { new: true },
    );
    if (!feeStructure) {
      throw new NotFoundException(`Fee Structure with ID ${id} not found`);
    }
    return feeStructure;
  }

  async delete(id: string) {
    const feeStructure = await this.feeStructureModel.findByIdAndDelete(id);
    if (!feeStructure) {
      throw new NotFoundException(`Fee Structure with ID ${id} not found`);
    }
    return feeStructure;
  }

  async deactivate(id: string) {
    const feeStructure = await this.feeStructureModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );
    if (!feeStructure) {
      throw new NotFoundException(`Fee Structure with ID ${id} not found`);
    }
    return feeStructure;
  }
}
