"use client";

import React, { useState } from "react";
import { Company, Project, Person } from "@/types/procurement";
import { formatIDR } from "@/lib/financialEngine";
import { FileText, CheckCircle2, ShieldCheck, Printer } from "lucide-react";

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
  const [activeProvenance, setActiveProvenance] = useState<string | null>(null);

  const director = company.directors.find((d) => d.isSignatory) || company.directors[0];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Sub Tab Selection */}
      <div className="bg-slate-950/80 border-b border-slate-800 p-2.5 px-4 flex items-center justify-between">
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

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.open(`/api/export-docx?companyId=${company.id}`, "_blank")}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-3 py-1 rounded-md text-xs font-medium border border-cyan-500/30 transition-all shadow-sm"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Download DOCX</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-md text-xs font-medium border border-slate-700 transition-all"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Preview</span>
          </button>
        </div>
      </div>

      {/* Provenance Active Banner */}
      {activeProvenance && (
        <div className="bg-cyan-950/80 border-b border-cyan-800/60 p-2 px-4 flex items-center justify-between text-xs text-cyan-300 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span>
              <strong>Provenance Source Verified:</strong> {activeProvenance}
            </span>
          </div>
          <button onClick={() => setActiveProvenance(null)} className="text-cyan-400 hover:text-cyan-200 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Document Sheet Display (Paper styling) */}
      <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-slate-950/50">
        <div className="w-full max-w-2xl bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6 text-xs leading-relaxed relative">
          {/* Document Header Letterhead */}
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
              <span className="inline-block px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 font-mono">
                {company.branding.numberingPattern.replace("{ROMAN}", "VIII").replace("{YEAR}", "2026")}
              </span>
            </div>
          </div>

          {/* SubTab 1: Surat Penawaran */}
          {selectedSubTab === "surat" && (
            <div className="space-y-4">
              <div className="flex justify-between text-slate-300">
                <div>
                  <p>Nomor: 001/SP-AOS/VIII/2026</p>
                  <p>Lampiran: 1 (Satu) Berkas</p>
                  <p>Hal: Penawaran Pekerjaan {project.projectName}</p>
                </div>
                <div>
                  <p>Semarang, 14 Agustus 2026</p>
                </div>
              </div>

              <div className="pt-2">
                <p>Kepada Yth.</p>
                <p className="font-semibold text-slate-200">{project.clientName}</p>
                <p className="text-slate-400">{project.clientAddress}</p>
              </div>

              <p>Dengan hormat,</p>
              <p>
                Sehubungan dengan pengumuman pengadaan paket pekerjaan{" "}
                <span
                  onClick={() => setActiveProvenance(`SPK & Scope: ${project.scopeOfWork}`)}
                  className="text-cyan-400 font-semibold cursor-pointer underline decoration-cyan-500/40 hover:bg-cyan-500/10 px-1 rounded"
                >
                  "{project.projectName}"
                </span>
                , bersama ini kami dari{" "}
                <span
                  onClick={() => setActiveProvenance(`Akta Notaris & NIB: ${company.legalDocuments[0]?.documentNumber}`)}
                  className="text-cyan-400 font-semibold cursor-pointer underline decoration-cyan-500/40 hover:bg-cyan-500/10 px-1 rounded"
                >
                  {company.legalName}
                </span>{" "}
                menyampaikan penawaran lengkap sesuai dengan persyaratan administrasi, teknis, dan finansial.
              </p>

              <p>
                Total nilai penawaran biaya yang kami ajukan adalah sebesar{" "}
                <span
                  onClick={() => setActiveProvenance(`Calculated via Deterministic Financial Engine: RAB Breakdown`)}
                  className="text-emerald-400 font-extrabold cursor-pointer underline decoration-emerald-500/40 hover:bg-emerald-500/10 px-1 rounded"
                >
                  {formatIDR(project.financials.grandTotalIDR)}
                </span>{" "}
                (<em>{project.financials.terbilangIDR}</em>) termasuk PPN 11%.
              </p>

              <div className="pt-8 flex justify-end">
                <div className="text-center space-y-12">
                  <p className="font-medium text-slate-300">Hormat kami,</p>
                  <div className="pt-4 border-t border-slate-700">
                    <p className="font-bold text-slate-100">{director.fullName}</p>
                    <p className="text-[10px] text-slate-400">{director.position}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 2: Penawaran Teknis */}
          {selectedSubTab === "teknis" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
                DOKUMEN PENAWARAN TEKNIS & METODOLOGI
              </h3>
              <p><strong>Nama Proyek:</strong> {project.projectName}</p>
              <p><strong>Ruang Lingkup Pekerjaan:</strong> {project.scopeOfWork}</p>
              <h4 className="font-bold text-slate-200 pt-2">1. Pendekatan Metodologi Pekerjaan</h4>
              <p className="text-slate-300">
                Pekerjaan dilaksanakan menggunakan pendekatan *Agile Engineering Framework* dan pemantauan berbasis telemetry IoT real-time.
              </p>
              <h4 className="font-bold text-slate-200 pt-2">2. Pengalaman Perusahaan Terkait (Reusable Experience)</h4>
              <ul className="space-y-2 list-disc list-inside text-slate-300">
                <li>
                  <span
                    onClick={() => setActiveProvenance("Source SPK: 523/SPK/DISKAN/2024 (Verified BAST)")}
                    className="text-cyan-400 font-semibold cursor-pointer underline decoration-cyan-500/40 hover:bg-cyan-500/10 px-1 rounded"
                  >
                    Kaji Terap Automatic Feeder Berbasis IoT (Diskan Kota Semarang) - Nilai: Rp 485.000.000
                  </span>
                </li>
                <li>
                  <span
                    onClick={() => setActiveProvenance("Source SPK: 027/SPK/DKP-JT/IX/2023")}
                    className="text-cyan-400 font-semibold cursor-pointer underline decoration-cyan-500/40 hover:bg-cyan-500/10 px-1 rounded"
                  >
                    SIM Tempat Pelelangan Ikan (DKP Prov Jawa Tengah) - Nilai: Rp 320.000.000
                  </span>
                </li>
              </ul>
            </div>
          )}

          {/* SubTab 3: CV Tenaga Ahli */}
          {selectedSubTab === "cv" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
                DAFTAR RIWAYAT HIDUP (CV) TENAGA AHLI
              </h3>
              {selectedPerson ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-start bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <div>
                      <h4 className="text-sm font-bold text-cyan-400">{selectedPerson.fullName}, {selectedPerson.academicTitle}</h4>
                      <p className="text-slate-400">Posisi Penugasan: Team Leader / Software Architect</p>
                      <p className="text-slate-500 text-[11px]">Pendidikan: {selectedPerson.lastEducation} {selectedPerson.major} ({selectedPerson.university})</p>
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

          {/* SubTab 4: RAB Finansial */}
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

              {/* RAB Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Uraian Komponen</th>
                      <th className="p-2.5">Vol</th>
                      <th className="p-2.5">Satuan</th>
                      <th className="p-2.5">Harga Satuan</th>
                      <th className="p-2.5 text-right">Subtotal (IDR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 text-[11px]">
                    {project.financials.items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-800/40">
                        <td className="p-2.5">{idx + 1}</td>
                        <td className="p-2.5 font-medium">{item.description}</td>
                        <td className="p-2.5">{item.quantity}</td>
                        <td className="p-2.5">{item.unit}</td>
                        <td className="p-2.5">{formatIDR(item.billingRateIDR)}</td>
                        <td className="p-2.5 text-right font-semibold text-slate-100">
                          {formatIDR(item.subtotalIDR)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Totals */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Biaya Langsung Personel:</span>
                  <span className="font-semibold text-slate-200">{formatIDR(project.financials.personnelCostSubtotalIDR)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Biaya Non-Personel:</span>
                  <span className="font-semibold text-slate-200">{formatIDR(project.financials.nonPersonnelCostSubtotalIDR)}</span>
                </div>
                <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800 font-semibold">
                  <span>Total Biaya Langsung (Direct Cost):</span>
                  <span>{formatIDR(project.financials.directCostSubtotalIDR)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>PPN {project.financials.ppnPercent}%:</span>
                  <span>{formatIDR(project.financials.ppnAmountIDR)}</span>
                </div>
                <div className="flex justify-between text-cyan-400 pt-2 border-t border-slate-800 text-sm font-extrabold">
                  <span>GRAND TOTAL (Termasuk Pajak):</span>
                  <span>{formatIDR(project.financials.grandTotalIDR)}</span>
                </div>
                <p className="text-[11px] text-slate-400 italic pt-1">
                  Terbilang: "{project.financials.terbilangIDR}"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
