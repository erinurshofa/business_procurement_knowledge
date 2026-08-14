import { supabase } from "./supabaseClient";
import { Company, Project, Person } from "@/types/procurement";
import { MOCK_COMPANIES, MOCK_PROJECTS, MOCK_PEOPLE } from "./mockData";

/**
 * Service to fetch procurement data from Supabase PostgreSQL Database,
 * falling back gracefully to mockData if Supabase connection is offline or unpopulated.
 */

export async function getCompanyById(companyId: string): Promise<Company> {
  try {
    const { data: companyData, error } = await supabase
      .from("companies")
      .select("*, directors(*), legal_documents(*)")
      .eq("id", companyId)
      .single();

    if (error || !companyData) {
      console.warn(`[Supabase] Company ${companyId} not found or offline. Using local state fallback.`);
      return MOCK_COMPANIES.find((c) => c.id === companyId) || MOCK_COMPANIES[0];
    }

    return {
      id: companyData.id,
      legalName: companyData.legal_name,
      businessType: companyData.business_type,
      address: companyData.address,
      city: companyData.city,
      phone: companyData.phone || "",
      email: companyData.email || "",
      website: companyData.website || "",
      bankName: companyData.bank_name || "",
      bankAccountNumber: companyData.bank_account_number || "",
      bankAccountHolder: companyData.bank_account_holder || "",
      branding: companyData.branding || { numberingPattern: `001/SP-${companyData.id.toUpperCase()}/2026` },
      directors: companyData.directors?.map((d: any) => ({
        id: d.id,
        fullName: d.full_name,
        position: d.position,
        idCardNumber: d.id_card_number || "",
        taxIdNumber: d.tax_id_number || "",
        effectiveFrom: d.effective_from || "2020-01-01",
        isSignatory: d.is_signatory ?? true,
      })) || [],
      legalDocuments: companyData.legal_documents?.map((ld: any) => ({
        id: ld.id,
        documentType: ld.document_type,
        documentNumber: ld.document_number,
        issueDate: ld.issue_date,
        validUntil: ld.valid_until,
        issuingAuthority: ld.issuing_authority || "",
        sourceFile: "",
        verificationState: ld.verification_state || "VERIFIED",
      })) || [],
      taxRecord: {
        id: "tax-1",
        npwpNumber: companyData.directors?.[0]?.tax_id_number || "01.234.567.8-012.000",
        kppName: "KPP Pratama",
        registeredDate: "2018-01-01",
        status: "AKTIF",
      },
    };
  } catch (err) {
    return MOCK_COMPANIES.find((c) => c.id === companyId) || MOCK_COMPANIES[0];
  }
}

export async function getProjectById(projectId: string, companyId?: string): Promise<Project> {
  try {
    let query = supabase.from("projects").select("*");
    if (projectId) {
      query = query.eq("id", projectId);
    } else if (companyId) {
      query = query.eq("company_id", companyId);
    }
    const { data: projectData, error } = await query.maybeSingle();

    if (error || !projectData) {
      return (
        MOCK_PROJECTS.find((p) => p.id === projectId || p.companyId === companyId) ||
        MOCK_PROJECTS[0]
      );
    }

    return {
      id: projectData.id,
      companyId: projectData.company_id,
      projectName: projectData.project_name,
      clientName: projectData.client_name,
      clientAddress: projectData.client_address || "",
      location: projectData.location || "",
      procurementCategory: projectData.procurement_category || "Konsultansi IT",
      scopeOfWork: projectData.scope_of_work || "",
      targetStartDate: projectData.target_start_date || "2026-08-13",
      targetEndDate: projectData.target_end_date || "2026-11-11",
      documentNumber: projectData.document_number,
      documentDate: projectData.document_date,
      procurementRefNo: projectData.procurement_ref_no,
      executionDays: projectData.execution_days,
      validityDays: projectData.validity_days,
      assignments: [],
      selectedExperienceIds: [],
      financials: projectData.financials || MOCK_PROJECTS[0].financials,
      status: projectData.status || "Approved",
    };
  } catch (err) {
    return (
      MOCK_PROJECTS.find((p) => p.id === projectId || p.companyId === companyId) ||
      MOCK_PROJECTS[0]
    );
  }
}

export async function logGeneratedDocument(
  companyId: string,
  projectId: string,
  documentType: string,
  documentNumber: string,
  fileName: string
) {
  try {
    await supabase.from("generated_documents").insert({
      company_id: companyId,
      project_id: projectId || null,
      document_type: documentType,
      document_number: documentNumber,
      document_date: new Date().toISOString().split("T")[0],
      file_name: fileName,
    });
  } catch (err) {
    console.error("[Supabase] Failed to log generated document:", err);
  }
}

export async function updateProjectDetails(
  projectId: string,
  updatedFields: Partial<Project>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("projects")
      .update({
        project_name: updatedFields.projectName,
        client_name: updatedFields.clientName,
        client_address: updatedFields.clientAddress,
        scope_of_work: updatedFields.scopeOfWork,
        document_number: updatedFields.documentNumber,
        document_date: updatedFields.documentDate,
        procurement_ref_no: updatedFields.procurementRefNo,
        execution_days: updatedFields.executionDays,
        validity_days: updatedFields.validityDays,
        financials: updatedFields.financials,
      })
      .eq("id", projectId);

    if (error) {
      console.warn("[Supabase] Update project failed, falling back to local state:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Supabase] Failed to update project in database:", err);
    return false;
  }
}
