# Payments & Billing Module

The Payments module handles Stripe and Razorpay integrations, parent portal checkouts, webhook listeners, automated Mongoose-backed queue retries, and receipt generation.

## Features

- **Checkout Ingestion**: Create Stripe PaymentIntents or Razorpay Orders linked to student invoices.
- **Asynchronous Webhook Processing**: Webhooks instantly save raw buffers to a database queue (`QueueJob`) and respond with `200 OK` to prevent gateway timeouts.
- **Multi-Tenant Gateway Isolation**: Dynamic API keys are resolved based on the school context.
- **Automated Retry Loop**: Failsafe background worker retry handlers for failed payments.
- **Email Receipts**: Generates dynamic PDFs via `pdfkit-table` and automatically emails them to parents on successful payments.
- **Analytics Dashboard**: Tracks MRR, net collections, refund history, and transaction success rates.

## API Endpoints

### Parent portal
- `POST /payments/initiate` - Create a checkout session (Stripe) or order (Razorpay) for a student's pending invoice.
- `GET /payments/student/:studentId` - Fetch billing transaction logs for a student.
- `POST /payments/subscriptions/create` - Subscribe a student to dynamic recurring auto-billing.
- `POST /payments/subscriptions/:id/cancel` - Cancel active subscription.

### Webhooks (Public)
- `POST /payments/webhook/stripe` - Stripe webhook event listener.
- `POST /payments/webhook/razorpay` - Razorpay webhook event listener.

### Administration
- `POST /payments/refund` - Initiate a partial or full refund on a completed payment.
- `GET /payments/analytics/revenue` - Retrieve MRR, collection rates, and financial reports.

## Database Models

- `Payment`: Log of individual payment attempts.
- `Subscription`: Status tracker for active recurring subscriptions.
- `Refund`: Ledger of processed refunds.
- `QueueJob`: Background tasks representing delayed webhook handling or failed payment notifications.

## Testing

Run tests specific to payments:
```bash
npm run test -- src/payments
```
