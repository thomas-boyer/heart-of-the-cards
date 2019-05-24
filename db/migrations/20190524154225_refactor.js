
exports.up = function(knex, Promise) {
  return knex.schema.table('players', (table) =>
  {
    table.dropColumn('games_played');
    table.dropColumn('games_won');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('players', (table) =>
  {
    table.integer('games_played');
    table.integer('games_won');
  })
};
