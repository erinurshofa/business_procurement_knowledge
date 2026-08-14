"use client";

import React from "react";
import { ConflictAlert } from "@/types/procurement";
import { AlertTriangle, CheckCircle, ShieldAlert, FileText, ArrowRight } from "lucide-react";

interface ConflictInspectorProps {
  conflicts: ConflictAlert[];
  onResolveConflict: (conflictId: string) => void;
}

export const ConflictInspector: React.FC<ConflictInspectorProps> = ({
  conflicts,
  onResolveConflict,
}) => {
  const unresolvedConflicts = conflicts.filter((c) => c.status === "UNRESOLVED");
  const resolvedConflicts = conflicts.filter((c) => c.status === "VERIFIED_BY_USER");

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-950 p-4 px-6 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            <span>Consistency & Conflict Inspector (Red Flags Detector)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mencegah silent resolution dan menjamin fakta dokumen konsisten (BRULE-004 & BRULE-005)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded text-xs font-semibold">
            {unresolvedConflicts.length} Conflicts Active
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* ACTIVE UNRESOLVED CONFLICTS */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Konflik Membutuhkan Verifikasi Pengguna ({unresolvedConflicts.length})</span>
          </h3>

          {unresolvedConflicts.length === 0 ? (
            <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 text-center space-y-2">
              <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-slate-100">Tidak Ada Konflik Terdeteksi</p>
              <p className="text-xs text-slate-400">
                Semua data terstruktur, evidence legalitas, dan perhitungan finansial konsisten 100%.
              </p>
            </div>
          ) : (
            unresolvedConflicts.map((conf) => (
              <div
                key={conf.id}
                className="bg-slate-950 p-5 rounded-xl border border-amber-500/30 space-y-4 text-xs shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        conf.severity === "CRITICAL"
                          ? "bg-red-500/10 text-red-400 border border-red-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {conf.severity} RED FLAG
                    </span>
                    <h4 className="font-bold text-slate-100">{conf.entityName}</h4>
                  </div>
                  <span className="text-slate-500 font-mono text-[10px]">{conf.field}</span>
                </div>

                <p className="text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800">
                  {conf.message}
                </p>

                {/* Source Comparison */}
                <div className="grid grid-cols-2 gap-3 text-[11px] bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Source Evidence A:</span>
                    <span className="font-medium text-cyan-400">{conf.sourceA}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Source Evidence B:</span>
                    <span className="font-medium text-cyan-400">{conf.sourceB}</span>
                  </div>
                </div>

                {/* Verification Resolution Button */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onResolveConflict(conf.id)}
                    className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg shadow-md transition-all"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Verifikasi & Setujui Fakta Ini</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* VERIFIED / RESOLVED CONFLICTS HISTORY */}
        {resolvedConflicts.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Riwayat Konflik Yang Telah Diverifikasi ({resolvedConflicts.length})</span>
            </h3>

            {resolvedConflicts.map((conf) => (
              <div
                key={conf.id}
                className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-xs opacity-70"
              >
                <div>
                  <p className="font-semibold text-slate-300">{conf.entityName}</p>
                  <p className="text-slate-500 text-[11px]">{conf.message}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold rounded">
                  VERIFIED BY USER
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
