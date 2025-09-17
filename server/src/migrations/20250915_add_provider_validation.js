export async function up(knex) {
  await knex.schema.alterTable('provider_profiles', (table) => {
    table.boolean('is_validated').defaultTo(false);
    table.enum('validation_status', ['pending', 'approved', 'rejected']).defaultTo('pending');
    table.text('validation_notes').nullable();
    table.timestamp('validated_at').nullable();
    table.integer('validated_by').nullable().references('id').inTable('users');
  });
}

export async function down(knex) {
  await knex.schema.alterTable('provider_profiles', (table) => {
    table.dropColumns(['is_validated', 'validation_status', 'validation_notes', 'validated_at', 'validated_by']);
  });
}