import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

import { AppModule } from '../src/app.module';
import { Tenant } from '../src/tenant/schemas/tenant.schema';
import { School } from '../src/schools/schemas/school.schema';
import { User } from '../src/users/schemas/user.schema';
import { Role } from '../src/roles/schemas/role.schema';
import { Course } from '../src/courses/schemas/course.schema';
import { Department } from '../src/departments/schemas/department.schema';
import { RoleEnum } from '../src/common/enums/role.enum';

describe('Tenant Isolation (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  let tenantModel: Model<any>;
  let schoolModel: Model<any>;
  let userModel: Model<any>;
  let roleModel: Model<any>;
  let courseModel: Model<any>;
  let departmentModel: Model<any>;

  let schoolHogwartsId: string;
  let schoolSpringfieldId: string;

  let tokenHogwarts: string;
  let tokenSpringfield: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    connection = app.get<Connection>(getConnectionToken());
    tenantModel = app.get<Model<any>>(getModelToken(Tenant.name));
    schoolModel = app.get<Model<any>>(getModelToken(School.name));
    userModel = app.get<Model<any>>(getModelToken(User.name));
    roleModel = app.get<Model<any>>(getModelToken(Role.name));
    courseModel = app.get<Model<any>>(getModelToken(Course.name));
    departmentModel = app.get<Model<any>>(getModelToken(Department.name));

    // Clear test database collections to prevent duplicate key or state pollution
    await tenantModel.deleteMany({});
    await schoolModel.deleteMany({});
    await userModel.deleteMany({});
    await roleModel.deleteMany({});
    await courseModel.deleteMany({});
    await departmentModel.deleteMany({});

    // 1. Seed Roles
    const adminRole = await roleModel.create({
      name: RoleEnum.ADMIN,
      description: 'School Admin',
      permissions: [],
    });

    // 2. Seed Tenants
    const tenantHogwarts = await tenantModel.create({
      name: 'Hogwarts Tenant',
      subdomain: 'hogwarts',
      isActive: true,
    });
    const tenantSpringfield = await tenantModel.create({
      name: 'Springfield Tenant',
      subdomain: 'springfield',
      isActive: true,
    });

    // 3. Seed Schools
    const schoolHogwarts = await schoolModel.create({
      tenantId: tenantHogwarts._id,
      name: 'Hogwarts School',
      address: 'Scotland Highlands',
      phone: '555-3920',
      email: 'admissions@hogwarts.edu',
    });
    schoolHogwartsId = schoolHogwarts._id.toString();

    const schoolSpringfield = await schoolModel.create({
      tenantId: tenantSpringfield._id,
      name: 'Springfield High',
      address: '742 Evergreen Terrace',
      phone: '555-0199',
      email: 'info@springfield.edu',
    });
    schoolSpringfieldId = schoolSpringfield._id.toString();

    // 4. Seed Users with appropriate schoolId
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const userHogwarts = await userModel.create({
      email: 'admin@hogwarts.com',
      passwordHash,
      firstName: 'Albus',
      lastName: 'Dumbledore',
      role: adminRole._id,
      schoolId: schoolHogwarts._id,
    });

    const userSpringfield = await userModel.create({
      email: 'admin@springfield.com',
      passwordHash,
      firstName: 'Seymour',
      lastName: 'Skinner',
      role: adminRole._id,
      schoolId: schoolSpringfield._id,
    });

    // 5. Seed Departments first
    const deptHogwarts = await departmentModel.create({
      name: 'Magic Dept',
      code: 'MAG',
      schoolId: schoolHogwarts._id,
    });

    const deptSpringfield = await departmentModel.create({
      name: 'Science Dept',
      code: 'SCI',
      schoolId: schoolSpringfield._id,
    });

    // 6. Seed Courses under separate schools using bypassTenant option
    // (so saving is not intercepted by dynamic context while seeding from supertest suite)
    await courseModel.create([
      {
        name: 'Potions 101',
        description: 'Basic potions',
        schoolId: schoolHogwarts._id,
        department: deptHogwarts._id,
      },
      {
        name: 'Defense Against the Dark Arts',
        description: 'Defense spells',
        schoolId: schoolHogwarts._id,
        department: deptHogwarts._id,
      },
    ]);

    await courseModel.create([
      {
        name: 'Basic Arithmetic',
        description: 'Simple math',
        schoolId: schoolSpringfield._id,
        department: deptSpringfield._id,
      },
      {
        name: 'Elementary Science',
        description: 'Simple science',
        schoolId: schoolSpringfield._id,
        department: deptSpringfield._id,
      },
    ]);

    // 7. Login and store access tokens
    const loginResHogwarts = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@hogwarts.com', password: 'password123' })
      .expect(200);
    tokenHogwarts = loginResHogwarts.body.accessToken;

    const loginResSpringfield = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@springfield.com', password: 'password123' })
      .expect(200);
    tokenSpringfield = loginResSpringfield.body.accessToken;
  }, 60000);

  afterAll(async () => {
    // Cleanup DB
    if (tenantModel) await tenantModel.deleteMany({});
    if (schoolModel) await schoolModel.deleteMany({});
    if (userModel) await userModel.deleteMany({});
    if (roleModel) await roleModel.deleteMany({});
    if (courseModel) await courseModel.deleteMany({});
    if (departmentModel) await departmentModel.deleteMany({});
    if (connection) await connection.close();
    if (app) await app.close();
  }, 15000);

  it('should retrieve only Hogwarts courses when requesting Hogwarts tenant context', async () => {
    const res = await request(app.getHttpServer())
      .get('/courses')
      .set('Authorization', `Bearer ${tokenHogwarts}`)
      .set('X-Tenant-ID', 'hogwarts')
      .expect(200);

    expect(res.headers['x-resolved-tenant']).toBe('hogwarts');
    expect(res.headers['x-resolved-school-id']).toBe(schoolHogwartsId);

    const courses = res.body.data;
    expect(courses.length).toBe(2);
    const courseNames = courses.map((c: any) => c.name);
    expect(courseNames).toContain('Potions 101');
    expect(courseNames).not.toContain('Basic Arithmetic');
  });

  it('should retrieve only Springfield courses when requesting Springfield tenant context', async () => {
    const res = await request(app.getHttpServer())
      .get('/courses')
      .set('Authorization', `Bearer ${tokenSpringfield}`)
      .set('X-Tenant-ID', 'springfield')
      .expect(200);

    expect(res.headers['x-resolved-tenant']).toBe('springfield');
    expect(res.headers['x-resolved-school-id']).toBe(schoolSpringfieldId);

    const courses = res.body.data;
    expect(courses.length).toBe(2);
    const courseNames = courses.map((c: any) => c.name);
    expect(courseNames).toContain('Basic Arithmetic');
    expect(courseNames).not.toContain('Potions 101');
  });

  it('should prevent cross-tenant access (Springfield user requesting Hogwarts tenant)', async () => {
    // Springfield user is logged in (tokenSpringfield)
    // Springfield user attempts to query using header 'X-Tenant-ID: hogwarts'
    const res = await request(app.getHttpServer())
      .get('/courses')
      .set('Authorization', `Bearer ${tokenSpringfield}`)
      .set('X-Tenant-ID', 'hogwarts')
      .expect(403);

    expect(res.body.message).toContain('Cross-tenant access detected');
  });

  it('should fallback to JWT schoolId claims if header and subdomain are missing', async () => {
    const res = await request(app.getHttpServer())
      .get('/courses')
      .set('Authorization', `Bearer ${tokenHogwarts}`)
      .expect(200);

    expect(res.headers['x-resolved-tenant']).toBe('hogwarts');
    expect(res.headers['x-resolved-school-id']).toBe(schoolHogwartsId);

    const courses = res.body.data;
    expect(courses.length).toBe(2);
    expect(courses.map((c: any) => c.name)).toContain('Potions 101');
  });
});
