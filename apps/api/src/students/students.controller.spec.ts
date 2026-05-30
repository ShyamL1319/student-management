/* eslint-disable @typescript-eslint/no-explicit-any */
import { StudentsService } from './students.service';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { StudentsController } from './students.controller';
import { StudentGender, StudentStatus } from './schemas/student.schema';

describe('StudentsController', () => {
  const studentsService = {
    create: jest.fn<any>(),
    findAll: jest.fn<any>(),
    findOne: jest.fn<any>(),
    update: jest.fn<any>(),
    remove: jest.fn<any>(),
  };
  const controller = new StudentsController(studentsService as unknown as StudentsService);
  const dto = {
    firstName: 'Aarav',
    lastName: 'Sharma',
    studentId: 'STU12345',
    department: 'dep-id',
    email: 'aarav@example.com',
    phone: '+919888888888',
    dateOfBirth: new Date('2010-04-12'),
    gender: StudentGender.Male,
    address: '42 Park Street',
    enrollmentDate: new Date('2024-06-01'),
    status: StudentStatus.Active,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a student through the service', async () => {
    studentsService.create.mockResolvedValue(dto);

    await expect(controller.create(dto as any)).resolves.toEqual(dto);
  });

  it('lists students through the service', async () => {
    studentsService.findAll.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 });

    await expect(controller.findAll({ page: 1, limit: 10 })).resolves.toMatchObject({ total: 0 });
  });

  it('deletes a student through the service', async () => {
    studentsService.remove.mockResolvedValue({ id: 'student-id' });

    await expect(controller.remove('student-id')).resolves.toEqual({ id: 'student-id' });
  });
});
