import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Receipt, ReceiptDocument } from './schemas/receipt.schema';
import { CreateReceiptDto, UpdateReceiptDto, ReceiptQueryDto } from './dto/receipt.dto';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectModel(Receipt.name) private receiptModel: Model<ReceiptDocument>,
  ) {}

  private async generateReceiptNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.receiptModel.countDocuments();
    return `RCP-${year}-${month}-${String(count + 1).padStart(5, '0')}`;
  }

  async create(dto: CreateReceiptDto) {
    const receiptNumber = await this.generateReceiptNumber();
    const receipt = new this.receiptModel({
      ...dto,
      receiptNumber,
      status: 'ISSUED',
    });
    return receipt.save();
  }

  async findAll(query: ReceiptQueryDto = {}) {
    return this.receiptModel.find(query).lean();
  }

  async findById(id: string) {
    const receipt = await this.receiptModel.findById(id).lean();
    if (!receipt) {
      throw new NotFoundException(`Receipt with ID ${id} not found`);
    }
    return receipt;
  }

  async findByReceiptNumber(receiptNumber: string) {
    const receipt = await this.receiptModel.findOne({ receiptNumber }).lean();
    if (!receipt) {
      throw new NotFoundException(`Receipt with number ${receiptNumber} not found`);
    }
    return receipt;
  }

  async findByStudent(studentId: string) {
    return this.receiptModel.find({ studentId, status: 'ISSUED' }).lean();
  }

  async findByFeeCollection(feeCollectionId: string) {
    return this.receiptModel.find({ feeCollectionId, status: 'ISSUED' }).lean();
  }

  async update(id: string, dto: UpdateReceiptDto) {
    const receipt = await this.receiptModel.findByIdAndUpdate(id, dto, { new: true });
    if (!receipt) {
      throw new NotFoundException(`Receipt with ID ${id} not found`);
    }
    return receipt;
  }

  async cancel(id: string) {
    const receipt = await this.receiptModel.findByIdAndUpdate(
      id,
      { status: 'CANCELLED' },
      { new: true },
    );
    if (!receipt) {
      throw new NotFoundException(`Receipt with ID ${id} not found`);
    }
    return receipt;
  }

  async getReceiptsByDateRange(startDate: Date, endDate: Date) {
    return this.receiptModel
      .find({
        paymentDate: { $gte: startDate, $lte: endDate },
        status: 'ISSUED',
      })
      .lean();
  }

  async delete(id: string) {
    const receipt = await this.receiptModel.findByIdAndDelete(id);
    if (!receipt) {
      throw new NotFoundException(`Receipt with ID ${id} not found`);
    }
    return receipt;
  }
}
