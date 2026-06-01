import {
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  IsEnum,
  IsMongoId,
  IsArray,
} from 'class-validator';

export class CreateInvoiceDto {
  @IsMongoId()
  studentId!: string;

  @IsMongoId()
  classId!: string;

  @IsMongoId()
  academicYearId!: string;

  @IsDate()
  invoiceDate!: Date;

  @IsDate()
  dueDate!: Date;

  @IsArray()
  feeItems!: any[]; // Array of fee items with amounts

  @IsNumber()
  totalAmount!: number;

  @IsOptional()
  @IsNumber()
  totalDiscount?: number;

  @IsNumber()
  netAmount!: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  issuedBy!: string;
}

export class UpdateInvoiceDto {
  @IsOptional()
  @IsNumber()
  paidAmount?: number;

  @IsOptional()
  @IsEnum(['DRAFT', 'ISSUED', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class InvoiceQueryDto {
  @IsOptional()
  @IsMongoId()
  studentId?: string;

  @IsOptional()
  @IsMongoId()
  classId?: string;

  @IsOptional()
  @IsMongoId()
  academicYearId?: string;

  @IsOptional()
  invoiceNumber?: string;

  @IsOptional()
  @IsEnum(['DRAFT', 'ISSUED', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'])
  status?: string;
}
