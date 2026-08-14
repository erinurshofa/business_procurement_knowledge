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

-- SEED DATA: Populate initial real companies, directors, and projects extracted from public/documents/docx
INSERT INTO companies (id, legal_name, business_type, address, city, phone, email, website, bank_name, bank_account_number, bank_account_holder, branding)
VALUES
('aos', 'CV ALFA OMEGA SOLUSINDO', 'CV', 'Jl. Candi Penataran A No. 24 Bambankerep', 'Semarang', '085640169851', 'alfaomegasolusindo@gmail.com', 'https://alfaomegasolusindo.co.id', 'Bank Jateng', '1-003-99281-2', 'CV ALFA OMEGA SOLUSINDO', '{"numberingPattern": "01 / SP / AOS / VIII / 2026", "footerText": "CV ALFA OMEGA SOLUSINDO • Solutions & Digital Innovation"}'::jsonb),
('stigma', 'CV STIGMA PRATAMA', 'CV', 'Jl. Tapak Sari I Tugurejo Tugu', 'Semarang', '081326824441', 'stigmapratama@gmail.com', 'https://stigmapratama.com', 'Bank BNI', '0392-817263-001', 'CV STIGMA PRATAMA', '{"numberingPattern": "01 / SP / DP / IV / 2026", "footerText": "CV STIGMA PRATAMA • System Integrator & Consulting Services"}'::jsonb),
('ezra', 'PT EZRA PRATAMA', 'PT', 'Jl. Candisari III RT.001 RW.005 Bambankerep Ngaliyan', 'Semarang', '024-76674166', 'ezrapratama@gmail.com', 'https://ezrapratama.co.id', 'Bank Mandiri', '135-00-1928374-1', 'PT EZRA PRATAMA', '{"numberingPattern": "01 / SP / DP / II / 2026", "footerText": "PT EZRA PRATAMA • E-Government Specialist & IT Consultant"}'::jsonb),
('sbp', 'CV SOLUSI BUMI PERSADA', 'CV', 'JL. Sinar Waluyo No. 120 A, Kelurahan Kedungmundu, Kecamatan Tembalang', 'Semarang', '(024) 8312-771', 'info@multisolusi.info', 'http://www.multisolusi.info', 'Bank BRI', '0022-01-002938-53-0', 'CV SOLUSI BUMI PERSADA', '{"numberingPattern": "01 / DINSOS / SIDAKSOS / V / 2023", "footerText": "CV SOLUSI BUMI PERSADA • General Procurement & Engineering"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    legal_name = EXCLUDED.legal_name,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    branding = EXCLUDED.branding;

INSERT INTO directors (company_id, full_name, position, tax_id_number, is_signatory)
VALUES
('aos', 'TITIK ENDANGNINGSIH, SE', 'Direktur', '24.526.431.8-261.000', true),
('stigma', 'BUDI SANTOSO, S.Sos', 'Direktur', '30.010.105.7-150.000', true),
('ezra', 'DONI YOHANES, S.Kom, M.Kom', 'Direktur', '28.670.251.2-065.000', true),
('sbp', 'Agus Hartanto, S.kom., M.Kom.', 'Direktur', '81.392.103.5-503.000', true)
ON CONFLICT DO NOTHING;

INSERT INTO projects (id, company_id, project_name, client_name, client_address, location, procurement_category, scope_of_work, target_start_date, target_end_date, financials, status)
VALUES
(
    'proj-aos-1',
    'aos',
    'Pekerjaan Kaji Terap Automatic Feeder Berbasis Teknologi IoT Pada Balai Benih Ikan Dinas Perikanan Kota Semarang Tahun Anggaran 2026',
    'Dinas Perikanan Kota Semarang',
    'Jl. Kolonel Sugiono No. 2, Semarang',
    'Kota Semarang',
    'Konsultansi IT',
    'Kaji Terap Automatic Feeder Berbasis Teknologi IoT Pada Balai Benih Ikan Dinas Perikanan Kota Semarang Tahun Anggaran 2026',
    '2026-08-13',
    '2026-11-11',
    '{"grandTotalIDR": 99289500, "terbilangIDR": "Sembilan Puluh Sembilan Juta Dua Ratus Delapan Puluh Sembilan Ribu Lima Ratus Rupiah", "ppnAmountIDR": 9839324, "directCostSubtotalIDR": 89450176, "personnelCostSubtotalIDR": 75000000, "nonPersonnelCostSubtotalIDR": 14450176, "items": [{"id": "fin-aos-1", "unit": "OB", "category": "Personnel", "quantity": 1, "description": "Tenaga Ahli IoT & System Architect", "subtotalIDR": 75000000, "billingRateIDR": 25000000, "durationMonths": 3}, {"id": "fin-aos-2", "unit": "Paket", "category": "Non-Personnel", "quantity": 1, "description": "Perangkat Automatic Feeder IoT & Testing Equipment", "subtotalIDR": 14450176, "billingRateIDR": 14450176, "durationMonths": 1}]}'::jsonb,
    'Approved'
),
(
    'proj-stigma-1',
    'stigma',
    'Pekerjaan Kaji Terap Smart Monitoring Berbasis IoT Motion Pada Balai Benih Ikan Dinas Perikanan Kota Semarang Tahun Anggaran 2026',
    'Dinas Perikanan Kota Semarang',
    'Jl. Kolonel Sugiono No. 2, Semarang',
    'Kota Semarang',
    'Konsultansi IT',
    'Kaji Terap Smart Monitoring Berbasis IoT Motion Pada Balai Benih Ikan Dinas Perikanan Kota Semarang Tahun Anggaran 2026',
    '2026-04-15',
    '2026-08-13',
    '{"grandTotalIDR": 99345000, "terbilangIDR": "Sembilan Puluh Sembilan Juta Tiga Ratus Empat Puluh Lima Ribu Rupiah", "ppnAmountIDR": 9845000, "directCostSubtotalIDR": 89500000, "personnelCostSubtotalIDR": 74700000, "nonPersonnelCostSubtotalIDR": 14800000, "items": [{"id": "fin-stigma-1", "unit": "OB", "category": "Personnel", "quantity": 1, "description": "Team Leader Ahli Kecerdasan Buatan / Computer Vision", "subtotalIDR": 35500000, "billingRateIDR": 8875000, "durationMonths": 4}, {"id": "fin-stigma-2", "unit": "OB", "category": "Personnel", "quantity": 1, "description": "Tenaga Ahli Sistem Keamanan / Teknologi Informasi", "subtotalIDR": 35500000, "billingRateIDR": 8875000, "durationMonths": 4}, {"id": "fin-stigma-3", "unit": "OB", "category": "Personnel", "quantity": 1, "description": "Tenaga Pendukung Operator Komputer", "subtotalIDR": 3700000, "billingRateIDR": 3700000, "durationMonths": 1}, {"id": "fin-stigma-4", "unit": "Pcs", "category": "Non-Personnel", "quantity": 1, "description": "Modul Hardware", "subtotalIDR": 3750000, "billingRateIDR": 3750000, "durationMonths": 1}, {"id": "fin-stigma-5", "unit": "Set", "category": "Non-Personnel", "quantity": 1, "description": "Modul Camera", "subtotalIDR": 2000000, "billingRateIDR": 2000000, "durationMonths": 1}, {"id": "fin-stigma-6", "unit": "Pcs", "category": "Non-Personnel", "quantity": 1, "description": "Modul Software Infrastruktur Server", "subtotalIDR": 4000000, "billingRateIDR": 4000000, "durationMonths": 1}, {"id": "fin-stigma-7", "unit": "Paket", "category": "Non-Personnel", "quantity": 1, "description": "Biaya Komunikasi", "subtotalIDR": 300000, "billingRateIDR": 300000, "durationMonths": 1}, {"id": "fin-stigma-8", "unit": "Paket", "category": "Non-Personnel", "quantity": 1, "description": "Biaya Transportasi", "subtotalIDR": 2750000, "billingRateIDR": 2750000, "durationMonths": 1}, {"id": "fin-stigma-9", "unit": "Rim", "category": "Non-Personnel", "quantity": 4, "description": "Kertas HVS A4", "subtotalIDR": 200000, "billingRateIDR": 50000, "durationMonths": 1}, {"id": "fin-stigma-10", "unit": "Buah", "category": "Non-Personnel", "quantity": 4, "description": "Tinta Printer", "subtotalIDR": 400000, "billingRateIDR": 100000, "durationMonths": 1}, {"id": "fin-stigma-11", "unit": "Buku", "category": "Non-Personnel", "quantity": 5, "description": "Laporan Pendahuluan", "subtotalIDR": 400000, "billingRateIDR": 80000, "durationMonths": 1}, {"id": "fin-stigma-12", "unit": "Buku", "category": "Non-Personnel", "quantity": 5, "description": "Laporan Akhir", "subtotalIDR": 500000, "billingRateIDR": 100000, "durationMonths": 1}, {"id": "fin-stigma-13", "unit": "Buku", "category": "Non-Personnel", "quantity": 5, "description": "Manual Book", "subtotalIDR": 500000, "billingRateIDR": 100000, "durationMonths": 1}]}'::jsonb,
    'Approved'
),
(
    'proj-ezra-1',
    'ezra',
    'Pekerjaan Kaji Terap Rekam Kualitas Air Budidaya Ikan Pada Balai Benih Ikan Dinas Perikanan Kota Semarang Tahun Anggaran 2026',
    'Dinas Perikanan Kota Semarang',
    'Jl. Kolonel Sugiono No. 2, Semarang',
    'Kota Semarang',
    'Konsultansi IT',
    'Kaji Terap Rekam Kualitas Air Budidaya Ikan Pada Balai Benih Ikan Dinas Perikanan Kota Semarang Tahun Anggaran 2026',
    '2026-02-24',
    '2026-06-24',
    '{"grandTotalIDR": 99390954, "terbilangIDR": "Sembilan Puluh Sembilan Juta Tiga Ratus Sembilan Puluh Ribu Sembilan Ratus Lima Puluh Empat Rupiah", "ppnAmountIDR": 9849374, "directCostSubtotalIDR": 89541580, "personnelCostSubtotalIDR": 70000000, "nonPersonnelCostSubtotalIDR": 19541580, "items": [{"id": "fin-ezra-1", "unit": "OB", "category": "Personnel", "quantity": 1, "description": "Tenaga Ahli E-Government & Sensor Water Quality Specialist", "subtotalIDR": 70000000, "billingRateIDR": 17500000, "durationMonths": 4}, {"id": "fin-ezra-2", "unit": "Paket", "category": "Non-Personnel", "quantity": 1, "description": "Sensor Rekam Kualitas Air Budidaya & Multi-Parameter Probe", "subtotalIDR": 19541580, "billingRateIDR": 19541580, "durationMonths": 1}]}'::jsonb,
    'Approved'
),
(
    'proj-sbp-1',
    'sbp',
    'Pengembangan Aplikasi Sistem Informasi Data Terpadu Kesejahteraan Sosial (SIDAKSOS) Tahun Anggaran 2023',
    'Pejabat Pengadaan Barang / Jasa Dinas Sosial Kota Semarang',
    'Dinas Sosial Kota Semarang, Semarang',
    'Kota Semarang',
    'Konsultansi IT',
    'Pengembangan Aplikasi Sistem Informasi Data Terpadu Kesejahteraan Sosial (SIDAKSOS) Tahun Anggaran 2023',
    '2023-05-25',
    '2023-08-23',
    '{"grandTotalIDR": 83250000, "terbilangIDR": "Delapan Puluh Tiga Juta Dua Ratus Lima Puluh Ribu Rupiah", "ppnAmountIDR": 8250000, "directCostSubtotalIDR": 75000000, "personnelCostSubtotalIDR": 60000000, "nonPersonnelCostSubtotalIDR": 15000000, "items": [{"id": "fin-sbp-1", "unit": "OB", "category": "Personnel", "quantity": 1, "description": "Tenaga Ahli System Analyst & Lead Developer", "subtotalIDR": 60000000, "billingRateIDR": 20000000, "durationMonths": 3}, {"id": "fin-sbp-2", "unit": "Paket", "category": "Non-Personnel", "quantity": 1, "description": "Sewa Server & Cloud Testing Environment", "subtotalIDR": 15000000, "billingRateIDR": 15000000, "durationMonths": 1}]}'::jsonb,
    'Approved'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO generated_documents (company_id, project_id, document_type, document_number, document_date, file_name)
VALUES
('aos', 'proj-aos-1', 'Surat Penawaran Administrasi', '01 / SP / AOS / VIII / 2026', '2026-08-13', '0. Surat Penawaran Administrasi - CV ALFA OMEGA SOLUSINDO.docx'),
('stigma', 'proj-stigma-1', 'Surat Penawaran Administrasi', '01 / SP / DP / IV / 2026', '2026-04-15', '0. Surat Penawaran Administrasi - CV STIGMA PRATAMA.docx'),
('ezra', 'proj-ezra-1', 'Surat Penawaran Administrasi', '01 / SP / DP / II / 2026', '2026-02-24', '0. Surat Penawaran Administrasi - PT EZRA PRATAMA.docx'),
('sbp', 'proj-sbp-1', 'Surat Penawaran Administrasi', '01 / DINSOS / SIDAKSOS / V / 2023', '2023-05-25', '0. Surat Penawaran Administrasi - CV SOLUSI BUMI PERSADA.docx')
ON CONFLICT DO NOTHING;

