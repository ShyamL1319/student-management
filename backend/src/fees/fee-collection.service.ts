import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  FeeCollection,
  FeeCollectionDocument,
} from './schemas/fee-collection.schema';
import {
  CreateFeeCollectionDto,
  UpdateFeeCollectionDto,
  FeeCollectionQueryDto,
} from './dto/fee-collection.dto';

@Injectable()
export class FeeCollectionService {
  constructor(
    @InjectModel(FeeCollection.name)
    private feeCollectionModel: Model<FeeCollectionDocument>,
  ) {}

  async create(dto: CreateFeeCollectionDto) {
    const feeCollection = new this.feeCollectionModel({
      ...dto,
      status: 'PENDING',
    });
    return feeCollection.save();
  }

  async findAll(query: FeeCollectionQueryDto = {}) {
    return this.feeCollectionModel.find(query).lean();
  }

  async findById(id: string) {
    const feeCollection = await this.feeCollectionModel.findById(id).lean();
    if (!feeCollection) {
      throw new NotFoundException(`Fee Collection with ID ${id} not found`);
    }
    return feeCollection;
  }

  async findByStudent(studentId: string, academicYearId?: string) {
    const query: any = { studentId };
    if (academicYearId) {
      query.academicYearId = academicYearId;
    }
    return this.feeCollectionModel.find(query).lean();
  }

  async findByClass(classId: string, academicYearId?: string) {
    const query: any = { classId };
    if (academicYearId) {
      query.academicYearId = academicYearId;
    }
    return this.feeCollectionModel.find(query).lean();
  }

  async update(id: string, dto: UpdateFeeCollectionDto) {
    const feeCollection = await this.feeCollectionModel.findByIdAndUpdate(
      id,
      dto,
      { new: true },
    );
    if (!feeCollection) {
      throw new NotFoundException(`Fee Collection with ID ${id} not found`);
    }
    return feeCollection;
  }

  async recordPayment(
    id: string,
    amountPaid: number,
    paymentMethod: string,
    transactionId?: string,
  ) {
    const feeCollection = await this.feeCollectionModel.findById(id);
    if (!feeCollection) {
      throw new NotFoundException(`Fee Collection with ID ${id} not found`);
    }

    const previousAmountPaid = feeCollection.amountPaid || 0;
    const totalPaid = previousAmountPaid + amountPaid;
    const amountDue = feeCollection.amountDue - feeCollection.discount;

    let status = 'PENDING';
    if (totalPaid >= amountDue) {
      status = 'PAID';
    } else if (totalPaid > 0) {
      status = 'PARTIAL';
    }

    // Check if overdue
    if (new Date() > new Date(feeCollection.dueDate) && status !== 'PAID') {
      status = 'OVERDUE';
    }

    const updatedFeeCollection =
      await this.feeCollectionModel.findByIdAndUpdate(
        id,
        {
          amountPaid: totalPaid,
          status,
          paymentDate: new Date(),
          paymentMethod,
          transactionId,
        },
        { new: true },
      );

    return updatedFeeCollection;
  }

  async getPendingFees(studentId: string, academicYearId?: string) {
    const query: any = {
      studentId,
      status: { $in: ['PENDING', 'OVERDUE', 'PARTIAL'] },
    };
    if (academicYearId) {
      query.academicYearId = academicYearId;
    }
    return this.feeCollectionModel.find(query).lean();
  }

  async getOutstandingAmount(studentId: string, academicYearId?: string) {
    const query: any = {
      studentId,
      status: { $in: ['PENDING', 'OVERDUE', 'PARTIAL'] },
    };
    if (academicYearId) {
      query.academicYearId = academicYearId;
    }

    const pendingFees = await this.feeCollectionModel.find(query).lean();
    const outstanding = pendingFees.reduce((total, fee) => {
      const amountDue = fee.amountDue - fee.discount;
      const remaining = amountDue - (fee.amountPaid || 0);
      return total + Math.max(0, remaining);
    }, 0);

    return { studentId, outstanding, count: pendingFees.length };
  }

  async delete(id: string) {
    const feeCollection = await this.feeCollectionModel.findByIdAndDelete(id);
    if (!feeCollection) {
      throw new NotFoundException(`Fee Collection with ID ${id} not found`);
    }
    return feeCollection;
  }
}
