import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { CreateReceiptDto, UpdateReceiptDto, ReceiptQueryDto } from './dto/receipt.dto';

@Controller('receipts')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post()
  create(@Body() dto: CreateReceiptDto) {
    return this.receiptService.create(dto);
  }

  @Get()
  findAll(@Query() query: ReceiptQueryDto) {
    return this.receiptService.findAll(query);
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.receiptService.findByStudent(studentId);
  }

  @Get('fee-collection/:feeCollectionId')
  findByFeeCollection(@Param('feeCollectionId') feeCollectionId: string) {
    return this.receiptService.findByFeeCollection(feeCollectionId);
  }

  @Get('number/:receiptNumber')
  findByReceiptNumber(@Param('receiptNumber') receiptNumber: string) {
    return this.receiptService.findByReceiptNumber(receiptNumber);
  }

  @Get('date-range')
  getReceiptsByDateRange(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.receiptService.getReceiptsByDateRange(new Date(startDate), new Date(endDate));
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.receiptService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReceiptDto) {
    return this.receiptService.update(id, dto);
  }

  @Put(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.receiptService.cancel(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.receiptService.delete(id);
  }
}
