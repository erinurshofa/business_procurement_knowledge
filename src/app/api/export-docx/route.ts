import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { generateProcurementPackageDocx } from "@/lib/docxGenerator";
import { getCompanyById, getProjectById, logGeneratedDocument } from "@/lib/supabaseService";
import { MOCK_PEOPLE } from "@/lib/mockData";

interface FoundDoc {
  fileName: string;
  fullPath: string;
}

function getAllFilesRecursively(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFilesRecursively(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

function findDocxFile(companyId: string, docPrefix: string = "0", customKeyword?: string): FoundDoc | null {
  const baseDir = path.join(process.cwd(), "public", "documents", "docx");
  const allFiles = getAllFilesRecursively(baseDir);

  const matchedPath = allFiles.find((filePath) => {
    const fileName = path.basename(filePath);
    const lower = fileName.toLowerCase();

    // Check company match
    let companyMatch = false;
    if (companyId === "aos" && lower.includes("alfa omega")) companyMatch = true;
    if (companyId === "ezra" && lower.includes("ezra")) companyMatch = true;
    if (companyId === "stigma" && lower.includes("stigma")) companyMatch = true;
    if (companyId === "sbp" && (lower.includes("solusi bumi") || lower.includes("sbp"))) companyMatch = true;

    if (!companyMatch) return false;

    // Check custom keyword or prefix
    if (customKeyword && lower.includes(customKeyword.toLowerCase())) {
      return true;
    }

    return fileName.startsWith(docPrefix);
  });

  if (!matchedPath) return null;

  return {
    fileName: path.basename(matchedPath),
    fullPath: matchedPath,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || "aos";
    const projectId = searchParams.get("projectId") || "";
    const docPrefix = searchParams.get("docPrefix") || "0";
    const keyword = searchParams.get("keyword") || undefined;

    // 1. Fetch live data from Supabase (or fallback to local dataset)
    const company = await getCompanyById(companyId);
    const project = await getProjectById(projectId, companyId);
    const person = MOCK_PEOPLE[0];

    const found = findDocxFile(companyId, docPrefix, keyword);
    let docxBuffer: Buffer;
    let fileName = found?.fileName || `Surat_Penawaran_${company.legalName.replace(/[^a-zA-Z0-9]/g, "_")}.docx`;

    // 2. Serve actual pre-existing official file if found
    if (found && fs.existsSync(found.fullPath)) {
      docxBuffer = await fs.promises.readFile(found.fullPath);
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

