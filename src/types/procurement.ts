// Business Procurement Knowledge Workspace Types
// Grounded strictly in BRD v1.1 & PRD v1.0 specifications

export type VerificationState =
  | "CONFIRMED"
  | "SUPPORTED"
  | "INFERRED"
  | "ASSUMED"
  | "MISSING"
  | "CONFLICTED"
  | "EXPIRED"
  | "UNVERIFIED"
  | "POTENTIALLY_OUTDATED";

export type ComplianceStatus =
  | "UPCOMING"
  | "DUE"
  | "OVERDUE"
  | "MISSING"
  | "SUBMITTED"
  | "VERIFIED"
  | "EXPIRED"
  | "CONFLICTED"
  | "UNVERIFIED";

export interface CompanyBranding {
  logoUrl?: string;
  letterheadUrl?: string;
  signatureUrl?: string;
  stampUrl?: string;
  footerText?: string;
  numberingPattern: string; // e.g. "001/SP-AOS/VIII/2026"
}

export interface Director {
  id: string;
  fullName: string;
  position: "Direktur Utama" | "Direktur" | "Komisaris Utama" | "Komisaris";
  idCardNumber: string;
  taxIdNumber: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isSignatory: boolean;
  deedReference?: string;
}

export interface LegalDocument {
  id: string;
  documentType: "Akta Pendirian" | "Akta Perubahan" | "NIB" | "SIUP" | "SBU" | "TDP";
  documentNumber: string;
  issueDate: string;
  validUntil?: string;
  issuingAuthority: string;
  sourceFile: string;
  verificationState: VerificationState;
}

export interface TaxRecord {
  id: string;
  npwpNumber: string;
  kppName: string;
  registeredDate: string;
  status: "AKTIF" | "NON_EFEKTIF";
}

export interface Company {
  id: string; // e.g., "aos", "ezra", "sbp", "stigma"
  legalName: string;
  businessType: "PT" | "CV";
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  directors: Director[];
  legalDocuments: LegalDocument[];
  taxRecord: TaxRecord;
  branding: CompanyBranding;
}

export interface EmploymentHistory {
  id: string;
  companyName: string;
  role: string;
  status: "Permanent" | "Contract" | "Non-permanent" | "Consultant" | "External";
  startDate: string;
  endDate?: string;
  sourceDocument?: string;
}

export interface Certification {
  id: string;
  certificateName: string;
  issuingBody: string;
  certificateNumber: string;
  issueDate: string;
  validUntil?: string;
  sourceFile: string;
}

export interface Person {
  id: string;
  fullName: string;
  academicTitle: string;
  currentPrimaryCompanyId: string;
  birthPlace: string;
  birthDate: string;
  lastEducation: string;
  major: string;
  university: string;
  totalYearsExperience: number;
  skills: string[];
  certifications: Certification[];
  employmentHistory: EmploymentHistory[];
  idCardNumber: string;
  taxNumber: string;
  cvSourceFile: string;
  verificationState: VerificationState;
}

export interface CompanyExperience {
  id: string;
  companyId: string;
  projectName: string;
  clientName: string;
  location: string;
  contractNumber: string;
  contractDate: string;
  contractValueIDR: number;
  startDate: string;
  endDate: string;
  handoverDate: string;
  completionPercentage: number;
  procurementCategory: "Konsultansi IT" | "Konstruksi" | "Pengadaan Barang" | "Jasa Lainnya";
  scopeSummary: string;
  spkSourceFile: string;
  bastSourceFile?: string;
  spmkSourceFile?: string;
  relevanceScore?: number;
  verificationState: VerificationState;
}

export interface ComplianceEvidence {
  id: string;
  companyId: string;
  evidenceType: "BPE" | "SURAT_KETERANGAN_BANK" | "SPT_TAHUNAN" | "NPWP" | "NIB" | "SBU";
  title: string;
  documentNumber: string;
  taxYear?: number;
  taxPeriodMonth?: number; // 1-12
  issueDate: string;
  validUntil?: string;
  targetFrequency: "Monthly" | "Annual" | "One-Time";
  defaultTargetMonth?: "Januari" | "April" | "Setiap Bulan";
  status: ComplianceStatus;
  sourceFile: string;
  sourcePage?: number;
  verifiedBy?: string;
  verificationDate?: string;
  notes?: string;
}

export interface FinancialItem {
  id: string;
  category: "Personnel" | "Non-Personnel";
  description: string;
  personName?: string;
  role?: string;
  quantity: number; // e.g. Person count or Item count
  unit: string; // e.g. "OB" (Orang Bulan), "Unit", "Paket"
  durationMonths: number;
  billingRateIDR: number;
  subtotalIDR: number;
}

export interface FinancialCalculation {
  items: FinancialItem[];
  personnelCostSubtotalIDR: number;
  nonPersonnelCostSubtotalIDR: number;
  directCostSubtotalIDR: number;
  ppnPercent: number; // e.g. 11
  ppnAmountIDR: number;
  grandTotalIDR: number;
  terbilangIDR: string;
}

export interface ProjectAssignment {
  id: string;
  personId: string;
  proposedPosition: string;
  roleDescription: string;
  allocationPercent: number;
  manMonths: number;
  billingRateIDR: number;
}

export interface Project {
  id: string;
  companyId: string;
  projectName: string;
  clientName: string;
  clientAddress: string;
  location: string;
  procurementCategory: "Konsultansi IT" | "Konstruksi" | "Pengadaan Barang" | "Jasa Lainnya";
  scopeOfWork: string;
  targetStartDate: string;
  targetEndDate: string;
  documentNumber?: string;
  documentDate?: string;
  procurementRefNo?: string;
  executionDays?: number;
  validityDays?: number;
  assignments: ProjectAssignment[];
  selectedExperienceIds: string[];
  financials: FinancialCalculation;
  status: "Draft" | "Review" | "Approved" | "Generated" | "Submitted";
}

export interface ContextState {
  activeCompanyId: string;
  activeProjectId?: string;
  activePersonId?: string;
  activeTab: "document" | "knowledge" | "compliance" | "conflicts";
  searchQuery: string;
}

export interface ConflictAlert {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  entityName: string;
  field: string;
  message: string;
  sourceA: string;
  sourceB: string;
  status: "UNRESOLVED" | "VERIFIED_BY_USER";
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; actionPrompt: string }[];
  contextUpdated?: Partial<ContextState>;
  targetedClarification?: {
    question: string;
    options: { label: string; value: string }[];
  };
}

export type UserRole =
  | "ADMIN"
  | "PROCUREMENT_OFFICER"
  | "FINANCE"
  | "LEGAL_COMPLIANCE"
  | "APPROVER";

export interface UserSession {
  userId: string;
  userName: string;
  userEmail: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: string; // e.g. "v1.0", "v1.1", "v2.0"
  modifiedBy: string;
  modifiedAt: string;
  changeSummary: string;
  documentDataSnapshot: Partial<Project>;
}

export interface DigitalSignatureInfo {
  signatoryName: string;
  signatoryRole: string;
  signedAt: string;
  verificationHash: string;
  stampUrl?: string;
  signatureUrl?: string;
  isOverlayActive: boolean;
}
