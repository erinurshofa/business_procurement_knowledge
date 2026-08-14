import { ContextState, ChatMessage, Company, Person, CompanyExperience, Project } from "@/types/procurement";

export function processUserConversationalPrompt(
  promptText: string,
  currentState: ContextState,
  companies: Company[],
  people: Person[],
  experiences: CompanyExperience[],
  projects?: Project[]
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
    const compProj = projects?.find((p) => p.companyId === "aos");
    if (compProj) updatedState.activeProjectId = compProj.id;
    responseText = "Perusahaan aktif berhasil diubah menjadi **CV ALFA OMEGA SOLUSINDO**.\n\nSemua master data, legalitas, pengalaman, dan bukti pajak kini dalam scope CV Alfa Omega Solusindo (Tenant Isolated).";
    suggestedActions = [
      { label: "Pratinjau Surat Penawaran", actionPrompt: "Pratinjau Surat Penawaran" },
      { label: "Cari Pengalaman Relevan", actionPrompt: "Cari pengalaman perusahaan yang paling relevan" },
      { label: "Cek Kalender Compliance Pajak", actionPrompt: "Lihat kalender compliance" },
    ];
  } else if (cleanPrompt.includes("ezra")) {
    updatedState.activeCompanyId = "ezra";
    const compProj = projects?.find((p) => p.companyId === "ezra");
    if (compProj) updatedState.activeProjectId = compProj.id;
    responseText = "Perusahaan aktif berhasil diubah menjadi **PT EZRA PRATAMA**.\n\nData dan scope sistem kini menggunakan konteks PT EZRA PRATAMA.";
    suggestedActions = [
      { label: "Pratinjau Surat Penawaran", actionPrompt: "Pratinjau Surat Penawaran" },
      { label: "Cari Pengalaman IT", actionPrompt: "Cari pengalaman PT Ezra" },
      { label: "Lihat Legalitas", actionPrompt: "Tampilkan legalitas perusahaan" },
    ];
  } else if (cleanPrompt.includes("solusi bumi") || cleanPrompt.includes("sbp")) {
    updatedState.activeCompanyId = "sbp";
    const compProj = projects?.find((p) => p.companyId === "sbp");
    if (compProj) updatedState.activeProjectId = compProj.id;
    responseText = "Perusahaan aktif berhasil diubah menjadi **CV SOLUSI BUMI PERSADA**.";
  } else if (cleanPrompt.includes("stigma")) {
    updatedState.activeCompanyId = "stigma";
    const compProj = projects?.find((p) => p.companyId === "stigma");
    if (compProj) updatedState.activeProjectId = compProj.id;
    responseText = "Perusahaan aktif berhasil diubah menjadi **CV STIGMA PRATAMA**.\n\nData dan scope sistem kini menggunakan konteks CV STIGMA PRATAMA.";
    suggestedActions = [
      { label: "Pratinjau Surat Penawaran", actionPrompt: "Pratinjau Surat Penawaran" },
      { label: "Cek Kalender Compliance Pajak", actionPrompt: "Lihat kalender compliance" },
    ];
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

  // 3. Personnel Assignment & Recommendation Intent
  else if (
    cleanPrompt.includes("personil") ||
    cleanPrompt.includes("tenaga ahli") ||
    cleanPrompt.includes("affandy") ||
    cleanPrompt.includes("eri") ||
    cleanPrompt.includes("dyan") ||
    cleanPrompt.includes("agus") ||
    cleanPrompt.includes("team leader") ||
    cleanPrompt.includes("rekomendasi")
  ) {
    updatedState.activeTab = "knowledge";
    const companyPeople = people.filter((p) => p.currentPrimaryCompanyId === updatedState.activeCompanyId);

    if (cleanPrompt.includes("affandy") || (updatedState.activeCompanyId === "stigma" && cleanPrompt.includes("team leader"))) {
      const affandy = people.find((p) => p.fullName.includes("Affandy"));
      if (affandy) {
        updatedState.activePersonId = affandy.id;
        responseText = `**Affandy Ichsan, S.Kom.** direkomendasikan sebagai **Team Leader / Ahli Kecerdasan Buatan** untuk ${companies.find(c => c.id === updatedState.activeCompanyId)?.legalName}.\n\nKualifikasi:\n• Pengalaman: 12 Tahun di Bidang AI, IoT Vision & Monitoring\n• Sertifikasi: \`Certified AI Computer Vision & IoT Specialist\`\n• Surat Penugasan: \`No: 1 / ST / IOTMOTION / IV / 2026\`\n• Billing Rate: Rp 8.875.000 / OB (Total 4 Bulan: Rp 35.500.000)`;
        suggestedActions = [
          { label: "Tugaskan ke Proyek", actionPrompt: "Tugaskan Affandy ke proyek aktif" },
          { label: "Lihat Surat Penugasan", actionPrompt: "Lihat Surat Penugasan Personil" },
        ];
      }
    } else if (cleanPrompt.includes("eri") || (updatedState.activeCompanyId === "stigma" && cleanPrompt.includes("programmer"))) {
      const eri = people.find((p) => p.fullName.includes("Eri"));
      if (eri) {
        updatedState.activePersonId = eri.id;
        responseText = `**Eri Nur Sofa, S.Kom.** direkomendasikan sebagai **Tenaga Ahli Sistem Keamanan / Programmer (Quality Engineer)**.\n\nKualifikasi:\n• Pendidikan: S1 Teknik Informatika Universitas Semarang (Lulus 2019)\n• Pengalaman Nyata: Programmer Aplikasi SIDAKSOS (Dinsos Semarang) & Staf Ahli Sistem Informasi (DPM-PTSP Semarang)\n• Surat Penugasan: \`No: 2 / ST / IOTMOTION / IV / 2026\`\n• Billing Rate: Rp 8.875.000 / OB (Total 4 Bulan: Rp 35.500.000)`;
        suggestedActions = [
          { label: "Tugaskan ke Proyek", actionPrompt: "Tugaskan Eri ke proyek aktif" },
          { label: "Lihat CV Eri Nur Sofa", actionPrompt: "Pratinjau CV Tenaga Ahli" },
        ];
      }
    } else if (cleanPrompt.includes("dyan") || (updatedState.activeCompanyId === "stigma" && cleanPrompt.includes("admin"))) {
      const dyan = people.find((p) => p.fullName.includes("Dyan"));
      if (dyan) {
        updatedState.activePersonId = dyan.id;
        responseText = `**Dyan Sinung Prabowo, S.Kom** direkomendasikan sebagai **Tenaga Pendukung Operator Komputer / Administrasi Proyek**.\n\nKualifikasi:\n• Pendidikan: SMK Negeri 1 Rembang\n• Pengalaman Nyata: Operator Komputer Pelayanan Perizinan (DPM-PTSP Kota Semarang)\n• Billing Rate: Rp 3.700.000 / Bulan`;
        suggestedActions = [
          { label: "Tugaskan ke Proyek", actionPrompt: "Tugaskan Dyan ke proyek aktif" },
          { label: "Lihat CV Dyan", actionPrompt: "Pratinjau CV Tenaga Ahli" },
        ];
      }
    } else {
      const agus = people.find((p) => p.fullName.includes("Agus"));
      if (agus) {
        updatedState.activePersonId = agus.id;
        responseText = `**Agus Setiawan, S.Kom., M.T.** telah dipilih sebagai **Team Leader / Software Architect**.\n\nKualifikasi:\n• Pengalaman: 12 Tahun\n• Sertifikasi: \`Certified Software Architect (BNSP)\`\n• Status Evidence CV: Verified (\`CV_Agus_Setiawan_2026.pdf\`)`;
        suggestedActions = [
          { label: "Hitung RAB Personel", actionPrompt: "Hitung biaya remunerasi Agus" },
          { label: "Generate Dokumen CV", actionPrompt: "Generate CV Agus Setiawan" },
        ];
      }
    }
  }

  // 4. Compliance / Tax Calendar Intent
  else if (cleanPrompt.includes("compliance") || cleanPrompt.includes("bpe") || cleanPrompt.includes("pajak") || cleanPrompt.includes("kalender")) {
    updatedState.activeTab = "compliance";
    if (updatedState.activeCompanyId === "stigma") {
      responseText = "Menampilkan **Compliance Calendar & Evidence Vault CV STIGMA PRATAMA**.\n\nSistem mencatat data faktual resmi:\n• **BPE Pajak Bulanan 2026:** \n  - BPE Masa Januari 2026 (Verified: `4.a BPE Januari 2026 - CV STIGMA PRATAMA.jpg`)\n  - BPE Masa Februari 2026 (Verified: `4.b BPE Februari 2026 - CV STIGMA PRATAMA.jpg`)\n  - BPE Masa Maret 2026 (Verified: `4.c BPE Maret 2026 - CV STIGMA PRATAMA.jpg`)\n• **Laporan SPT Tahunan Badan 1771:** Verified (No Tanda Terima: `60052406557252030151` / Tahun Pajak 2024).\n• **Pakta Integritas & Prakualifikasi:** Verified (`0. Pakta Integritas` & `1. Surat Pernyataan Prakualifikasi`).";
    } else {
      responseText = "Menampilkan **Compliance Calendar & Evidence Vault**.\n\nSistem mencatat:\n• **BPE Pajak Bulanan 2026:** 7 Bulan Verified (Jan-Juli), 1 Bulan DUE (Agustus).\n• **Surat Keterangan Bank:** Target Tahunan Januari - Status: **VERIFIED** (\`Bank Jateng 2026\`).\n• **SPT Tahunan Badan:** Target Tahunan April - Status: **VERIFIED** (\`SPT 2025\`).";
    }
    suggestedActions = [
      { label: "Cek Status BPE", actionPrompt: "Detail BPE 2026" },
      { label: "Cek Audit Kepatuhan", actionPrompt: "Cek konflik data" },
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

  // 6. Document Generation & Download Intent
  else if (
    cleanPrompt.includes("download") ||
    cleanPrompt.includes("rekap") ||
    cleanPrompt.includes("kuantitas") ||
    cleanPrompt.includes("remunerasi") ||
    cleanPrompt.includes("generate") ||
    cleanPrompt.includes("buat dokumen") ||
    cleanPrompt.includes("paket")
  ) {
    updatedState.activeTab = "document";
    responseText = "Memproses **Paket Dokumen Procurement Lengkap**...\n\nSeluruh berkas dokumen resmi (.docx) telah siap diunduh secara langsung:\n1. 📄 **0. Surat Penawaran Administrasi**\n2. 📊 **1. Rekapitulasi Penawaran Biaya**\n3. 📋 **2. Daftar Kuantitas dan Harga**\n4. 👥 **3. Komponen Remunerasi**\n\n*Silakan gunakan tombol bilah unduh di atas pratinjau dokumen atau pilih tombol aksi cepat di bawah ini.*";
    suggestedActions = [
      { label: "📄 Download Surat Penawaran", actionPrompt: "Download Surat Penawaran" },
      { label: "📊 Download Rekapitulasi Biaya", actionPrompt: "Download Rekapitulasi Biaya" },
      { label: "📋 Download Kuantitas & Harga", actionPrompt: "Download Daftar Kuantitas dan Harga" },
      { label: "👥 Download Remunerasi", actionPrompt: "Download Komponen Remunerasi" },
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
