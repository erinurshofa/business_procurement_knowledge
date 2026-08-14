"use client";

import React from "react";
import { Company } from "@/types/procurement";
import {
  Building2,
  ShieldCheck,
  Download,
  Sparkles,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

interface HeaderProps {
  companies: Company[];
  activeCompanyId: string;
  onCompanyChange: (companyId: string) => void;
  unresolvedConflictCount: number;
  activeRole?: string;
  onRoleChange?: (role: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  companies,
  activeCompanyId,
  onCompanyChange,
  unresolvedConflictCount,
  activeRole = "ADMIN",
  onRoleChange,
}) => {
  const activeCompany = companies.find((c) => c.id === activeCompanyId) || companies[0];

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Brand & App Title */}
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 shadow-lg shadow-cyan-500/20">
          <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-slate-100 tracking-tight">
              Procurement Knowledge OS
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
              v1.0 • Next.js 16
            </span>
          </div>
          <p className="text-xs text-slate-400">
            AI-Powered Business & Procurement Operating System
          </p>
        </div>
      </div>

      {/* Center: Tenant Multi-Company & User Role Switcher */}
      <div className="flex items-center space-x-3">
        {/* Active Company Tenant */}
        <div className="flex items-center space-x-2 bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 rounded-xl shadow-inner">
          <Building2 className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="text-xs text-slate-400">Tenant:</span>
          <div className="relative group">
            <select
              value={activeCompanyId}
              onChange={(e) => onCompanyChange(e.target.value)}
              className="appearance-none bg-transparent text-xs font-semibold text-slate-200 pr-7 cursor-pointer focus:outline-none"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                  {c.legalName} ({c.businessType})
                </option>
              ))}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* User Role Switcher (RBAC) */}
        <div className="flex items-center space-x-2 bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 rounded-xl shadow-inner">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-400">Role:</span>
          <div className="relative group">
            <select
              value={activeRole}
              onChange={(e) => onRoleChange && onRoleChange(e.target.value)}
              className="appearance-none bg-transparent text-xs font-bold text-cyan-400 pr-6 cursor-pointer focus:outline-none"
            >
              <option value="ADMIN" className="bg-slate-900 text-slate-200">👑 Admin / Owner</option>
              <option value="PROCUREMENT_OFFICER" className="bg-slate-900 text-slate-200">📋 Procurement Officer</option>
              <option value="FINANCE" className="bg-slate-900 text-slate-200">💰 Finance & Tax Specialist</option>
              <option value="LEGAL_COMPLIANCE" className="bg-slate-900 text-slate-200">⚖️ Legal & Compliance User</option>
              <option value="APPROVER" className="bg-slate-900 text-slate-200">✅ Approver Authority</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-cyan-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Right Controls: System Integrity & Actions */}
      <div className="flex items-center space-x-4">
        {/* Integrity Badge */}
        {unresolvedConflictCount > 0 ? (
          <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-medium animate-pulse">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{unresolvedConflictCount} Warning Conflict</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>System Verified</span>
          </div>
        )}

        {/* Generate & Export Package Button */}
        <button
          onClick={() => window.open(`/api/export-docx?companyId=${activeCompanyId}`, "_blank")}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export DOCX Package</span>
        </button>
      </div>
    </header>
  );
};
