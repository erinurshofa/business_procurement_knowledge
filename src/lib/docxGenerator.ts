import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
} from "docx";
import { Company, Project, Person } from "@/types/procurement";
import { formatIDR } from "./financialEngine";

/**
 * Real DOCX Document Generator using 'docx' library
 * Produces native Microsoft Word (.docx) binary files matching procurement standards.
 */

export async function generateProcurementPackageDocx(
  company: Company,
  project: Project,
  person?: Person
): Promise<Buffer> {
  const director = company.directors.find((d) => d.isSignatory) || company.directors[0];

  // 1. RAB Table Rows
  const rabTableRows: TableRow[] = [
    // Header Row
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "No", bold: true, color: "FFFFFF" })] })],
          shading: { fill: "0F172A" },
          width: { size: 5, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Uraian Komponen", bold: true, color: "FFFFFF" })] })],
          shading: { fill: "0F172A" },
          width: { size: 45, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Vol", bold: true, color: "FFFFFF" })] })],
          shading: { fill: "0F172A" },
          width: { size: 10, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Satuan", bold: true, color: "FFFFFF" })] })],
          shading: { fill: "0F172A" },
          width: { size: 10, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Harga Satuan", bold: true, color: "FFFFFF" })] })],
          shading: { fill: "0F172A" },
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Subtotal (IDR)", bold: true, color: "FFFFFF" })], alignment: AlignmentType.RIGHT })],
          shading: { fill: "0F172A" },
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  ];

  // Data Rows
  project.financials.items.forEach((item, idx) => {
    rabTableRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: (idx + 1).toString() })] }),
          new TableCell({ children: [new Paragraph({ text: item.description })] }),
          new TableCell({ children: [new Paragraph({ text: item.quantity.toString() })] }),
          new TableCell({ children: [new Paragraph({ text: item.unit })] }),
          new TableCell({ children: [new Paragraph({ text: formatIDR(item.billingRateIDR) })] }),
          new TableCell({
            children: [new Paragraph({ text: formatIDR(item.subtotalIDR), alignment: AlignmentType.RIGHT })],
          }),
        ],
      })
    );
  });

  // Construct Document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header Kop Surat
          new Paragraph({
            children: [
              new TextRun({ text: company.legalName, bold: true, size: 28, color: "0891B2" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `${company.address}, ${company.city} | Telp: ${company.phone}`, size: 18, color: "64748B" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Email: ${company.email} | Website: ${company.website}`, size: 18, color: "64748B" }),
            ],
          }),
          new Paragraph({
            text: "─────────────────────────────────────────────────────────────────────────────────",
            spacing: { after: 300 },
          }),

          // Judul Surat Penawaran
          new Paragraph({
            children: [
              new TextRun({ text: "SURAT PENAWARAN PEKERJAAN", bold: true, size: 24, underline: {} }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: `Nomor: ${project.documentNumber || company.branding.numberingPattern}\n`, size: 20 }),
              new TextRun({ text: `Lampiran: 1 (Satu) Berkas Paket Procurement\n`, size: 20 }),
              new TextRun({ text: `Hal: Penawaran Pekerjaan ${project.projectName}\n\n`, size: 20 }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Kepada Yth.\n", size: 20 }),
              new TextRun({ text: `${project.clientName}\n`, bold: true, size: 20 }),
              new TextRun({ text: `${project.clientAddress}\n\n`, size: 20 }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Dengan hormat, sehubungan dengan pengadaan paket pekerjaan "${project.projectName}", bersama ini kami dari ${company.legalName} menyampaikan penawaran harga sebesar `,
                size: 20,
              }),
              new TextRun({ text: formatIDR(project.financials.grandTotalIDR), bold: true, size: 20, color: "059669" }),
              new TextRun({ text: ` (${project.financials.terbilangIDR}) termasuk pajak yang berlaku.\n\n`, size: 20, italics: true }),
            ],
            spacing: { after: 300 },
          }),

          // RAB Title & Table
          new Paragraph({
            children: [new TextRun({ text: "RENCANA ANGGARAN BIAYA (RAB) FINANSIAL", bold: true, size: 22 })],
            spacing: { after: 150 },
          }),

          new Table({
            rows: rabTableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),

          // Summary Totals
          new Paragraph({
            children: [
              new TextRun({ text: `\nSubtotal Biaya Langsung: ${formatIDR(project.financials.directCostSubtotalIDR)}\n`, bold: true, size: 20 }),
              new TextRun({ text: `PPN ${project.financials.ppnPercent || 11}%: ${formatIDR(project.financials.ppnAmountIDR)}\n`, size: 20 }),
              new TextRun({ text: `GRAND TOTAL: ${formatIDR(project.financials.grandTotalIDR)}\n`, bold: true, size: 22, color: "0891B2" }),
            ],
            spacing: { after: 400 },
          }),

          // Signatory Block
          new Paragraph({
            children: [
              new TextRun({ text: `Semarang, ${project.documentDate || "14 Agustus 2026"}\n`, size: 20 }),
              new TextRun({ text: `${company.legalName}\n\n\n\n`, bold: true, size: 20 }),
              new TextRun({ text: `${director.fullName}\n`, bold: true, size: 20, underline: {} }),
              new TextRun({ text: `${director.position}`, size: 18, color: "475569" }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
