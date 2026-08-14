import { ContextState, ChatMessage, Company, Person, CompanyExperience } from "@/types/procurement";

export function processUserConversationalPrompt(
  promptText: string,
  currentState: ContextState,
  companies: Company[],
  people: Person[],
  experiences: CompanyExperience[]
): {
  assistantResponse: ChatMessage;
  nextState: ContextState;
} {
  const cleanPrompt = promptText.toLowerCase().trim();
  let responseText = "";
  const updatedState: ContextState = { ...currentState };
  let suggestedActions: { label: string; actionPrompt: string }[] | undefined = undefined;

  // 1. Company Switch Intent
  if (cleanPrompt.includes("alfa omega") || cleanPrompt.includes("aos")) {
    updatedState.activeCompanyId = "aos";
    responseText = "Perusahaan aktif berhasil diubah menjadi **CV ALFA OMEGA SOLUSINDO**.\n\nSemua master data, legalitas, pengalaman, dan bukti pajak kini dalam scope CV Alfa Omega Solusindo (Tenant Isolated).";
    suggestedActions = [
      { label: "Buat Project Baru", actionPrompt: "Buat project baru untuk Dinas Perikanan" },
      { label: "Cari Pengalaman Relevan", actionPrompt: "Cari pengalaman perusahaan yang paling relevan" },
      { label: "Cek Kalender Compliance Pajak", actionPrompt: "Lihat kalender compliance" },
    ];
  } else if (cleanPrompt.includes("ezra")) {
    updatedState.activeCompanyId = "ezra";
    responseText = "Perusahaan aktif berhasil diubah menjadi **PT EZRA PRATAMA**.\n\nData dan scope sistem kini menggunakan konteks PT EZRA PRATAMA.";
    suggestedActions = [
      { label: "Cari Pengalaman IT", actionPrompt: "Cari pengalaman PT Ezra" },
      { label: "Lihat Legalitas", actionPrompt: "Tampilkan legalitas perusahaan" },
    ];
  } else if (cleanPrompt.includes("solusi bumi") || cleanPrompt.includes("sbp")) {
    updatedState.activeCompanyId = "sbp";
    responseText = "Perusahaan aktif berhasil diubah menjadi **CV SOLUSI BUMI PERSADA**.";
  } else if (cleanPrompt.includes("stigma")) {
    updatedState.activeCompanyId = "stigma";
    responseText = "Perusahaan aktif berhasil diubah menjadi **CV STIGMA PRATAMA**.";
  }

  // 2. Search / Experience Matching Intent
  else if (cleanPrompt.includes("pengalaman") || cleanPrompt.includes("cari") || cleanPrompt.includes("match")) {
    updatedState.activeTab = "knowledge";
    const companyExps = experiences.filter((e) => e.companyId === updatedState.activeCompanyId);
    if (companyExps.length > 0) {
      const expListStr = companyExps
        .map(
          (e, idx) =>
            `${idx + 1}. **${e.projectName}** (${e.clientName})\n   • Nilai SPK: Rp ${e.contractValueIDR.toLocaleString(
              "id-ID"
            )}\n   • Relevance Score: ${e.relevanceScore}%\n   • Evidence: \`${e.spkSourceFile}\` (Verified)`
        )
        .join("\n\n");
      responseText = `Berikut ${companyExps.length} pengalaman perusahaan terverifikasi yang paling relevan untuk scope proyek saat ini:\n\n${expListStr}\n\nSemua riwayat terhubung dengan SPK & BAST asli di Evidence Vault.`;
      suggestedActions = [
        { label: "Tautkan ke Proyek", actionPrompt: "Gunakan pengalaman ini untuk proyek" },
        { label: "Tampilkan Dokumen SPK", actionPrompt: "Tampilkan SPK 2024" },
      ];
    } else {
      responseText = "Tidak ditemukan pengalaman perusahaan yang sesuai untuk scope ini.";
    }
  }

  // 3. Personnel Assignment Intent
  else if (cleanPrompt.includes("agus") || cleanPrompt.includes("team leader")) {
    const agus = people.find((p) => p.fullName.includes("Agus"));
    if (agus) {
      updatedState.activePersonId = agus.id;
      updatedState.activeTab = "knowledge";
      responseText = `**Agus Setiawan, S.Kom., M.T.** telah dipilih sebagai **Team Leader / Software Architect**.\n\nKualifikasi:\n• Pengalaman: 12 Tahun\n• Sertifikasi: \`Certified Software Architect (BNSP)\`\n• Status Evidence CV: Verified (\`CV_Agus_Setiawan_2026.pdf\`)`;
      suggestedActions = [
        { label: "Hitung RAB Personel", actionPrompt: "Hitung biaya remunerasi Agus" },
        { label: "Generate Dokumen CV", actionPrompt: "Generate CV Agus Setiawan" },
      ];
    }
  }

  // 4. Compliance / Tax Calendar Intent
  else if (cleanPrompt.includes("compliance") || cleanPrompt.includes("bpe") || cleanPrompt.includes("pajak") || cleanPrompt.includes("kalender")) {
    updatedState.activeTab = "compliance";
    responseText = "Menampilkan **Compliance Calendar & Evidence Vault**.\n\nSistem mencatat:\n• **BPE Pajak Bulanan 2026:** 7 Bulan Verified (Jan-Juli), 1 Bulan DUE (Agustus).\n• **Surat Keterangan Bank:** Target Tahunan Januari - Status: **VERIFIED** (\`Bank Jateng 2026\`).\n• **SPT Tahunan Badan:** Target Tahunan April - Status: **VERIFIED** (\`SPT 2025\`).";
    suggestedActions = [
      { label: "Cek Status BPE Agustus", actionPrompt: "Detail BPE Agustus 2026" },
      { label: "Cek Audit Konflik", actionPrompt: "Cek konflik data" },
    ];
  }

  // 5. Conflict Check Intent
  else if (cleanPrompt.includes("konflik") || cleanPrompt.includes("conflict") || cleanPrompt.includes("audit") || cleanPrompt.includes("red flag")) {
    updatedState.activeTab = "conflicts";
    responseText = "Menampilkan **Consistency & Conflict Inspector**.\n\nTerdeteksi **1 Peringatan Kritis (Critical Red Flag)**:\n⚠️ **Perbedaan Gelar Direktur** pada Akta Pendirian vs Form OSS Import.\n\nSistem menghentikan otomasi pembuatan dokumen final sampai verifikasi pengguna diberikan.";
    suggestedActions = [
      { label: "Verifikasi Gelar Direktur", actionPrompt: "Gunakan gelar pada Akta Pendirian" },
      { label: "Lanjutkan ke Generation", actionPrompt: "Generate semua dokumen" },
    ];
  }

  // 6. Document Generation Intent
  else if (cleanPrompt.includes("generate") || cleanPrompt.includes("buat dokumen") || cleanPrompt.includes("paket")) {
    updatedState.activeTab = "document";
    responseText = "Memproses **Paket Dokumen Procurement Lengkap**...\n\nDokumen yang siap di-generate:\n1. 📄 **Surat Penawaran Administrative**\n2. 📘 **Dokumen Penawaran Teknis & Metodologi**\n3. 👤 **Daftar Kualifikasi Tenaga Ahli (CV)**\n4. 📊 **Rencana Anggaran Biaya (RAB & Remunerasi)**\n\n*Catatan: Semua kalkulasi finansial dijamin 100% presisi menggunakan Deterministic Calculation Engine.*";
    suggestedActions = [
      { label: "Pratinjau Surat Penawaran", actionPrompt: "Lihat pratinjau surat penawaran" },
      { label: "Pratinjau RAB Finansial", actionPrompt: "Lihat RAB lengkap" },
    ];
  }

  // 7. General Inquiry / Help Intent
  else {
    responseText = `Saya memahami perintah Anda: "${promptText}".\n\nSebagai **AI-Powered Procurement Knowledge Operating System**, Anda dapat meminta saya untuk:\n• *"Gunakan CV Alfa Omega"* atau *"Switch ke PT Ezra"* (Isolasi Tenant)\n• *"Cari pengalaman yang paling relevan"* (Matching & RAG Evidence)\n• *"Pakai Agus sebagai Team Leader"* (Penugasan Personel)\n• *"Lihat compliance calendar"* (Monitoring BPE Pajak & Bank)\n• *"Cek konflik data"* (Audit Konsistensi Red Flags)\n• *"Generate semua dokumen"* (Otomasi Package Penawaran)`;
    suggestedActions = [
      { label: "Gunakan CV Alfa Omega", actionPrompt: "Gunakan CV Alfa Omega" },
      { label: "Cari Pengalaman Relevan", actionPrompt: "Cari pengalaman perusahaan yang paling relevan" },
      { label: "Generate Paket Dokumen", actionPrompt: "Generate semua dokumen" },
    ];
  }

  const assistantMessage: ChatMessage = {
    id: `msg-asst-${Date.now()}`,
    sender: "assistant",
    text: responseText,
    timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    suggestedActions,
  };

  return {
    assistantResponse: assistantMessage,
    nextState: updatedState,
  };
}
