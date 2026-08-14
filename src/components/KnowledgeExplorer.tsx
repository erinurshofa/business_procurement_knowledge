import React, { useState } from "react";
import { Company, Person, CompanyExperience } from "@/types/procurement";
import { getVerificationBadgeStyle } from "@/lib/consistencyEngine";
import { formatIDR } from "@/lib/financialEngine";
import {
  Building2,
  Users,
  Award,
  ShieldCheck,
  FileCheck2,
  Search,
  UploadCloud,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";
import { OCRExtractionResult } from "@/lib/ocrEngine";

interface KnowledgeExplorerProps {
  companies: Company[];
  people: Person[];
  experiences: CompanyExperience[];
  activeCompanyId: string;
  onSelectPerson: (personId: string) => void;
}

export const KnowledgeExplorer: React.FC<KnowledgeExplorerProps> = ({
  companies,
  people,
  experiences,
  activeCompanyId,
  onSelectPerson,
}) => {
  const [subTab, setSubTab] = useState<"company" | "people" | "experience">("company");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRExtractionResult | null>(null);

  const activeCompany = companies.find((c) => c.id === activeCompanyId) || companies[0];
  const companyExperiences = experiences.filter((e) => e.companyId === activeCompanyId);

  const filteredPeople = people.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-ocr", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setOcrResult(data.data);
      }
    } catch (err) {
      console.error("Upload OCR error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden relative">
      {/* Sub Navigation & Search Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800 p-3 px-5 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setSubTab("company")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              subTab === "company"
                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-semibold"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Company Profile & Legal</span>
          </button>
          <button
            onClick={() => setSubTab("people")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              subTab === "people"
                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-semibold"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Global People Directory ({people.length})</span>
          </button>
          <button
            onClick={() => setSubTab("experience")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              subTab === "experience"
                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-semibold"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Experience Repository ({companyExperiences.length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Upload & OCR Dropzone Button */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-all shadow-md"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Upload & OCR PDF</span>
          </button>

          {/* Filter / Search Input */}
          <div className="relative w-40">
            <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari data..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1 pl-8 pr-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      {/* OCR Document Upload Modal */}
      {isUploadOpen && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <UploadCloud className="h-5 w-5 text-cyan-400" />
                <h3 className="font-bold text-slate-100 text-sm">Upload & Engine OCR Dokumen Faktual</h3>
              </div>
              <button
                onClick={() => {
                  setIsUploadOpen(false);
                  setOcrResult(null);
                }}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Unggah berkas SPK, Kontrak, BAST, NIB, atau Bukti Pajak BPE (PDF/Word/Gambar). Sistem AI OCR secara otomatis mengekstrak metadata nomor, tanggal, instansi, dan nilai finansial.
            </p>

            {/* Dropzone Input */}
            <div className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-xl p-6 text-center space-y-3 bg-slate-950/60 transition-all cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <UploadCloud className="h-8 w-8 text-cyan-400 mx-auto animate-bounce" />
              <div>
                <p className="text-xs font-semibold text-cyan-300">Klik atau seret berkas ke sini</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Mendukung format PDF, DOCX, PNG, JPG (Maks. 25MB)</p>
              </div>
            </div>

            {uploading && (
              <div className="flex items-center justify-center space-x-2 py-4 text-xs text-cyan-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memproses ekstraksi OCR & verifikasi entitas...</span>
              </div>
            )}

            {ocrResult && (
              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40 space-y-2 text-xs animate-fadeIn">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Ekstraksi OCR Berhasil (Skor Kepercayaan: {(ocrResult.confidenceScore * 100).toFixed(0)}%)</span>
                </div>
                <div className="space-y-1 text-slate-300 pt-1 border-t border-slate-800">
                  <p><strong>Nama Berkas:</strong> {ocrResult.fileName}</p>
                  <p><strong>Nomor Dokumen:</strong> <span className="font-mono text-cyan-400">{ocrResult.extractedFields.contractNumber || ocrResult.extractedFields.nibNumber}</span></p>
                  <p><strong>Instansi Client:</strong> {ocrResult.extractedFields.clientName || "Dinas Sosial / Perikanan"}</p>
                  {ocrResult.extractedFields.contractValueIDR && (
                    <p><strong>Nilai Kontrak:</strong> <span className="text-emerald-400 font-bold">{formatIDR(ocrResult.extractedFields.contractValueIDR)}</span></p>
                  )}
                  <p><strong>Penandatangan:</strong> {ocrResult.extractedFields.signatoryName || "Direktur Perusahaan"}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* SUBTAB 1: Company Profile & Legal Documents */}
        {subTab === "company" && (
          <div className="space-y-6">
            {/* Identity Card */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-slate-100">{activeCompany.legalName}</h3>
                  <p className="text-xs text-slate-400">{activeCompany.address}, {activeCompany.city}</p>
                </div>
                <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold text-xs rounded-full">
                  Tenant ID: {activeCompany.id.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-slate-300 border-t border-slate-800 pt-3">
                <div>
                  <p className="text-slate-500 text-[11px]">Telepon / Email:</p>
                  <p>{activeCompany.phone} • {activeCompany.email}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[11px]">Rekening Bank Resmi:</p>
                  <p>{activeCompany.bankName} ({activeCompany.bankAccountNumber})</p>
                </div>
              </div>
            </div>

            {/* Directors */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Direksi & Penandatangan Resmi (Authorized Signatories)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeCompany.directors.map((dir) => (
                  <div key={dir.id} className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-100">{dir.fullName}</span>
                      {dir.isSignatory && (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-semibold">
                          Signatory
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400">{dir.position}</p>
                    <p className="text-slate-500 text-[11px]">NIK: {dir.idCardNumber} | NPWP: {dir.taxIdNumber}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Documents */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Legalitas Perusahaan & NIB (Source Vault)
              </h4>
              <div className="space-y-2">
                {activeCompany.legalDocuments.map((doc) => {
                  const badge = getVerificationBadgeStyle(doc.verificationState);
                  return (
                    <div key={doc.id} className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-200">{doc.documentType} - No: {doc.documentNumber}</p>
                        <p className="text-slate-500 text-[11px]">Diterbitkan: {doc.issueDate} oleh {doc.issuingAuthority}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded border text-[10px] font-semibold ${badge.bgColor} ${badge.textColor}`}>
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: Global People Directory */}
        {subTab === "people" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPeople.map((person) => (
              <div
                key={person.id}
                onClick={() => onSelectPerson(person.id)}
                className="bg-slate-950 p-5 rounded-xl border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{person.fullName}, {person.academicTitle}</h4>
                    <p className="text-xs text-cyan-400">Pengalaman: {person.totalYearsExperience} Tahun</p>
                  </div>
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] px-2 py-0.5 rounded font-semibold">
                    Global Entity
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  {person.lastEducation} {person.major} • {person.university}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {person.skills.map((skill, idx) => (
                    <span key={idx} className="bg-slate-900 text-slate-300 border border-slate-800 text-[10px] px-2 py-0.5 rounded">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[11px] text-slate-500">
                  <span>CV File: {person.cvSourceFile}</span>
                  <span className="text-cyan-400 font-medium hover:underline">Select for Assignment →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SUBTAB 3: Experience Repository */}
        {subTab === "experience" && (
          <div className="space-y-4">
            {companyExperiences.map((exp) => (
              <div key={exp.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{exp.projectName}</h4>
                    <p className="text-slate-400">Klien: {exp.clientName} ({exp.location})</p>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold text-sm block">
                      {formatIDR(exp.contractValueIDR)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">No SPK: {exp.contractNumber}</span>
                  </div>
                </div>

                <p className="text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800/80">
                  {exp.scopeSummary}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px]">
                  <div className="flex items-center space-x-3 text-slate-400">
                    <span className="flex items-center space-x-1">
                      <FileCheck2 className="h-3.5 w-3.5 text-cyan-400" />
                      <span>SPK: {exp.spkSourceFile}</span>
                    </span>
                    {exp.bastSourceFile && (
                      <span className="flex items-center space-x-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>BAST Verified</span>
                      </span>
                    )}
                  </div>

                  <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-semibold">
                    Relevance Score: {exp.relevanceScore}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
