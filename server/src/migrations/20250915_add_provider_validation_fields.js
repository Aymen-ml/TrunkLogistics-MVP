export async function up(knex) {
  await knex.schema.alterTable('provider_profiles', (table) => {
    // Business Information
    table.string('business_registration_number').notNullable();
    table.string('tax_identification_number').notNullable();
    table.string('vat_number');  // Optional, depends on country
    
    // Contact Information
    table.string('business_phone').notNullable();
    table.string('emergency_contact_name').notNullable();
    table.string('emergency_contact_phone').notNullable();
    
    // Address Information (expanding existing)
    table.string('street_address').notNullable();
    table.string('state_province').notNullable();
    
    // Document References
    table.string('business_license_doc_url').notNullable();
    table.string('tax_document_url').notNullable();
    table.string('owner_id_url').notNullable(); // Government-issued ID
    
    // Additional Business Details
    table.integer('years_in_business').notNullable();
    table.text('business_description').notNullable();
    table.specificType('service_areas', 'text[]').notNullable(); // Array of service areas
    
    // Timestamps
    table.timestamp('documents_submitted_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.alterTable('provider_profiles', (table) => {
    // Drop all new columns
    table.dropColumns([
      'business_registration_number',
      'tax_identification_number',
      'vat_number',
      'business_phone',
      'emergency_contact_name',
      'emergency_contact_phone',
      'street_address',
      'state_province',
      'business_license_doc_url',
      'tax_document_url',
      'owner_id_url',
      'years_in_business',
      'business_description',
      'service_areas',
      'documents_submitted_at'
    ]);
  });
}