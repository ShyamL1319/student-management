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
import { FeeStructureService } from './fee-structure.service';
import {
  CreateFeeStructureDto,
  UpdateFeeStructureDto,
  FeeStructureQueryDto,
} from './dto/fee-structure.dto';

@Controller('fee-structures')
export class FeeStructureController {
  constructor(private readonly feeStructureService: FeeStructureService) {}

  @Post()
  create(@Body() dto: CreateFeeStructureDto) {
    return this.feeStructureService.create(dto);
  }

  @Get()
  findAll(@Query() query: FeeStructureQueryDto) {
    return this.feeStructureService.findAll(query);
  }

  @Get('class/:classId')
  findByClass(
    @Param('classId') classId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.feeStructureService.findByClass(classId, academicYearId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.feeStructureService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFeeStructureDto) {
    return this.feeStructureService.update(id, dto);
  }

  @Put(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.feeStructureService.deactivate(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.feeStructureService.delete(id);
  }
}
