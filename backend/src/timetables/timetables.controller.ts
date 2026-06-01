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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TimetablesService } from './timetables.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { CheckConflictDto } from './dto/check-conflict.dto';

@ApiTags('timetables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('timetables')
export class TimetablesController {
  constructor(private readonly timetablesService: TimetablesService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new timetable entry' })
  @ApiResponse({
    status: 201,
    description: 'Timetable entry created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Scheduling conflict detected or invalid data',
  })
  create(@Body() createTimetableDto: CreateTimetableDto) {
    return this.timetablesService.create(createTimetableDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all timetable entries with filters' })
  @ApiResponse({
    status: 200,
    description: 'List of timetable entries',
  })
  findAll(@Query() query: any) {
    return this.timetablesService.findAll(query);
  }

  @Get('class/:classId/weekly')
  @ApiOperation({ summary: 'Get weekly timetable for a class' })
  @ApiResponse({
    status: 200,
    description: 'Weekly timetable grouped by day',
  })
  getWeeklyTimetable(@Param('classId') classId: string, @Query() query: any) {
    return this.timetablesService.getWeeklyTimetable(classId, query);
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'Get class timetable' })
  @ApiResponse({
    status: 200,
    description: 'Class timetable entries',
  })
  getClassTimetable(@Param('classId') classId: string, @Query() query: any) {
    return this.timetablesService.getClassTimetable(classId, query);
  }

  @Get('teacher/:teacherId')
  @ApiOperation({ summary: "Get teacher's timetable" })
  @ApiResponse({
    status: 200,
    description: 'Teacher timetable entries',
  })
  getTeacherTimetable(
    @Param('teacherId') teacherId: string,
    @Query() query: any,
  ) {
    return this.timetablesService.getTeacherTimetable(teacherId, query);
  }

  @Post('check-conflict')
  @HttpCode(200)
  @ApiOperation({ summary: 'Check for scheduling conflicts' })
  @ApiResponse({
    status: 200,
    description: 'Conflict detection result',
  })
  checkConflict(@Body() checkConflictDto: CheckConflictDto) {
    return this.timetablesService.detectConflicts(checkConflictDto);
  }

  @Post('bulk-create')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create multiple timetable entries at once' })
  @ApiResponse({
    status: 201,
    description: 'Timetable entries created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Conflict detected in batch or invalid data',
  })
  bulkCreate(@Body() timetables: CreateTimetableDto[]) {
    return this.timetablesService.bulkCreate(timetables);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get timetable entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Timetable entry found',
  })
  @ApiResponse({
    status: 404,
    description: 'Timetable entry not found',
  })
  findOne(@Param('id') id: string) {
    return this.timetablesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update timetable entry' })
  @ApiResponse({
    status: 200,
    description: 'Timetable entry updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Timetable entry not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Scheduling conflict detected or invalid data',
  })
  update(
    @Param('id') id: string,
    @Body() updateTimetableDto: UpdateTimetableDto,
  ) {
    return this.timetablesService.update(id, updateTimetableDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete timetable entry' })
  @ApiResponse({
    status: 204,
    description: 'Timetable entry deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Timetable entry not found',
  })
  remove(@Param('id') id: string) {
    return this.timetablesService.remove(id);
  }
}
