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
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum as Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Schools')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolService: SchoolsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a School' })
  create(@Body() createSchoolDto: CreateSchoolDto) {
    return this.schoolService.create(createSchoolDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Get all Schools' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.schoolService.findAll(query);
  }

  @Get('settings')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER, Role.STAFF)
  @ApiOperation({ summary: 'Get current school settings' })
  async getSettings(@CurrentUser() user: any) {
    const schoolId = user.school?.toString();
    if (!schoolId) {
      throw new NotFoundException('No school associated with this user');
    }
    return this.schoolService.findOne(schoolId);
  }

  @Patch('settings')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update current school settings' })
  async updateSettings(@CurrentUser() user: any, @Body() dto: UpdateSchoolDto) {
    const schoolId = user.school?.toString();
    if (!schoolId) {
      throw new NotFoundException('No school associated with this user');
    }
    return this.schoolService.update(schoolId, dto);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Get a School by id' })
  findOne(@Param('id') id: string) {
    return this.schoolService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a School' })
  update(@Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto) {
    return this.schoolService.update(id, updateSchoolDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a School' })
  remove(@Param('id') id: string) {
    return this.schoolService.remove(id);
  }
}
