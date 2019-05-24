
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('game_players', (table) =>
  {
    table.dropColumn('player_cards');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('game_players', (table) =>
  {
    table.integer('player_cards');
  })
};
