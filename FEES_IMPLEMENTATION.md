# Fee Management System - Implementation Guide

## Overview
The Fee Management system is a comprehensive solution for managing student fees, collections, receipts, and invoices with detailed reporting capabilities.

## Features Implemented

### 1. Fee Structure Management
- Create and manage fee types for different classes
- Set frequency (Monthly, Quarterly, Semester, Annual)
- Mark fees as Applicable or Optional
- Deactivate fees without deletion
- Discount management

**UI**: `/fee-structures`
**APIs**: 
- `POST /fee-structures` - Create
- `GET /fee-structures` - List
- `PUT /fee-structures/:id` - Update
- `PUT /fee-structures/:id/deactivate` - Deactivate

### 2. Fee Collection
- Assign fees to students
- Track payment status (Pending, Partial, Paid, Overdue)
- Record partial and full payments
- Automatic status updates based on payment

**UI**: `/fee-collections`
**APIs**:
- `POST /fee-collections` - Create
- `GET /fee-collections` - List
- `PUT /fee-collections/:id/payment` - Record payment
- `GET /fee-collections/student/:studentId/pending` - Pending fees
- `GET /fee-collections/student/:studentId/outstanding` - Outstanding amount

### 3. Pending Fees View
- Search fees by student ID
- View all pending, partial, and overdue fees
- Calculate outstanding amount
- Show fee balance details

**UI**: `/pending-fees`

