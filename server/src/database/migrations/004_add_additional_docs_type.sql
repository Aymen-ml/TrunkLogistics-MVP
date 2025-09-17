-- Migration 004: Add additional_docs document type
-- Add 'additional_docs' to the document_type constraint

-- Drop the existing constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_document_type_check;

-- Add the new constraint with 'additional_docs' included
ALTER TABLE documents ADD CONSTRAINT documents_document_type_check 
CHECK (document_type IN ('registration', 'technical_inspection', 'insurance', 'license', 'business_license', 'additional_docs'));

-- Add comment for documentation
COMMENT ON CONSTRAINT documents_document_type_check ON documents IS 'Allowed document types: registration, technical_inspection, insurance, license, business_license, additional_docs';
