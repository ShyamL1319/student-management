import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeeStructure, FeeStructureSchema } from './schemas/fee-structure.schema';
import { FeeCollection, FeeCollectionSchema } from './schemas/fee-collection.schema';
import { Receipt, ReceiptSchema } from './schemas/receipt.schema';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { FeeStructureService } from './fee-structure.service';
import { FeeCollectionService } from './fee-collection.service';
import { ReceiptService } from './receipt.service';
import { InvoiceService } from './invoice.service';
import { FeeStructureController } from './fee-structure.controller';
import { FeeCollectionController } from './fee-collection.controller';
import { ReceiptController } from './receipt.controller';
import { InvoiceController } from './invoice.controller';
import { FeesReportService } from './fees-report.service';
import { FeesReportController } from './fees-report.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FeeStructure.name, schema: FeeStructureSchema },
      { name: FeeCollection.name, schema: FeeCollectionSchema },
      { name: Receipt.name, schema: ReceiptSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
  ],
  providers: [FeeStructureService, FeeCollectionService, ReceiptService, InvoiceService, FeesReportService],
  controllers: [FeeStructureController, FeeCollectionController, ReceiptController, InvoiceController, FeesReportController],
  exports: [FeeStructureService, FeeCollectionService, ReceiptService, InvoiceService],
})
export class FeesModule {}
