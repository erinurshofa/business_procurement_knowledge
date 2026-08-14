import { NextRequest, NextResponse } from "next/server";
import { processUserConversationalPrompt } from "@/lib/conversationalEngine";
import { ContextState, Company, Person, CompanyExperience, Project } from "@/types/procurement";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { promptText, contextState, companies, people, experiences, projects } = body as {
      promptText: string;
      contextState: ContextState;
      companies: Company[];
      people: Person[];
      experiences: CompanyExperience[];
      projects: Project[];
    };

    const googleApiKey = process.env.GOOGLE_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;

    const activeCompany = companies?.find((c) => c.id === contextState.activeCompanyId) || companies?.[0];
    const activeProject = projects?.find((p) => p.id === contextState.activeProjectId || p.companyId === contextState.activeCompanyId) || projects?.[0];
    const activeDirector = activeCompany?.directors?.find((d) => d.isSignatory) || activeCompany?.directors?.[0];

    // 1. Try Google Gemini API if key is present
    if (googleApiKey) {
      try {
        const systemPrompt = `Anda adalah Assistant Procurement Knowledge OS cerdas untuk platform Pengadaan Barang & Jasa.
Konteks Perusahaan Aktif:
- Nama Legal: ${activeCompany?.legalName || "N/A"} (${activeCompany?.businessType})
- Direktur: ${activeDirector?.fullName || "N/A"} (${activeDirector?.position})
- Alamat: ${activeCompany?.address || "N/A"}, ${activeCompany?.city || ""}
- Kontak: ${activeCompany?.phone || ""} | ${activeCompany?.email || ""}

Konteks Proyek Aktif:
- Nama Pekerjaan: ${activeProject?.projectName || "N/A"}
- Client: ${activeProject?.clientName || "N/A"}
- Total RAB: Rp ${activeProject?.financials?.grandTotalIDR?.toLocaleString("id-ID") || 0} (${activeProject?.financials?.terbilangIDR || ""})
- No Dokumen: ${activeProject?.documentNumber || activeCompany?.branding?.numberingPattern || ""}
- No Pengumuman Ref: ${activeProject?.procurementRefNo || ""}

Jawablah pertanyaan user dengan profesional, ringkas, jelas, dan akurat berdasarkan konteks pengadaan di atas dalam Bahasa Indonesia.`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${googleApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: `${systemPrompt}\n\nPertanyaan Pengguna: ${promptText}` },
                  ],
                },
              ],
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            // Also run conversational engine state transition
            const { nextState } = processUserConversationalPrompt(
              promptText,
              contextState,
              companies,
              people,
              experiences,
              projects
            );

            return NextResponse.json({
              assistantResponse: {
                id: `msg-ai-${Date.now()}`,
                sender: "assistant",
                text: replyText,
                timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                suggestedActions: [
                  { label: "Pratinjau Surat Penawaran", actionPrompt: "Pratinjau Surat Penawaran" },
                  { label: "Cari Pengalaman Relevan", actionPrompt: "Cari pengalaman perusahaan yang paling relevan" },
                  { label: "Export DOCX Package", actionPrompt: "Generate semua dokumen" },
                ],
              },
              nextState,
            });
          }
        }
      } catch (geminiErr) {
        console.warn("[AI API] Gemini API call failed, falling back to local engine:", geminiErr);
      }
    }

    // 2. Fallback to Local Deterministic Conversational Engine
    const result = processUserConversationalPrompt(
      promptText,
      contextState,
      companies,
      people,
      experiences,
      projects
    );

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Gagal memproses AI chat", details: err?.message },
      { status: 500 }
    );
  }
}
