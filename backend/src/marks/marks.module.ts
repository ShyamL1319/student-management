import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarksService } from './marks.service';
import { MarksController } from './marks.controller';
import { Mark, MarkSchema } from './schemas/mark.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Mark.name, schema: MarkSchema }]),
  ],
  providers: [MarksService],
  controllers: [MarksController],
  exports: [MarksService, MongooseModule],
})
export class MarksModule {}
