"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, ContextState, Company, Person, Project } from "@/types/procurement";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Building2,
  FolderGit2,
  UserCheck,
  Zap,
} from "lucide-react";

interface CopilotPanelProps {
  messages: ChatMessage[];
  contextState: ContextState;
  companies: Company[];
  people: Person[];
  projects: Project[];
  onSendMessage: (prompt: string) => void;
}

export const CopilotPanel: React.FC<CopilotPanelProps> = ({
  messages,
  contextState,
  companies,
  people,
  projects,
  onSendMessage,
}) => {
  const [inputPrompt, setInputPrompt] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeCompany = companies.find((c) => c.id === contextState.activeCompanyId);
  const activeProject = projects.find((p) => p.id === contextState.activeProjectId);
  const activePerson = people.find((p) => p.id === contextState.activePersonId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;
    onSendMessage(inputPrompt);
    setInputPrompt("");
  };

  return (
    <div className="w-1/2 h-[calc(100vh-4rem)] bg-slate-950 border-r border-slate-800 flex flex-col justify-between">
      {/* 1. Context Indicator Bar */}
      <div className="bg-slate-900/80 border-b border-slate-800 p-3.5 px-5 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">Active Context:</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          {/* Active Company Badge */}
          <span className="flex items-center space-x-1.5 bg-slate-800 text-cyan-300 px-2.5 py-1 rounded-md border border-slate-700 font-medium">
            <Building2 className="h-3 w-3 text-cyan-400" />
            <span>{activeCompany?.legalName || "No Company"}</span>
          </span>

          {/* Active Project Badge */}
          {activeProject && (
            <span className="flex items-center space-x-1.5 bg-slate-800 text-emerald-300 px-2.5 py-1 rounded-md border border-slate-700 font-medium">
              <FolderGit2 className="h-3 w-3 text-emerald-400" />
              <span className="max-w-[140px] truncate">{activeProject.projectName}</span>
            </span>
          )}

          {/* Active Person Badge */}
          {activePerson && (
            <span className="flex items-center space-x-1.5 bg-slate-800 text-indigo-300 px-2.5 py-1 rounded-md border border-slate-700 font-medium">
              <UserCheck className="h-3 w-3 text-indigo-400" />
              <span>{activePerson.fullName}</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Conversational Message Thread */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
              }`}
            >
              {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Content Bubble */}
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white font-medium rounded-tr-none shadow-md"
                  : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-inner"
              }`}
            >
              {/* Message Body */}
              <div className="whitespace-pre-wrap font-sans">
                {msg.text.split("\n").map((line, idx) => (
                  <p key={idx} className={line.startsWith("•") || line.startsWith("1.") ? "ml-2 my-1" : "my-0.5"}>
                    {line}
                  </p>
                ))}
              </div>

              {/* Timestamp */}
              <div
                className={`text-[10px] text-right ${
                  msg.sender === "user" ? "text-blue-200" : "text-slate-500"
                }`}
              >
                {msg.timestamp}
              </div>

              {/* Action Prompt Suggestions */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                  {msg.suggestedActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSendMessage(action.actionPrompt)}
                      className="flex items-center space-x-1 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/50 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all hover:scale-105"
                    >
                      <Zap className="h-3 w-3 text-cyan-400" />
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Prompt Input Box */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Tulis perintah ('Gunakan CV Alfa Omega', 'Cari pengalaman relevan', 'Generate dokumen')..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-3 pl-4 pr-12 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim()}
            className="absolute right-2 p-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white rounded-lg transition-all shadow-md"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className="text-[10px] text-slate-500 mt-2 text-center">
          Powered by RAG Knowledge Engine & Deterministic Financial Calculations
        </p>
      </div>
    </div>
  );
};
