import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, SubmitAssignmentDto, GradeSubmissionDto } from './dto/assignment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles(RoleEnum.TEACHER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new assignment (Teacher)' })
  async create(@CurrentUser() user: any, @Body() dto: CreateAssignmentDto) {
    return this.assignmentsService.create(user._id.toString(), user.school.toString(), dto);
  }

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.TEACHER, RoleEnum.STUDENT)
  @ApiOperation({ summary: 'List all assignments' })
  async findAll(@CurrentUser() user: any, @Query() query: any) {
    const filterQuery = { ...query };
    // If student, filter by class
    if (user.roleType === 'STUDENT') {
      filterQuery.classId = user.class?.toString();
    } else if (user.roleType === 'TEACHER') {
      filterQuery.teacherId = user._id.toString();
    }
    return this.assignmentsService.findAll(user.school.toString(), filterQuery);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.TEACHER, RoleEnum.STUDENT)
  @ApiOperation({ summary: 'Get details of an assignment' })
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.assignmentsService.findOne(id, user.school.toString());
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.TEACHER)
  @ApiOperation({ summary: 'Delete an assignment' })
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.assignmentsService.remove(id, user.school.toString());
  }

  @Post(':id/submit')
  @Roles(RoleEnum.STUDENT)
  @ApiOperation({ summary: 'Submit homework for an assignment (Student)' })
  async submit(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: SubmitAssignmentDto,
  ) {
    return this.assignmentsService.submit(user._id.toString(), user.school.toString(), id, dto);
  }

  @Get(':id/submissions')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.TEACHER)
  @ApiOperation({ summary: 'Get submissions list for an assignment' })
  async getSubmissions(@CurrentUser() user: any, @Param('id') id: string) {
    return this.assignmentsService.getSubmissions(user.school.toString(), id);
  }

  @Patch('submissions/:submissionId/grade')
  @Roles(RoleEnum.TEACHER, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Grade an assignment submission (Teacher)' })
  async grade(
    @CurrentUser() user: any,
    @Param('submissionId') submissionId: string,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.assignmentsService.grade(user._id.toString(), user.school.toString(), submissionId, dto);
  }
}
