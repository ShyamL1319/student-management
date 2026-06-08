import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdmissionsController } from './admissions.controller';
import { AdmissionsService } from './admissions.service';
import { AdmissionApplication, AdmissionApplicationSchema } from './schemas/admission.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AdmissionApplication.name, schema: AdmissionApplicationSchema }]),
  ],
  controllers: [AdmissionsController],
  providers: [AdmissionsService],
  exports: [AdmissionsService],
})
export class AdmissionsModule {}
