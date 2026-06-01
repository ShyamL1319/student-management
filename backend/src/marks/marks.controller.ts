import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { MarksService } from './marks.service';
import { CreateMarkDto } from './dto/create-mark.dto';
import { MarksQueryDto } from './dto/marks-query.dto';

@Controller('marks')
export class MarksController {
  constructor(private readonly marksService: MarksService) {}

  @Post()
  create(@Body() dto: CreateMarkDto) {
    return this.marksService.create(dto);
  }

  @Get()
  find(@Query() query: MarksQueryDto) {
    return this.marksService.find(query);
  }

  @Get('student/:id/result')
  getResult(@Param('id') id: string) {
    return this.marksService.getStudentResult(id);
  }

  @Get('student/:id/report')
  async getStudentReport(@Param('id') id: string, @Query() query: any) {
    const result = await this.marksService.getStudentResult(id);
    // simple CSV
    const rows = ['subjectId,marksObtained,maxMarks'];
    for (const m of result.marks) {
      rows.push(`${m.subjectId},${m.marksObtained},${m.maxMarks}`);
    }
    rows.push(`Total,${result.totalObtained},${result.totalMax}`);
    rows.push(`GPA,${result.gpa},`);
    rows.push(`Grade,${result.grade},`);
    return rows.join('\n');
  }

  @Get('exam/:id/rank')
  getRank(@Param('id') id: string) {
    return this.marksService.generateRank(id);
  }
}
