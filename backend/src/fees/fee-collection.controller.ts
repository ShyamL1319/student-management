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
import { FeeCollectionService } from './fee-collection.service';
import {
  CreateFeeCollectionDto,
  UpdateFeeCollectionDto,
  FeeCollectionQueryDto,
} from './dto/fee-collection.dto';

@Controller('fee-collections')
export class FeeCollectionController {
  constructor(private readonly feeCollectionService: FeeCollectionService) {}

  @Post()
  create(@Body() dto: CreateFeeCollectionDto) {
    return this.feeCollectionService.create(dto);
  }

  @Get()
  findAll(@Query() query: FeeCollectionQueryDto) {
    return this.feeCollectionService.findAll(query);
  }

  @Get('student/:studentId')
  findByStudent(
    @Param('studentId') studentId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.feeCollectionService.findByStudent(studentId, academicYearId);
  }

  @Get('class/:classId')
  findByClass(
    @Param('classId') classId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.feeCollectionService.findByClass(classId, academicYearId);
  }

  @Get('student/:studentId/pending')
  getPendingFees(
    @Param('studentId') studentId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.feeCollectionService.getPendingFees(studentId, academicYearId);
  }

  @Get('student/:studentId/outstanding')
  getOutstandingAmount(
    @Param('studentId') studentId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.feeCollectionService.getOutstandingAmount(
      studentId,
      academicYearId,
    );
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.feeCollectionService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFeeCollectionDto) {
    return this.feeCollectionService.update(id, dto);
  }

  @Put(':id/payment')
  recordPayment(
    @Param('id') id: string,
    @Body()
    body: { amountPaid: number; paymentMethod: string; transactionId?: string },
  ) {
    return this.feeCollectionService.recordPayment(
      id,
      body.amountPaid,
      body.paymentMethod,
      body.transactionId,
    );
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.feeCollectionService.delete(id);
  }
}
