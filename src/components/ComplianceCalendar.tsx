"use client";

import React from "react";
import { ComplianceEvidence, Company } from "@/types/procurement";
import { Calendar, CheckCircle2, AlertCircle, Clock, FileText, ShieldAlert } from "lucide-react";

interface ComplianceCalendarProps {
  company: Company;
  records: ComplianceEvidence[];
}

export const ComplianceCalendar: React.FC<ComplianceCalendarProps> = ({
  company,
  records,
}) => {
  const companyRecords = records.filter((r) => r.companyId === company.id);

  // Group BPE Records by month 1-12
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const bankRecord = companyRecords.find((r) => r.evidenceType === "SURAT_KETERANGAN_BANK");
  const sptRecord = companyRecords.find((r) => r.evidenceType === "SPT_TAHUNAN");

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Header Banner */}
      <div className="bg-slate-950 p-4 px-6 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-cyan-400" />
            <span>Compliance Calendar & Recurring Evidence Vault</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoring kepatuhan pajak & legalitas berulang (BR-009A) untuk {company.legalName}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded text-xs font-semibold">
            Tahun Pajak: 2026
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* SECTION 1: Recurring Annual Obligations Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Surat Keterangan Bank Card */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  Target Operational Default: Januari
                </span>
                <h3 className="text-sm font-bold text-slate-100 mt-0.5">Surat Keterangan Bank</h3>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold rounded">
                Verified (Annual)
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Dokumen keaktifan bank dan referensi finansial wajib diperbarui 1 kali setiap awal tahun (Default Januari).
            </p>

            {bankRecord ? (
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                <p className="font-semibold text-slate-200">{bankRecord.title}</p>
                <p className="text-slate-400 text-[11px]">No: {bankRecord.documentNumber}</p>
                <p className="text-slate-500 text-[10px]">Diterbitkan: {bankRecord.issueDate} | Valid: {bankRecord.validUntil}</p>
              </div>
            ) : (
              <p className="text-xs text-amber-400">Surat Keterangan Bank tahun berjalan belum tersedia.</p>
            )}
          </div>

          {/* 2. Laporan SPT Tahunan Badan Card */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  Target Operational Default: April
                </span>
                <h3 className="text-sm font-bold text-slate-100 mt-0.5">Laporan Tahunan Pajak (SPT Badan)</h3>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold rounded">
                Verified (Annual)
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Laporan SPT Tahunan Badan tahun pajak 2025 dengan target penyelesaian operasional bulan April.
            </p>

            {sptRecord ? (
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                <p className="font-semibold text-slate-200">{sptRecord.title}</p>
                <p className="text-slate-400 text-[11px]">No BPE: {sptRecord.documentNumber}</p>
                <p className="text-slate-500 text-[10px]">Tanggal Pelaporan: {sptRecord.issueDate}</p>
              </div>
            ) : (
              <p className="text-xs text-amber-400">SPT Tahunan Badan belum diunggah.</p>
            )}
          </div>
        </div>

        {/* SECTION 2: Monthly BPE Tax Checklist 2026 */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Bukti Penerimaan Elektronik (BPE) Pajak Monthly Cycle 2026
              </h3>
              <p className="text-xs text-slate-400">
                Pemantauan kepatuhan bayar/lapor PPh 23 & PPN bulanan untuk penawaran pengadaan.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">12 Bulan / Cycle</span>
          </div>

          {/* Grid Month Checklist */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {monthNames.map((mName, idx) => {
              const monthNum = idx + 1;
              const bpe = companyRecords.find(
                (r) => r.evidenceType === "BPE" && r.taxPeriodMonth === monthNum
              );

              const isVerified = bpe && bpe.status === "VERIFIED";
              const isDue = bpe && bpe.status === "DUE";
              const isFuture = monthNum > 8;

              return (
                <div
                  key={monthNum}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 text-xs transition-all ${
                    isVerified
                      ? "bg-slate-900 border-emerald-500/30"
                      : isDue
                      ? "bg-amber-500/10 border-amber-500/40 animate-pulse"
                      : "bg-slate-950 border-slate-800 opacity-60"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{mName}</span>
                    {isVerified ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : isDue ? (
                      <Clock className="h-4 w-4 text-amber-400" />
                    ) : (
                      <span className="text-[10px] text-slate-500">Upcoming</span>
                    )}
                  </div>

                  {bpe ? (
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-slate-400 truncate">{bpe.documentNumber}</p>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
                          isVerified
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {bpe.status}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">No Record</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
