"use client";

import React, { useState, useEffect } from "react";
import {
  ContextState,
  ChatMessage,
  ConflictAlert,
  Company,
  Person,
  CompanyExperience,
  ComplianceEvidence,
  Project,
} from "@/types/procurement";
import {
  MOCK_COMPANIES,
  MOCK_PEOPLE,
  MOCK_EXPERIENCES,
  MOCK_COMPLIANCE_EVIDENCE,
  MOCK_PROJECTS,
  MOCK_CONFLICTS,
} from "@/lib/mockData";
import { processUserConversationalPrompt } from "@/lib/conversationalEngine";
import { runConsistencyCheck } from "@/lib/consistencyEngine";
import { Header } from "@/components/Header";
import { CopilotPanel } from "@/components/CopilotPanel";
import { CanvasPanel } from "@/components/CanvasPanel";

export default function Home() {
  const [companies] = useState<Company[]>(MOCK_COMPANIES);
  const [people] = useState<Person[]>(MOCK_PEOPLE);
  const [experiences] = useState<CompanyExperience[]>(MOCK_EXPERIENCES);
  const [complianceRecords] = useState<ComplianceEvidence[]>(MOCK_COMPLIANCE_EVIDENCE);
  const [projects] = useState<Project[]>(MOCK_PROJECTS);
  const [conflicts, setConflicts] = useState<ConflictAlert[]>(MOCK_CONFLICTS);

  const [contextState, setContextState] = useState<ContextState>({
    activeCompanyId: "aos",
    activeProjectId: "proj-1",
    activePersonId: "person-1",
    activeTab: "document",
    searchQuery: "",
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      text: "Selamat datang di **Business & Procurement Knowledge Operating System**.\n\nPerusahaan aktif saat ini adalah **CV ALFA OMEGA SOLUSINDO**.\nSemua master data, legalitas, riwayat personel, dan bukti pajak terisolasi dalam scope perusahaan ini.\n\nBagaimana saya dapat membantu pekerjaan procurement Anda hari ini?",
      timestamp: "16:00",
      suggestedActions: [
        { label: "Gunakan PT Ezra Pratama", actionPrompt: "Switch ke PT Ezra" },
        { label: "Cari Pengalaman Relevan", actionPrompt: "Cari pengalaman perusahaan yang paling relevan" },
        { label: "Cek Compliance BPE Pajak", actionPrompt: "Lihat compliance calendar" },
        { label: "Generate Paket Penawaran", actionPrompt: "Generate semua dokumen" },
      ],
    },
  ]);

  // Run consistency checks on mount & context updates
  useEffect(() => {
    const currentCompany = companies.find((c) => c.id === contextState.activeCompanyId) || companies[0];
    const currentProject = projects.find((p) => p.id === contextState.activeProjectId);
    const result = runConsistencyCheck(currentCompany, currentProject, complianceRecords);

    // Merge generated conflicts with mock conflicts without duplicates
    setConflicts((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const newItems = result.conflicts.filter((c) => !existingIds.has(c.id));
      return [...prev, ...newItems];
    });
  }, [contextState.activeCompanyId, contextState.activeProjectId, companies, projects, complianceRecords]);

  // Conversational prompt handler
  const handleSendMessage = (userPromptText: string) => {
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: userPromptText,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Process intent & get AI response
    setTimeout(() => {
      const { assistantResponse, nextState } = processUserConversationalPrompt(
        userPromptText,
        contextState,
        companies,
        people,
        experiences
      );

      setContextState(nextState);
      setMessages((prev) => [...prev, assistantResponse]);
    }, 400);
  };

  const handleCompanyChange = (companyId: string) => {
    setContextState((prev) => ({ ...prev, activeCompanyId: companyId }));
    const targetComp = companies.find((c) => c.id === companyId);

    const systemNotice: ChatMessage = {
      id: `msg-sys-${Date.now()}`,
      sender: "assistant",
      text: `Context switched to **${targetComp?.legalName}**.\nTenant scope & master data updated successfully.`,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, systemNotice]);
  };

  const handleTabChange = (tab: "document" | "knowledge" | "compliance" | "conflicts") => {
    setContextState((prev) => ({ ...prev, activeTab: tab }));
  };

  const handleSelectPerson = (personId: string) => {
    setContextState((prev) => ({ ...prev, activePersonId: personId, activeTab: "document" }));
    const person = people.find((p) => p.id === personId);

    const msg: ChatMessage = {
      id: `msg-person-${Date.now()}`,
      sender: "assistant",
      text: `Tenaga Ahli **${person?.fullName}** dipilih. CV terverifikasi diintegrasikan ke Dokumen Paket Penawaran.`,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, msg]);
  };

  const handleResolveConflict = (conflictId: string) => {
    setConflicts((prev) =>
      prev.map((c) => (c.id === conflictId ? { ...c, status: "VERIFIED_BY_USER" } : c))
    );

    const msg: ChatMessage = {
      id: `msg-res-${Date.now()}`,
      sender: "assistant",
      text: `Konflik data \`${conflictId}\` telah diverifikasi dan disetujui pengguna. Status diubah menjadi VERIFIED.`,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, msg]);
  };

  const unresolvedConflictCount = conflicts.filter((c) => c.status === "UNRESOLVED").length;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Header */}
      <Header
        companies={companies}
        activeCompanyId={contextState.activeCompanyId}
        onCompanyChange={handleCompanyChange}
        unresolvedConflictCount={unresolvedConflictCount}
      />

      {/* Main Workspace Split View */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Conversational Copilot */}
        <CopilotPanel
          messages={messages}
          contextState={contextState}
          companies={companies}
          people={people}
          projects={projects}
          onSendMessage={handleSendMessage}
        />

        {/* Right Side: Interactive Multi-Tab Canvas */}
        <CanvasPanel
          contextState={contextState}
          companies={companies}
          people={people}
          experiences={experiences}
          complianceRecords={complianceRecords}
          projects={projects}
          conflicts={conflicts}
          onTabChange={handleTabChange}
          onSelectPerson={handleSelectPerson}
          onResolveConflict={handleResolveConflict}
        />
      </main>
    </div>
  );
}
