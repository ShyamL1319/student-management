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
    const result = await this.counterModel.findOneAndUpdate(
      { _id: counterName } as any,
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    ).exec();

    const doc = (result as any)?.value || result;
    if (!doc) {
      throw new Error(`Failed to generate sequence for counter: ${counterName}`);
    }

    return doc.seq;
  }

  async generateAdmissionNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const seq = await this.getNextSequence(`admission_number:${year}`);
    const paddedSeq = String(seq).padStart(6, '0');
    return `ADM-${year}-${paddedSeq}`;
  }

  async generateRollNumber(classId: string, academicYearId: string): Promise<string> {
    const counterKey = `roll_number:${classId}:${academicYearId}`;
    const seq = await this.getNextSequence(counterKey);
    const paddedSeq = String(seq).padStart(6, '0');
    
    // Use last 6 chars of classId or full classId if it's shorter
    const classIdStr = String(classId);
    const shortClassId = classIdStr.length > 6 
      ? classIdStr.substring(classIdStr.length - 6) 
      : classIdStr;
      
    return `ROLL-${shortClassId}-${paddedSeq}`;
  }
}
