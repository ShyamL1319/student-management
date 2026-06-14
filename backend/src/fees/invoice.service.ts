import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  InvoiceQueryDto,
} from './dto/invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  private async generateInvoiceNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.invoiceModel.countDocuments();
    return `INV-${year}-${month}-${String(count + 1).padStart(5, '0')}`;
  }

  async create(dto: CreateInvoiceDto) {
    const invoiceNumber = await this.generateInvoiceNumber();
    const pendingAmount = dto.netAmount;

    const invoice = new this.invoiceModel({
      ...dto,
      invoiceNumber,
      pendingAmount,
      status: 'ISSUED',
    });
    return invoice.save();
  }

  async findAll(query: InvoiceQueryDto = {}) {
    const { page, limit, ...filter } = query;
    if (page || limit) {
      const p = page || 1;
      const l = limit || 10;
      const skip = (p - 1) * l;
      const [data, total] = await Promise.all([
        this.invoiceModel.find(filter).skip(skip).limit(l).lean().exec(),
        this.invoiceModel.countDocuments(filter).exec(),
      ]);
      return { data, total, page: p, totalPages: Math.ceil(total / l) };
    }
    return this.invoiceModel.find(filter).lean().exec();
  }

  async findById(id: string) {
    const invoice = await this.invoiceModel.findById(id).lean();
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async findByInvoiceNumber(invoiceNumber: string) {
    const invoice = await this.invoiceModel.findOne({ invoiceNumber }).lean();
    if (!invoice) {
      throw new NotFoundException(
        `Invoice with number ${invoiceNumber} not found`,
      );
    }
    return invoice;
  }

  async findByStudent(studentId: string, academicYearId?: string) {
    const query: any = { studentId };
    if (academicYearId) {
      query.academicYearId = academicYearId;
    }
    return this.invoiceModel.find(query).lean();
  }

  async findByClass(classId: string, academicYearId?: string) {
    const query: any = { classId };
    if (academicYearId) {
      query.academicYearId = academicYearId;
    }
    return this.invoiceModel.find(query).lean();
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    const invoice = await this.invoiceModel.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    const paidAmount = dto.paidAmount || invoice.paidAmount || 0;
    const pendingAmount = invoice.netAmount - paidAmount;

    let status = dto.status || invoice.status;
    if (!dto.status) {
      if (paidAmount >= invoice.netAmount) {
        status = 'PAID';
      } else if (paidAmount > 0) {
        status = 'PARTIAL';
      }
    }

    const updatedInvoice = await this.invoiceModel.findByIdAndUpdate(
      id,
      {
        ...dto,
        paidAmount,
        pendingAmount,
        status,
      },
      { new: true },
    );

    return updatedInvoice;
  }

  async recordPayment(id: string, amountPaid: number) {
    const invoice = await this.invoiceModel.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    const totalPaid = (invoice.paidAmount || 0) + amountPaid;
    const pendingAmount = invoice.netAmount - totalPaid;

    let status = 'PARTIAL';
    if (totalPaid >= invoice.netAmount) {
      status = 'PAID';
    }

    const updatedInvoice = await this.invoiceModel.findByIdAndUpdate(
      id,
      {
        paidAmount: totalPaid,
        pendingAmount: Math.max(0, pendingAmount),
        status,
      },
      { new: true },
    );

    return updatedInvoice;
  }

  async getOverdueInvoices(academicYearId?: string) {
    const query: any = {
      dueDate: { $lt: new Date() },
      status: { $in: ['ISSUED', 'PARTIAL', 'OVERDUE'] },
    };
    if (academicYearId) {
      query.academicYearId = academicYearId;
    }
    return this.invoiceModel.find(query).lean();
  }

  async cancel(id: string) {
    const invoice = await this.invoiceModel.findByIdAndUpdate(
      id,
      { status: 'CANCELLED' },
      { new: true },
    );
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async delete(id: string) {
    const invoice = await this.invoiceModel.findByIdAndDelete(id);
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }
}
