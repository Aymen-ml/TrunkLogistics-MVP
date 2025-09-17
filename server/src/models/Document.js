import { query } from '../config/database.js';

class Document {
  static async create(documentData) {
    const {
      entityType,
      entityId,
      documentType,
      fileName,
      filePath,
      fileSize,
      mimeType,
      uploadedBy,
      status = 'pending'
    } = documentData;

    const sqlQuery = `INSERT INTO documents (
      entity_type, entity_id, document_type, file_name, file_path, 
      file_size, mime_type, uploaded_by, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`;

    try {
      const result = await query(sqlQuery, [
        entityType, entityId, documentType, fileName, filePath,
        fileSize, mimeType, uploadedBy, status
      ]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    const result = await query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByEntity(entityType, entityId) {
    const result = await query(
      'SELECT * FROM documents WHERE entity_type = $1 AND entity_id = $2 ORDER BY uploaded_at DESC',
      [entityType, entityId]
    );
    return result.rows;
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'document_type', 'file_name', 'status', 'verification_status',
      'verification_notes', 'verified_by', 'verified_at'
    ];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);

    const result = await query(
      `UPDATE documents SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async delete(id) {
    const result = await query(
      'DELETE FROM documents WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async setStatus(id, status) {
    const result = await query(
      'UPDATE documents SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }

  static async verify(id, verificationData) {
    const { verificationStatus, verificationNotes, verifiedBy } = verificationData;
    
    const result = await query(
      `UPDATE documents SET 
        verification_status = $1, 
        verification_notes = $2, 
        verified_by = $3, 
        verified_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 
       RETURNING *`,
      [verificationStatus, verificationNotes, verifiedBy, id]
    );

    return result.rows[0];
  }

  static async getPending() {
    const result = await query(
      `SELECT d.*, 
        CASE 
          WHEN d.entity_type = 'truck' THEN t.license_plate
          ELSE d.entity_id::text
        END as entity_name
       FROM documents d
       LEFT JOIN trucks t ON d.entity_type = 'truck' AND d.entity_id = t.id
       WHERE d.status = 'pending'
       ORDER BY d.uploaded_at ASC`
    );
    return result.rows;
  }

  static async getStats() {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified,
        COUNT(CASE WHEN verification_status = 'rejected' THEN 1 END) as rejected
       FROM documents`
    );
    return result.rows[0];
  }
}

export default Document;
