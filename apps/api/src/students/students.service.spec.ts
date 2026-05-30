/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConflictException, NotFoundException } from '@nestjs/common';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { StudentsService } from './students.service';
import { StudentGender, StudentStatus } from './schemas/student.schema';

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

describe('StudentsService', () => {
  const query = {
    exec: jest.fn<any>(),
  };
  const studentModel = {
    exists: jest.fn<any>(),
    create: jest.fn<any>(),
    findOne: jest.fn<any>(),
    findOneAndUpdate: jest.fn<any>(),
    find: jest.fn<any>(),
    countDocuments: jest.fn<any>(),
  };
  const departmentModel = {
    findById: (jest.fn<any>()).mockReturnValue({ exec: (jest.fn<any>()).mockResolvedValue({ _id: 'dep-id' }) }),
  };
  const service = new StudentsService(studentModel as never, departmentModel as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a student', async () => {
    studentModel.exists.mockResolvedValue(null);
    studentModel.create.mockResolvedValue(dto);

    await expect(service.create(dto)).resolves.toEqual(dto);
  });

  it('rejects duplicate student emails', async () => {
    studentModel.exists.mockResolvedValue({ _id: 'existing' });

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws when a student is missing', async () => {
    studentModel.findOne.mockReturnValue({ exec: (jest.fn<any>()).mockResolvedValue(null) });

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('soft deletes a student', async () => {
    studentModel.findOneAndUpdate.mockReturnValue({ exec: (jest.fn<any>()).mockResolvedValue(dto) });

    await expect(service.remove('student-id')).resolves.toEqual({ id: 'student-id' });
  });

  it('lists students with pagination metadata', async () => {
    studentModel.find.mockReturnValue({
      populate: () => ({ sort: () => ({ skip: () => ({ limit: () => ({ exec: query.exec }) }) }) }),
    });
    studentModel.countDocuments.mockReturnValue({ exec: (jest.fn<any>()).mockResolvedValue(1) });
    query.exec.mockResolvedValue([dto]);

    await expect(service.findAll({ page: 1, limit: 10 })).resolves.toMatchObject({
      total: 1,
      page: 1,
      limit: 10,
    });
  });
});
