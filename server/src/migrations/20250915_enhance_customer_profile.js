export async function up(knex) {
  await knex.schema.alterTable('customer_profiles', (table) => {
    // Business Information
    table.string('business_type').notNullable().defaultTo('individual'); // individual, company
    table.string('industry_sector');
    
    // Contact Information
    table.string('business_phone');
    table.string('contact_person_name');
    table.string('contact_person_position');
    table.string('contact_person_email');
    table.string('contact_person_phone');
    
    // Address Information (expanding existing)
    table.string('street_address');
    table.string('state_province');
    
    // Additional Details
    table.text('delivery_instructions'); // Special instructions for deliveries
    table.specificType('preferred_payment_methods', 'text[]'); // Array of payment methods
    
    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.alterTable('customer_profiles', (table) => {
    table.dropColumns([
      'business_type',
      'industry_sector',
      'business_phone',
      'contact_person_name',
      'contact_person_position',
      'contact_person_email',
      'contact_person_phone',
      'street_address',
      'state_province',
      'delivery_instructions',
      'preferred_payment_methods',
      'created_at',
      'updated_at'
    ]);
  });
}