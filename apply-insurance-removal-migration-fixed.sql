-- Apply migration 031: Remove insurance document types from the system
-- This migration removes insurance and cargo_insurance document types

-- First, update any existing insurance documents to be additional_docs
UPDATE documents 
SET document_type = 'additional_docs' 
WHERE document_type IN ('insurance', 'cargo_insurance');

-- Drop the existing constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_document_type_check;

-- Add the new constraint without insurance types
ALTER TABLE documents ADD CONSTRAINT documents_document_type_check 
CHECK (document_type IN (
  'registration',           -- Vehicle registration
  'technical_inspection',   -- Technical inspection certificate
  'license',               -- Driver's license
  'business_license',      -- Business license
  'additional_docs',       -- Additional documents
  'permit',                -- General permits
  'maintenance_record',    -- Maintenance records
  'driver_certificate',    -- Driver certificates
  'customs_documents',     -- Customs documentation
  'safety_certificate',    -- Safety inspection certificate
  'emission_certificate',  -- Emission test certificate
  'weight_certificate',    -- Weight and dimension certificate
  'transport_license',     -- Transport/carrier license
  'route_permit',          -- Route-specific permits
  'hazmat_permit',         -- Hazardous materials permit
  'oversize_permit',       -- Oversize/overweight permits
  'fuel_card',             -- Fuel card documentation
  'toll_transponder',      -- Toll transponder documentation
  'gps_certificate',       -- GPS tracking certificate
  'compliance_certificate' -- General compliance certificate
));

-- Add comment for documentation
COMMENT ON CONSTRAINT documents_document_type_check ON documents IS 
'Allowed document types: registration, technical_inspection, license, business_license, additional_docs, permit, maintenance_record, driver_certificate, customs_documents, safety_certificate, emission_certificate, weight_certificate, transport_license, route_permit, hazmat_permit, oversize_permit, fuel_card, toll_transponder, gps_certificate, compliance_certificate';

-- Note: Migration 031 applied - Remove insurance document types from system
