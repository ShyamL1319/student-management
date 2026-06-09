import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ParentsService } from './parents.service';
import {
  RegisterParentDto,
  LinkChildDto,
  SendParentMessageDto,
  UpdateParentProfileDto,
  CreateParentDto,
  UpdateParentDto,
} from './dto/parent-auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Parents')
@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new parent account' })
  async register(@Body() dto: RegisterParentDto) {
    return this.parentsService.register(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.PARENT)
  @ApiBearerAuth()
  @Post('link-child')
  @ApiOperation({ summary: 'Link a student child by admission number and DOB' })
  async linkChild(@CurrentUser() parent: any, @Body() dto: LinkChildDto) {
    return this.parentsService.linkChild(parent._id.toString(), dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.PARENT)
  @ApiBearerAuth()
  @Get('children')
  @ApiOperation({ summary: 'Get profile information of linked children' })
  async getChildren(@CurrentUser() parent: any) {
    return this.parentsService.getChildren(parent._id.toString());
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.PARENT)
  @ApiBearerAuth()
  @Get('dashboard')
  @ApiOperation({
    summary: 'Get parent dashboard widgets and summary statistics',
  })
  async getDashboard(@CurrentUser() parent: any) {
    return this.parentsService.getDashboard(parent._id.toString());
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.PARENT)
  @ApiBearerAuth()
  @Get('children/:studentId/attendance')
  @ApiOperation({ summary: 'Get attendance logs for a child' })
  async getChildAttendance(
    @CurrentUser() parent: any,
    @Param('studentId') studentId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.parentsService.getChildAttendance(
      parent._id.toString(),
      studentId,
      {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      },
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.PARENT)
  @ApiBearerAuth()
  @Get('children/:studentId/academic')
  @ApiOperation({ summary: 'Get academic results & GPA history for a child' })
  async getChildAcademic(
    @CurrentUser() parent: any,
    @Param('studentId') studentId: string,
  ) {
    return this.parentsService.getChildAcademic(
      parent._id.toString(),
      studentId,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.PARENT)
  @ApiBearerAuth()
  @Get('children/:studentId/fees')
  @ApiOperation({
    summary: 'Get billing invoices and payment dues for a child',
  })
  async getChildFees(
    @CurrentUser() parent: any,
    @Param('studentId') studentId: string,
  ) {
    return this.parentsService.getChildFees(parent._id.toString(), studentId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.PARENT)
  @ApiBearerAuth()
  @Get('children/:studentId/exams')
  @ApiOperation({ summary: 'Get exam schedules for a child' })
  async getChildExams(
    @CurrentUser() parent: any,
    @Param('studentId') studentId: string,
  ) {
    return this.parentsService.getChildExams(parent._id.toString(), studentId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.PARENT)
  @ApiBearerAuth()
  @Get('notifications')
  @ApiOperation({ summary: 'Get in-app notifications for the parent' })
  async getNotifications(@CurrentUser() parent: any) {
    return this.parentsService.getNotifications(parent._id.toString());
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.PARENT)
  @ApiBearerAuth()
  @Get('messages')
  @ApiOperation({
    summary: 'List communications and messages sent/received by parent',
  })
  async getMessages(@CurrentUser() parent: any) {
    return this.parentsService.getMessages(parent._id.toString());
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.PARENT)
  @ApiBearerAuth()
  @Post('messages')
  @ApiOperation({ summary: 'Send a message to a teacher or staff' })
  async sendMessage(
    @CurrentUser() parent: any,
    @Body() dto: SendParentMessageDto,
  ) {
    return this.parentsService.sendMessage(parent._id.toString(), dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.PARENT)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get parent profile data' })
  async getProfile(@CurrentUser() parent: any) {
    return this.parentsService.getProfile(parent._id.toString());
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.PARENT)
  @ApiBearerAuth()
  @Patch('profile')
  @ApiOperation({ summary: 'Update parent profile details' })
  async updateProfile(
    @CurrentUser() parent: any,
    @Body() dto: UpdateParentProfileDto,
  ) {
    return this.parentsService.updateProfile(parent._id.toString(), dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.STAFF)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new parent account (Admin)' })
  async create(@Body() dto: CreateParentDto) {
    return this.parentsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.STAFF)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'List all parent accounts (Admin/Staff)' })
  async findAll(@Query() query: any) {
    return this.parentsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.STAFF)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({
    summary: 'Get details of a specific parent account (Admin/Staff)',
  })
  async findOne(@Param('id') id: string) {
    return this.parentsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update parent details (Admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateParentDto) {
    return this.parentsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a parent account (Admin)' })
  async remove(@Param('id') id: string) {
    return this.parentsService.remove(id);
  }
}
