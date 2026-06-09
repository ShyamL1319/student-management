import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  HttpStatus, 
  HttpCode 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { 
  CreateAssignmentDto, 
  UpdateAssignmentDto,
  SubmitAssignmentDto, 
  GradeSubmissionDto, 
  BulkGradeSubmissionDto 
} from './dto/assignment.dto';
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
  @ApiOperation({ summary: 'Create a new assignment (Teacher/Admin)' })
  @ApiResponse({ status: 201, description: 'Assignment created successfully' })
  async create(@CurrentUser() user: any, @Body() dto: CreateAssignmentDto) {
    const schoolId = user.schoolId?.toString() || user.school?.toString();
    return this.assignmentsService.create(user._id.toString(), schoolId, dto);
  }

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.TEACHER, RoleEnum.STUDENT)
  @ApiOperation({ summary: 'List assignments with optional pagination filters' })
  async findAll(@CurrentUser() user: any, @Query() query: any) {
    const schoolId = user.schoolId?.toString() || user.school?.toString();
    const filterQuery = { ...query };
    
    if (user.roleType === RoleEnum.STUDENT) {
      filterQuery.classId = user.class?.toString();
      filterQuery.isPublished = true;
    } else if (user.roleType === RoleEnum.TEACHER) {
      filterQuery.teacherId = user._id.toString();
    }
    
    return this.assignmentsService.findAll(schoolId, filterQuery, user._id.toString(), user.roleType);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.TEACHER, RoleEnum.STUDENT)
  @ApiOperation({ summary: 'Get details of a specific assignment' })
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    const schoolId = user.schoolId?.toString() || user.school?.toString();
    return this.assignmentsService.findOne(id, schoolId, user._id.toString(), user.roleType);
  }

  @Patch(':id')
  @Roles(RoleEnum.TEACHER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Edit assignment details' })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateAssignmentDto,
  ) {
    const schoolId = user.schoolId?.toString() || user.school?.toString();
    return this.assignmentsService.update(id, schoolId, user._id.toString(), user.roleType, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.TEACHER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an assignment and all associated submissions' })
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    const schoolId = user.schoolId?.toString() || user.school?.toString();
    return this.assignmentsService.remove(id, schoolId, user._id.toString(), user.roleType);
  }

  @Post(':id/publish')
  @Roles(RoleEnum.TEACHER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Publish a draft assignment' })
  async publish(@CurrentUser() user: any, @Param('id') id: string) {
    const schoolId = user.schoolId?.toString() || user.school?.toString();
    return this.assignmentsService.publish(id, schoolId, user._id.toString(), user.roleType);
  }

  @Get(':id/presign-upload')
  @Roles(RoleEnum.STUDENT, RoleEnum.TEACHER, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Generate S3 Presigned URL for attaching files/submitting work' })
  async getPresignedUrl(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Query('fileName') fileName: string,
  ) {
    const schoolId = user.schoolId?.toString() || user.school?.toString();
    return this.assignmentsService.generatePresignedUploadUrl(schoolId, id, user._id.toString(), fileName);
  }

  @Post(':id/submit')
  @Roles(RoleEnum.STUDENT)
  @ApiOperation({ summary: 'Submit student homework files' })
  async submit(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: SubmitAssignmentDto,
  ) {
    const schoolId = user.schoolId?.toString() || user.school?.toString();
    return this.assignmentsService.submit(user._id.toString(), schoolId, id, dto);
  }

  @Get(':id/submissions')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.TEACHER)
  @ApiOperation({ summary: 'View submissions list for an assignment' })
  async getSubmissions(@CurrentUser() user: any, @Param('id') id: string) {
    const schoolId = user.schoolId?.toString() || user.school?.toString();
    return this.assignmentsService.getSubmissions(schoolId, id, user._id.toString(), user.roleType);
  }

  @Patch('submissions/:submissionId/grade')
  @Roles(RoleEnum.TEACHER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Evaluate a specific student submission' })
  async grade(
    @CurrentUser() user: any,
    @Param('submissionId') submissionId: string,
    @Body() dto: GradeSubmissionDto,
  ) {
    const schoolId = user.schoolId?.toString() || user.school?.toString();
    return this.assignmentsService.grade(user._id.toString(), schoolId, submissionId, dto);
  }

  @Post(':id/submissions/bulk-grade')
  @Roles(RoleEnum.TEACHER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Submit evaluation marks and feedbacks in bulk' })
  async bulkGrade(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: BulkGradeSubmissionDto,
  ) {
    const schoolId = user.schoolId?.toString() || user.school?.toString();
    return this.assignmentsService.bulkGrade(user._id.toString(), schoolId, id, dto);
  }

  @Get(':id/analytics')
  @Roles(RoleEnum.TEACHER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Retrieve assignment performance statistics' })
  async getAnalytics(@CurrentUser() user: any, @Param('id') id: string) {
    const schoolId = user.schoolId?.toString() || user.school?.toString();
    return this.assignmentsService.getAnalytics(id, schoolId);
  }
}

