"use client";

import React, { useState, useEffect, useRef } from "react";
import { Company, Project, Person, FinancialItem } from "@/types/procurement";
import { formatIDR } from "@/lib/financialEngine";
import { updateProjectDetails } from "@/lib/supabaseService";
import {
  FileText,
  CheckCircle2,
  ShieldCheck,
  Printer,
  Edit3,
  Eye,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Building2,
  DollarSign,
  Calculator,
  Download,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  List,
  Sparkles,
} from "lucide-react";

interface DocumentViewerProps {
  company: Company;
  project: Project;
  selectedPerson?: Person;
  onProjectUpdate?: (updatedProject: Project) => void;
}

export type DocSubTab = "surat" | "rekap" | "kuantitas" | "remunerasi" | "teknis" | "cv";

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  company,
  project,
  selectedPerson,
  onProjectUpdate,
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<DocSubTab>("surat");
  const [isEditMode, setIsEditMode] = useState(true); // Default to live editable MS Word mode
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isStampOverlayActive, setIsStampOverlayActive] = useState(true);

  const director = company.directors.find((d) => d.isSignatory) || company.directors[0];

  // MS Word-like Universal Live State for Surat Penawaran
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

  // MS Word-like Live State for RAB Financial Items
  const [rabItems, setRabItems] = useState<FinancialItem[]>(project.financials?.items || []);
  const [ppnPercent, setPpnPercent] = useState<number>(project.financials?.ppnPercent || 11);
  const [terbilangCustom, setTerbilangCustom] = useState<string>(
    project.financials?.terbilangIDR || "Sembilan Puluh Sembilan Juta Dua Ratus Delapan Puluh Sembilan Ribu Lima Ratus Rupiah"
  );

  // MS Word-like Live State for Remuneration Components
  const [remunerationItems, setRemunerationItems] = useState([
    {
      id: "rem-1",
      position: "Team Leader / Ahli Software Architect",
      personName: "Affandi Ichsan, S.Kom",
      basicSalary: 3784500,
      socialCharge: 1324575,
      overhead: 2270700,
      allowance: 750000,
      profit: 745225,
      billingRate: 8875000,
    },
    {
      id: "rem-2",
      position: "Tenaga Ahli Sistem Integrator / IoT",
      personName: "Budi Santoso, S.T.",
      basicSalary: 3250000,
      socialCharge: 1137500,
      overhead: 1950000,
      allowance: 650000,
      profit: 642500,
      billingRate: 7630000,
    },
  ]);

  // MS Word-like Live State for Technical Proposal
  const [technicalScope, setTechnicalScope] = useState({
    title: project.projectName,
    scope: project.scopeOfWork || "Pengembangan telemetry IoT sensor, monitoring realtime cloud dashboard, dan implementasi automated logic controller.",
    methodology: "Pekerjaan dilaksanakan menggunakan pendekatan Agile Engineering Framework, pengujian komprehensif bertahap, kalibrasi sensor presisi tinggi, dan pelatihan transfer knowledge bagi operator dinas.",
    schedule: "Minggu 1-4: Analisis & Desain Arsitektur; Minggu 5-8: Perakitan Hardware & Firmware; Minggu 9-12: Integrasi Cloud Dashboard & Uji Terima BAST.",
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
    setTerbilangCustom(project.financials?.terbilangIDR || prevTerbilang(project.financials?.grandTotalIDR || 0));
  }, [project, company]);

  function prevTerbilang(num: number): string {
    return project.financials?.terbilangIDR || "Sembilan Puluh Sembilan Juta Tiga Ratus Empat Puluh Lima Ribu Rupiah";
  }

  // Financial Recalculations
  const blpTotal = rabItems
    .filter((i) => i.category === "Personnel")
    .reduce((sum, i) => sum + (Number(i.subtotalIDR) || 0), 0);

  const blnpTotal = rabItems
    .filter((i) => i.category === "Non-Personnel")
    .reduce((sum, i) => sum + (Number(i.subtotalIDR) || 0), 0);

  const directCostTotal = blpTotal + blnpTotal;
  const ppnAmount = Math.round((directCostTotal * ppnPercent) / 100);
  const grandTotal = directCostTotal + ppnAmount;

  // Handle RAB item change
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

  const handleAddRabItem = (category: "Personnel" | "Non-Personnel" = "Personnel") => {
    const newItem: FinancialItem = {
      id: `rab-item-${Date.now()}`,
      category,
      description: category === "Personnel" ? "Tenaga Ahli Baru / Konsultan Spesialis" : "Perangkat Operasional & Peralatan Kerja",
      quantity: 1,
      unit: category === "Personnel" ? "OB" : "Paket",
      durationMonths: 1,
      billingRateIDR: category === "Personnel" ? 12000000 : 5000000,
      subtotalIDR: category === "Personnel" ? 12000000 : 5000000,
    };
    setRabItems((prev) => [...prev, newItem]);
  };

  const handleDeleteRabItem = (id: string) => {
    setRabItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleRemunerationUpdate = (id: string, field: string, val: any) => {
    setRemunerationItems((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated: any = { ...r, [field]: val };
        if (field === "basicSalary") {
          const basic = Number(val) || 0;
          updated.socialCharge = Math.round(basic * 0.35);
          updated.overhead = Math.round(basic * 0.6);
          updated.allowance = Math.round(basic * 0.2);
          updated.profit = Math.round((basic + updated.socialCharge + updated.overhead) * 0.1);
          updated.billingRate = basic + updated.socialCharge + updated.overhead + updated.allowance + updated.profit;
        }
        return updated;
      })
    );
  };

  // Universal Save to Supabase & State
  const handleSaveAll = async () => {
    setIsSaving(true);
    const updatedProjectPayload: Project = {
      ...project,
      projectName: letterData.projectName,
      clientName: letterData.recipientName,
      documentNumber: letterData.docNumber,
      procurementRefNo: letterData.refNumber,
      executionDays: letterData.executionDays,
      validityDays: letterData.validityDays,
      scopeOfWork: technicalScope.scope,
      financials: {
        items: rabItems,
        personnelCostSubtotalIDR: blpTotal,
        nonPersonnelCostSubtotalIDR: blnpTotal,
        directCostSubtotalIDR: directCostTotal,
        ppnPercent,
        ppnAmountIDR: ppnAmount,
        grandTotalIDR: grandTotal,
        terbilangIDR: terbilangCustom,
      },
    };

    const success = await updateProjectDetails(project.id, updatedProjectPayload);
    setIsSaving(false);

    if (onProjectUpdate) {
      onProjectUpdate(updatedProjectPayload);
    }

    setSaveNotification(
      success
        ? "✅ Semua pengeditan dokumen Word berhasil disimpan ke Database Supabase!"
        : "✅ Pengeditan dokumen disimpan ke sesi aktif."
    );
    setTimeout(() => setSaveNotification(null), 3500);
  };

  const handleReset = () => {
    setLetterData({
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
      signatoryRole: director.position,
    });
    setRabItems(project.financials?.items || []);
    setSaveNotification("Form dikembalikan ke data awal.");
    setTimeout(() => setSaveNotification(null), 2500);
  };

  const handleDownloadDoc = (prefix: "0" | "1" | "2" | "3") => {
    window.open(
      `/api/export-docx?companyId=${company.id}&projectId=${project.id}&docPrefix=${prefix}`,
      "_blank"
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden font-sans">
      {/* ------------------------------------------------------------- */}
      {/* MS Word Style Ribbon Toolbar                                  */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-950 border-b border-slate-800 p-2 px-4 flex items-center justify-between shadow-md">
        {/* Document Tabs */}
        <div className="flex items-center space-x-1 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setSelectedSubTab("surat")}
            className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
              selectedSubTab === "surat"
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40 font-bold shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            0. Surat Penawaran
          </button>
          <button
            onClick={() => setSelectedSubTab("rekap")}
            className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
              selectedSubTab === "rekap"
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 font-bold shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            1. Rekapitulasi Biaya
          </button>
          <button
            onClick={() => setSelectedSubTab("kuantitas")}
            className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
              selectedSubTab === "kuantitas"
                ? "bg-amber-500/15 text-amber-300 border-amber-500/40 font-bold shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            2. Kuantitas & Harga
          </button>
          <button
            onClick={() => setSelectedSubTab("remunerasi")}
            className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
              selectedSubTab === "remunerasi"
                ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/40 font-bold shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            3. Remunerasi Personel
          </button>
          <button
            onClick={() => setSelectedSubTab("teknis")}
            className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
              selectedSubTab === "teknis"
                ? "bg-blue-500/15 text-blue-300 border-blue-500/40 font-bold"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            4. Metodologi Teknis
          </button>
        </div>

        {/* Action Buttons */}
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
            {isEditMode ? (
              <>
                <Edit3 className="h-3.5 w-3.5 text-amber-400" />
                <span>✏️ MS Word Live Edit ON</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 text-cyan-400" />
                <span>👁️ Mode Baca / View</span>
              </>
            )}
          </button>

          {/* e-Stamp Overlay Toggle */}
          <button
            onClick={() => setIsStampOverlayActive(!isStampOverlayActive)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all border ${
              isStampOverlayActive
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
            }`}
            title="Toggle E-Stamp & Signature Canvas Overlay"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>e-Stamp: {isStampOverlayActive ? "ON" : "OFF"}</span>
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

          {/* Print Action */}
          <button
            onClick={() => window.print()}
            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
            title="Cetak Lembar Dokumen"
          >
            <Printer className="h-3.5 w-3.5" />
          </button>
        </div>
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
      {/* MS Word Canvas Editor Sheet                                   */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-slate-950/70">
        <div className="w-full max-w-4xl bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-10 shadow-2xl space-y-6 text-xs leading-relaxed relative">
          
          {/* Header Action inside the Sheet */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-300 tracking-wide uppercase">
                {isEditMode ? "📝 Canvas Editor Interaktif (Klik teks langsung untuk mengedit seperti MS Word)" : "👁️ Pratinjau Lembar Dokumen Resmi"}
              </span>
            </div>

            {/* Quick Download Specific DOCX */}
            <button
              onClick={() => {
                if (selectedSubTab === "surat") handleDownloadDoc("0");
                else if (selectedSubTab === "rekap") handleDownloadDoc("1");
                else if (selectedSubTab === "kuantitas") handleDownloadDoc("2");
                else if (selectedSubTab === "remunerasi") handleDownloadDoc("3");
                else handleDownloadDoc("0");
              }}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800 px-3 py-1 rounded text-xs font-bold transition-all shadow-sm"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Download Berkas .docx</span>
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
          {/* SUBTAB 0: SURAT PENAWARAN ADMINISTRASI                    */}
          {/* ========================================================= */}
          {selectedSubTab === "surat" && (
            <div className="space-y-5 font-sans text-slate-200 leading-relaxed text-xs">
              {/* Header Letter Meta (Nomor, Lampiran, Tanggal) */}
              <div className="flex justify-between items-start text-slate-300">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-400 w-20">Nomor:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={letterData.docNumber}
                        onChange={(e) => setLetterData({ ...letterData, docNumber: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-cyan-400 font-mono font-bold"
                      />
                    ) : (
                      <span className="font-mono text-cyan-400 font-bold">{letterData.docNumber}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-400 w-20">Lampiran:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={letterData.lampiran}
                        onChange={(e) => setLetterData({ ...letterData, lampiran: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200"
                      />
                    ) : (
                      <span>{letterData.lampiran}</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={letterData.letterDate}
                      onChange={(e) => setLetterData({ ...letterData, letterDate: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200 text-right"
                    />
                  ) : (
                    <span>{letterData.letterDate}</span>
                  )}
                </div>
              </div>

              {/* Recipient Block */}
              <div className="pt-2 space-y-1">
                <p className="text-slate-400">Kepada Yth. :</p>
                {isEditMode ? (
                  <div className="space-y-1 pl-4">
                    <input
                      type="text"
                      value={letterData.recipientName}
                      onChange={(e) => setLetterData({ ...letterData, recipientName: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-bold text-slate-100 w-full"
                    />
                    <p className="text-slate-400 text-[11px]">di</p>
                    <input
                      type="text"
                      value={letterData.recipientCity}
                      onChange={(e) => setLetterData({ ...letterData, recipientCity: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs tracking-widest text-slate-300 font-semibold"
                    />
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-slate-100 pl-4">{letterData.recipientName}</p>
                    <p className="text-slate-400 pl-4">di</p>
                    <p className="pl-8 font-semibold tracking-widest text-slate-300">{letterData.recipientCity}</p>
                  </>
                )}
              </div>

              {/* Perihal */}
              <div className="pt-2 border-t border-b border-slate-800 py-2 flex items-center space-x-2">
                <span className="font-semibold text-slate-400">Perihal :</span>
                {isEditMode ? (
                  <input
                    type="text"
                    value={letterData.perihal}
                    onChange={(e) => setLetterData({ ...letterData, perihal: e.target.value })}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-bold text-slate-100 flex-1"
                  />
                ) : (
                  <span className="font-bold text-slate-100">{letterData.perihal}</span>
                )}
              </div>

              {/* Paragraf 1 (Pembuka & Nilai Penawaran) */}
              <div className="space-y-1">
                {isEditMode ? (
                  <div className="space-y-2 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                    <label className="text-[10px] text-amber-400 font-bold block">Paragraf 1 (Uraian & Rujukan Dokumen Pemilihan):</label>
                    <textarea
                      rows={4}
                      value={letterData.p1}
                      onChange={(e) => setLetterData({ ...letterData, p1: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-100 leading-relaxed focus:outline-none"
                    />
                    <div className="flex items-center space-x-2 pt-1">
                      <span className="text-[11px] text-slate-400">Nilai Grand Total:</span>
                      <span className="text-emerald-400 font-bold font-mono">{formatIDR(grandTotal)}</span>
                      <span className="text-[11px] text-slate-400 italic">({terbilangCustom})</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-justify leading-relaxed">
                    {letterData.p1} sebesar <span className="text-emerald-400 font-bold">{formatIDR(grandTotal)}</span> (<em>{terbilangCustom}</em>) sudah termasuk pajak yang berlaku.
                  </p>
                )}
              </div>

              {/* Paragraf 2 */}
              <div className="space-y-1">
                {isEditMode ? (
                  <textarea
                    rows={2}
                    value={letterData.p2}
                    onChange={(e) => setLetterData({ ...letterData, p2: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 leading-relaxed focus:outline-none"
                  />
                ) : (
                  <p className="text-justify leading-relaxed">{letterData.p2}</p>
                )}
              </div>

              {/* Paragraf 3 (Jangka Waktu Pelaksanaan) */}
              <div className="space-y-1">
                {isEditMode ? (
                  <div className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-300">Kami akan melaksanakan pekerjaan dengan jangka waktu selama:</span>
                    <input
                      type="number"
                      value={letterData.executionDays}
                      onChange={(e) =>
                        setLetterData({
                          ...letterData,
                          executionDays: Number(e.target.value),
                          p3: `Kami akan melaksanakan pekerjaan tersebut dengan jangka waktu pelaksanaan pekerjaan selama ${e.target.value} hari kalender.`,
                        })
                      }
                      className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-cyan-300 font-bold text-center"
                    />
                    <span className="text-slate-300 font-semibold">hari kalender.</span>
                  </div>
                ) : (
                  <p className="text-justify leading-relaxed">{letterData.p3}</p>
                )}
              </div>

              {/* Paragraf 4 (Masa Berlaku Penawaran) */}
              <div className="space-y-1">
                {isEditMode ? (
                  <div className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-300">Penawaran ini berlaku selama:</span>
                    <input
                      type="number"
                      value={letterData.validityDays}
                      onChange={(e) =>
                        setLetterData({
                          ...letterData,
                          validityDays: Number(e.target.value),
                          p4: `Penawaran ini berlaku selama ${e.target.value} hari kalender sejak tanggal surat penawaran ini. Surat Penawaran beserta lampirannya kami sampaikan sebanyak 1 (satu) rangkap dokumen asli.`,
                        })
                      }
                      className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-cyan-300 font-bold text-center"
                    />
                    <span className="text-slate-300 font-semibold">hari kalender sejak tanggal surat.</span>
                  </div>
                ) : (
                  <p className="text-justify leading-relaxed">{letterData.p4}</p>
                )}
              </div>

              {/* Paragraf 5 */}
              <div className="space-y-1">
                {isEditMode ? (
                  <textarea
                    rows={2}
                    value={letterData.p5}
                    onChange={(e) => setLetterData({ ...letterData, p5: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 leading-relaxed focus:outline-none"
                  />
                ) : (
                  <p className="text-justify leading-relaxed">{letterData.p5}</p>
                )}
              </div>

              {/* Signatory Box with Canvas e-Stamp Overlay */}
              <div className="pt-8 flex justify-end">
                <div className="text-center space-y-12 min-w-[240px] relative">
                  <p className="font-bold text-slate-200 uppercase tracking-wide">{letterData.companyName}</p>

                  <div className="pt-4 border-t border-slate-700 relative">
                    {isStampOverlayActive && (
                      <div className="absolute -top-12 right-2 bg-cyan-950/95 border-2 border-cyan-400 text-cyan-300 p-2.5 rounded-xl text-[10px] font-mono shadow-xl shadow-cyan-500/30 transform -rotate-6 animate-pulse flex items-center space-x-2.5">
                        <ShieldCheck className="h-5 w-5 text-cyan-400 shrink-0" />
                        <div className="text-left leading-tight">
                          <p className="font-extrabold text-slate-100 uppercase tracking-wider">E-STAMP & SIGN VERIFIED</p>
                          <p className="text-[9px] text-cyan-300 font-mono">Hash: {company.id.toUpperCase()}-2026-9F81A2B0</p>
                          <p className="text-[9px] text-emerald-400 font-bold">✓ e-Meterai Rp 10.000 Valid (DJP)</p>
                        </div>
                      </div>
                    )}
                    {isEditMode ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={letterData.signatoryName}
                          onChange={(e) => setLetterData({ ...letterData, signatoryName: e.target.value })}
                          className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-100 font-extrabold text-center w-full"
                          title="Edit Nama Penandatangan"
                        />
                        <input
                          type="text"
                          value={letterData.signatoryRole}
                          onChange={(e) => setLetterData({ ...letterData, signatoryRole: e.target.value })}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[10px] text-slate-400 uppercase font-semibold text-center w-full"
                          title="Edit Jabatan Penandatangan"
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
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBTAB 1: REKAPITULASI PENAWARAN BIAYA                    */}
          {/* ========================================================= */}
          {selectedSubTab === "rekap" && (
            <div className="space-y-5">
              <div className="text-center space-y-1 border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold text-slate-100 tracking-wider">
                  REKAPITULASI PENAWARAN BIAYA
                </h3>
                <p className="text-xs text-cyan-400 font-semibold">{letterData.projectName}</p>
              </div>

              {/* Tax & Terbilang Selector Bar */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 text-xs flex items-center space-x-1.5">
                    <DollarSign className="h-4 w-4" />
                    <span>Pengaturan PPN & Terbilang Rupiah:</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <label className="text-[11px] text-slate-300 font-semibold">Tarif PPN:</label>
                    <select
                      value={ppnPercent}
                      onChange={(e) => setPpnPercent(Number(e.target.value))}
                      className="bg-slate-900 text-cyan-400 border border-slate-700 rounded px-2.5 py-1 text-xs font-bold focus:outline-none"
                    >
                      <option value={11}>11% (PPN Standard)</option>
                      <option value={12}>12% (PPN UU HPP Terbaru)</option>
                      <option value={0}>0% (Bebas PPN / Non-BKP)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Kalimat Terbilang Rupiah:</label>
                  <input
                    type="text"
                    value={terbilangCustom}
                    onChange={(e) => setTerbilangCustom(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 italic"
                  />
                </div>
              </div>

              {/* Rekapitulasi Table Format */}
              <div className="border border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-slate-700 font-bold">
                      <th className="p-3 w-12 text-center border-r border-slate-700">No</th>
                      <th className="p-3 border-r border-slate-700">Uraian Biaya</th>
                      <th className="p-3 text-right">Total Harga (Rp.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200 font-medium">
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 text-center border-r border-slate-800 font-bold">1</td>
                      <td className="p-3 border-r border-slate-800">BIAYA LANGSUNG PERSONIL (BLP)</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-100">
                        {formatIDR(blpTotal)}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 text-center border-r border-slate-800 font-bold">2</td>
                      <td className="p-3 border-r border-slate-800">BIAYA LANGSUNG NON PERSONIL (BLNP)</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-100">
                        {formatIDR(blnpTotal)}
                      </td>
                    </tr>
                    <tr className="bg-slate-950/60 font-bold text-slate-300">
                      <td className="p-3 text-center border-r border-slate-800"></td>
                      <td className="p-3 border-r border-slate-800">JUMLAH (BLP + BLNP)</td>
                      <td className="p-3 text-right font-mono text-cyan-300">
                        {formatIDR(directCostTotal)}
                      </td>
                    </tr>
                    <tr className="bg-slate-950/60 text-slate-400">
                      <td className="p-3 text-center border-r border-slate-800"></td>
                      <td className="p-3 border-r border-slate-800">PPN {ppnPercent}%</td>
                      <td className="p-3 text-right font-mono">
                        {formatIDR(ppnAmount)}
                      </td>
                    </tr>
                    <tr className="bg-slate-950 font-extrabold text-emerald-400 text-sm border-t-2 border-slate-700">
                      <td className="p-3 text-center border-r border-slate-700"></td>
                      <td className="p-3 border-r border-slate-700 uppercase">JUMLAH TOTAL (Sudah Termasuk Pajak)</td>
                      <td className="p-3 text-right font-mono font-bold">
                        {formatIDR(grandTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-slate-400 italic text-[11px]">
                <strong>Terbilang :</strong> "{terbilangCustom}"
              </div>

              {/* Signatory for Rekapitulasi */}
              <div className="pt-6 flex justify-end">
                <div className="text-center space-y-12 min-w-[220px]">
                  <p className="text-slate-300">{letterData.letterDate}</p>
                  <p className="font-bold text-slate-200 uppercase">{letterData.companyName}</p>
                  <div className="pt-4 border-t border-slate-700">
                    <p className="font-extrabold text-slate-100">{letterData.signatoryName}</p>
                    <p className="text-[11px] text-slate-400 uppercase font-semibold">{letterData.signatoryRole}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBTAB 2: DAFTAR KUANTITAS DAN HARGA (Full Cell Editor)  */}
          {/* ========================================================= */}
          {selectedSubTab === "kuantitas" && (
            <div className="space-y-5">
              <div className="text-center space-y-1 border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold text-slate-100 tracking-wider">
                  DAFTAR KUANTITAS DAN HARGA
                </h3>
                <p className="text-xs text-cyan-400 font-semibold">{letterData.projectName}</p>
              </div>

              {/* Full Cell Editable Table */}
              <div className="overflow-x-auto border border-slate-700 rounded-lg">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-slate-700 font-bold">
                      <th className="p-2.5 w-10 text-center">No</th>
                      <th className="p-2.5 w-24">Kategori</th>
                      <th className="p-2.5">Uraian Komponen Pekerjaan</th>
                      <th className="p-2.5 text-center w-14">Vol</th>
                      <th className="p-2.5 text-center w-16">Satuan</th>
                      <th className="p-2.5 text-right w-36">Harga Satuan (Rp)</th>
                      <th className="p-2.5 text-right w-36">Total Biaya (Rp)</th>
                      <th className="p-2.5 text-center w-12">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {rabItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-800/40">
                        <td className="p-2.5 text-center font-semibold">{idx + 1}</td>
                        <td className="p-2.5">
                          <select
                            value={item.category}
                            onChange={(e) =>
                              handleRabItemUpdate(item.id, "category", e.target.value as any)
                            }
                            className="bg-slate-950 text-xs text-slate-200 border border-slate-700 rounded px-1.5 py-1 w-full"
                          >
                            <option value="Personnel">Personnel</option>
                            <option value="Non-Personnel">Non-Personnel</option>
                          </select>
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleRabItemUpdate(item.id, "description", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-medium focus:border-cyan-500"
                          />
                        </td>
                        <td className="p-2.5 text-center">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleRabItemUpdate(item.id, "quantity", Number(e.target.value))}
                            className="w-12 bg-slate-950 border border-slate-700 rounded px-1 py-1 text-xs text-slate-100 text-center"
                          />
                        </td>
                        <td className="p-2.5 text-center">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleRabItemUpdate(item.id, "unit", e.target.value)}
                            className="w-14 bg-slate-950 border border-slate-700 rounded px-1 py-1 text-xs text-slate-100 text-center"
                          />
                        </td>
                        <td className="p-2.5 text-right font-mono">
                          <input
                            type="number"
                            value={item.billingRateIDR}
                            onChange={(e) =>
                              handleRabItemUpdate(item.id, "billingRateIDR", Number(e.target.value))
                            }
                            className="w-32 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 font-mono font-bold text-right focus:border-cyan-500"
                          />
                        </td>
                        <td className="p-2.5 text-right font-semibold text-slate-100 font-mono">
                          {formatIDR(item.subtotalIDR)}
                        </td>
                        <td className="p-2.5 text-center">
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

              {/* Add Rows Toolbar */}
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

          {/* ========================================================= */}
          {/* SUBTAB 3: KOMPONEN REMUNERASI PERSONEL                    */}
          {/* ========================================================= */}
          {selectedSubTab === "remunerasi" && (
            <div className="space-y-5">
              <div className="text-center space-y-1 border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold text-slate-100 tracking-wider">
                  RINCIAN KOMPONEN REMUNERASI TENAGA AHLI
                </h3>
                <p className="text-xs text-indigo-400 font-semibold">{letterData.projectName}</p>
              </div>

              {/* Remuneration Table */}
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

              <p className="text-[11px] text-slate-400 italic">
                *Komponen remunerasi mengacu pada standar remunerasi Ikatan Konsultan Indonesia (INKINDO) dan Peraturan LKPP yang berlaku. Mengubah Gaji Dasar akan secara otomatis merekalibrasi beban personil, beban umum, tunjangan, dan total billing rate.
              </p>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBTAB 4: PENAWARAN TEKNIS & METODOLOGI                   */}
          {/* ========================================================= */}
          {selectedSubTab === "teknis" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
                DOKUMEN PENAWARAN TEKNIS & METODOLOGI
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Nama Pekerjaan:</label>
                  <input
                    type="text"
                    value={technicalScope.title}
                    onChange={(e) => setTechnicalScope({ ...technicalScope, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Ruang Lingkup & Spesifikasi Teknis:</label>
                  <textarea
                    rows={3}
                    value={technicalScope.scope}
                    onChange={(e) => setTechnicalScope({ ...technicalScope, scope: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-100 leading-relaxed"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Pendekatan Metodologi Kerja:</label>
                  <textarea
                    rows={3}
                    value={technicalScope.methodology}
                    onChange={(e) => setTechnicalScope({ ...technicalScope, methodology: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-100 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
