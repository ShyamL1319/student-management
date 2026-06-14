import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum } from '../common/enums/role.enum';

@ApiTags('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Admit a new student' })
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Get()
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.TEACHER)
  @ApiOperation({ summary: 'List students with filters' })
  findAll(@Query() query: any) {
    return this.studentsService.findAll(query);
  }

  @Get('suggest')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.TEACHER)
  @ApiOperation({
    summary: 'Get student suggestions for autocomplete dropdowns',
  })
  suggest(@Query('q') q: string) {
    return this.studentsService.suggest(q);
  }

  @Get(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.TEACHER)
  @ApiOperation({ summary: 'Get student by id' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Update student' })
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Delete student' })
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }

  @Post(':id/promote')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Promote student to a new class/section' })
  promote(
    @Param('id') id: string,
    @Body() body: { class?: string; section?: string },
  ) {
    return this.studentsService.promote(id, body);
  }

  @Post(':id/transfer')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Transfer student (alias to promote for now)' })
  transfer(
    @Param('id') id: string,
    @Body() body: { class?: string; section?: string },
  ) {
    return this.studentsService.transfer(id, body);
  }
}
