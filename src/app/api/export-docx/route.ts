import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { generateProcurementPackageDocx } from "@/lib/docxGenerator";
import { getCompanyById, getProjectById, logGeneratedDocument } from "@/lib/supabaseService";
import { MOCK_PEOPLE } from "@/lib/mockData";

function findDocxFile(companyId: string, docPrefix: string = "0"): string | null {
  const dirPath = path.join(process.cwd(), "public", "documents", "docx");
  if (!fs.existsSync(dirPath)) return null;

  const files = fs.readdirSync(dirPath);
  const matched = files.find((file) => {
    if (!file.endsWith(".docx")) return false;
    const lower = file.toLowerCase();

    const startsWithPrefix = file.startsWith(docPrefix);

    if (companyId === "aos" && lower.includes("alfa omega")) return startsWithPrefix;
    if (companyId === "ezra" && lower.includes("ezra")) return startsWithPrefix;
    if (companyId === "stigma" && lower.includes("stigma")) return startsWithPrefix;
    if (companyId === "sbp" && (lower.includes("solusi bumi") || lower.includes("sbp"))) return startsWithPrefix;

    return false;
  });

  return matched || null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || "aos";
    const projectId = searchParams.get("projectId") || "";
    const docPrefix = searchParams.get("docPrefix") || "0";

    // 1. Fetch live data from Supabase (or fallback to local dataset)
    const company = await getCompanyById(companyId);
    const project = await getProjectById(projectId, companyId);
    const person = MOCK_PEOPLE[0];

    const realFileName = findDocxFile(companyId, docPrefix);
    let docxBuffer: Buffer;
    let fileName = realFileName || `Surat_Penawaran_${company.legalName.replace(/[^a-zA-Z0-9]/g, "_")}.docx`;

    // 2. Serve actual pre-existing official DOCX from public/documents/docx/ if present
    if (realFileName) {
      const filePath = path.join(process.cwd(), "public", "documents", "docx", realFileName);
      if (fs.existsSync(filePath)) {
        docxBuffer = await fs.promises.readFile(filePath);
      } else {
        docxBuffer = await generateProcurementPackageDocx(company, project, person);
      }
    } else {
      docxBuffer = await generateProcurementPackageDocx(company, project, person);
    }

    const documentNumber = project.documentNumber || company.branding.numberingPattern;

    // 3. Log document generation event to Supabase generated_documents table
    await logGeneratedDocument(company.id, project.id, "Surat Penawaran Administrasi", documentNumber, fileName);

    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal mengunduh dokumen DOCX", details: error?.message },
      { status: 500 }
    );
  }
}

