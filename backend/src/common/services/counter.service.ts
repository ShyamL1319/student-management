import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Counter, CounterDocument } from '../schemas/counter.schema';

@Injectable()
export class CounterService {
  constructor(
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
  ) {}

  async getNextSequence(counterName: string): Promise<number> {
    const result = await this.counterModel
      .findOneAndUpdate(
        { _id: counterName } as any,
        { $inc: { seq: 1 } },
        { new: true, upsert: true },
      )
      .exec();

    const doc = (result as any)?.value || result;
    if (!doc) {
      throw new Error(
        `Failed to generate sequence for counter: ${counterName}`,
      );
    }

    return doc.seq;
  }

  async generateAdmissionNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const seq = await this.getNextSequence(`admission_number:${year}`);
    const paddedSeq = String(seq).padStart(6, '0');
    return `PSEI-${year}-${paddedSeq}`;
  }

  async generateRollNumber(
    classId: string,
    academicYearId: string,
  ): Promise<string> {
    const counterKey = `roll_number:${classId}:${academicYearId}`;
    const seq = await this.getNextSequence(counterKey);
    const paddedSeq = String(seq).padStart(6, '0');

    let deptCode = 'GEN';
    let classCode = 'CLASS';

    if (classId && classId !== 'default' && this.counterModel.db) {
      try {
        const ClassModel = this.counterModel.db.model('Class');
        const classDoc = await ClassModel.findById(classId).exec();
        if (classDoc) {
          classCode = classDoc.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
          if (classDoc.department) {
            const DepartmentModel = this.counterModel.db.model('Department');
            const deptDoc = await DepartmentModel.findById(
              classDoc.department,
            ).exec();
            if (deptDoc) {
              deptCode = deptDoc.code
                ? deptDoc.code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
                : deptDoc.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            }
          }
        }
      } catch (err) {
        // Fallback in case of db errors or testing mocks
        const classIdStr = String(classId);
        classCode =
          classIdStr.length > 6
            ? classIdStr.substring(classIdStr.length - 6).toUpperCase()
            : classIdStr.toUpperCase();
      }
    } else {
      const classIdStr = String(classId);
      classCode =
        classIdStr.length > 6
          ? classIdStr.substring(classIdStr.length - 6).toUpperCase()
          : classIdStr.toUpperCase();
    }

    return `PSEI${deptCode}${classCode}${paddedSeq}`;
  }
}
