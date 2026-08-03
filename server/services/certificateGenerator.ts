import PDFDocument from "pdfkit";
import { Readable } from "stream";

interface CertificateData {
  studentName: string;
  courseName: string;
  completionDate: Date;
  score: number;
  certificateNumber: string;
}

/**
 * Generate a professional PDF certificate with MineTrans branding
 */
export async function generateCertificatePDF(
  data: CertificateData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on("error", reject);

    // Background color
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#0A0A0B");

    // Border
    doc
      .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
      .stroke("#AD6A3D");

    // Inner decorative border
    doc
      .rect(50, 50, doc.page.width - 100, doc.page.height - 100)
      .stroke("#AD6A3D");

    // Title
    doc
      .font("Helvetica-Bold")
      .fontSize(48)
      .fillColor("#AD6A3D")
      .text("CERTIFICATE", 0, 100, {
        align: "center",
        width: doc.page.width,
      });

    doc
      .font("Helvetica-Bold")
      .fontSize(36)
      .fillColor("#F7F5F1")
      .text("OF COMPLETION", 0, 160, {
        align: "center",
        width: doc.page.width,
      });

    // Decorative line
    doc
      .moveTo(150, 230)
      .lineTo(doc.page.width - 150, 230)
      .stroke("#AD6A3D");

    // Body text
    doc
      .font("Helvetica")
      .fontSize(14)
      .fillColor("#C9CACE")
      .text("This is to certify that", 0, 270, {
        align: "center",
        width: doc.page.width,
      });

    // Student name
    doc
      .font("Helvetica-Bold")
      .fontSize(28)
      .fillColor("#AD6A3D")
      .text(data.studentName, 0, 310, {
        align: "center",
        width: doc.page.width,
      });

    // Course name
    doc
      .font("Helvetica")
      .fontSize(14)
      .fillColor("#C9CACE")
      .text("has successfully completed the", 0, 360, {
        align: "center",
        width: doc.page.width,
      });

    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("#F7F5F1")
      .text(data.courseName, 0, 385, {
        align: "center",
        width: doc.page.width,
      });

    // Score
    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("#C9CACE")
      .text(`Final Score: ${data.score}%`, 0, 425, {
        align: "center",
        width: doc.page.width,
      });

    // Decorative line
    doc
      .moveTo(150, 470)
      .lineTo(doc.page.width - 150, 470)
      .stroke("#AD6A3D");

    // Date and certificate number
    const dateStr = data.completionDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#C9CACE")
      .text(`Date: ${dateStr}`, 80, 510)
      .text(
        `Certificate No: ${data.certificateNumber}`,
        doc.page.width - 280,
        510
      );

    // Footer
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#AD6A3D")
      .text("MineTrans Insurance Brokers", 0, doc.page.height - 60, {
        align: "center",
        width: doc.page.width,
      });

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#C9CACE")
      .text(
        "Specialist mining and marine insurance broking for Sub-Saharan Africa",
        0,
        doc.page.height - 40,
        {
          align: "center",
          width: doc.page.width,
        }
      );

    doc.end();
  });
}

/**
 * Generate a unique certificate number
 */
export function generateCertificateNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MT-${timestamp}-${random}`;
}
