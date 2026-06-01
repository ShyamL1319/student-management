import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { ExaminationsService } from './examinations.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum as Role } from '../common/enums/role.enum';

@ApiTags('Examinations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exams')
export class ExaminationsController {
  constructor(private readonly service: ExaminationsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create an exam' })
  create(@Body() dto: CreateExamDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get all exams' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get exam by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update an exam' })
  update(@Param('id') id: string, @Body() dto: UpdateExamDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an exam' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/publish')
  @Roles(Role.ADMIN)
  @HttpCode(200)
  @ApiOperation({ summary: 'Publish an exam' })
  @ApiResponse({ status: 200, description: 'Exam published' })
  publish(@Param('id') id: string) {
    return this.service.publish(id);
  }

  @Post(':id/schedule')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Add schedule entries to an exam' })
  addSchedule(@Param('id') id: string, @Body() schedule: any) {
    return this.service.addSchedule(id, schedule);
  }
}
