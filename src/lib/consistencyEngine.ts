import {
  Company,
  Project,
  ComplianceEvidence,
  ConflictAlert,
  VerificationState,
} from "@/types/procurement";

export interface SystemAuditResult {
  conflicts: ConflictAlert[];
  expiredItemsCount: number;
  missingItemsCount: number;
  overallStatus: "READY" | "REQUIRES_ATTENTION" | "CRITICAL_BLOCKED";
}

export function runConsistencyCheck(
  company: Company,
  project?: Project,
  complianceRecords: ComplianceEvidence[] = []
): SystemAuditResult {
  const conflicts: ConflictAlert[] = [];
  let expiredItemsCount = 0;
  let missingItemsCount = 0;

  // 1. Check Company Legal Documents Expiration
  company.legalDocuments.forEach((doc) => {
    if (doc.validUntil) {
      const validDate = new Date(doc.validUntil);
      const now = new Date();
      if (validDate < now) {
        expiredItemsCount++;
        conflicts.push({
          id: `conf-exp-${doc.id}`,
          severity: "HIGH",
          entityName: `${company.legalName} - Dokumen ${doc.documentType}`,
          field: "Temporal Validity",
          message: `Dokumen ${doc.documentType} No. ${doc.documentNumber} telah kadaluarsa pada ${doc.validUntil}.`,
          sourceA: `Legal Vault (${doc.sourceFile})`,
          sourceB: "Current System Date (2026)",
          status: "UNRESOLVED",
        });
      }
    }
  });

  // 2. Check Director Signatory Presence
  const hasSignatory = company.directors.some((d) => d.isSignatory);
  if (!hasSignatory) {
    missingItemsCount++;
    conflicts.push({
      id: `conf-nosig-${company.id}`,
      severity: "CRITICAL",
      entityName: company.legalName,
      field: "Authorized Signatory",
      message: "Tidak ada Direktur yang ditunjuk sebagai Penandatangan Resmi (Signatory). Dokumen penawaran tidak dapat ditandatangani.",
      sourceA: "Master Data Perusahaan",
      sourceB: "Syarat Legalitas Penawaran Procurement",
      status: "UNRESOLVED",
    });
  }

  // 3. Check Monthly Tax BPE Completeness (Current Year 2026)
  const currentMonth = new Date().getMonth() + 1; // e.g. August = 8
  const companyBPEs = complianceRecords.filter(
    (c) => c.companyId === company.id && c.evidenceType === "BPE" && c.taxYear === 2026
  );

  for (let m = 1; m < currentMonth; m++) {
    const monthBPE = companyBPEs.find((b) => b.taxPeriodMonth === m);
    if (!monthBPE || monthBPE.status === "MISSING" || monthBPE.status === "DUE") {
      missingItemsCount++;
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
      conflicts.push({
        id: `conf-bpe-missing-${m}`,
        severity: "HIGH",
        entityName: `Compliance Pajak - BPE Masa ${monthNames[m - 1]} 2026`,
        field: "Monthly Recurring Tax Evidence",
        message: `Bukti Penerimaan Elektronik (BPE) Masa ${monthNames[m - 1]} 2026 belum diverifikasi/diunggah.`,
        sourceA: "Compliance Repository Rules (BR-009A)",
        sourceB: "Pemeriksaan Kepatuhan Pajak Bulanan",
        status: "UNRESOLVED",
      });
    }
  }

  // 4. Check Project Specific Rules if Project exists
  if (project) {
    if (project.assignments.length === 0) {
      missingItemsCount++;
      conflicts.push({
        id: `conf-proj-noassign-${project.id}`,
        severity: "CRITICAL",
        entityName: `Proyek ${project.projectName}`,
        field: "Personnel Assignment",
        message: "Belum ada Tenaga Ahli yang ditugaskan dalam proyek ini.",
        sourceA: "Project Configuration",
        sourceB: "Syarat Penawaran Teknis",
        status: "UNRESOLVED",
      });
    }

    if (project.selectedExperienceIds.length === 0) {
      missingItemsCount++;
      conflicts.push({
        id: `conf-proj-noexp-${project.id}`,
        severity: "HIGH",
        entityName: `Proyek ${project.projectName}`,
        field: "Company Experience Links",
        message: "Belum ada Pengalaman Perusahaan yang relevan yang ditautkan ke proyek ini.",
        sourceA: "Project Configuration",
        sourceB: "Syarat Kualifikasi Pengalaman",
        status: "UNRESOLVED",
      });
    }
  }

  let overallStatus: "READY" | "REQUIRES_ATTENTION" | "CRITICAL_BLOCKED" = "READY";
  if (conflicts.some((c) => c.severity === "CRITICAL")) {
    overallStatus = "CRITICAL_BLOCKED";
  } else if (conflicts.length > 0) {
    overallStatus = "REQUIRES_ATTENTION";
  }

  return {
    conflicts,
    expiredItemsCount,
    missingItemsCount,
    overallStatus,
  };
}

export function getVerificationBadgeStyle(state: VerificationState): {
  bgColor: string;
  textColor: string;
  label: string;
} {
  switch (state) {
    case "CONFIRMED":
      return { bgColor: "bg-emerald-500/10 border-emerald-500/30", textColor: "text-emerald-400", label: "CONFIRMED" };
    case "SUPPORTED":
      return { bgColor: "bg-blue-500/10 border-blue-500/30", textColor: "text-blue-400", label: "SUPPORTED" };
    case "INFERRED":
      return { bgColor: "bg-indigo-500/10 border-indigo-500/30", textColor: "text-indigo-400", label: "INFERRED" };
    case "CONFLICTED":
      return { bgColor: "bg-red-500/10 border-red-500/30", textColor: "text-red-400", label: "CONFLICT" };
    case "EXPIRED":
      return { bgColor: "bg-amber-500/10 border-amber-500/30", textColor: "text-amber-400", label: "EXPIRED" };
    case "MISSING":
      return { bgColor: "bg-rose-500/10 border-rose-500/30", textColor: "text-rose-400", label: "MISSING" };
    default:
      return { bgColor: "bg-slate-500/10 border-slate-500/30", textColor: "text-slate-400", label: "UNVERIFIED" };
  }
}
