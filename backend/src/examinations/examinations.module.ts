import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExaminationsService } from './examinations.service';
import { ExaminationsController } from './examinations.controller';
import { Exam, ExamSchema } from './schemas/exam.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Exam.name, schema: ExamSchema }]),
  ],
  controllers: [ExaminationsController],
  providers: [ExaminationsService],
  exports: [ExaminationsService, MongooseModule],
})
export class ExaminationsModule {}
