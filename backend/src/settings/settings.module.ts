import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Settings, SettingsSchema } from './schemas/settings.schema';
import { School, SchoolSchema } from '../schools/schemas/school.schema';
import { CryptoService } from './services/crypto.service';
import { SettingsService } from './services/settings.service';
import { SettingsController } from './controllers/settings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Settings.name, schema: SettingsSchema },
      { name: School.name, schema: SchoolSchema },
    ]),
  ],
  controllers: [SettingsController],
  providers: [CryptoService, SettingsService],
  exports: [SettingsService, CryptoService],
})
export class SettingsModule {}
