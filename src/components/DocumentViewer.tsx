"use client";

import React, { useState, useEffect } from "react";
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
  Users,
  Award,
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableProject, setEditableProject] = useState<Project>(project);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isStampOverlayActive, setIsStampOverlayActive] = useState(true);

  const director = company.directors.find((d) => d.isSignatory) || company.directors[0];

  useEffect(() => {
    setEditableProject(project);
  }, [project]);

  // Recalculate RAB totals helper
  const recalculateFinancials = (items: FinancialItem[], customPpnPercent?: number) => {
    const ppnPercent = customPpnPercent !== undefined ? customPpnPercent : (editableProject.financials.ppnPercent || 11);

    const personnelCostSubtotalIDR = items
      .filter((i) => i.category === "Personnel")
      .reduce((sum, i) => sum + (Number(i.subtotalIDR) || 0), 0);

    const nonPersonnelCostSubtotalIDR = items
      .filter((i) => i.category === "Non-Personnel")
      .reduce((sum, i) => sum + (Number(i.subtotalIDR) || 0), 0);

    const directCostSubtotalIDR = personnelCostSubtotalIDR + nonPersonnelCostSubtotalIDR;
    const ppnAmountIDR = Math.round((directCostSubtotalIDR * ppnPercent) / 100);
    const grandTotalIDR = directCostSubtotalIDR + ppnAmountIDR;

    return {
      items,
      personnelCostSubtotalIDR,
      nonPersonnelCostSubtotalIDR,
      directCostSubtotalIDR,
      ppnPercent,
      ppnAmountIDR,
      grandTotalIDR,
      terbilangIDR: editableProject.financials.terbilangIDR,
    };
  };

  const handleFieldChange = (field: keyof Project, value: any) => {
    setEditableProject((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePpnChange = (newPpnPercent: number) => {
    setEditableProject((prev) => ({
      ...prev,
      financials: recalculateFinancials(prev.financials.items, newPpnPercent),
    }));
  };

  const handleFinancialItemChange = (itemId: string, field: keyof FinancialItem, value: any) => {
    setEditableProject((prev) => {
      const updatedItems = prev.financials.items.map((item) => {
        if (item.id !== itemId) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "billingRateIDR" || field === "durationMonths") {
          updated.subtotalIDR =
            (Number(updated.quantity) || 1) *
            (Number(updated.billingRateIDR) || 0) *
            (Number(updated.durationMonths) || 1);
        }
        return updated;
      });

      return {
        ...prev,
        financials: recalculateFinancials(updatedItems),
      };
    });
  };

  const handleAddFinancialItem = (category: "Personnel" | "Non-Personnel" = "Personnel") => {
    const newItem: FinancialItem = {
      id: `fin-custom-${Date.now()}`,
      category,
      description: category === "Personnel" ? "Tenaga Ahli Tambahan" : "Peralatan & Biaya Operasional",
      quantity: 1,
      unit: category === "Personnel" ? "OB" : "Paket",
      durationMonths: 1,
      billingRateIDR: 10000000,
      subtotalIDR: 10000000,
    };
    setEditableProject((prev) => {
      const updatedItems = [...prev.financials.items, newItem];
      return {
        ...prev,
        financials: recalculateFinancials(updatedItems),
      };
    });
  };

  const handleDeleteFinancialItem = (id: string) => {
    setEditableProject((prev) => {
      const updatedItems = prev.financials.items.filter((i) => i.id !== id);
      return {
        ...prev,
        financials: recalculateFinancials(updatedItems),
      };
    });
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const success = await updateProjectDetails(editableProject.id, editableProject);
    setIsSaving(false);

    if (onProjectUpdate) {
      onProjectUpdate(editableProject);
    }

    setSaveNotification(
      success
        ? "Semua perubahan dokumen berhasil disimpan permanen ke database Supabase!"
        : "Perubahan disimpan ke sesi aktif lokal."
    );
    setTimeout(() => setSaveNotification(null), 3500);
  };

  const handleReset = () => {
    setEditableProject(project);
    setSaveNotification("Form dokumen dikembalikan ke data awal.");
    setTimeout(() => setSaveNotification(null), 2500);
  };

  // Helper to trigger specific download
  const handleDownloadDoc = (prefix: "0" | "1" | "2" | "3") => {
    window.open(
      `/api/export-docx?companyId=${company.id}&projectId=${editableProject.id}&docPrefix=${prefix}`,
      "_blank"
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Sub Tab Selection & Mode Switcher Bar */}
      <div className="bg-slate-950/95 border-b border-slate-800 p-2.5 px-4 flex items-center justify-between">
        {/* Navigation Tabs - Switches Document Preview Sheet */}
        <div className="flex items-center space-x-1 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setSelectedSubTab("surat")}
            className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
              selectedSubTab === "surat"
                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-bold shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            0. Surat Penawaran
          </button>
          <button
            onClick={() => setSelectedSubTab("rekap")}
            className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
              selectedSubTab === "rekap"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            1. Rekapitulasi Biaya
          </button>
          <button
            onClick={() => setSelectedSubTab("kuantitas")}
            className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
              selectedSubTab === "kuantitas"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            2. Kuantitas & Harga
          </button>
          <button
            onClick={() => setSelectedSubTab("remunerasi")}
            className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
              selectedSubTab === "remunerasi"
                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 font-bold shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            3. Remunerasi Personel
          </button>
          <button
            onClick={() => setSelectedSubTab("teknis")}
            className={`px-2.5 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
              selectedSubTab === "teknis"
                ? "bg-blue-500/10 text-blue-400 border-blue-500/30 font-bold"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            Teknis
          </button>
          <button
            onClick={() => setSelectedSubTab("cv")}
            className={`px-2.5 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
              selectedSubTab === "cv"
                ? "bg-purple-500/10 text-purple-400 border-purple-500/30 font-bold"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            CV Ahli
          </button>
        </div>

        {/* Mode Switcher & Download Toolbar */}
        <div className="flex items-center space-x-2">
          {/* Edit Mode Toggle Button */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all border ${
              isEditMode
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10"
                : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
            }`}
          >
            {isEditMode ? (
              <>
                <Eye className="h-3.5 w-3.5 text-amber-400" />
                <span>👁️ Mode Pratinjau</span>
              </>
            ) : (
              <>
                <Edit3 className="h-3.5 w-3.5 text-cyan-400" />
                <span>✏️ Edit Dokumen</span>
              </>
            )}
          </button>

          {/* e-Stamp Digital Overlay Toggle */}
          <button
            onClick={() => setIsStampOverlayActive(!isStampOverlayActive)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all border ${
              isStampOverlayActive
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/10"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
            }`}
            title="Toggle Pembubuhan e-Stamp & e-Signature Canvas Overlay"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>e-Stamp: {isStampOverlayActive ? "ON" : "OFF"}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
            title="Cetak Dokumen"
          >
            <Printer className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Notifications Bar */}
      {saveNotification && (
        <div className="bg-emerald-950/90 border-b border-emerald-800 p-2 px-4 flex items-center justify-between text-xs text-emerald-300 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{saveNotification}</span>
          </div>
        </div>
      )}

      {/* Main Document Preview & Editor Sheet Area */}
      <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-slate-950/60">
        <div className="w-full max-w-3xl bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6 text-xs leading-relaxed relative">
          
          {/* Header Action Bar inside the sheet */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isEditMode ? "bg-amber-400 animate-ping" : "bg-emerald-400"
                }`}
              />
              <span className="font-bold text-xs uppercase tracking-wide text-slate-200">
                {isEditMode ? "✏️ Mode Edit Aktif - Ubah Data & Klik Simpan" : "👁️ Pratinjau Lembar Dokumen Resmi"}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {isEditMode ? (
                <>
                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded text-xs transition-all"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-3 py-1 rounded text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
                  </button>
                </>
              ) : (
                /* Download Button specific to currently previewed sheet */
                <button
                  onClick={() => {
                    if (selectedSubTab === "surat") handleDownloadDoc("0");
                    else if (selectedSubTab === "rekap") handleDownloadDoc("1");
                    else if (selectedSubTab === "kuantitas") handleDownloadDoc("2");
                    else if (selectedSubTab === "remunerasi") handleDownloadDoc("3");
                    else handleDownloadDoc("0");
                  }}
                  className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-3 py-1 rounded text-xs shadow-md transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Dokumen Ini (.docx)</span>
                </button>
              )}
            </div>
          </div>

          {/* Letterhead Kop Surat Header */}
          <div className="border-b-2 border-slate-700 pb-4 flex justify-between items-start">
            <div>
              <h2 className="text-base font-extrabold text-cyan-400 tracking-wide uppercase">
                {company.legalName}
              </h2>
              <p className="text-[11px] text-slate-400">{company.address}</p>
              <p className="text-[10px] text-slate-500">
                Telp: {company.phone} | Email: {company.email}
              </p>
            </div>
            <div className="text-right">
              {isEditMode ? (
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block font-semibold">No. Dokumen:</label>
                  <input
                    type="text"
                    value={editableProject.documentNumber || ""}
                    onChange={(e) => handleFieldChange("documentNumber", e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-cyan-400 w-52 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              ) : (
                <span className="inline-block px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] text-cyan-400 font-mono font-bold">
                  {editableProject.documentNumber || company.branding.numberingPattern}
                </span>
              )}
            </div>
          </div>

          {/* ==================================================== */}
          {/* TAB 0: PRATINJAU & EDIT SURAT PENAWARAN ADMINISTRASI */}
          {/* ==================================================== */}
          {selectedSubTab === "surat" && (
            <div className="space-y-4 font-sans text-slate-200 leading-relaxed text-xs">
              {isEditMode && (
                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/40 space-y-3">
                  <h4 className="font-bold text-amber-400 text-xs flex items-center space-x-1">
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Form Edit Informasi Surat Penawaran:</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Nama Pekerjaan (Proyek):</label>
                      <input
                        type="text"
                        value={editableProject.projectName}
                        onChange={(e) => handleFieldChange("projectName", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Tanggal Surat Penawaran:</label>
                      <input
                        type="text"
                        value={editableProject.documentDate || ""}
                        onChange={(e) => handleFieldChange("documentDate", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">No. Pengumuman Ref:</label>
                      <input
                        type="text"
                        value={editableProject.procurementRefNo || ""}
                        onChange={(e) => handleFieldChange("procurementRefNo", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Penerima Surat (Instansi Client):</label>
                      <input
                        type="text"
                        value={editableProject.clientName || ""}
                        onChange={(e) => handleFieldChange("clientName", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Jangka Waktu Pelaksanaan (Hari):</label>
                      <input
                        type="number"
                        value={editableProject.executionDays || 90}
                        onChange={(e) => handleFieldChange("executionDays", Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Masa Berlaku Penawaran (Hari):</label>
                      <input
                        type="number"
                        value={editableProject.validityDays || 30}
                        onChange={(e) => handleFieldChange("validityDays", Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Surat Penawaran */}
              <div className="flex justify-between items-start text-slate-300">
                <div className="space-y-0.5">
                  <p>
                    <span className="font-semibold text-slate-400">Nomor:</span>{" "}
                    <span className="font-mono text-cyan-400 font-bold">
                      {editableProject.documentNumber || company.branding.numberingPattern}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-400">Lampiran:</span> 1 Bendel
                  </p>
                </div>
                <div className="text-right">
                  <p>Semarang, {editableProject.documentDate || "14 Agustus 2026"}</p>
                </div>
              </div>

              <div className="pt-2 space-y-0.5">
                <p>Kepada Yth. :</p>
                <p className="font-bold text-slate-100">{editableProject.clientName}</p>
                <p className="text-slate-400">di</p>
                <p className="pl-6 font-semibold tracking-widest text-slate-300">S E M A R A N G</p>
              </div>

              <div className="pt-2 border-t border-b border-slate-800 py-2">
                <p>
                  <span className="font-semibold text-slate-400">Perihal :</span>{" "}
                  <span className="font-bold text-slate-100">
                    Penawaran Pengadaan {editableProject.projectName}
                  </span>
                </p>
              </div>

              <p className="text-justify leading-relaxed">
                Sehubungan dengan pengumuman Pengadaan Langsung dengan Pascakualifikasi dan Dokumen Pemilihan nomor :{" "}
                <span className="font-mono text-cyan-400 font-semibold">
                  {editableProject.procurementRefNo || "PL06A/02/PP-Perikanan/VIII/2026"}
                </span>{" "}
                tanggal {editableProject.documentDate || "13 Agustus 2026"}, dan setelah kami pelajari dengan seksama Dokumen Pemilihan dan Berita Acara Pemberian Penjelasan (serta adendum Dokumen Pemilihan), dengan ini kami mengajukan Dokumen Penawaran Harga, Dokumen Administrasi dan Teknis untuk{" "}
                <span className="font-semibold text-slate-100">{editableProject.projectName}</span> sebesar{" "}
                <span className="text-emerald-400 font-bold">
                  {formatIDR(editableProject.financials.grandTotalIDR)}
                </span>{" "}
                (<em>{editableProject.financials.terbilangIDR}</em>) sudah termasuk pajak yang berlaku.
              </p>

              <p className="text-justify leading-relaxed">
                Penawaran ini sudah memperhatikan ketentuan dan persyaratan yang tercantum dalam Dokumen Pengadaan Langsung untuk melaksanakan pekerjaan tersebut di atas.
              </p>

              <p className="text-justify leading-relaxed">
                Kami akan melaksanakan pekerjaan tersebut dengan jangka waktu pelaksanaan pekerjaan selama{" "}
                <span className="font-semibold text-cyan-300">
                  {editableProject.executionDays || 90} hari kalender
                </span>.
              </p>

              <p className="text-justify leading-relaxed">
                Penawaran ini berlaku selama{" "}
                <span className="font-semibold text-cyan-300">
                  {editableProject.validityDays || 30} hari kalender
                </span>{" "}
                sejak tanggal surat penawaran ini. Surat Penawaran beserta lampirannya kami sampaikan sebanyak 1 (satu) rangkap dokumen asli.
              </p>

              <p className="text-justify leading-relaxed">
                Dengan disampaikannya Surat Penawaran ini, maka kami menyatakan sanggup dan akan tunduk pada semua ketentuan yang tercantum dalam Dokumen Pengadaan.
              </p>

              <div className="pt-8 flex justify-end">
                <div className="text-center space-y-12 min-w-[240px] relative">
                  <p className="font-bold text-slate-200 uppercase tracking-wide">{company.legalName}</p>

                  <div className="pt-4 border-t border-slate-700 relative">
                    {/* Digital e-Stamp & e-Signature Canvas Overlay */}
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
                    <p className="font-extrabold text-slate-100 text-sm">{director.fullName}</p>
                    <p className="text-[11px] text-slate-400 uppercase font-semibold">{director.position}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 1: PRATINJAU & EDIT REKAPITULASI PENAWARAN BIAYA */}
          {/* ==================================================== */}
          {selectedSubTab === "rekap" && (
            <div className="space-y-4">
              <div className="text-center space-y-1 border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold text-slate-100 tracking-wider">
                  REKAPITULASI PENAWARAN BIAYA
                </h3>
                <p className="text-xs text-cyan-400 font-semibold">{editableProject.projectName}</p>
              </div>

              {isEditMode && (
                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-amber-400 text-xs flex items-center space-x-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>Pengaturan Tarif PPN & Terbilang Rekapitulasi:</span>
                    </h4>
                    <div className="flex items-center space-x-2">
                      <label className="text-[11px] text-slate-300 font-semibold">Tarif PPN:</label>
                      <select
                        value={editableProject.financials.ppnPercent || 11}
                        onChange={(e) => handlePpnChange(Number(e.target.value))}
                        className="bg-slate-900 text-cyan-400 border border-slate-700 rounded px-2 py-1 text-xs font-bold focus:outline-none"
                      >
                        <option value={11}>11% (PPN Standard)</option>
                        <option value={12}>12% (PPN Terbaru UU HPP)</option>
                        <option value={0}>0% (Bebas PPN / Non-BKP)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Kalimat Terbilang Rupiah:</label>
                    <input
                      type="text"
                      value={editableProject.financials.terbilangIDR}
                      onChange={(e) =>
                        setEditableProject((prev) => ({
                          ...prev,
                          financials: { ...prev.financials, terbilangIDR: e.target.value },
                        }))
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 italic"
                    />
                  </div>
                </div>
              )}

              {/* Rekapitulasi Table Format Matching DOCX */}
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
                        {formatIDR(editableProject.financials.personnelCostSubtotalIDR)}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 text-center border-r border-slate-800 font-bold">2</td>
                      <td className="p-3 border-r border-slate-800">BIAYA LANGSUNG NON PERSONIL (BLNP)</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-100">
                        {formatIDR(editableProject.financials.nonPersonnelCostSubtotalIDR)}
                      </td>
                    </tr>
                    <tr className="bg-slate-950/60 font-bold text-slate-300">
                      <td className="p-3 text-center border-r border-slate-800"></td>
                      <td className="p-3 border-r border-slate-800">JUMLAH (BLP + BLNP)</td>
                      <td className="p-3 text-right font-mono text-cyan-300">
                        {formatIDR(editableProject.financials.directCostSubtotalIDR)}
                      </td>
                    </tr>
                    <tr className="bg-slate-950/60 text-slate-400">
                      <td className="p-3 text-center border-r border-slate-800"></td>
                      <td className="p-3 border-r border-slate-800">PPN {editableProject.financials.ppnPercent || 11}%</td>
                      <td className="p-3 text-right font-mono">
                        {formatIDR(editableProject.financials.ppnAmountIDR)}
                      </td>
                    </tr>
                    <tr className="bg-slate-950 font-extrabold text-emerald-400 text-sm border-t-2 border-slate-700">
                      <td className="p-3 text-center border-r border-slate-700"></td>
                      <td className="p-3 border-r border-slate-700 uppercase">JUMLAH TOTAL (Sudah Termasuk Pajak)</td>
                      <td className="p-3 text-right font-mono">
                        {formatIDR(editableProject.financials.grandTotalIDR)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-slate-400 italic text-[11px]">
                <strong>Terbilang :</strong> "{editableProject.financials.terbilangIDR}"
              </div>

              {/* Signatory for Rekapitulasi */}
              <div className="pt-6 flex justify-end">
                <div className="text-center space-y-12 min-w-[220px]">
                  <p className="text-slate-300">Semarang, {editableProject.documentDate || "14 Agustus 2026"}</p>
                  <p className="font-bold text-slate-200 uppercase">{company.legalName}</p>
                  <div className="pt-4 border-t border-slate-700">
                    <p className="font-extrabold text-slate-100">{director.fullName}</p>
                    <p className="text-[11px] text-slate-400 uppercase font-semibold">{director.position}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: PRATINJAU & EDIT DAFTAR KUANTITAS DAN HARGA   */}
          {/* ==================================================== */}
          {selectedSubTab === "kuantitas" && (
            <div className="space-y-4">
              <div className="text-center space-y-1 border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold text-slate-100 tracking-wider">
                  DAFTAR KUANTITAS DAN HARGA
                </h3>
                <p className="text-xs text-cyan-400 font-semibold">{editableProject.projectName}</p>
              </div>

              {/* Detailed Kuantitas Table */}
              <div className="overflow-x-auto border border-slate-700 rounded-lg">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-slate-700 font-bold">
                      <th className="p-2.5 w-10 text-center">No</th>
                      <th className="p-2.5">Kategori</th>
                      <th className="p-2.5">Uraian Komponen Pekerjaan</th>
                      <th className="p-2.5 text-center">Vol</th>
                      <th className="p-2.5 text-center">Satuan</th>
                      <th className="p-2.5 text-right">Harga Satuan (Rp)</th>
                      <th className="p-2.5 text-right">Total Biaya (Rp)</th>
                      {isEditMode && <th className="p-2.5 text-center">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {editableProject.financials.items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-800/40">
                        <td className="p-2.5 text-center font-semibold">{idx + 1}</td>
                        <td className="p-2.5">
                          {isEditMode ? (
                            <select
                              value={item.category}
                              onChange={(e) =>
                                handleFinancialItemChange(item.id, "category", e.target.value as any)
                              }
                              className="bg-slate-950 text-xs text-slate-200 border border-slate-700 rounded px-1 py-0.5"
                            >
                              <option value="Personnel">Personnel</option>
                              <option value="Non-Personnel">Non-Personnel</option>
                            </select>
                          ) : (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                item.category === "Personnel"
                                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              }`}
                            >
                              {item.category}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-medium">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleFinancialItemChange(item.id, "description", e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-100"
                            />
                          ) : (
                            item.description
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          {isEditMode ? (
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleFinancialItemChange(item.id, "quantity", Number(e.target.value))}
                              className="w-12 bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-xs text-slate-100 text-center"
                            />
                          ) : (
                            item.quantity
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleFinancialItemChange(item.id, "unit", e.target.value)}
                              className="w-14 bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-xs text-slate-100 text-center"
                            />
                          ) : (
                            item.unit
                          )}
                        </td>
                        <td className="p-2.5 text-right font-mono">
                          {isEditMode ? (
                            <input
                              type="number"
                              value={item.billingRateIDR}
                              onChange={(e) =>
                                handleFinancialItemChange(item.id, "billingRateIDR", Number(e.target.value))
                              }
                              className="w-28 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-cyan-300 font-mono font-bold text-right"
                            />
                          ) : (
                            formatIDR(item.billingRateIDR)
                          )}
                        </td>
                        <td className="p-2.5 text-right font-semibold text-slate-100 font-mono">
                          {formatIDR(item.subtotalIDR)}
                        </td>
                        {isEditMode && (
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => handleDeleteFinancialItem(item.id)}
                              className="p-1 text-rose-400 hover:bg-rose-500/20 rounded transition-all"
                              title="Hapus Baris Komponen"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isEditMode && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAddFinancialItem("Personnel")}
                    className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Tambah Komponen Personel</span>
                  </button>
                  <button
                    onClick={() => handleAddFinancialItem("Non-Personnel")}
                    className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Tambah Komponen Non-Personel</span>
                  </button>
                </div>
              )}

              {/* Summary Totals */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Biaya Langsung Personil:</span>
                  <span className="font-semibold text-slate-200">
                    {formatIDR(editableProject.financials.personnelCostSubtotalIDR)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Biaya Non-Personil:</span>
                  <span className="font-semibold text-slate-200">
                    {formatIDR(editableProject.financials.nonPersonnelCostSubtotalIDR)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800 font-semibold">
                  <span>Total Biaya Langsung (Direct Cost):</span>
                  <span className="text-cyan-300">{formatIDR(editableProject.financials.directCostSubtotalIDR)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>PPN {editableProject.financials.ppnPercent || 11}%:</span>
                  <span>{formatIDR(editableProject.financials.ppnAmountIDR)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 pt-2 border-t border-slate-800 text-sm font-extrabold">
                  <span>GRAND TOTAL:</span>
                  <span>{formatIDR(editableProject.financials.grandTotalIDR)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: PRATINJAU & EDIT KOMPONEN REMUNERASI PERSONEL */}
          {/* ==================================================== */}
          {selectedSubTab === "remunerasi" && (
            <div className="space-y-4">
              <div className="text-center space-y-1 border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold text-slate-100 tracking-wider">
                  KOMPONEN REMUNERASI TENAGA AHLI
                </h3>
                <p className="text-xs text-indigo-400 font-semibold">{editableProject.projectName}</p>
              </div>

              {/* Remuneration Breakdown Table */}
              <div className="overflow-x-auto border border-slate-700 rounded-lg">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-slate-700 font-bold">
                      <th className="p-2 w-8 text-center">No</th>
                      <th className="p-2">Posisi Jabatan</th>
                      <th className="p-2">Gaji Dasar (Rp)</th>
                      <th className="p-2">Beban Personil</th>
                      <th className="p-2">Beban Umum</th>
                      <th className="p-2">Tunjangan</th>
                      <th className="p-2">Keuntungan</th>
                      <th className="p-2 text-right">Total Billing Rate (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2 text-center font-bold">1</td>
                      <td className="p-2 font-bold text-slate-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            defaultValue="Team Leader / Software Architect"
                            className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-100 w-full"
                          />
                        ) : (
                          "Team Leader / Software Architect"
                        )}
                      </td>
                      <td className="p-2 font-mono">Rp 3.784.500</td>
                      <td className="p-2 font-mono">Rp 1.324.575</td>
                      <td className="p-2 font-mono">Rp 2.270.700</td>
                      <td className="p-2 font-mono">Rp 750.000</td>
                      <td className="p-2 font-mono">Rp 745.225</td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-400">
                        Rp 8.875.000 / OB
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2 text-center font-bold">2</td>
                      <td className="p-2 font-bold text-slate-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            defaultValue="Tenaga Ahli Sistem Integrator / IoT"
                            className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-100 w-full"
                          />
                        ) : (
                          "Tenaga Ahli Sistem Integrator / IoT"
                        )}
                      </td>
                      <td className="p-2 font-mono">Rp 3.250.000</td>
                      <td className="p-2 font-mono">Rp 1.137.500</td>
                      <td className="p-2 font-mono">Rp 1.950.000</td>
                      <td className="p-2 font-mono">Rp 650.000</td>
                      <td className="p-2 font-mono">Rp 642.500</td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-400">
                        Rp 7.630.000 / OB
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                *Komponen remunerasi mengacu pada standar remunerasi Ikatan Konsultan Indonesia (INKINDO) dan Peraturan LKPP yang berlaku.
              </p>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: PRATINJAU DOKUMEN PENAWARAN TEKNIS            */}
          {/* ==================================================== */}
          {selectedSubTab === "teknis" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
                DOKUMEN PENAWARAN TEKNIS & METODOLOGI
              </h3>

              {isEditMode && (
                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/40 space-y-3">
                  <h4 className="font-bold text-amber-400 text-xs flex items-center space-x-1">
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Form Edit Penawaran Teknis & Ruang Lingkup:</span>
                  </h4>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Nama Pekerjaan:</label>
                    <input
                      type="text"
                      value={editableProject.projectName}
                      onChange={(e) => handleFieldChange("projectName", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Ruang Lingkup Pekerjaan:</label>
                    <textarea
                      rows={3}
                      value={editableProject.scopeOfWork}
                      onChange={(e) => handleFieldChange("scopeOfWork", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 leading-relaxed"
                    />
                  </div>
                </div>
              )}

              <p><strong>Nama Proyek:</strong> {editableProject.projectName}</p>
              <p><strong>Ruang Lingkup Pekerjaan:</strong> {editableProject.scopeOfWork}</p>
              <h4 className="font-bold text-slate-200 pt-2">1. Pendekatan Metodologi Pekerjaan</h4>
              <p className="text-slate-300 leading-relaxed">
                Pekerjaan dilaksanakan menggunakan pendekatan *Agile Engineering Framework*, pengujian komprehensif, dan pemantauan berbasis telemetry IoT real-time sesuai spesifikasi teknis Dokumen Pengadaan.
              </p>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: PRATINJAU CV TENAGA AHLI                      */}
          {/* ==================================================== */}
          {selectedSubTab === "cv" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
                DAFTAR RIWAYAT HIDUP (CV) TENAGA AHLI
              </h3>

              {selectedPerson ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-start bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <div>
                      <h4 className="text-sm font-bold text-cyan-400">
                        {selectedPerson.fullName}, {selectedPerson.academicTitle}
                      </h4>
                      <p className="text-slate-400">Posisi Penugasan: Team Leader / Software Architect</p>
                      <p className="text-slate-500 text-[11px]">
                        Pendidikan: {selectedPerson.lastEducation} {selectedPerson.major} ({selectedPerson.university})
                      </p>
                    </div>
                    <span className="flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded text-[10px]">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Verified CV</span>
                    </span>
                  </div>
                  <p><strong>Pengalaman Kerja:</strong> {selectedPerson.totalYearsExperience} Tahun</p>
                  <p><strong>Sertifikasi Keahlian:</strong></p>
                  <ul className="list-disc list-inside text-slate-300">
                    {selectedPerson.certifications.map((c) => (
                      <li key={c.id}>
                        {c.certificateName} - {c.issuingBody} (No: {c.certificateNumber})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-slate-400">Pilih tenaga ahli untuk pratinjau CV terverifikasi.</p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