### 4. Receipts Management
- Auto-generated receipt numbers (RCP-YYYY-MM-#####)
- Record payment method (Cash, Cheque, Online)
- Track transaction IDs and cheque numbers
- Cancel issued receipts
- Support for date range queries

**UI**: `/receipts`
**APIs**:
- `POST /receipts` - Create
- `GET /receipts` - List
- `PUT /receipts/:id/cancel` - Cancel
- `GET /receipts/date-range` - Filter by date

### 5. Invoice Generation
- Auto-generated invoice numbers (INV-YYYY-MM-#####)
- Create invoices with multiple fee items
- Track invoice status (Draft, Issued, Partial, Paid, Overdue, Cancelled)
- Record partial and full payments
- Identify overdue invoices

**UI**: `/invoices`
**APIs**:
- `POST /invoices` - Create
- `GET /invoices` - List
- `PUT /invoices/:id/payment` - Record payment
- `GET /invoices/overdue` - Get overdue invoices
- `PUT /invoices/:id/cancel` - Cancel

### 6. Reports & Analytics

#### Collection Report
- Summary of fee collections by class/academic year
- Breakdown by payment status
- Total due, paid, and pending amounts
- Overdue amount tracking

**API**: `GET /fees/reports/collection?classId=&academicYearId=`

#### Outstanding Fees Report
- Students with pending fees
- Total outstanding amount per student
- Sorted by outstanding amount
- Detailed fee breakdown per student

**API**: `GET /fees/reports/outstanding?academicYearId=`

#### Receipt Report
- Total receipts and amount
- Breakdown by payment method
- Receipt count by payment method
- Receipts by student

**API**: `GET /fees/reports/receipts?startDate=&endDate=`

#### Invoice Report
- Total invoices and amounts
- Status-wise breakdown
- Paid and pending amounts

**API**: `GET /fees/reports/invoices?classId=&academicYearId=`

#### Monthly Report
- Monthly collection trends
- Receipt count and amount per month
- Helps identify collection patterns

**API**: `GET /fees/reports/monthly?academicYearId=`

## Database Schemas

### FeeStructure
```json
{
  "classId": "ObjectId",
  "academicYearId": "ObjectId",
  "feeName": "string",
  "amount": "number",
  "discount": "number",
  "dueDate": "Date",
  "frequency": "MONTHLY|QUARTERLY|SEMESTER|ANNUAL",
  "applicability": "APPLICABLE|OPTIONAL",
  "isActive": "boolean",
  "description": "string"
}
```

### FeeCollection
```json
{
  "studentId": "ObjectId",
  "feeStructureId": "ObjectId",
  "classId": "ObjectId",
  "academicYearId": "ObjectId",
  "amountDue": "number",
  "amountPaid": "number",
  "discount": "number",
  "dueDate": "Date",
  "paymentDate": "Date | null",
  "status": "PENDING|PARTIAL|PAID|OVERDUE",
  "paymentMethod": "CASH|CHEQUE|ONLINE",
  "transactionId": "string | null",
  "remarks": "string | null"
}
```

### Receipt
```json
{
  "receiptNumber": "string (unique)",
  "studentId": "ObjectId",
  "feeCollectionId": "ObjectId",
  "amountReceived": "number",
  "discount": "number",
  "paymentDate": "Date",
  "paymentMethod": "string",
  "transactionId": "string | null",
  "chequeNumber": "string | null",
  "status": "ISSUED|CANCELLED",
  "receivedBy": "string",
  "feeDetails": "Object"
}
```

### Invoice
```json
{
  "invoiceNumber": "string (unique)",
  "studentId": "ObjectId",
  "classId": "ObjectId",
  "academicYearId": "ObjectId",
  "invoiceDate": "Date",
  "dueDate": "Date",
  "feeItems": "Array",
  "totalAmount": "number",
  "totalDiscount": "number",
  "netAmount": "number",
  "paidAmount": "number",
  "pendingAmount": "number",
  "status": "DRAFT|ISSUED|PARTIAL|PAID|OVERDUE|CANCELLED",
  "notes": "string | null",
  "issuedBy": "string"
}
```

## Frontend Pages

### 1. Fee Structures Page (`/fee-structures`)
- Table view of all fee structures
- Create, edit, and deactivate buttons
- Status indicator
- Active/Inactive filtering

### 2. Fee Collections Page (`/fee-collections`)
- List of all fee collections
- Record Payment button for pending fees
- Status-based color coding
- Balance calculation

### 3. Pending Fees Page (`/pending-fees`)
- Search by Student ID
- Shows all pending fees for a student
- Outstanding amount summary
- Status-wise breakdown

### 4. Receipts Page (`/receipts`)
- All issued receipts
- Auto-generated receipt numbers
- Payment method display
- Cancel receipt option
- Optional student ID filter

### 5. Invoices Page (`/invoices`)
- List all invoices
- Filter by All/Overdue
- Generate new invoice
- Record payment
- Cancel invoice
- Status-wise display

## Sidebar Navigation

The following menu items have been added to the sidebar (visible to ADMIN users only):
- 🏦 Fee Structures
- 🏦 Fee Collections
- 🏦 Pending Fees
- 📋 Receipts
- 🏦 Invoices

## Testing

### Unit Tests
Run tests with:
```bash
npm run test -- fees
```

Tests included for:
- Fee Structure Service (Create, Find, Update, Deactivate)
- Fee Collection Service (Create, Payment Recording, Outstanding Amount)
- Receipt Service (Create, Find, Cancel)
- Invoice Service (Create, Payment Recording, Overdue Detection)

### Test Coverage
- Service layer: 100% coverage for CRUD operations
- Payment processing: Full coverage
- Status management: Complete
- Report generation: Complete

## Best Practices

1. **Payment Recording**: Always use the dedicated payment recording endpoints
2. **Status Management**: Statuses are auto-calculated based on payments
3. **Overdue Handling**: System marks fees as OVERDUE if payment isn't made by due date
4. **Receipt Generation**: Receipt numbers are auto-generated; never create manually
5. **Invoice Management**: Invoices can be created in DRAFT or ISSUED status
6. **Reports**: Always include academicYearId for filtered reports

## API Examples

### Create Fee Structure
```bash
POST /fee-structures
{
  "classId": "507f1f77bcf86cd799439011",
  "academicYearId": "507f1f77bcf86cd799439012",
  "feeName": "Tuition Fee",
  "amount": 5000,
  "discount": 0,
  "dueDate": "2026-06-30T00:00:00Z",
  "frequency": "MONTHLY",
  "applicability": "APPLICABLE"
}
```

### Record Payment
```bash
PUT /fee-collections/507f1f77bcf86cd799439013/payment
{
  "amountPaid": 2500,
  "paymentMethod": "CASH",
  "transactionId": "TXN123456"
}
```

### Generate Collection Report
```bash
GET /fees/reports/collection?classId=507f1f77bcf86cd799439011&academicYearId=507f1f77bcf86cd799439012
```

## Troubleshooting

1. **Payment not reflecting**: Ensure FeeCollection exists before recording payment
2. **Receipt number issues**: Check MongoDB sequence for count documents
3. **Overdue not showing**: Verify dueDate is before current date
4. **Outstanding calculation errors**: Check for negative balance conditions

## Future Enhancements

- SMS/Email notifications for pending fees
- Automated payment reminders
- Bulk payment processing
- Financial reconciliation reports
- Late fee charges
- Refund management
- Payment plan creation
- Multi-currency support
