"use client";

import React from "react";
import {
  ContextState,
  Company,
  Person,
  CompanyExperience,
  ComplianceEvidence,
  Project,
  ConflictAlert,
} from "@/types/procurement";
import { DocumentViewer } from "./DocumentViewer";
import { KnowledgeExplorer } from "./KnowledgeExplorer";
import { ComplianceCalendar } from "./ComplianceCalendar";
import { ConflictInspector } from "./ConflictInspector";
import { FileText, Database, Calendar, ShieldAlert } from "lucide-react";

interface CanvasPanelProps {
  contextState: ContextState;
  companies: Company[];
  people: Person[];
  experiences: CompanyExperience[];
  complianceRecords: ComplianceEvidence[];
  projects: Project[];
  conflicts: ConflictAlert[];
  onTabChange: (tab: "document" | "knowledge" | "compliance" | "conflicts") => void;
  onSelectPerson: (personId: string) => void;
  onResolveConflict: (conflictId: string) => void;
}

export const CanvasPanel: React.FC<CanvasPanelProps> = ({
  contextState,
  companies,
  people,
  experiences,
  complianceRecords,
  projects,
  conflicts,
  onTabChange,
  onSelectPerson,
  onResolveConflict,
}) => {
  const activeCompany = companies.find((c) => c.id === contextState.activeCompanyId) || companies[0];
  const activeProject =
    projects.find((p) => p.id === contextState.activeProjectId && p.companyId === contextState.activeCompanyId) ||
    projects.find((p) => p.companyId === contextState.activeCompanyId) ||
    projects[0];
  const activePerson = people.find((p) => p.id === contextState.activePersonId);

  const unresolvedConflictCount = conflicts.filter((c) => c.status === "UNRESOLVED").length;

  return (
    <div className="w-1/2 h-[calc(100vh-4rem)] bg-slate-900 flex flex-col justify-between overflow-hidden">
      {/* Top Tab Bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-1 py-2">
          <button
            onClick={() => onTabChange("document")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              contextState.activeTab === "document"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Document Package</span>
          </button>

          <button
            onClick={() => onTabChange("knowledge")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              contextState.activeTab === "knowledge"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Knowledge Hub</span>
          </button>

          <button
            onClick={() => onTabChange("compliance")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              contextState.activeTab === "compliance"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Compliance Calendar</span>
          </button>

          <button
            onClick={() => onTabChange("conflicts")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all relative ${
              contextState.activeTab === "conflicts"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Conflict Inspector</span>
            {unresolvedConflictCount > 0 && (
              <span className="ml-1 bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                {unresolvedConflictCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {contextState.activeTab === "document" && (
          <DocumentViewer
            company={activeCompany}
            project={activeProject}
            selectedPerson={activePerson}
          />
        )}

        {contextState.activeTab === "knowledge" && (
          <KnowledgeExplorer
            companies={companies}
            people={people}
            experiences={experiences}
            activeCompanyId={contextState.activeCompanyId}
            onSelectPerson={onSelectPerson}
          />
        )}

        {contextState.activeTab === "compliance" && (
          <ComplianceCalendar
            company={activeCompany}
            records={complianceRecords}
          />
        )}

        {contextState.activeTab === "conflicts" && (
          <ConflictInspector
            conflicts={conflicts}
            onResolveConflict={onResolveConflict}
          />
        )}
      </div>
    </div>
  );
};
