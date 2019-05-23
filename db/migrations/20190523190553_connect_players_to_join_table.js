exports.up = function(knex, Promise) {
  return knex.schema.table('players', (table) =>
  {
    table.integer('game_player_rel_id');
    table.foreign('game_player_rel_id').references('game_players.id');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropColumn('players.game_player_rel_id');
};
