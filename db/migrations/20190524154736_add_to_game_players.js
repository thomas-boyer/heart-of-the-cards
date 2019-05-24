
exports.up = function(knex, Promise) {
  return knex.schema.table('game_players', (table) =>
  {
    table.integer('player_suit');
    table.integer('player_cards');
    table.integer('player_bet');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('game_players', (table) =>
  {
    table.dropColumn('player_suit');
    table.dropColumn('player_cards');
    table.dropColumn('player_bet');
  })
};
