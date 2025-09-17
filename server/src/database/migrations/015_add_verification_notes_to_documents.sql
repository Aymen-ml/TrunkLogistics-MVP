-- Migration 015: Add verification_notes column to documents table
-- Add verification notes field to store admin comments when approving/rejecting documents

-- Add verification_notes column to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN documents.verification_notes IS 'Admin notes when verifying documents (approval/rejection reasons)';

-- Add index for verification_notes for potential future queries
CREATE INDEX IF NOT EXISTS idx_documents_verification_notes ON documents(verification_notes) WHERE verification_notes IS NOT NULL;
