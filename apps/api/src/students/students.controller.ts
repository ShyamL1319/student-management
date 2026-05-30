import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { ListStudentsQueryDto } from './dto/list-students-query.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PaginatedStudents, StudentsService } from './students.service';
import { StudentDocument } from './schemas/student.schema';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(UserRole.Admin)
  @ApiCreatedResponse({ description: 'Creates a student record.' })
  @ResponseMessage('Student created successfully')
  create(@Body() createStudentDto: CreateStudentDto): Promise<StudentDocument> {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @Roles(UserRole.Admin)
  @ApiOkResponse({ description: 'Lists student records.' })
  @ResponseMessage('Students loaded successfully')
  findAll(@Query() query: ListStudentsQueryDto): Promise<PaginatedStudents> {
    return this.studentsService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.Admin)
  @ApiOkResponse({ description: 'Returns one student record.' })
  @ResponseMessage('Student loaded successfully')
  findOne(@Param('id') id: string): Promise<StudentDocument> {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.Admin, UserRole.Staff)
  @ApiOkResponse({ description: 'Updates a student record.' })
  @ResponseMessage('Student updated successfully')
  update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<StudentDocument> {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  @ApiOkResponse({ description: 'Soft deletes a student record.' })
  @ResponseMessage('Student deleted successfully')
  remove(@Param('id') id: string): Promise<{ id: string }> {
    return this.studentsService.remove(id);
  }
}
