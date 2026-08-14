import { NextRequest, NextResponse } from "next/server";
import { generateProcurementPackageDocx } from "@/lib/docxGenerator";
import { getCompanyById, getProjectById, logGeneratedDocument } from "@/lib/supabaseService";
import { MOCK_PEOPLE } from "@/lib/mockData";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || "aos";
    const projectId = searchParams.get("projectId") || "proj-1";

    // 1. Fetch live data from Supabase (or fallback to local dataset)
    const company = await getCompanyById(companyId);
    const project = await getProjectById(projectId);
    const person = MOCK_PEOPLE[0];

    // 2. Generate native DOCX file with company kop, director, and project details
    const docxBuffer = await generateProcurementPackageDocx(company, project, person);

    const documentNumber = company.branding.numberingPattern || `001/SP-${company.id.toUpperCase()}/VIII/2026`;
    const fileName = `Paket_Procurement_${company.id.toUpperCase()}_2026.docx`;

    // 3. Log document generation event to Supabase generated_documents table
    await logGeneratedDocument(company.id, project.id, "Surat Penawaran Administrasi", documentNumber, fileName);

    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal membuat dokumen DOCX", details: error?.message },
      { status: 500 }
    );
  }
}

