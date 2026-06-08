import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { Student, StudentSchema } from '../students/schemas/student.schema';
import { Teacher, TeacherSchema } from '../teachers/schemas/teacher.schema';
import { Staff, StaffSchema } from '../staff/schemas/staff.schema';
import { Parent, ParentSchema } from '../parents/schemas/parent.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
        discriminators: [
          { name: Student.name, schema: StudentSchema, value: 'STUDENT' },
          { name: Teacher.name, schema: TeacherSchema, value: 'TEACHER' },
          { name: Staff.name, schema: StaffSchema, value: 'STAFF' },
          { name: Parent.name, schema: ParentSchema, value: 'PARENT' },
        ],
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
