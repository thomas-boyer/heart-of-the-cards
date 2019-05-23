exports.up = function(knex, Promise) {
  return knex.schema.table('game_players', (table) =>
  {
    table.integer('game_id');
    table.foreign('game_id').references('games.id');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropColumn('game_players.game_id');
};
