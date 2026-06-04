import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  FeeCollection,
  FeeCollectionDocument,
} from './schemas/fee-collection.schema';
import { Receipt, ReceiptDocument } from './schemas/receipt.schema';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';

@Injectable()
export class FeesReportService {
  constructor(
    @InjectModel(FeeCollection.name)
    private feeCollectionModel: Model<FeeCollectionDocument>,
    @InjectModel(Receipt.name) private receiptModel: Model<ReceiptDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  async generateCollectionReport(
    classId?: string,
    academicYearId?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const query: any = {};
    if (classId) query.classId = classId;
    if (academicYearId) query.academicYearId = academicYearId;

    const feeCollections = await this.feeCollectionModel.find(query).lean();

    const summary = {
      totalRecords: feeCollections.length,
      totalDue: 0,
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
      byStatus: {
        PENDING: 0,
        PARTIAL: 0,
        PAID: 0,
        OVERDUE: 0,
      },
      details: [] as any[],
    };

    for (const fee of feeCollections) {
      const amountDue = fee.amountDue - fee.discount;
      const amountPaid = fee.amountPaid || 0;
      const balance = amountDue - amountPaid;

      summary.totalDue += amountDue;
      summary.totalPaid += amountPaid;
      summary.totalPending += Math.max(0, balance);
      summary.byStatus[fee.status as keyof typeof summary.byStatus]++;

      if (fee.status === 'OVERDUE') {
        summary.totalOverdue += Math.max(0, balance);
      }

      summary.details.push({
        studentId: fee.studentId,
        amountDue,
        amountPaid,
        balance: Math.max(0, balance),
        status: fee.status,
        dueDate: fee.dueDate,
        paymentDate: fee.paymentDate,
      });
    }

    return summary;
  }

  async generateOutstandingFeesReport(academicYearId?: string) {
    const query: any = {
      status: { $in: ['PENDING', 'OVERDUE', 'PARTIAL'] },
    };
    if (academicYearId) query.academicYearId = academicYearId;

    const outstandingFees = await this.feeCollectionModel.find(query).lean();

    const byStudent: Record<string, any> = {};
    for (const fee of outstandingFees) {
      const studentIdStr = fee.studentId.toString();
      if (!byStudent[studentIdStr]) {
        byStudent[studentIdStr] = {
          studentId: studentIdStr,
          totalOutstanding: 0,
          feeCount: 0,
          fees: [],
        };
      }

      const balance = fee.amountDue - fee.discount - (fee.amountPaid || 0);
      byStudent[studentIdStr].totalOutstanding += Math.max(0, balance);
      byStudent[studentIdStr].feeCount++;
      byStudent[studentIdStr].fees.push({
        feeStructureId: fee.feeStructureId,
        amountDue: fee.amountDue,
        balance: Math.max(0, balance),
        status: fee.status,
        dueDate: fee.dueDate,
      });
    }

    const report = Object.values(byStudent).sort(
      (a: any, b: any) => b.totalOutstanding - a.totalOutstanding,
    );

    return {
      totalStudentsWithOutstanding: report.length,
      totalOutstandingAmount: report.reduce(
        (sum: number, s: any) => sum + s.totalOutstanding,
        0,
      ),
      report,
    };
  }

  async generateReceiptReport(startDate?: Date, endDate?: Date) {
    const query: any = { status: 'ISSUED' };

    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = startDate;
      if (endDate) query.paymentDate.$lte = endDate;
    }

    const receipts = await this.receiptModel.find(query).lean();

    const byPaymentMethod: Record<string, any> = {};
    const byStudent: Record<string, any> = {};
    let totalAmount = 0;

    for (const receipt of receipts) {
      totalAmount += receipt.amountReceived;

      if (!byPaymentMethod[receipt.paymentMethod]) {
        byPaymentMethod[receipt.paymentMethod] = { count: 0, amount: 0 };
      }
      byPaymentMethod[receipt.paymentMethod].count++;
      byPaymentMethod[receipt.paymentMethod].amount += receipt.amountReceived;

      const studentIdStr = receipt.studentId.toString();
      if (!byStudent[studentIdStr]) {
        byStudent[studentIdStr] = { receipts: [] };
      }
      byStudent[studentIdStr].receipts.push({
        receiptNumber: receipt.receiptNumber,
        amount: receipt.amountReceived,
        paymentDate: receipt.paymentDate,
        paymentMethod: receipt.paymentMethod,
      });
    }

    return {
      totalReceipts: receipts.length,
      totalAmount,
      byPaymentMethod,
      byStudent,
    };
  }

  async generateInvoiceReport(classId?: string, academicYearId?: string) {
    const query: any = {};
    if (classId) query.classId = classId;
    if (academicYearId) query.academicYearId = academicYearId;

    const invoices = await this.invoiceModel.find(query).lean();

    const summary = {
      totalInvoices: invoices.length,
      totalAmount: 0,
      totalPaid: 0,
      totalPending: 0,
      byStatus: {
        DRAFT: 0,
        ISSUED: 0,
        PARTIAL: 0,
        PAID: 0,
        OVERDUE: 0,
        CANCELLED: 0,
      },
      details: [] as any[],
    };

    for (const invoice of invoices) {
      summary.totalAmount += invoice.netAmount;
      summary.totalPaid += invoice.paidAmount || 0;
      summary.totalPending += invoice.pendingAmount || 0;
      summary.byStatus[invoice.status as keyof typeof summary.byStatus]++;

      summary.details.push({
        invoiceNumber: invoice.invoiceNumber,
        studentId: invoice.studentId,
        netAmount: invoice.netAmount,
        paidAmount: invoice.paidAmount || 0,
        pendingAmount: invoice.pendingAmount || 0,
        status: invoice.status,
        dueDate: invoice.dueDate,
      });
    }

    return summary;
  }

  async generateMonthlyReport(academicYearId?: string) {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const currentYear = new Date().getFullYear();
    const monthlyData: Record<number, any> = {};

    for (const month of months) {
      const startDate = new Date(currentYear, month - 1, 1);
      const endDate = new Date(currentYear, month, 0);

      const query: any = {
        paymentDate: { $gte: startDate, $lte: endDate },
        status: 'ISSUED',
      };
      if (academicYearId) query.academicYearId = academicYearId;

      const receipts = await this.receiptModel.find(query).lean();
      const totalAmount = receipts.reduce(
        (sum, r) => sum + r.amountReceived,
        0,
      );
      const monthName = startDate.toLocaleDateString('en-US', {
        month: 'long',
      });

      monthlyData[month] = {
        month: monthName,
        receiptCount: receipts.length,
        totalAmount,
      };
    }

    return monthlyData;
  }
}
