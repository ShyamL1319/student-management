import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AdmissionApplication, AdmissionApplicationDocument } from './schemas/admission.schema';
import { CreateAdmissionDto, UpdateAdmissionStatusDto } from './dto/admission.dto';

@Injectable()
export class AdmissionsService {
  constructor(
    @InjectModel(AdmissionApplication.name) private admissionModel: Model<AdmissionApplicationDocument>,
  ) {}

  async create(schoolId: string, dto: CreateAdmissionDto): Promise<AdmissionApplication> {
    return this.admissionModel.create({
      school: new Types.ObjectId(schoolId),
      applicantName: dto.applicantName,
      gradeLevel: dto.gradeLevel,
      entranceScore: dto.entranceScore || 0,
      parentEmail: dto.parentEmail,
      status: 'Applied',
    });
  }

  async findAll(schoolId: string, query: any): Promise<{ data: AdmissionApplication[]; total: number }> {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { school: new Types.ObjectId(schoolId) };
    if (query.status) {
      filter.status = query.status;
    }
    if (query.search) {
      filter.applicantName = { $regex: query.search, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      this.admissionModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.admissionModel.countDocuments(filter).exec(),
    ]);

    return { data, total };
  }

  async findOne(id: string, schoolId: string): Promise<AdmissionApplication> {
    const item = await this.admissionModel
      .findOne({ _id: new Types.ObjectId(id), school: new Types.ObjectId(schoolId) })
      .exec();
    if (!item) {
      throw new NotFoundException('Admission application not found');
    }
    return item;
  }

  async updateStatus(id: string, schoolId: string, dto: UpdateAdmissionStatusDto): Promise<AdmissionApplication> {
    const item = await this.admissionModel.findOne({
      _id: new Types.ObjectId(id),
      school: new Types.ObjectId(schoolId),
    }).exec();

    if (!item) {
      throw new NotFoundException('Admission application not found');
    }

    item.status = dto.status;
    return item.save();
  }

  async remove(id: string, schoolId: string): Promise<void> {
    const result = await this.admissionModel
      .findOneAndDelete({ _id: new Types.ObjectId(id), school: new Types.ObjectId(schoolId) })
      .exec();
    if (!result) {
      throw new NotFoundException('Admission application not found');
    }
  }
}
