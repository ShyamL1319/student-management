import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exam, ExamDocument } from './schemas/exam.schema';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Injectable()
export class ExaminationsService {
  constructor(@InjectModel(Exam.name) private examModel: Model<ExamDocument>) {}

  async create(dto: CreateExamDto) {
    const created = await this.examModel.create(dto as any);
    return created;
  }

  async findAll(query: any = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.examModel.find().skip(skip).limit(limit).exec(),
      this.examModel.countDocuments().exec(),
    ]);

    return { data, total };
  }

  async findOne(id: string) {
    const exam = await this.examModel.findById(id).exec();
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async update(id: string, dto: UpdateExamDto) {
    const updated = await this.examModel.findByIdAndUpdate(id, dto as any, { new: true }).exec();
    if (!updated) throw new NotFoundException('Exam not found');
    return updated;
  }

  async remove(id: string) {
    const removed = await this.examModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Exam not found');
    return { deleted: true };
  }

  async publish(id: string) {
    const exam = await this.examModel.findById(id).exec();
    if (!exam) throw new NotFoundException('Exam not found');
    exam.isPublished = true;
    await exam.save();
    return exam;
  }

  async addSchedule(id: string, schedule: any) {
    const exam = await this.examModel.findById(id).exec();
    if (!exam) throw new NotFoundException('Exam not found');
    exam.schedule = exam.schedule || [];
    exam.schedule.push(...(schedule as any[]));
    await exam.save();
    return exam;
  }
}
