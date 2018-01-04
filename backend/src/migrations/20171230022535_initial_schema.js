exports.up = function(knex) {
  return knex.schema.createTable('User', function(table) {
    table.string('id').primary();
    table
      .string('email')
      .unique()
      .notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('User');
};
