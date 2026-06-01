# Fees Module

The Fees module manages all fee-related operations including fee structures, fee collections, receipts, and invoice generation.

## Features

- **Fee Structure**: Define fee types and amounts for classes
- **Fee Collection**: Track student fee payments
- **Receipts**: Generate and manage payment receipts
- **Invoices**: Generate and manage fee invoices
- **Reports**: Generate fee collection and outstanding fees reports

## API Endpoints

### Fee Structures
- `POST /fee-structures` - Create fee structure
- `GET /fee-structures` - Get all fee structures
- `GET /fee-structures/:id` - Get fee structure by ID
- `GET /fee-structures/class/:classId` - Get fees for a class
- `PUT /fee-structures/:id` - Update fee structure
- `PUT /fee-structures/:id/deactivate` - Deactivate fee structure
- `DELETE /fee-structures/:id` - Delete fee structure

### Fee Collections
- `POST /fee-collections` - Create fee collection
- `GET /fee-collections` - Get all fee collections
- `GET /fee-collections/:id` - Get fee collection by ID
- `GET /fee-collections/student/:studentId` - Get fees for a student
- `GET /fee-collections/class/:classId` - Get fees for a class
- `GET /fee-collections/student/:studentId/pending` - Get pending fees
- `GET /fee-collections/student/:studentId/outstanding` - Get outstanding amount
- `PUT /fee-collections/:id` - Update fee collection
- `PUT /fee-collections/:id/payment` - Record payment
- `DELETE /fee-collections/:id` - Delete fee collection

### Receipts
- `POST /receipts` - Create receipt
- `GET /receipts` - Get all receipts
- `GET /receipts/:id` - Get receipt by ID
- `GET /receipts/student/:studentId` - Get receipts for a student
- `GET /receipts/fee-collection/:feeCollectionId` - Get receipts for a fee collection
- `GET /receipts/number/:receiptNumber` - Get receipt by number
- `GET /receipts/date-range` - Get receipts by date range
- `PUT /receipts/:id` - Update receipt
- `PUT /receipts/:id/cancel` - Cancel receipt
- `DELETE /receipts/:id` - Delete receipt

### Invoices
- `POST /invoices` - Create invoice
- `GET /invoices` - Get all invoices
- `GET /invoices/:id` - Get invoice by ID
- `GET /invoices/student/:studentId` - Get invoices for a student
- `GET /invoices/class/:classId` - Get invoices for a class
- `GET /invoices/overdue` - Get overdue invoices
- `GET /invoices/number/:invoiceNumber` - Get invoice by number
- `PUT /invoices/:id` - Update invoice
- `PUT /invoices/:id/payment` - Record payment
- `PUT /invoices/:id/cancel` - Cancel invoice
- `DELETE /invoices/:id` - Delete invoice

## Models

### FeeStructure
```typescript
{
  classId: ObjectId,
  academicYearId: ObjectId,
  feeName: string,
  amount: number,
  discount: number,
  dueDate: Date,
  frequency: 'MONTHLY' | 'QUARTERLY' | 'SEMESTER' | 'ANNUAL',
  applicability: 'APPLICABLE' | 'OPTIONAL',
  isActive: boolean,
  description: string,
  createdAt: Date,
  updatedAt: Date
}
```

### FeeCollection
```typescript
{
  studentId: ObjectId,
  feeStructureId: ObjectId,
  classId: ObjectId,
  academicYearId: ObjectId,
  amountDue: number,
  amountPaid: number,
  discount: number,
  dueDate: Date,
  paymentDate: Date | null,
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE',
  paymentMethod: string | null,
  transactionId: string | null,
  remarks: string | null,
  createdAt: Date,
  updatedAt: Date
}
```

### Receipt
```typescript
{
  receiptNumber: string,
  studentId: ObjectId,
  feeCollectionId: ObjectId,
  amountReceived: number,
  discount: number,
  paymentDate: Date,
  paymentMethod: string,
  transactionId: string | null,
  chequeNumber: string | null,
  status: 'ISSUED' | 'CANCELLED',
  receivedBy: string,
  remarks: string | null,
  feeDetails: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Invoice
```typescript
{
  invoiceNumber: string,
  studentId: ObjectId,
  classId: ObjectId,
  academicYearId: ObjectId,
  invoiceDate: Date,
  dueDate: Date,
  feeItems: Array,
  totalAmount: number,
  totalDiscount: number,
  netAmount: number,
  paidAmount: number,
  pendingAmount: number,
  status: 'DRAFT' | 'ISSUED' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED',
  notes: string | null,
  issuedBy: string,
  createdAt: Date,
  updatedAt: Date
}
```

## Tests

Run tests with:
```bash
npm run test -- fees
```

Tests are located in:
- `fee-structure.service.spec.ts`
- `fee-collection.service.spec.ts`
- `receipt.service.spec.ts`
- `invoice.service.spec.ts`
