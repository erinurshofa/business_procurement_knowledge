"use client";

import React, { useState, useEffect } from "react";
import { Company, Project, Person, FinancialItem } from "@/types/procurement";
import { formatIDR } from "@/lib/financialEngine";
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
} from "lucide-react";

interface DocumentViewerProps {
  company: Company;
  project: Project;
  selectedPerson?: Person;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  company,
  project,
  selectedPerson,
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<"surat" | "teknis" | "cv" | "rab">("surat");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableProject, setEditableProject] = useState<Project>(project);
  const [activeProvenance, setActiveProvenance] = useState<string | null>(null);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  const director = company.directors.find((d) => d.isSignatory) || company.directors[0];

  useEffect(() => {
    setEditableProject(project);
  }, [project]);

  const handleFieldChange = (field: keyof Project, value: any) => {
    setEditableProject((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFinancialItemChange = (itemId: string, field: string, value: any) => {
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

      const personnelCostSubtotalIDR = updatedItems
        .filter((i) => i.category === "Personnel")
        .reduce((sum, i) => sum + i.subtotalIDR, 0);

      const nonPersonnelCostSubtotalIDR = updatedItems
        .filter((i) => i.category === "Non-Personnel")
        .reduce((sum, i) => sum + i.subtotalIDR, 0);

      const directCostSubtotalIDR = personnelCostSubtotalIDR + nonPersonnelCostSubtotalIDR;
      const ppnAmountIDR = Math.round(directCostSubtotalIDR * 0.11);
      const grandTotalIDR = directCostSubtotalIDR + ppnAmountIDR;

      return {
        ...prev,
        financials: {
          ...prev.financials,
          items: updatedItems,
          personnelCostSubtotalIDR,
          nonPersonnelCostSubtotalIDR,
          directCostSubtotalIDR,
          ppnAmountIDR,
          grandTotalIDR,
        },
      };
    });
  };

  const handleAddFinancialItem = () => {
    const newItem: FinancialItem = {
      id: `fin-custom-${Date.now()}`,
      category: "Personnel",
      description: "Komponen Pekerjaan Baru",
      quantity: 1,
      unit: "OB",
      durationMonths: 1,
      billingRateIDR: 10000000,
      subtotalIDR: 10000000,
    };
    setEditableProject((prev) => {
      const updatedItems = [...prev.financials.items, newItem];
      const personnelCostSubtotalIDR = updatedItems
        .filter((i) => i.category === "Personnel")
        .reduce((sum, i) => sum + i.subtotalIDR, 0);
      const nonPersonnelCostSubtotalIDR = updatedItems
        .filter((i) => i.category === "Non-Personnel")
        .reduce((sum, i) => sum + i.subtotalIDR, 0);
      const directCostSubtotalIDR = personnelCostSubtotalIDR + nonPersonnelCostSubtotalIDR;
      const ppnAmountIDR = Math.round(directCostSubtotalIDR * 0.11);
      const grandTotalIDR = directCostSubtotalIDR + ppnAmountIDR;

      return {
        ...prev,
        financials: {
          ...prev.financials,
          items: updatedItems,
          personnelCostSubtotalIDR,
          nonPersonnelCostSubtotalIDR,
          directCostSubtotalIDR,
          ppnAmountIDR,
          grandTotalIDR,
        },
      };
    });
  };

  const handleDeleteFinancialItem = (id: string) => {
    setEditableProject((prev) => {
      const updatedItems = prev.financials.items.filter((i) => i.id !== id);
      const personnelCostSubtotalIDR = updatedItems
        .filter((i) => i.category === "Personnel")
        .reduce((sum, i) => sum + i.subtotalIDR, 0);
      const nonPersonnelCostSubtotalIDR = updatedItems
        .filter((i) => i.category === "Non-Personnel")
        .reduce((sum, i) => sum + i.subtotalIDR, 0);
      const directCostSubtotalIDR = personnelCostSubtotalIDR + nonPersonnelCostSubtotalIDR;
      const ppnAmountIDR = Math.round(directCostSubtotalIDR * 0.11);
      const grandTotalIDR = directCostSubtotalIDR + ppnAmountIDR;

      return {
        ...prev,
        financials: {
          ...prev.financials,
          items: updatedItems,
          personnelCostSubtotalIDR,
          nonPersonnelCostSubtotalIDR,
          directCostSubtotalIDR,
          ppnAmountIDR,
          grandTotalIDR,
        },
      };
    });
  };

  const handleSave = () => {
    setSaveNotification("Perubahan dokumen berhasil disimpan!");
    setTimeout(() => setSaveNotification(null), 3000);
  };

  const handleReset = () => {
    setEditableProject(project);
    setSaveNotification("Form dokumen dikembalikan ke data awal.");
    setTimeout(() => setSaveNotification(null), 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Sub Tab Selection & Mode Switcher Bar */}
      <div className="bg-slate-950/90 border-b border-slate-800 p-2.5 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs font-medium">
          <button
            onClick={() => setSelectedSubTab("surat")}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              selectedSubTab === "surat"
                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-semibold"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            1. Surat Penawaran
          </button>
          <button
            onClick={() => setSelectedSubTab("teknis")}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              selectedSubTab === "teknis"
                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-semibold"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            2. Penawaran Teknis
          </button>
          <button
            onClick={() => setSelectedSubTab("cv")}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              selectedSubTab === "cv"
                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-semibold"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            3. CV Tenaga Ahli
          </button>
          <button
            onClick={() => setSelectedSubTab("rab")}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              selectedSubTab === "rab"
                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-semibold"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            4. RAB Finansial
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
                <span>Pratinjau Mode</span>
              </>
            ) : (
              <>
                <Edit3 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Edit Dokumen</span>
              </>
            )}
          </button>

          {/* Quick Download Buttons */}
          <div className="flex items-center space-x-1 border-l border-slate-800 pl-2">
            <button
              onClick={() =>
                window.open(
                  `/api/export-docx?companyId=${company.id}&projectId=${editableProject.id}&docPrefix=0`,
                  "_blank"
                )
              }
              className="flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 px-2 py-1 rounded text-[11px] font-semibold transition-all"
              title="Download 0. Surat Penawaran"
            >
              <FileText className="h-3 w-3 text-cyan-400" />
              <span>0. Surat</span>
            </button>
            <button
              onClick={() =>
                window.open(
                  `/api/export-docx?companyId=${company.id}&projectId=${editableProject.id}&docPrefix=1`,
                  "_blank"
                )
              }
              className="flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-800/60 px-2 py-1 rounded text-[11px] font-semibold transition-all"
              title="Download 1. Rekapitulasi Biaya"
            >
              <FileText className="h-3 w-3 text-emerald-400" />
              <span>1. Rekap</span>
            </button>
            <button
              onClick={() =>
                window.open(
                  `/api/export-docx?companyId=${company.id}&projectId=${editableProject.id}&docPrefix=2`,
                  "_blank"
                )
              }
              className="flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-800/60 px-2 py-1 rounded text-[11px] font-semibold transition-all"
              title="Download 2. Kuantitas dan Harga"
            >
              <FileText className="h-3 w-3 text-amber-400" />
              <span>2. Kuantitas</span>
            </button>
            <button
              onClick={() =>
                window.open(
                  `/api/export-docx?companyId=${company.id}&projectId=${editableProject.id}&docPrefix=3`,
                  "_blank"
                )
              }
              className="flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-800/60 px-2 py-1 rounded text-[11px] font-semibold transition-all"
              title="Download 3. Komponen Remunerasi"
            >
              <FileText className="h-3 w-3 text-indigo-400" />
              <span>3. Remunerasi</span>
            </button>
            <button
              onClick={() => window.print()}
              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              title="Cetak Dokumen"
            >
              <Printer className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications & Provenance Bar */}
      {saveNotification && (
        <div className="bg-emerald-950/90 border-b border-emerald-800 p-2 px-4 flex items-center justify-between text-xs text-emerald-300 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{saveNotification}</span>
          </div>
        </div>
      )}

      {/* Main Document Content Area */}
      <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-slate-950/50">
        <div className="w-full max-w-3xl bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6 text-xs leading-relaxed relative">
          {/* Header Banner Mode Status */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isEditMode ? "bg-amber-400 animate-ping" : "bg-emerald-400"
                }`}
              />
              <span className="font-bold text-xs uppercase tracking-wide text-slate-200">
                {isEditMode ? "✏️ Mode Edit Dokumen Aktif" : "👁️ Mode Pratinjau Dokumen Presisi"}
              </span>
            </div>
            {isEditMode && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded text-xs transition-all"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-3 py-1 rounded text-xs shadow-md transition-all"
                >
                  <Save className="h-3 w-3" />
                  <span>Simpan</span>
                </button>
              </div>
            )}
          </div>

          {/* Letterhead Header */}
          <div className="border-b border-slate-700 pb-4 flex justify-between items-start">
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
                  <label className="text-[10px] text-slate-400 block font-semibold">No. Surat:</label>
                  <input
                    type="text"
                    value={editableProject.documentNumber || ""}
                    onChange={(e) => handleFieldChange("documentNumber", e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-cyan-400 w-48 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              ) : (
                <span className="inline-block px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] text-cyan-400 font-mono font-bold">
                  {editableProject.documentNumber || company.branding.numberingPattern}
                </span>
              )}
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* SubTab 1: Surat Penawaran                            */}
          {/* ---------------------------------------------------- */}
          {selectedSubTab === "surat" && (
            <div className="space-y-4 font-sans text-slate-200 leading-relaxed text-xs">
              {isEditMode ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-amber-400 text-xs">Form Edit Surat Penawaran:</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Tanggal Surat:</label>
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
                      <label className="text-[10px] text-slate-400 block mb-1">Penerima (Client):</label>
                      <input
                        type="text"
                        value={editableProject.clientName || ""}
                        onChange={(e) => handleFieldChange("clientName", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Hari Pelaksanaan:</label>
                      <input
                        type="number"
                        value={editableProject.executionDays || 90}
                        onChange={(e) => handleFieldChange("executionDays", Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Preview Sheet Surat Penawaran */}
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
                <div className="text-center space-y-12 min-w-[220px]">
                  <p className="font-bold text-slate-200 uppercase tracking-wide">{company.legalName}</p>
                  <div className="pt-4 border-t border-slate-700">
                    <p className="font-extrabold text-slate-100 text-sm">{director.fullName}</p>
                    <p className="text-[11px] text-slate-400 uppercase font-semibold">{director.position}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SubTab 2: Penawaran Teknis                           */}
          {/* ---------------------------------------------------- */}
          {selectedSubTab === "teknis" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
                DOKUMEN PENAWARAN TEKNIS & METODOLOGI
              </h3>

              {isEditMode ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-amber-400 text-xs">Form Edit Teknis:</h4>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Nama Pekerjaan:</label>
                    <input
                      type="text"
                      value={editableProject.projectName}
                      onChange={(e) => handleFieldChange("projectName", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Ruang Lingkup Pekerjaan:</label>
                    <textarea
                      rows={3}
                      value={editableProject.scopeOfWork}
                      onChange={(e) => handleFieldChange("scopeOfWork", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100"
                    />
                  </div>
                </div>
              ) : null}

              <p><strong>Nama Proyek:</strong> {editableProject.projectName}</p>
              <p><strong>Ruang Lingkup Pekerjaan:</strong> {editableProject.scopeOfWork}</p>
              <h4 className="font-bold text-slate-200 pt-2">1. Pendekatan Metodologi Pekerjaan</h4>
              <p className="text-slate-300 leading-relaxed">
                Pekerjaan dilaksanakan menggunakan pendekatan *Agile Engineering Framework*, pengujian komprehensif, dan pemantauan berbasis telemetry IoT real-time sesuai spesifikasi teknis Dokumen Pengadaan.
              </p>
              <h4 className="font-bold text-slate-200 pt-2">2. Pengalaman Perusahaan Terkait</h4>
              <ul className="space-y-2 list-disc list-inside text-slate-300">
                <li>Kaji Terap System Integrator & Cloud Telemetry - Nilai: Rp 485.000.000</li>
                <li>Pengembangan Aplikasi Management System - Nilai: Rp 320.000.000</li>
              </ul>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SubTab 3: CV Tenaga Ahli                             */}
          {/* ---------------------------------------------------- */}
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
                  <p><strong>Pengalaman Kerja Total:</strong> {selectedPerson.totalYearsExperience} Tahun</p>
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

          {/* ---------------------------------------------------- */}
          {/* SubTab 4: RAB Finansial & Interactive Editor         */}
          {/* ---------------------------------------------------- */}
          {selectedSubTab === "rab" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-100">
                  RENCANA ANGGARAN BIAYA (RAB) & REMUNERASI
                </h3>
                <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  Deterministic Engine Standard
                </span>
              </div>

              {/* RAB Table (Editable or Viewable) */}
              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Uraian Komponen</th>
                      <th className="p-2.5">Vol</th>
                      <th className="p-2.5">Satuan</th>
                      <th className="p-2.5">Harga Satuan (IDR)</th>
                      <th className="p-2.5 text-right">Subtotal (IDR)</th>
                      {isEditMode && <th className="p-2.5 text-center">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 text-[11px]">
                    {editableProject.financials.items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-800/40">
                        <td className="p-2.5">{idx + 1}</td>
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
                        <td className="p-2.5">
                          {isEditMode ? (
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleFinancialItemChange(item.id, "quantity", Number(e.target.value))}
                              className="w-12 bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-xs text-slate-100"
                            />
                          ) : (
                            item.quantity
                          )}
                        </td>
                        <td className="p-2.5">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleFinancialItemChange(item.id, "unit", e.target.value)}
                              className="w-14 bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-xs text-slate-100"
                            />
                          ) : (
                            item.unit
                          )}
                        </td>
                        <td className="p-2.5">
                          {isEditMode ? (
                            <input
                              type="number"
                              value={item.billingRateIDR}
                              onChange={(e) => handleFinancialItemChange(item.id, "billingRateIDR", Number(e.target.value))}
                              className="w-28 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-cyan-300 font-mono"
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
                              className="p-1 text-rose-400 hover:bg-rose-500/20 rounded"
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
                <button
                  onClick={handleAddFinancialItem}
                  className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Komponen RAB</span>
                </button>
              )}

              {/* Summary Totals */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Biaya Langsung Personel:</span>
                  <span className="font-semibold text-slate-200">
                    {formatIDR(editableProject.financials.personnelCostSubtotalIDR)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Biaya Non-Personel:</span>
                  <span className="font-semibold text-slate-200">
                    {formatIDR(editableProject.financials.nonPersonnelCostSubtotalIDR)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800 font-semibold">
                  <span>Total Biaya Langsung (Direct Cost):</span>
                  <span>{formatIDR(editableProject.financials.directCostSubtotalIDR)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>PPN {editableProject.financials.ppnPercent || 11}%:</span>
                  <span>{formatIDR(editableProject.financials.ppnAmountIDR)}</span>
                </div>
                <div className="flex justify-between text-cyan-400 pt-2 border-t border-slate-800 text-sm font-extrabold">
                  <span>GRAND TOTAL (Termasuk Pajak):</span>
                  <span>{formatIDR(editableProject.financials.grandTotalIDR)}</span>
                </div>
                <p className="text-[11px] text-slate-400 italic pt-1">
                  *Terbilang: "{editableProject.financials.terbilangIDR}"
                </p>

                {/* Download Buttons Panel inside RAB SubTab */}
                <div className="pt-4 border-t border-slate-800/80">
                  <p className="text-xs font-bold text-slate-200 mb-2.5">
                    📥 Download Berkas Finansial & Remunerasi Resmi (.docx):
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      onClick={() =>
                        window.open(
                          `/api/export-docx?companyId=${company.id}&projectId=${editableProject.id}&docPrefix=1`,
                          "_blank"
                        )
                      }
                      className="p-3 bg-slate-900 hover:bg-slate-850 border border-emerald-500/40 rounded-xl text-left transition-all hover:scale-[1.02] shadow-md group"
                    >
                      <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                        <FileText className="h-4 w-4 shrink-0" />
                        <span>1. Rekapitulasi Biaya</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Surat Rekapitulasi Penawaran Biaya Finansial</p>
                    </button>

                    <button
                      onClick={() =>
                        window.open(
                          `/api/export-docx?companyId=${company.id}&projectId=${editableProject.id}&docPrefix=2`,
                          "_blank"
                        )
                      }
                      className="p-3 bg-slate-900 hover:bg-slate-850 border border-amber-500/40 rounded-xl text-left transition-all hover:scale-[1.02] shadow-md group"
                    >
                      <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                        <FileText className="h-4 w-4 shrink-0" />
                        <span>2. Kuantitas & Harga</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Daftar Rincian Kuantitas dan Harga Pekerjaan</p>
                    </button>

                    <button
                      onClick={() =>
                        window.open(
                          `/api/export-docx?companyId=${company.id}&projectId=${editableProject.id}&docPrefix=3`,
                          "_blank"
                        )
                      }
                      className="p-3 bg-slate-900 hover:bg-slate-850 border border-indigo-500/40 rounded-xl text-left transition-all hover:scale-[1.02] shadow-md group"
                    >
                      <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs">
                        <FileText className="h-4 w-4 shrink-0" />
                        <span>3. Remunerasi Personel</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Rincian Komponen Remunerasi & Gaji Tenaga Ahli</p>
                    </button>
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
