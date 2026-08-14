"use client";

import React, { useState, useEffect } from "react";
import { Company, Project, FinancialItem, Person } from "@/types/procurement";
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Building,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Hash,
  DollarSign,
  Briefcase,
  Edit3,
  Eye,
  Save,
  Plus,
  Trash2,
  List,
  Sparkles,
  FolderArchive,
  Layers,
  Award,
  FileCheck,
  BookOpen,
} from "lucide-react";

interface DocumentViewerProps {
  company: Company;
  project: Project;
  selectedPerson?: Person;
  onProjectUpdate?: (updatedProject: Project) => void;
}

export type MainCategory = "adm_harga" | "teknis" | "prakualifikasi";

export type DocSubTab =
  // Kategori 1: Penawaran Adm & Harga
  | "surat"
  | "rekap"
  | "kuantitas"
  | "remunerasi"
  // Kategori 2: Penawaran Teknis
  | "teknis_metodologi"
  | "teknis_pengalaman"
  | "teknis_komposisi"
  | "teknis_cv"
  | "teknis_penugasan"
  // Kategori 3: Prakualifikasi
  | "prak_pakta"
  | "prak_pernyataan"
  | "prak_formulir"
  | "prak_legalitas"
  | "prak_pajak";

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  company,
  project,
  selectedPerson,
  onProjectUpdate,
}) => {
  const [activeCategory, setActiveCategory] = useState<MainCategory>("adm_harga");
  const [selectedSubTab, setSelectedSubTab] = useState<DocSubTab>("surat");
  const [isEditMode, setIsEditMode] = useState(true); // Default to live editable MS Word mode
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isStampOverlayActive, setIsStampOverlayActive] = useState(true);

  const director = company.directors.find((d) => d.isSignatory) || company.directors[0];

  // =========================================================================
  // STATE 1: Penawaran Administrasi & Surat Penawaran
  // =========================================================================
  const [letterData, setLetterData] = useState({
    companyName: company.legalName,
    companyAddress: company.address,
    companyContact: `Telp: ${company.phone} | Email: ${company.email}`,
    docNumber: project.documentNumber || `01 / SP / ${company.id.toUpperCase()} / VIII / 2026`,
    lampiran: "1 Bendel Dokumen Asli",
    letterDate: project.documentDate ? `Semarang, ${project.documentDate}` : "Semarang, 14 Agustus 2026",
    recipientName: project.clientName || "Pejabat Pengadaan Pada Dinas Perikanan Kota Semarang",
    recipientCity: "S E M A R A N G",
    perihal: `Penawaran Pengadaan ${project.projectName}`,
    refNumber: project.procurementRefNo || "PL06A/02/PP-Perikanan/VIII/2026",
    refDate: project.documentDate || "13 Agustus 2026",
    projectName: project.projectName,
    executionDays: project.executionDays || 90,
    validityDays: project.validityDays || 30,
    p1: `Sehubungan dengan pengumuman Pengadaan Langsung dengan Pascakualifikasi dan Dokumen Pemilihan nomor : ${
      project.procurementRefNo || "PL06A/02/PP-Perikanan/VIII/2026"
    } tanggal ${
      project.documentDate || "13 Agustus 2026"
    }, dan setelah kami pelajari dengan seksama Dokumen Pemilihan dan Berita Acara Pemberian Penjelasan (serta adendum Dokumen Pemilihan), dengan ini kami mengajukan Dokumen Penawaran Harga, Dokumen Administrasi dan Teknis untuk pekerjaan tersebut.`,
    p2: "Penawaran ini sudah memperhatikan ketentuan dan persyaratan yang tercantum dalam Dokumen Pengadaan Langsung untuk melaksanakan pekerjaan tersebut di atas.",
    p3: `Kami akan melaksanakan pekerjaan tersebut dengan jangka waktu pelaksanaan pekerjaan selama ${
      project.executionDays || 90
    } hari kalender.`,
    p4: `Penawaran ini berlaku selama ${
      project.validityDays || 30
    } hari kalender sejak tanggal surat penawaran ini. Surat Penawaran beserta lampirannya kami sampaikan sebanyak 1 (satu) rangkap dokumen asli.`,
    p5: "Dengan disampaikannya Surat Penawaran ini, maka kami menyatakan sanggup dan akan tunduk pada semua ketentuan yang tercantum dalam Dokumen Pengadaan.",
    signatoryName: director.fullName,
    signatoryRole: director.position as string,
  });

  // =========================================================================
  // STATE 2: RAB Kuantitas dan Harga
  // =========================================================================
  const [rabItems, setRabItems] = useState<FinancialItem[]>(project.financials?.items || []);
  const [ppnPercent, setPpnPercent] = useState<number>(project.financials?.ppnPercent || 11);
  const [terbilangCustom, setTerbilangCustom] = useState<string>(
    project.financials?.terbilangIDR || "Sembilan Puluh Sembilan Juta Dua Ratus Delapan Puluh Sembilan Ribu Lima Ratus Rupiah"
  );

  // =========================================================================
  // STATE 3: Komponen Remunerasi
  // =========================================================================
  const [remunerationItems, setRemunerationItems] = useState([
    {
      id: "rem-1",
      position: "Team Leader / Ahli Kecerdasan Buatan",
      personName: "Affandy Ichsan, S.Kom",
      basicSalary: 3784500,
      socialCharge: 1324575,
      overhead: 2270700,
      allowance: 750000,
      profit: 745225,
      billingRate: 8875000,
    },
    {
      id: "rem-2",
      position: "Tenaga Ahli Sistem Keamanan / Programmer",
      personName: "Eri Nur Sofa, S.Kom.",
      basicSalary: 3250000,
      socialCharge: 1137500,
      overhead: 1950000,
      allowance: 650000,
      profit: 642500,
      billingRate: 7630000,
    },
    {
      id: "rem-3",
      position: "Tenaga Pendukung Operator Komputer",
      personName: "Dyan Sinung Prabowo, S.Kom",
      basicSalary: 1575000,
      socialCharge: 551250,
      overhead: 945000,
      allowance: 315000,
      profit: 313750,
      billingRate: 3700000,
    },
  ]);

  // =========================================================================
  // STATE 4: Penawaran Teknis & Metodologi
  // =========================================================================
  const [technicalDoc, setTechnicalDoc] = useState({
    title: project.projectName,
    bab1DataOrg: "CV. STIGMA PRATAMA merupakan badan usaha yang bergerak di bidang Pengadaan Barang dan Jasa Teknologi Informasi, Sistem Integrator, dan Konsultansi Telemetri IoT dengan tenaga ahli berkompeten.",
    bab2Metodologi: "Pelaksanaan pekerjaan menggunakan pendekatan Agile Engineering Framework, desain arsitektur modular, integrasi sensor cerdas real-time, pengujian ketahanan lapangan, dan pelatihan alih pengetahuan ke dinas.",
    bab3TanggapanKAK: "Tanggapan terhadap KAK: Seluruh spesifikasi teknis telah dipelajari dengan seksama dan dipenuhi 100% tanpa deviasi.",
    bab4Jadwal: "Minggu 1-4: Analisis Kebutuhan & Desain; Minggu 5-8: Perakitan & Integrasi Alat; Minggu 9-12: Uji Lapangan & Serah Terima BAST.",
  });

  // =========================================================================
  // STATE 5: Pengalaman Perusahaan 10 Tahun Terakhir
  // =========================================================================
  const [companyExpList, setCompanyExpList] = useState([
    {
      no: 1,
      clientName: "Dinas Perhubungan, Komunikasi dan Informatika Provinsi Jawa Tengah",
      packageName: "Penyusunan Aplikasi Sistem Informasi Eksekutif (SIE) Kegiatan Pengembangan SIJOLI 2014",
      scope: "Pengembangan Aplikasi Database & Dashboard Eksekutif",
      period: "29/01/2014 - 14/03/2014",
      manMonths: "5 OB",
      contractValue: 49500000,
    },
    {
      no: 2,
      clientName: "Dinas Tenaga Kerja, Transmigrasi dan Kependudukan Provinsi Jawa Tengah",
      packageName: "Pembuatan Aplikasi Penyusunan Profil Kependudukan",
      scope: "Pengelolaan & Penyajian Data Kependudukan Skala Provinsi",
      period: "18/02/2014 - 03/04/2014",
      manMonths: "4 OB",
      contractValue: 38450000,
    },
    {
      no: 3,
      clientName: "Badan Kepegawaian Daerah (BKD) Kota Semarang",
      packageName: "Pengembangan Sistem Informasi e-File & Manajemen Arsip Kepegawaian 2022",
      scope: "Digitalisasi Arsip ASN, OCR Berkas, dan Enkripsi Data",
      period: "15/06/2022 - 20/10/2022",
      manMonths: "4 OB",
      contractValue: 195000000,
    },
    {
      no: 4,
      clientName: "Dinas Pekerjaan Umum (DPU) Kota Semarang",
      packageName: "Pengembangan Fitur Serta Fungsi Aplikasi SIPU 2023",
      scope: "Upgrade Pelaporan Jalan & Drainase, Peta GIS Spasial",
      period: "10/05/2023 - 20/09/2023",
      manMonths: "4 OB",
      contractValue: 245000000,
    },
  ]);

  // =========================================================================
  // STATE 6: Komposisi Tim & Surat Penugasan
  // =========================================================================
  const [teamComposition, setTeamComposition] = useState([
    {
      id: "tc-1",
      name: "Affandy Ichsan, S.Kom.",
      company: company.legalName,
      type: "Tenaga Ahli Lokal",
      expertise: "Ahli Kecerdasan Buatan / Computer Vision",
      position: "Team Leader",
      jobDesc: "Merancang arsitektur AI Monitoring, pengembangan sistem aplikasi dan integrasi kamera CCTV cerdas berbasis AI.",
      manMonths: 4,
    },
    {
      id: "tc-2",
      name: "Eri Nur Sofa, S.Kom.",
      company: company.legalName,
      type: "Tenaga Ahli Lokal",
      expertise: "Tenaga Ahli Sistem Keamanan / Programmer",
      position: "Programmer (Quality Engineer)",
      jobDesc: "Merancang alat smart monitoring, pembuatan backend API, dan perakitan modul controller lapangan.",
      manMonths: 4,
    },
    {
      id: "tc-3",
      name: "Dyan Sinung Prabowo, S.Kom",
      company: company.legalName,
      type: "Tenaga Pendukung",
      expertise: "Administrasi Proyek & IT Support",
      position: "Operator Komputer",
      jobDesc: "Melaksanakan tugas administrasi proyek, penyusunan laporan, dan dokumentasi kontrak pengadaan.",
      manMonths: 1,
    },
  ]);

  // =========================================================================
  // STATE 7: Prakualifikasi (Pakta, Pernyataan, Legalitas, Pajak)
  // =========================================================================
  const [prakualifikasiData, setPrakualifikasiData] = useState({
    paktaPoint1: "Tidak akan melakukan praktek Korupsi, Kolusi, dan Nepotisme (KKN).",
    paktaPoint2: "Akan melaporkan kepada PA/KPA/APIP jika mengetahui indikasi KKN dalam proses pengadaan ini.",
    paktaPoint3: "Akan mengikuti proses pengadaan secara bersih, transparan, dan profesional.",
    paktaPoint4: "Apabila melanggar hal-hal tersebut di atas, bersedia menerima sanksi pencantuman dalam Daftar Hitam dan sanksi hukum sesuai ketentuan perundang-undangan.",
    pernyataanBadanUsaha: "Menyatakan bahwa badan usaha kami tidak sedang dalam pengawasan pengadilan, tidak bangkrut, dan tidak sedang dihentikan kegiatan usahanya.",
    pernyataanKebenaran: "Semua informasi dan dokumen yang disampaikan dalam berkas penawaran ini adalah benar, sah, dan dapat dipertanggungjawabkan.",
    npwpNomor: "02.624.905.2-503.000",
    nitkuNomor: "0026249052503000000000",
    spt1771Nomor: "60052406557252030151",
    sptTahun: "2024 (Disampaikan 30/04/2025)",
  });

  useEffect(() => {
    setLetterData((prev) => ({
      ...prev,
      companyName: company.legalName,
      companyAddress: company.address,
      companyContact: `Telp: ${company.phone} | Email: ${company.email}`,
      docNumber: project.documentNumber || `01 / SP / ${company.id.toUpperCase()} / VIII / 2026`,
      projectName: project.projectName,
      recipientName: project.clientName || prev.recipientName,
      signatoryName: director.fullName,
      signatoryRole: director.position,
    }));
    setRabItems(project.financials?.items || []);
    setPpnPercent(project.financials?.ppnPercent || 11);
    setTerbilangCustom(project.financials?.terbilangIDR || "Sembilan Puluh Sembilan Juta Tiga Ratus Empat Puluh Lima Ribu Rupiah");
  }, [project, company]);

  // Financial Calculations
  const blpTotal = rabItems
    .filter((i) => i.category === "Personnel")
    .reduce((sum, i) => sum + (Number(i.subtotalIDR) || 0), 0);

  const blnpTotal = rabItems
    .filter((i) => i.category === "Non-Personnel")
    .reduce((sum, i) => sum + (Number(i.subtotalIDR) || 0), 0);

  const directCostTotal = blpTotal + blnpTotal;
  const ppnAmount = Math.round((directCostTotal * ppnPercent) / 100);
  const grandTotal = directCostTotal + ppnAmount;

  const handleRabItemUpdate = (id: string, field: keyof FinancialItem, val: any) => {
    setRabItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === "quantity" || field === "billingRateIDR" || field === "durationMonths") {
          updated.subtotalIDR =
            (Number(updated.quantity) || 1) *
            (Number(updated.billingRateIDR) || 0) *
            (Number(updated.durationMonths) || 1);
        }
        return updated;
      })
    );
  };

  const handleAddRabItem = (category: "Personnel" | "Non-Personnel") => {
    const newItem: FinancialItem = {
      id: `fin-custom-${Date.now()}`,
      category,
      description: category === "Personnel" ? "Tenaga Ahli Baru" : "Komponen Operasional Baru",
      quantity: 1,
      unit: category === "Personnel" ? "OB" : "Paket",
      durationMonths: 1,
      billingRateIDR: category === "Personnel" ? 8875000 : 1000000,
      subtotalIDR: category === "Personnel" ? 8875000 : 1000000,
    };
    setRabItems([...rabItems, newItem]);
  };

  const handleDeleteRabItem = (id: string) => {
    setRabItems(rabItems.filter((i) => i.id !== id));
  };

  const handleRemunerationUpdate = (id: string, field: string, val: any) => {
    setRemunerationItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated: any = { ...item, [field]: val };
        if (field === "basicSalary") {
          const bs = Number(val) || 0;
          updated.socialCharge = Math.round(bs * 0.35);
          updated.overhead = Math.round(bs * 0.60);
          updated.allowance = Math.round(bs * 0.20);
          updated.profit = Math.round(bs * 0.10);
          updated.billingRate = bs + updated.socialCharge + updated.overhead + updated.allowance + updated.profit;
        }
        return updated;
      })
    );
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const updatedProject: Project = {
        ...project,
        projectName: letterData.projectName,
        scopeOfWork: technicalDoc.bab2Metodologi,
        documentNumber: letterData.docNumber,
        documentDate: letterData.refDate,
        executionDays: Number(letterData.executionDays) || 90,
        validityDays: Number(letterData.validityDays) || 30,
        financials: {
          items: rabItems,
          personnelCostSubtotalIDR: blpTotal,
          nonPersonnelCostSubtotalIDR: blnpTotal,
          directCostSubtotalIDR: directCostTotal,
          ppnPercent: ppnPercent,
          ppnAmountIDR: ppnAmount,
          grandTotalIDR: grandTotal,
          terbilangIDR: terbilangCustom,
        },
      };

      if (onProjectUpdate) {
        onProjectUpdate(updatedProject);
      }

      setSaveNotification("✅ Seluruh perubahan dokumen berhasil disimpan ke database!");
      setTimeout(() => setSaveNotification(null), 4000);
    } catch (e: any) {
      setSaveNotification("❌ Gagal menyimpan dokumen: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadDoc = (docPrefix: string, keyword?: string) => {
    let url = `/api/export-docx?companyId=${company.id}&projectId=${project.id}&docPrefix=${docPrefix}`;
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
    window.open(url, "_blank");
  };

  const formatIDR = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden font-sans">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP MAIN CATEGORY FOLDER SWITCHER (3 Kategori Folder Asli) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-md">
        <div className="flex items-center space-x-2">
          <FolderArchive className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Kategori Berkas:</span>

          {/* Folder 1 */}
          <button
            onClick={() => {
              setActiveCategory("adm_harga");
              setSelectedSubTab("surat");
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              activeCategory === "adm_harga"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-md shadow-cyan-500/10"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>📁 1. Penawaran Adm & Harga</span>
          </button>

          {/* Folder 2 */}
          <button
            onClick={() => {
              setActiveCategory("teknis");
              setSelectedSubTab("teknis_metodologi");
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              activeCategory === "teknis"
                ? "bg-blue-500/20 text-blue-300 border-blue-500/60 shadow-md shadow-blue-500/10"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5 text-blue-400" />
            <span>📁 2. Penawaran Teknis</span>
          </button>

          {/* Folder 3 */}
          <button
            onClick={() => {
              setActiveCategory("prakualifikasi");
              setSelectedSubTab("prak_pakta");
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              activeCategory === "prakualifikasi"
                ? "bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-md shadow-purple-500/10"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
            <span>📁 3. Prakualifikasi & Legalitas</span>
          </button>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center space-x-2">
          {/* Live MS Word Editable Toggle */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all border ${
              isEditMode
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5 text-amber-400" />
            <span>{isEditMode ? "✏️ Mode Edit MS Word ON" : "👁️ Mode Baca / View"}</span>
          </button>

          {/* Save Action */}
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-3 py-1 rounded-md text-xs shadow-md transition-all disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. SUB-DOCUMENT NAVIGATION TABS                               */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center space-x-1 text-xs font-medium">
          
          {/* Subtabs for Adm & Harga */}
          {activeCategory === "adm_harga" && (
            <>
              <button
                onClick={() => setSelectedSubTab("surat")}
                className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                  selectedSubTab === "surat"
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                0. Surat Penawaran Adm
              </button>
              <button
                onClick={() => setSelectedSubTab("rekap")}
                className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                  selectedSubTab === "rekap"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                1. Rekapitulasi Biaya
              </button>
              <button
                onClick={() => setSelectedSubTab("kuantitas")}
                className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                  selectedSubTab === "kuantitas"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                2. Daftar Kuantitas & Harga
              </button>
              <button
                onClick={() => setSelectedSubTab("remunerasi")}
                className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                  selectedSubTab === "remunerasi"
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 font-bold"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                3. Komponen Remunerasi
              </button>
            </>
          )}

          {/* Subtabs for Penawaran Teknis */}
          {activeCategory === "teknis" && (
            <>
              <button
                onClick={() => setSelectedSubTab("teknis_metodologi")}
                className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                  selectedSubTab === "teknis_metodologi"
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/50 font-bold"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                0. Metodologi & Pendekatan
              </button>
              <button
                onClick={() => setSelectedSubTab("teknis_pengalaman")}
                className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                  selectedSubTab === "teknis_pengalaman"
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/50 font-bold"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                1. Pengalaman 10 Tahun
              </button>
              <button
                onClick={() => setSelectedSubTab("teknis_komposisi")}
                className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                  selectedSubTab === "teknis_komposisi"
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/50 font-bold"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                2. Komposisi Tim & Penugasan
              </button>
              <button
                onClick={() => setSelectedSubTab("teknis_cv")}
                className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                  selectedSubTab === "teknis_cv"
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/50 font-bold"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                3. CV Tenaga Ahli (Eri & Dyan)
              </button>
              <button
                onClick={() => setSelectedSubTab("teknis_penugasan")}
                className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                  selectedSubTab === "teknis_penugasan"
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/50 font-bold"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                4. Surat Penugasan Personil
              </button>
            </>
          )}

          {/* Subtabs for Prakualifikasi */}
          {activeCategory === "prakualifikasi" && (
            <>
              <button
                onClick={() => setSelectedSubTab("prak_pakta")}
                className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                  selectedSubTab === "prak_pakta"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                0. Pakta Integritas
              </button>
              <button
                onClick={() => setSelectedSubTab("prak_pernyataan")}
                className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                  selectedSubTab === "prak_pernyataan"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                1. Surat Pernyataan Prakualifikasi
              </button>
              <button
                onClick={() => setSelectedSubTab("prak_formulir")}
                className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                  selectedSubTab === "prak_formulir"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                2. Formulir Isian Kualifikasi
              </button>
              <button
                onClick={() => setSelectedSubTab("prak_legalitas")}
                className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                  selectedSubTab === "prak_legalitas"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                3. Legalitas Badan Usaha
              </button>
              <button
                onClick={() => setSelectedSubTab("prak_pajak")}
                className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                  selectedSubTab === "prak_pajak"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                4. Bukti Kepatuhan Pajak (BPE & SPT)
              </button>
            </>
          )}
        </div>

        {/* e-Stamp Overlay Toggle */}
        <button
          onClick={() => setIsStampOverlayActive(!isStampOverlayActive)}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all border shrink-0 ${
            isStampOverlayActive
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md"
              : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
          }`}
          title="Toggle E-Stamp & Signature Canvas Overlay"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>e-Stamp: {isStampOverlayActive ? "ON" : "OFF"}</span>
        </button>
      </div>

      {/* Notification Banner */}
      {saveNotification && (
        <div className="bg-emerald-950/95 border-b border-emerald-800 p-2 px-4 flex items-center justify-between text-xs text-emerald-300 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{saveNotification}</span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. MS WORD LIVE CANVAS DOCUMENT SHEET                         */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-slate-950/70">
        <div className="w-full max-w-4xl bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-10 shadow-2xl space-y-6 text-xs leading-relaxed relative">
          
          {/* Header Action inside the Sheet */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-300 tracking-wide uppercase">
                {isEditMode ? "📝 Live MS Word Canvas Editor (Klik teks untuk mengedit langsung)" : "👁️ Pratinjau Lembar Dokumen Resmi"}
              </span>
            </div>

            {/* Quick Download Specific DOCX */}
            <button
              onClick={() => {
                if (selectedSubTab === "surat") handleDownloadDoc("0");
                else if (selectedSubTab === "rekap") handleDownloadDoc("1");
                else if (selectedSubTab === "kuantitas") handleDownloadDoc("2");
                else if (selectedSubTab === "remunerasi") handleDownloadDoc("3");
                else if (selectedSubTab === "teknis_metodologi") handleDownloadDoc("0", "metodologi");
                else if (selectedSubTab === "teknis_pengalaman") handleDownloadDoc("1", "pengalaman");
                else if (selectedSubTab === "teknis_komposisi") handleDownloadDoc("2", "kualifikasi");
                else if (selectedSubTab === "teknis_cv") handleDownloadDoc("3", "curriculum");
                else if (selectedSubTab === "teknis_penugasan") handleDownloadDoc("4", "penugasan");
                else handleDownloadDoc("0");
              }}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800 px-3 py-1 rounded text-xs font-bold transition-all shadow-sm"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Download Berkas Resmi</span>
            </button>
          </div>

          {/* --------------------------------------------------------- */}
          {/* EDITABLE KOP SURAT (Letterhead Header)                    */}
          {/* --------------------------------------------------------- */}
          <div className="border-b-2 border-slate-700 pb-4 flex justify-between items-start">
            <div className="space-y-1 flex-1 pr-6">
              {isEditMode ? (
                <>
                  <input
                    type="text"
                    value={letterData.companyName}
                    onChange={(e) => setLetterData({ ...letterData, companyName: e.target.value })}
                    className="text-base font-extrabold text-cyan-400 uppercase tracking-wide bg-slate-950/80 border border-slate-700 rounded px-2 py-0.5 w-full focus:outline-none focus:border-cyan-500 font-sans"
                    title="Edit Nama Perusahaan"
                  />
                  <input
                    type="text"
                    value={letterData.companyAddress}
                    onChange={(e) => setLetterData({ ...letterData, companyAddress: e.target.value })}
                    className="text-[11px] text-slate-300 bg-slate-950/60 border border-slate-800 rounded px-2 py-0.5 w-full focus:outline-none"
                    title="Edit Alamat Perusahaan"
                  />
                  <input
                    type="text"
                    value={letterData.companyContact}
                    onChange={(e) => setLetterData({ ...letterData, companyContact: e.target.value })}
                    className="text-[10px] text-slate-400 bg-slate-950/60 border border-slate-800 rounded px-2 py-0.5 w-full focus:outline-none"
                    title="Edit Kontak Telepon / Email"
                  />
                </>
              ) : (
                <>
                  <h2 className="text-base font-extrabold text-cyan-400 tracking-wide uppercase">
                    {letterData.companyName}
                  </h2>
                  <p className="text-[11px] text-slate-300">{letterData.companyAddress}</p>
                  <p className="text-[10px] text-slate-400">{letterData.companyContact}</p>
                </>
              )}
            </div>

            <div className="text-right">
              {isEditMode ? (
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block font-semibold">No. Dokumen:</label>
                  <input
                    type="text"
                    value={letterData.docNumber}
                    onChange={(e) => setLetterData({ ...letterData, docNumber: e.target.value })}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-cyan-400 w-56 focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>
              ) : (
                <span className="inline-block px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] text-cyan-400 font-mono font-bold">
                  {letterData.docNumber}
                </span>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* FOLDER 1: DOKUMEN PENAWARAN ADMINISTRASI & BIAYA          */}
          {/* ========================================================= */}

          {/* SUBTAB 0: SURAT PENAWARAN */}
          {selectedSubTab === "surat" && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-300">
                    Nomor : <span className="font-mono text-cyan-400">{letterData.docNumber}</span>
                  </p>
                  <p className="text-slate-400">Lampiran : {letterData.lampiran}</p>
                </div>
                <div className="text-right">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={letterData.letterDate}
                      onChange={(e) => setLetterData({ ...letterData, letterDate: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 text-right w-52"
                    />
                  ) : (
                    <p className="text-slate-300">{letterData.letterDate}</p>
                  )}
                </div>
              </div>

              {/* Recipient */}
              <div className="space-y-1 pt-2">
                <p className="text-slate-400">Kepada Yth. :</p>
                {isEditMode ? (
                  <>
                    <input
                      type="text"
                      value={letterData.recipientName}
                      onChange={(e) => setLetterData({ ...letterData, recipientName: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-bold w-full"
                    />
                    <input
                      type="text"
                      value={letterData.recipientCity}
                      onChange={(e) => setLetterData({ ...letterData, recipientCity: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 font-semibold w-64"
                    />
                  </>
                ) : (
                  <>
                    <p className="font-bold text-slate-200">{letterData.recipientName}</p>
                    <p className="font-semibold text-slate-300">di {letterData.recipientCity}</p>
                  </>
                )}
              </div>

              {/* Perihal */}
              <div className="pt-2">
                <p className="text-slate-400">Perihal :</p>
                {isEditMode ? (
                  <input
                    type="text"
                    value={letterData.perihal}
                    onChange={(e) => setLetterData({ ...letterData, perihal: e.target.value })}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-cyan-300 font-bold w-full"
                  />
                ) : (
                  <p className="font-bold text-cyan-300 bg-slate-950/40 p-2 rounded border border-slate-800">
                    {letterData.perihal}
                  </p>
                )}
              </div>

              {/* Paragraphs 1-5 */}
              <div className="space-y-3 pt-3">
                {isEditMode ? (
                  <>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold">Paragraf 1 (Dasar Dokumen Pemilihan):</label>
                      <textarea
                        rows={3}
                        value={letterData.p1}
                        onChange={(e) => setLetterData({ ...letterData, p1: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold">Paragraf 2 (Kepatuhan Ketentuan):</label>
                      <textarea
                        rows={2}
                        value={letterData.p2}
                        onChange={(e) => setLetterData({ ...letterData, p2: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 leading-relaxed"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold">Jangka Waktu Pelaksanaan (Hari):</label>
                        <input
                          type="number"
                          value={letterData.executionDays}
                          onChange={(e) => setLetterData({ ...letterData, executionDays: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold">Masa Berlaku Penawaran (Hari):</label>
                        <input
                          type="number"
                          value={letterData.validityDays}
                          onChange={(e) => setLetterData({ ...letterData, validityDays: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 font-mono font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold">Paragraf 5 (Pernyataan Kesanggupan):</label>
                      <textarea
                        rows={2}
                        value={letterData.p5}
                        onChange={(e) => setLetterData({ ...letterData, p5: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 leading-relaxed"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-justify text-slate-300">{letterData.p1}</p>
                    <p className="text-justify text-slate-300">{letterData.p2}</p>
                    <p className="text-justify text-slate-300">{letterData.p3}</p>
                    <p className="text-justify text-slate-300">{letterData.p4}</p>
                    <p className="text-justify text-slate-300">{letterData.p5}</p>
                  </>
                )}
              </div>

              {/* Signatory Box with e-Meterai */}
              <div className="pt-6 flex justify-end">
                <div className="w-64 text-center space-y-2 relative">
                  <p className="text-xs text-slate-400 font-semibold">{company.legalName}</p>
                  
                  {/* e-Stamp Overlay */}
                  {isStampOverlayActive ? (
                    <div className="py-2 flex justify-center">
                      <div className="border-2 border-dashed border-rose-500/70 bg-rose-950/30 rounded-lg p-2 px-3 text-center shadow-inner flex items-center space-x-2">
                        <ShieldCheck className="h-5 w-5 text-rose-400 shrink-0" />
                        <div className="text-left">
                          <p className="text-[9px] font-mono font-bold text-rose-300 uppercase">DJP e-Meterai</p>
                          <p className="text-[8px] font-mono text-slate-400">Rp 10.000 (Verified)</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-12 flex items-center justify-center text-[10px] text-slate-600 italic">
                      [Tanda Tangan & Cap Basah]
                    </div>
                  )}

                  {isEditMode ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={letterData.signatoryName}
                        onChange={(e) => setLetterData({ ...letterData, signatoryName: e.target.value })}
                        className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-100 font-extrabold text-center w-full"
                      />
                      <input
                        type="text"
                        value={letterData.signatoryRole}
                        onChange={(e) => setLetterData({ ...letterData, signatoryRole: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[10px] text-slate-400 uppercase font-semibold text-center w-full"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="font-extrabold text-slate-100 text-sm">{letterData.signatoryName}</p>
                      <p className="text-[11px] text-slate-400 uppercase font-semibold">{letterData.signatoryRole}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 1: REKAPITULASI BIAYA */}
          {selectedSubTab === "rekap" && (
            <div className="space-y-6">
              <div className="text-center space-y-1 border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold text-slate-100 tracking-wider">REKAPITULASI PENAWARAN BIAYA</h3>
                <p className="text-xs text-cyan-400 font-semibold">{letterData.projectName}</p>
              </div>

              <div className="overflow-x-auto border border-slate-700 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-slate-700 font-bold">
                      <th className="p-3 w-12 text-center">No</th>
                      <th className="p-3">Uraian Komponen Biaya</th>
                      <th className="p-3 text-right w-48">Total Harga (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 text-center font-bold">1</td>
                      <td className="p-3 font-semibold">BIAYA LANGSUNG PERSONIL (BLP)</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-100">{formatIDR(blpTotal)}</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 text-center font-bold">2</td>
                      <td className="p-3 font-semibold">BIAYA LANGSUNG NON PERSONIL (BLNP)</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-100">{formatIDR(blnpTotal)}</td>
                    </tr>
                    <tr className="bg-slate-950/70 font-extrabold text-slate-200">
                      <td className="p-3 text-center"></td>
                      <td className="p-3">JUMLAH (1 + 2)</td>
                      <td className="p-3 text-right font-mono text-cyan-300">{formatIDR(directCostTotal)}</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 text-center font-bold">3</td>
                      <td className="p-3 font-semibold">PPN {ppnPercent}%</td>
                      <td className="p-3 text-right font-mono text-slate-300">{formatIDR(ppnAmount)}</td>
                    </tr>
                    <tr className="bg-emerald-950/50 text-emerald-300 font-black border-t-2 border-emerald-600 text-sm">
                      <td className="p-3 text-center"></td>
                      <td className="p-3 uppercase">TOTAL BIAYA PENAWARAN (TERMASUK PPN)</td>
                      <td className="p-3 text-right font-mono text-emerald-400">{formatIDR(grandTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Terbilang Box */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Terbilang :</p>
                <p className="text-xs text-amber-300 font-serif italic">"{terbilangCustom}"</p>
              </div>
            </div>
          )}

          {/* SUBTAB 2: DAFTAR KUANTITAS DAN HARGA */}
          {selectedSubTab === "kuantitas" && (
            <div className="space-y-5">
              <div className="text-center space-y-1 border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold text-slate-100 tracking-wider">DAFTAR KUANTITAS DAN HARGA</h3>
                <p className="text-xs text-amber-400 font-semibold">{letterData.projectName}</p>
              </div>

              <div className="overflow-x-auto border border-slate-700 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-slate-700 font-bold">
                      <th className="p-2.5 w-10 text-center">No</th>
                      <th className="p-2.5 w-24">Kategori</th>
                      <th className="p-2.5">Uraian Komponen</th>
                      <th className="p-2.5 w-20 text-center">Volume</th>
                      <th className="p-2.5 w-20 text-center">Satuan</th>
                      <th className="p-2.5 w-32 text-right">Harga Satuan (Rp)</th>
                      <th className="p-2.5 w-32 text-right">Subtotal (Rp)</th>
                      <th className="p-2.5 w-12 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {rabItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-800/40">
                        <td className="p-2 text-center font-bold">{idx + 1}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.category === "Personnel"
                                ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                                : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            }`}
                          >
                            {item.category === "Personnel" ? "Personel" : "Non-Personel"}
                          </span>
                        </td>
                        <td className="p-2">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleRabItemUpdate(item.id, "description", e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 w-full"
                            />
                          ) : (
                            <span className="font-semibold text-slate-200">{item.description}</span>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {isEditMode ? (
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleRabItemUpdate(item.id, "quantity", Number(e.target.value))}
                              className="bg-slate-950 border border-slate-700 rounded px-1 py-1 text-xs text-cyan-300 text-center w-14 font-mono font-bold"
                            />
                          ) : (
                            <span className="font-mono">{item.quantity}</span>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleRabItemUpdate(item.id, "unit", e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded px-1 py-1 text-xs text-slate-300 text-center w-16"
                            />
                          ) : (
                            <span>{item.unit}</span>
                          )}
                        </td>
                        <td className="p-2 text-right">
                          {isEditMode ? (
                            <input
                              type="number"
                              value={item.billingRateIDR}
                              onChange={(e) => handleRabItemUpdate(item.id, "billingRateIDR", Number(e.target.value))}
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-emerald-300 text-right w-28 font-mono"
                            />
                          ) : (
                            <span className="font-mono">{formatIDR(item.billingRateIDR)}</span>
                          )}
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-slate-100">
                          {formatIDR(item.subtotalIDR)}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleDeleteRabItem(item.id)}
                            className="p-1 text-rose-400 hover:bg-rose-500/20 rounded transition-all"
                            title="Hapus Baris Komponen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Toolbar */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleAddRabItem("Personnel")}
                  className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Tambah Baris Personel</span>
                </button>
                <button
                  onClick={() => handleAddRabItem("Non-Personnel")}
                  className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Tambah Baris Non-Personel</span>
                </button>
              </div>

              {/* Real-time Summary Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Biaya Langsung Personil (BLP):</span>
                  <span className="font-semibold text-slate-200">{formatIDR(blpTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Biaya Non-Personil (BLNP):</span>
                  <span className="font-semibold text-slate-200">{formatIDR(blnpTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800 font-semibold">
                  <span>Total Biaya Langsung:</span>
                  <span className="text-cyan-300 font-mono font-bold">{formatIDR(directCostTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>PPN {ppnPercent}%:</span>
                  <span className="font-mono">{formatIDR(ppnAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 pt-2 border-t border-slate-800 text-sm font-extrabold">
                  <span>GRAND TOTAL BIAYA:</span>
                  <span className="font-mono">{formatIDR(grandTotal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 3: KOMPONEN REMUNERASI */}
          {selectedSubTab === "remunerasi" && (
            <div className="space-y-5">
              <div className="text-center space-y-1 border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold text-slate-100 tracking-wider">
                  RINCIAN KOMPONEN REMUNERASI TENAGA AHLI
                </h3>
                <p className="text-xs text-indigo-400 font-semibold">{letterData.projectName}</p>
              </div>

              <div className="overflow-x-auto border border-slate-700 rounded-lg">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-slate-700 font-bold">
                      <th className="p-2 w-8 text-center">No</th>
                      <th className="p-2 w-48">Posisi Jabatan</th>
                      <th className="p-2 w-32">Gaji Dasar (Rp)</th>
                      <th className="p-2 w-24">Beban Personil</th>
                      <th className="p-2 w-24">Beban Umum</th>
                      <th className="p-2 w-24">Tunjangan</th>
                      <th className="p-2 w-24">Keuntungan</th>
                      <th className="p-2 text-right w-36">Total Billing Rate (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {remunerationItems.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-slate-800/40">
                        <td className="p-2 text-center font-bold">{idx + 1}</td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={r.position}
                            onChange={(e) => handleRemunerationUpdate(r.id, "position", e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-100 w-full font-bold"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={r.basicSalary}
                            onChange={(e) => handleRemunerationUpdate(r.id, "basicSalary", Number(e.target.value))}
                            className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-cyan-300 font-mono w-full"
                          />
                        </td>
                        <td className="p-2 font-mono">Rp {r.socialCharge.toLocaleString("id-ID")}</td>
                        <td className="p-2 font-mono">Rp {r.overhead.toLocaleString("id-ID")}</td>
                        <td className="p-2 font-mono">Rp {r.allowance.toLocaleString("id-ID")}</td>
                        <td className="p-2 font-mono">Rp {r.profit.toLocaleString("id-ID")}</td>
                        <td className="p-2 text-right font-mono font-bold text-emerald-400">
                          Rp {r.billingRate.toLocaleString("id-ID")} / OB
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* FOLDER 2: DOKUMEN PENAWARAN TEKNIS                        */}
          {/* ========================================================= */}

          {/* SUBTAB 0 TEKNIS: METODOLOGI & PENDEKATAN */}
          {selectedSubTab === "teknis_metodologi" && (
            <div className="space-y-4">
              <div className="text-center border-b border-slate-800 pb-3 space-y-1">
                <h3 className="text-sm font-extrabold text-blue-400 tracking-wider">
                  DOKUMEN PENAWARAN TEKNIS - METODOLOGI DAN PENDEKATAN
                </h3>
                <p className="text-xs text-slate-300 font-semibold">{company.legalName}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-bold">BAB I: Data Organisasi & Perusahaan:</label>
                  <textarea
                    rows={3}
                    value={technicalDoc.bab1DataOrg}
                    onChange={(e) => setTechnicalDoc({ ...technicalDoc, bab1DataOrg: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-xs text-slate-200 leading-relaxed font-sans"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-bold">BAB II: Pendekatan & Metodologi Pelaksanaan:</label>
                  <textarea
                    rows={4}
                    value={technicalDoc.bab2Metodologi}
                    onChange={(e) => setTechnicalDoc({ ...technicalDoc, bab2Metodologi: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-xs text-slate-200 leading-relaxed font-sans"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-bold">BAB III: Tanggapan Terhadap KAK (Kerangka Acuan Kerja):</label>
                  <textarea
                    rows={2}
                    value={technicalDoc.bab3TanggapanKAK}
                    onChange={(e) => setTechnicalDoc({ ...technicalDoc, bab3TanggapanKAK: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-xs text-slate-200 leading-relaxed font-sans"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-bold">BAB IV: Jadwal Pelaksanaan Pekerjaan:</label>
                  <textarea
                    rows={2}
                    value={technicalDoc.bab4Jadwal}
                    onChange={(e) => setTechnicalDoc({ ...technicalDoc, bab4Jadwal: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-xs text-slate-200 leading-relaxed font-sans"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 1 TEKNIS: PENGALAMAN 10 TAHUN */}
          {selectedSubTab === "teknis_pengalaman" && (
            <div className="space-y-4">
              <div className="text-center border-b border-slate-800 pb-3 space-y-1">
                <h3 className="text-sm font-extrabold text-blue-400 tracking-wider">
                  DAFTAR PENGALAMAN KERJA 10 (SEPULUH) TAHUN TERAKHIR
                </h3>
                <p className="text-xs text-slate-400">{company.legalName}</p>
              </div>

              <div className="overflow-x-auto border border-slate-700 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-slate-700 font-bold">
                      <th className="p-2.5 w-10 text-center">No</th>
                      <th className="p-2.5 w-48">Pengguna Jasa</th>
                      <th className="p-2.5">Nama Paket Pekerjaan</th>
                      <th className="p-2.5 w-32">Periode</th>
                      <th className="p-2.5 w-32 text-right">Nilai Kontrak (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {companyExpList.map((exp, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-2.5 text-center font-bold">{exp.no}</td>
                        <td className="p-2.5 font-semibold text-slate-200">{exp.clientName}</td>
                        <td className="p-2.5">
                          <p className="font-bold text-cyan-300">{exp.packageName}</p>
                          <p className="text-[10px] text-slate-400">{exp.scope}</p>
                        </td>
                        <td className="p-2.5 text-slate-300 font-mono text-[10px]">{exp.period}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-400">
                          Rp {exp.contractValue.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBTAB 2 TEKNIS: KOMPOSISI TIM & PENUGASAN */}
          {selectedSubTab === "teknis_komposisi" && (
            <div className="space-y-4">
              <div className="text-center border-b border-slate-800 pb-3 space-y-1">
                <h3 className="text-sm font-extrabold text-blue-400 tracking-wider">
                  KOMPOSISI TIM DAN PENUGASAN TENAGA AHLI
                </h3>
                <p className="text-xs text-slate-400">{letterData.projectName}</p>
              </div>

              <div className="overflow-x-auto border border-slate-700 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-slate-700 font-bold">
                      <th className="p-2.5 w-40">Nama Personil</th>
                      <th className="p-2.5 w-36">Lingkup Keahlian</th>
                      <th className="p-2.5 w-36">Posisi Diusulkan</th>
                      <th className="p-2.5">Uraian Tugas Pekerjaan</th>
                      <th className="p-2.5 w-20 text-center">Durasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {teamComposition.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/40">
                        <td className="p-2.5 font-bold text-slate-100">{t.name}</td>
                        <td className="p-2.5 text-slate-300">{t.expertise}</td>
                        <td className="p-2.5 font-bold text-cyan-300">{t.position}</td>
                        <td className="p-2.5 text-[11px] text-slate-300 leading-relaxed">{t.jobDesc}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-amber-300">{t.manMonths} Bulan</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBTAB 3 TEKNIS: CV TENAGA AHLI */}
          {selectedSubTab === "teknis_cv" && (
            <div className="space-y-6">
              <div className="text-center border-b border-slate-800 pb-3 space-y-1">
                <h3 className="text-sm font-extrabold text-blue-400 tracking-wider">
                  CURRICULUM VITAE (CV) DAFTAR RIWAYAT HIDUP TENAGA AHLI
                </h3>
              </div>

              {/* CV Card 1: Eri Nur Sofa */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-cyan-300">Eri Nur Sofa, S.Kom</h4>
                    <p className="text-[11px] text-slate-400">Posisi: Asisten Profesional Staf / Quality Engineer / Programmer</p>
                  </div>
                  <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded text-[10px] font-bold">
                    S1 Teknik Informatika USM (Lulus 2019)
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-1.5">
                  <p>• <strong>Tempat / Tgl Lahir:</strong> Semarang, 22 Agustus 1992</p>
                  <p>• <strong>Status Kepegawaian:</strong> Tenaga Kontrak Profesional CV STIGMA PRATAMA</p>
                  <p>• <strong>Riwayat Proyek Nyata:</strong></p>
                  <div className="pl-4 space-y-1 text-[11px] text-slate-400">
                    <p>1. <em>Pengembangan Aplikasi SIDAKSOS</em> - Dinas Sosial Kota Semarang (Ref: B.1179/027.1/III/2020)</p>
                    <p>2. <em>Pemeliharaan Software & Hardware Sistem Informasi</em> - DPM-PTSP Kota Semarang (Ref: 08/SI/PEMEL/II/2019)</p>
                  </div>
                </div>
              </div>

              {/* CV Card 2: Dyan Sinung Prabowo */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-amber-300">Dyan Sinung Prabowo, S.Kom</h4>
                    <p className="text-[11px] text-slate-400">Posisi: Operator Komputer / Tenaga Administrasi</p>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded text-[10px] font-bold">
                    SMK Negeri 1 Rembang
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-1.5">
                  <p>• <strong>Tempat / Tgl Lahir:</strong> Rembang, 25 September 2000</p>
                  <p>• <strong>Riwayat Proyek Nyata:</strong> <em>Sinergitas Sistem Pelayanan Perizinan</em> - DPM-PTSP Kota Semarang</p>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 4 TEKNIS: SURAT PENUGASAN PERSONIL */}
          {selectedSubTab === "teknis_penugasan" && (
            <div className="space-y-4">
              <div className="text-center border-b border-slate-800 pb-3 space-y-1">
                <h3 className="text-sm font-extrabold text-blue-400 tracking-wider">
                  SURAT PERNYATAAN KESEDIAAN UNTUK DITUGASKAN
                </h3>
                <p className="text-xs text-slate-400">No: 1 / ST / IOTMOTION / IV / 2026 & No: 2 / ST / IOTMOTION / IV / 2026</p>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>Yang bertanda tangan di bawah ini :</p>
                <div className="pl-4 space-y-1 font-semibold text-slate-200">
                  <p>1. Nama : <strong>Affandy Ichsan, S.Kom.</strong> (Jabatan: Team Leader / Ahli Kecerdasan Buatan)</p>
                  <p>2. Nama : <strong>Eri Nur Sofa, S.Kom.</strong> (Jabatan: Tenaga Ahli Sistem Keamanan / Programmer)</p>
                </div>
                <p className="text-justify pt-2">
                  Dengan ini menyatakan bahwa kami bersedia untuk melaksanakan paket pekerjaan <strong>{letterData.projectName}</strong> untuk Penyedia Barang/Jasa <strong>{company.legalName}</strong> selama jangka waktu 120 (seratus dua puluh) hari kalender atau 4 (empat) bulan penuh.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* FOLDER 3: DOKUMEN PRAKUALIFIKASI & LEGALITAS              */}
          {/* ========================================================= */}

          {/* SUBTAB 0 PRAKUALIFIKASI: PAKTA INTEGRITAS */}
          {selectedSubTab === "prak_pakta" && (
            <div className="space-y-5">
              <div className="text-center border-b border-slate-800 pb-3 space-y-1">
                <h3 className="text-sm font-extrabold text-purple-400 tracking-wider">PAKTA INTEGRITAS</h3>
                <p className="text-xs text-slate-300 font-semibold">{company.legalName}</p>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>Saya yang bertanda tangan di bawah ini, dalam rangka pengadaan <strong>{letterData.projectName}</strong> dengan ini menyatakan bahwa :</p>
                <div className="space-y-2 pl-4">
                  <p>1. {prakualifikasiData.paktaPoint1}</p>
                  <p>2. {prakualifikasiData.paktaPoint2}</p>
                  <p>3. {prakualifikasiData.paktaPoint3}</p>
                  <p>4. {prakualifikasiData.paktaPoint4}</p>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 1 PRAKUALIFIKASI: SURAT PERNYATAAN */}
          {selectedSubTab === "prak_pernyataan" && (
            <div className="space-y-5">
              <div className="text-center border-b border-slate-800 pb-3 space-y-1">
                <h3 className="text-sm font-extrabold text-purple-400 tracking-wider">
                  SURAT PERNYATAAN KUALIFIKASI
                </h3>
                <p className="text-xs text-slate-300 font-semibold">{company.legalName}</p>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>Yang bertanda tangan di bawah ini :</p>
                <div className="pl-4 space-y-1 font-semibold text-slate-200">
                  <p>Nama : {director.fullName}</p>
                  <p>Jabatan : {director.position}</p>
                  <p>Badan Usaha : {company.legalName}</p>
                </div>
                <p className="text-justify pt-2">
                  Menyatakan dengan sesungguhnya bahwa badan usaha kami beserta pengurusnya berstatus aktif, tidak sedang dalam sanksi daftar hitam, tidak bangkrut, dan sanggup memenuhi seluruh persyaratan kualifikasi teknis maupun administratif yang ditentukan.
                </p>
              </div>
            </div>
          )}

          {/* SUBTAB 2 PRAKUALIFIKASI: FORMULIR ISIAN */}
          {selectedSubTab === "prak_formulir" && (
            <div className="space-y-5">
              <div className="text-center border-b border-slate-800 pb-3 space-y-1">
                <h3 className="text-sm font-extrabold text-purple-400 tracking-wider">
                  FORMULIR ISIAN KUALIFIKASI BADAN USAHA
                </h3>
                <p className="text-xs text-slate-300 font-semibold">{company.legalName}</p>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Nama Badan Usaha:</p>
                    <p className="text-xs text-slate-100 font-bold">{company.legalName}</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Bentuk Usaha:</p>
                    <p className="text-xs text-cyan-300 font-bold">{company.businessType}</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Nomor Induk Berusaha (NIB):</p>
                    <p className="text-xs font-mono text-emerald-300 font-bold">0220009182736</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">NPWP / NITKU:</p>
                    <p className="text-xs font-mono text-emerald-300 font-bold">{prakualifikasiData.npwpNomor}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 3 PRAKUALIFIKASI: LEGALITAS BADAN USAHA */}
          {selectedSubTab === "prak_legalitas" && (
            <div className="space-y-5">
              <div className="text-center border-b border-slate-800 pb-3 space-y-1">
                <h3 className="text-sm font-extrabold text-purple-400 tracking-wider">
                  LEGALITAS BADAN USAHA & PERIZINAN BERUSAHA
                </h3>
                <p className="text-xs text-slate-300 font-semibold">{company.legalName}</p>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <p className="text-slate-400 font-semibold">1. Akta Pendirian & Pengesahan Kemenkumham:</p>
                  <p className="text-slate-200 font-bold pl-4">• Akta Notaris Pendirian CV STIGMA PRATAMA (Direktur: BUDI SANTOSO, S.Sos)</p>
                  
                  <p className="text-slate-400 font-semibold pt-2">2. Nomor Induk Berusaha (NIB OSS RBA):</p>
                  <p className="text-slate-200 font-bold pl-4 font-mono">• NIB: 0220009182736 (KBLI: Konsultansi IT & Perdagangan)</p>

                  <p className="text-slate-400 font-semibold pt-2">3. Rekening Koran Bank Operasional:</p>
                  <p className="text-slate-200 font-bold pl-4 font-mono">• Bank BNI Cabang Semarang (No. Rekening: 0392-817263-001 a.n CV STIGMA PRATAMA)</p>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 4 PRAKUALIFIKASI: BUKTI KEPATUHAN PAJAK */}
          {selectedSubTab === "prak_pajak" && (
            <div className="space-y-5">
              <div className="text-center border-b border-slate-800 pb-3 space-y-1">
                <h3 className="text-sm font-extrabold text-purple-400 tracking-wider">
                  BUKTI KEPATUHAN PAJAK (SPT TAHUNAN & BPE BULANAN 2026)
                </h3>
                <p className="text-xs text-slate-300 font-semibold">KPP Pratama Semarang</p>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-bold text-slate-200">SPT Tahunan Badan Formulir 1771</span>
                    <span className="text-emerald-400 font-mono font-bold text-[11px]">VERIFIED (DJP Online)</span>
                  </div>
                  <p className="text-slate-300">• <strong>No. Tanda Terima Elektronik:</strong> <span className="font-mono text-cyan-300">{prakualifikasiData.spt1771Nomor}</span></p>
                  <p className="text-slate-300">• <strong>Tahun Pajak:</strong> {prakualifikasiData.sptTahun}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-bold text-slate-200">Bukti Penerimaan Elektronik (BPE) Bulanan 2026</span>
                    <span className="text-emerald-400 font-mono font-bold text-[11px]">3 Bulan Terakhir Terverifikasi</span>
                  </div>
                  <div className="pl-3 space-y-1 text-slate-300">
                    <p>1. BPE Masa Januari 2026 (Berkas: <code>4.a BPE Januari 2026 - CV STIGMA PRATAMA.jpg</code>)</p>
                    <p>2. BPE Masa Februari 2026 (Berkas: <code>4.b BPE Februari 2026 - CV STIGMA PRATAMA.jpg</code>)</p>
                    <p>3. BPE Masa Maret 2026 (Berkas: <code>4.c BPE Maret 2026 - CV STIGMA PRATAMA.jpg</code>)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
