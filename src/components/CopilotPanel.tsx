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
  Copy,
  Check,
  Cpu,
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to render inline markdown (bold, code, italic)
  const renderInlineMarkdown = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match;
    let keyIdx = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith("`") && token.endsWith("`")) {
        parts.push(
          <code
            key={keyIdx++}
            className="font-mono text-[11px] bg-slate-950/90 text-cyan-300 border border-slate-800 px-1.5 py-0.5 rounded shadow-inner"
          >
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith("**") && token.endsWith("**")) {
        parts.push(
          <strong key={keyIdx++} className="font-semibold text-slate-100 font-sans">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith("*") && token.endsWith("*")) {
        parts.push(
          <em key={keyIdx++} className="italic text-slate-300 font-sans">
            {token.slice(1, -1)}
          </em>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  // Helper to parse rich structured Markdown blocks
  const parseRichMarkdown = (text: string) => {
    const paragraphs = text.split("\n\n");

    return paragraphs.map((para, pIdx) => {
      const lines = para.split("\n").filter((l) => l.trim().length > 0);

      // Check if paragraph is a list of items
      const isList =
        lines.length > 1 &&
        lines.every((line) => {
          const t = line.trim();
          return t.startsWith("•") || t.startsWith("-") || t.startsWith("*") || /^\d+\./.test(t);
        });

      if (isList) {
        return (
          <ul key={pIdx} className="space-y-1.5 my-2">
            {lines.map((line, lIdx) => {
              const cleanLine = line.replace(/^[•\-\*]\s*/, "").replace(/^\d+\.\s*/, "");
              return (
                <li
                  key={lIdx}
                  className="flex items-start space-x-2.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 shadow-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0 shadow-sm shadow-cyan-400/80" />
                  <div className="flex-1 text-slate-200 leading-relaxed">
                    {renderInlineMarkdown(cleanLine)}
                  </div>
                </li>
              );
            })}
          </ul>
        );
      }

      return (
        <div key={pIdx} className="space-y-1 my-1.5">
          {lines.map((line, lIdx) => {
            const trimmed = line.trim();

            // Callout / Alert for Warnings (Red Flag)
            if (trimmed.startsWith("⚠️") || trimmed.includes("Red Flag")) {
              return (
                <div
                  key={lIdx}
                  className="p-3 my-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl flex items-start space-x-2.5 shadow-sm"
                >
                  <span className="text-sm shrink-0">⚠️</span>
                  <div className="flex-1 leading-relaxed font-medium">
                    {renderInlineMarkdown(trimmed.replace(/^⚠️\s*/, ""))}
                  </div>
                </div>
              );
            }

            // Callout for Success / Confirmed items
            if (trimmed.startsWith("✓") || trimmed.startsWith("✔")) {
              return (
                <div
                  key={lIdx}
                  className="p-2.5 my-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center space-x-2 text-xs"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <div className="flex-1 font-medium">{renderInlineMarkdown(trimmed.replace(/^[✓✔]\s*/, ""))}</div>
                </div>
              );
            }

            // Document / Feature Callout Card
            if (
              trimmed.startsWith("📄") ||
              trimmed.startsWith("📘") ||
              trimmed.startsWith("👤") ||
              trimmed.startsWith("📊")
            ) {
              return (
                <div
                  key={lIdx}
                  className="p-2.5 my-1.5 bg-cyan-950/40 border border-cyan-800/40 text-cyan-200 rounded-xl flex items-center space-x-2.5 text-xs shadow-sm hover:border-cyan-700/60 transition-all"
                >
                  <span className="text-sm shrink-0">{trimmed.slice(0, 2)}</span>
                  <div className="flex-1 font-medium">{renderInlineMarkdown(trimmed.slice(2).trim())}</div>
                </div>
              );
            }

            // Single List Item
            if (trimmed.startsWith("•") || trimmed.startsWith("-") || /^\d+\./.test(trimmed)) {
              const cleanLine = trimmed.replace(/^[•\-\*]\s*/, "").replace(/^\d+\.\s*/, "");
              return (
                <div key={lIdx} className="flex items-start space-x-2 my-1 pl-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <div className="flex-1 text-slate-200">{renderInlineMarkdown(cleanLine)}</div>
                </div>
              );
            }

            return (
              <p key={lIdx} className="leading-relaxed">
                {renderInlineMarkdown(line)}
              </p>
            );
          })}
        </div>
      );
    });
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
          <span className="flex items-center space-x-1.5 bg-slate-800/90 text-cyan-300 px-2.5 py-1 rounded-md border border-slate-700/80 font-medium shadow-sm">
            <Building2 className="h-3 w-3 text-cyan-400" />
            <span>{activeCompany?.legalName || "No Company"}</span>
          </span>

          {/* Active Project Badge */}
          {activeProject && (
            <span className="flex items-center space-x-1.5 bg-slate-800/90 text-emerald-300 px-2.5 py-1 rounded-md border border-slate-700/80 font-medium shadow-sm">
              <FolderGit2 className="h-3 w-3 text-emerald-400" />
              <span className="max-w-[140px] truncate">{activeProject.projectName}</span>
            </span>
          )}

          {/* Active Person Badge */}
          {activePerson && (
            <span className="flex items-center space-x-1.5 bg-slate-800/90 text-indigo-300 px-2.5 py-1 rounded-md border border-slate-700/80 font-medium shadow-sm">
              <UserCheck className="h-3 w-3 text-indigo-400" />
              <span>{activePerson.fullName}</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Conversational Message Thread */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 group ${
              msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div
              className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                msg.sender === "user"
                  ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white"
                  : "bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white ring-2 ring-cyan-500/20 shadow-cyan-500/20"
              }`}
            >
              {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Content Bubble Container */}
            <div className="max-w-[85%] space-y-1.5">
              {/* Header Badge for Bot */}
              {msg.sender === "assistant" && (
                <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-slate-300">Procurement AI Engine</span>
                  </div>
                  <button
                    onClick={() => handleCopy(msg.text, msg.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-cyan-400 flex items-center space-x-1"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`rounded-2xl p-4 text-xs leading-relaxed transition-all shadow-lg ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-tr-none shadow-blue-500/10"
                    : "bg-slate-900/90 border border-slate-800/90 text-slate-200 rounded-tl-none hover:border-slate-700/80 backdrop-blur-md"
                }`}
              >
                {/* Message Content */}
                <div className="font-sans">
                  {msg.sender === "user" ? msg.text : parseRichMarkdown(msg.text)}
                </div>

                {/* Footer Timestamp */}
                <div
                  className={`text-[10px] text-right pt-2 ${
                    msg.sender === "user" ? "text-blue-200" : "text-slate-500"
                  }`}
                >
                  {msg.timestamp}
                </div>

                {/* Suggested Action Buttons */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5 mt-2">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => onSendMessage(action.actionPrompt)}
                        className="flex items-center space-x-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm shadow-cyan-500/10"
                      >
                        <Zap className="h-3 w-3 text-cyan-400" />
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Prompt Input Box */}
      <div className="p-4 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md">
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
            className="absolute right-2 p-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white rounded-lg transition-all shadow-md shadow-cyan-500/20"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2.5 px-1">
          <span className="flex items-center space-x-1 text-slate-400 font-mono">
            <Cpu className="h-3 w-3 text-cyan-400" />
            <span>LLM Model: Gemini 2.5 Flash / Llama 3.3 70B</span>
          </span>
          <span>RAG Knowledge & Financial Engine Enabled</span>
        </div>
      </div>
    </div>
  );
};
