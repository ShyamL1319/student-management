import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit-table';
import { EmailService } from '../../notifications/services/email.service';

@Injectable()
export class ReceiptPdfService {
  private readonly logger = new Logger(ReceiptPdfService.name);

  constructor(private readonly emailService: EmailService) {}

  /**
   * Generates a PDF buffer of a payment receipt
   */
  async generateReceiptPdf(receiptData: {
    receiptNumber: string;
    studentName: string;
    studentRollNumber: string;
    className: string;
    paymentDate: Date;
    paymentMethod: string;
    transactionId: string;
    amountReceived: number;
    currency: string;
    feeDetails: any; // key-value or array of items paid
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });

        // 1. Branding / Header
        doc
          .fillColor('#1A237E')
          .fontSize(24)
          .text('SCHOOL MANAGEMENT SYSTEM', { align: 'center' });
        doc
          .fillColor('#424242')
          .fontSize(10)
          .text('Official Payment Receipt', { align: 'center' });
        doc.moveDown(2);

        // Draw a line
        doc
          .strokeColor('#E0E0E0')
          .lineWidth(1)
          .moveTo(40, doc.y)
          .lineTo(550, doc.y)
          .stroke();
        doc.moveDown();

        // 2. Receipt metadata grid
        const startY = doc.y;
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Receipt Details:', 40, startY);
        doc
          .font('Helvetica')
          .text(`Receipt No: ${receiptData.receiptNumber}`, 40, startY + 15);
        doc.text(
          `Date: ${new Date(receiptData.paymentDate).toLocaleDateString()}`,
          40,
          startY + 30,
        );
        doc.text(
          `Payment Method: ${receiptData.paymentMethod}`,
          40,
          startY + 45,
        );
        doc.text(
          `Txn ID: ${receiptData.transactionId || 'N/A'}`,
          40,
          startY + 60,
        );

        doc.font('Helvetica-Bold').text('Student Details:', 300, startY);
        doc
          .font('Helvetica')
          .text(`Name: ${receiptData.studentName}`, 300, startY + 15);
        doc.text(
          `Roll No: ${receiptData.studentRollNumber || 'N/A'}`,
          300,
          startY + 30,
        );
        doc.text(`Class: ${receiptData.className || 'N/A'}`, 300, startY + 45);

        doc.moveDown(5);

        // Draw another line
        doc
          .strokeColor('#E0E0E0')
          .lineWidth(1)
          .moveTo(40, doc.y)
          .lineTo(550, doc.y)
          .stroke();
        doc.moveDown();

        // 3. Fee Items Table
        const items = receiptData.feeDetails?.feeItems || [];
        const rows =
          items.length > 0
            ? items.map((item: any) => [
                item.feeName || 'School Fee Contribution',
                `${receiptData.currency} ${(item.amount || 0).toFixed(2)}`,
                `${receiptData.currency} ${(item.discount || 0).toFixed(2)}`,
                `${receiptData.currency} ${((item.amount || 0) - (item.discount || 0)).toFixed(2)}`,
              ])
            : [
                [
                  'School Fee Contribution',
                  `${receiptData.currency} ${receiptData.amountReceived.toFixed(2)}`,
                  `${receiptData.currency} 0.00`,
                  `${receiptData.currency} ${receiptData.amountReceived.toFixed(2)}`,
                ],
              ];

        const table = {
          title: 'Breakdown of Paid Items',
          headers: [
            'Fee Item Description',
            'Base Amount',
            'Discount',
            'Paid Amount',
          ],
          rows: rows,
        };

        doc.table(table, {
          prepareHeader: () =>
            doc.font('Helvetica-Bold').fontSize(9).fillColor('#1A237E'),
          prepareRow: () =>
            doc.font('Helvetica').fontSize(9).fillColor('#424242'),
        });

        doc.moveDown();

        // 4. Totals Summary Block
        const endY = doc.y;
        doc
          .strokeColor('#E0E0E0')
          .lineWidth(1)
          .moveTo(40, endY)
          .lineTo(550, endY)
          .stroke();
        doc.moveDown();

        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#1A237E')
          .text(
            `Total Paid: ${receiptData.currency} ${receiptData.amountReceived.toFixed(2)}`,
            40,
            doc.y + 10,
            { align: 'right' },
          );

        doc.moveDown(3);
        doc
          .fontSize(8)
          .font('Helvetica-Oblique')
          .fillColor('#757575')
          .text(
            'This is a computer-generated document and does not require a physical signature.',
            { align: 'center' },
          );

        doc.end();
      } catch (err) {
        this.logger.error('Failed to generate PDF receipt buffer', err);
        reject(err);
      }
    });
  }

  /**
   * Helper that builds the PDF and sends it as an email attachment to a parent/student
   */
  async generateAndEmailReceipt(
    recipientEmail: string,
    studentName: string,
    receiptData: any,
  ): Promise<boolean> {
    try {
      const pdfBuffer = await this.generateReceiptPdf(receiptData);

      const subject = `Fee Payment Receipt - ${receiptData.receiptNumber}`;
      const textMessage = `Dear Parent,

We have successfully processed your fee payment. Please find attached the official receipt for your records.

Receipt Number: ${receiptData.receiptNumber}
Amount: ${receiptData.currency} ${receiptData.amountReceived.toFixed(2)}
Transaction ID: ${receiptData.transactionId}

Thank you,
School Administration`;

      const result = await this.emailService.sendEmail(
        recipientEmail,
        subject,
        textMessage,
        undefined,
        [
          {
            filename: `Receipt-${receiptData.receiptNumber}.pdf`,
            content: pdfBuffer,
          },
        ],
      );

      return result.success;
    } catch (error) {
      this.logger.error(
        `Failed to generate and email receipt to ${recipientEmail}:`,
        error,
      );
      return false;
    }
  }
}
