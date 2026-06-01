import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Mark, MarkDocument } from './schemas/mark.schema';
import { CreateMarkDto } from './dto/create-mark.dto';

@Injectable()
export class MarksService {
  constructor(@InjectModel(Mark.name) private markModel: Model<MarkDocument>) {}

  async create(dto: CreateMarkDto) {
    const mark = new this.markModel(dto);
    mark.gpa = this.calculateGPA(dto.marksObtained, dto.maxMarks);
    mark.grade = this.calculateGrade(dto.marksObtained, dto.maxMarks);
    return mark.save();
  }

  async find(query: any = {}) {
    return this.markModel.find(query).lean();
  }

  async getStudentResult(studentId: string) {
    const marks = await this.markModel.find({ studentId }).lean();
    if (!marks || marks.length === 0)
      throw new NotFoundException('No marks found for student');

    const totalObtained = marks.reduce((s, m) => s + (m.marksObtained || 0), 0);
    const totalMax = marks.reduce((s, m) => s + (m.maxMarks || 0), 0);
    const gpa = this.calculateGPA(totalObtained, totalMax);
    const grade = this.calculateGrade(totalObtained, totalMax);

    return { studentId, totalObtained, totalMax, gpa, grade, marks };
  }

  async generateRank(examId: string) {
    const marks = await this.markModel.find({ examId }).lean();
    const scoresByStudent: Record<string, { obtained: number; max: number }> =
      {};

    for (const m of marks) {
      if (!scoresByStudent[m.studentId])
        scoresByStudent[m.studentId] = { obtained: 0, max: 0 };
      scoresByStudent[m.studentId].obtained += m.marksObtained || 0;
      scoresByStudent[m.studentId].max += m.maxMarks || 0;
    }

    const results = Object.entries(scoresByStudent).map(([studentId, s]) => ({
      studentId,
      obtained: s.obtained,
      max: s.max,
      percentage: s.max ? (s.obtained / s.max) * 100 : 0,
    }));

    results.sort((a, b) => b.percentage - a.percentage);

    return results.map((r, idx) => ({ rank: idx + 1, ...r }));
  }

  calculateGPA(obtained: number, max: number) {
    if (!max) return 0;
    const pct = (obtained / max) * 100;
    // Simple 4-point scale
    if (pct >= 85) return 4.0;
    if (pct >= 70) return 3.0;
    if (pct >= 55) return 2.0;
    if (pct >= 40) return 1.0;
    return 0.0;
  }

  calculateGrade(obtained: number, max: number) {
    if (!max) return 'F';
    const pct = (obtained / max) * 100;
    if (pct >= 85) return 'A+';
    if (pct >= 70) return 'A';
    if (pct >= 55) return 'B';
    if (pct >= 40) return 'C';
    return 'F';
  }
}
