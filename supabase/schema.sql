-- Supabase / PostgreSQL Schema for Business Procurement Knowledge Platform
-- Includes Companies, Directors, Projects, Legal Documents, and Generated DOCX Log

-- 1. Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Table: Companies (Menyimpan Kop, Branding, & Detail Legal Perusahaan)
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'aos', 'ezra', 'stigma', 'sbp'
    legal_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(10) NOT NULL CHECK (business_type IN ('PT', 'CV')),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(100),
    website VARCHAR(150),
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(100),
    bank_account_holder VARCHAR(150),
    branding JSONB DEFAULT '{}'::jsonb, -- { logoUrl, letterheadUrl, signatureUrl, numberingPattern }
    created_at TIMESTAMP WITH TIMEZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIMEZONE DEFAULT NOW()
);

-- 3. Table: Directors / Signatories (Menyimpan Direktur & Penandatangan Dokumen)
CREATE TABLE IF NOT EXISTS directors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES companies(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    position VARCHAR(100) NOT NULL CHECK (position IN ('Direktur Utama', 'Direktur', 'Komisaris Utama', 'Komisaris')),
    id_card_number VARCHAR(50),
    tax_id_number VARCHAR(50),
    effective_from DATE,
    effective_to DATE,
    is_signatory BOOLEAN DEFAULT true,
    deed_reference TEXT,
    created_at TIMESTAMP WITH TIMEZONE DEFAULT NOW()
);

-- 4. Table: Legal Documents (Akta, NIB, SBU, SIUP)
CREATE TABLE IF NOT EXISTS legal_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES companies(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('Akta Pendirian', 'Akta Perubahan', 'NIB', 'SIUP', 'SBU', 'TDP')),
    document_number VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL,
    valid_until DATE,
    issuing_authority VARCHAR(255),
    verification_state VARCHAR(50) DEFAULT 'VERIFIED',
    created_at TIMESTAMP WITH TIMEZONE DEFAULT NOW()
);

-- 5. Table: Projects / Procurement Packages (Paket Pengadaan & RAB)
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES companies(id) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_address TEXT,
    location VARCHAR(150),
    procurement_category VARCHAR(100) DEFAULT 'Konsultansi IT',
    scope_of_work TEXT,
    target_start_date DATE,
    target_end_date DATE,
    financials JSONB NOT NULL DEFAULT '{}'::jsonb, -- Store RAB calculation breakdown
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Review', 'Approved', 'Generated', 'Submitted')),
    created_at TIMESTAMP WITH TIMEZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIMEZONE DEFAULT NOW()
);

-- 6. Table: Generated Documents Log (Catatan Ekspor DOCX)
CREATE TABLE IF NOT EXISTS generated_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES companies(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    signatory_director_id UUID REFERENCES directors(id) ON DELETE SET NULL,
    document_type VARCHAR(150) NOT NULL, -- e.g. 'Surat Penawaran Administrasi'
    document_number VARCHAR(100) NOT NULL,
    document_date DATE NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT, -- Storage path or local path
    created_at TIMESTAMP WITH TIMEZONE DEFAULT NOW()
);

-- SEED DATA: Populate initial companies & directors matching procurement workspace
INSERT INTO companies (id, legal_name, business_type, address, city, phone, email, website, bank_name, bank_account_number, bank_account_holder, branding)
VALUES
('aos', 'CV ALFA OMEGA SOLUSINDO', 'CV', 'Jl. Merdeka No. 45', 'Jakarta Selatan', '021-5551234', 'info@alfaomega.co.id', 'https://alfaomega.co.id', 'Bank Mandiri', '123-00-998877-1', 'CV ALFA OMEGA SOLUSINDO', '{"numberingPattern": "001/SP-AOS/VIII/2026", "letterheadHeader": "KOP CV ALFA OMEGA SOLUSINDO"}'::jsonb),
('stigma', 'CV STIGMA PRATAMA', 'CV', 'Jl. Sudirman No. 88', 'Bandung', '022-7772345', 'contact@stigmapratama.com', 'https://stigmapratama.com', 'Bank BCA', '456-11-223344-5', 'CV STIGMA PRATAMA', '{"numberingPattern": "001/SP-STG/VIII/2026", "letterheadHeader": "KOP CV STIGMA PRATAMA"}'::jsonb),
('ezra', 'PT EZRA PRATAMA', 'PT', 'Gedung Wisma Asri Lt. 5, Jl. Gatot Subroto', 'Jakarta Pusat', '021-3334567', 'admin@ezrapratama.co.id', 'https://ezrapratama.co.id', 'Bank BNI', '789-22-334455-6', 'PT EZRA PRATAMA', '{"numberingPattern": "001/SP-EZR/VIII/2026", "letterheadHeader": "KOP PT EZRA PRATAMA"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO directors (company_id, full_name, position, tax_id_number, is_signatory)
VALUES
('aos', 'Ir. Budi Santoso', 'Direktur', '01.234.567.8-012.000', true),
('stigma', 'Drs. Ahmad Hidayat', 'Direktur', '02.345.678.9-023.000', true),
('ezra', 'Hendrik Pratama, S.T.', 'Direktur Utama', '03.456.789.0-034.000', true)
ON CONFLICT DO NOTHING;
