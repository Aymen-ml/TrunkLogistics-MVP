-- Migration 005: Add more document types for comprehensive truck documentation
-- Add additional document types to support more comprehensive document management

-- Drop the existing constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_document_type_check;

-- Add the new constraint with additional document types
ALTER TABLE documents ADD CONSTRAINT documents_document_type_check 
CHECK (document_type IN (
  'registration',           -- Vehicle registration
  'technical_inspection',   -- Technical inspection certificate
  'insurance',             -- Insurance certificate
  'license',               -- Driver's license
  'business_license',      -- Business license
  'additional_docs',       -- Additional documents
  'permit',                -- Special permits (overweight, hazardous materials, etc.)
  'maintenance_record',    -- Maintenance and service records
  'driver_certificate',    -- Driver certifications (CDL, endorsements, etc.)
  'customs_documents',     -- Customs and border crossing documents
  'safety_certificate',    -- Safety inspection certificate
  'emission_certificate',  -- Emission test certificate
  'weight_certificate',    -- Weight and dimension certificate
  'cargo_insurance',       -- Cargo insurance certificate
  'transport_license',     -- Transport/carrier license
  'route_permit',          -- Route-specific permits
  'hazmat_permit',         -- Hazardous materials permit
  'oversize_permit',       -- Oversize/overweight permit
  'fuel_card',             -- Fuel card documentation
  'toll_transponder',      -- Toll system documentation
  'gps_certificate',       -- GPS/tracking system certificate
  'compliance_certificate' -- DOT compliance certificate
));

-- Add comment for documentation
COMMENT ON CONSTRAINT documents_document_type_check ON documents IS 
'Allowed document types: registration, technical_inspection, insurance, license, business_license, additional_docs, permit, maintenance_record, driver_certificate, customs_documents, safety_certificate, emission_certificate, weight_certificate, cargo_insurance, transport_license, route_permit, hazmat_permit, oversize_permit, fuel_card, toll_transponder, gps_certificate, compliance_certificate';
