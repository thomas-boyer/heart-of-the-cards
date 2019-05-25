
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('players', (table) =>
    {
      table.integer('games_won');
    })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('players', (table) =>
    {
      table.dropColumn('games_won');
    })
};
