
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('games', (table) =>
  {
    table.dropColumn('game_player_rel_id');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('games', (table) =>
  {
    table.integer('game_player_rel_id');
  })
};
