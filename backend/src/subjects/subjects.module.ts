import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { Subject, SubjectSchema } from './schemas/subject.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subject.name, schema: SubjectSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
    UsersModule,
  ],
  controllers: [SubjectsController],
  providers: [SubjectsService],
  exports: [SubjectsService, MongooseModule],
})
export class SubjectsModule {}
