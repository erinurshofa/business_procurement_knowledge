import { NextRequest, NextResponse } from "next/server";
import { generateProcurementPackageDocx } from "@/lib/docxGenerator";
import { MOCK_COMPANIES, MOCK_PROJECTS, MOCK_PEOPLE } from "@/lib/mockData";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || "aos";
    const projectId = searchParams.get("projectId") || "proj-1";

    const company = MOCK_COMPANIES.find((c) => c.id === companyId) || MOCK_COMPANIES[0];
    const project = MOCK_PROJECTS.find((p) => p.id === projectId) || MOCK_PROJECTS[0];
    const person = MOCK_PEOPLE[0];

    const docxBuffer = await generateProcurementPackageDocx(company, project, person);

    const fileName = `Paket_Procurement_${company.id.toUpperCase()}_2026.docx`;

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
