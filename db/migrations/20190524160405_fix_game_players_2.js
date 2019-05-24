
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('game_players', (table) =>
  {
    table.specificType('player_cards', 'INT[]');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('game_players', (table) =>
  {
    table.dropColumn('player_cards');
  })
};
