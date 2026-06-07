import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Tenant, TenantSchema } from './schemas/tenant.schema';
import { School, SchoolSchema } from '../schools/schemas/school.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: School.name, schema: SchoolSchema },
    ]),
    JwtModule.register({}),
  ],
  exports: [MongooseModule, JwtModule],
})
export class TenantModule {}
