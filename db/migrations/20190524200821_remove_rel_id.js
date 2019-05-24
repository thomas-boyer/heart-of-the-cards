
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('players', (table) =>
  {
    table.dropColumn('game_player_rel_id');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('players', (table) =>
  {
    table.integer('game_player_rel_id');
  })
};
