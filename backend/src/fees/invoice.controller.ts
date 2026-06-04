import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  InvoiceQueryDto,
} from './dto/invoice.dto';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoiceService.create(dto);
  }

  @Get()
  findAll(@Query() query: InvoiceQueryDto) {
    return this.invoiceService.findAll(query);
  }

  @Get('student/:studentId')
  findByStudent(
    @Param('studentId') studentId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.invoiceService.findByStudent(studentId, academicYearId);
  }

  @Get('class/:classId')
  findByClass(
    @Param('classId') classId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.invoiceService.findByClass(classId, academicYearId);
  }

  @Get('overdue')
  getOverdueInvoices(@Query('academicYearId') academicYearId?: string) {
    return this.invoiceService.getOverdueInvoices(academicYearId);
  }

  @Get('number/:invoiceNumber')
  findByInvoiceNumber(@Param('invoiceNumber') invoiceNumber: string) {
    return this.invoiceService.findByInvoiceNumber(invoiceNumber);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.invoiceService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoiceService.update(id, dto);
  }

  @Put(':id/payment')
  recordPayment(@Param('id') id: string, @Body() body: { amountPaid: number }) {
    return this.invoiceService.recordPayment(id, body.amountPaid);
  }

  @Put(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.invoiceService.cancel(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.invoiceService.delete(id);
  }
}
