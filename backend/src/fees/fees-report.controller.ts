import { Controller, Get, Query } from '@nestjs/common';
import { FeesReportService } from './fees-report.service';

@Controller('fees/reports')
export class FeesReportController {
  constructor(private readonly feesReportService: FeesReportService) {}

  @Get('collection')
  async getCollectionReport(
    @Query('classId') classId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.feesReportService.generateCollectionReport(
      classId,
      academicYearId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('outstanding')
  async getOutstandingFeesReport(@Query('academicYearId') academicYearId?: string) {
    return this.feesReportService.generateOutstandingFeesReport(academicYearId);
  }

  @Get('receipts')
  async getReceiptReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.feesReportService.generateReceiptReport(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('invoices')
  async getInvoiceReport(
    @Query('classId') classId?: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.feesReportService.generateInvoiceReport(classId, academicYearId);
  }

  @Get('monthly')
  async getMonthlyReport(@Query('academicYearId') academicYearId?: string) {
    return this.feesReportService.generateMonthlyReport(academicYearId);
  }
}
