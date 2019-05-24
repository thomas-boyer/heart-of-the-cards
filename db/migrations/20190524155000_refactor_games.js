
exports.up = function(knex, Promise) {
  return knex.schema.table('games', (table) =>
  {
    table.dropColumn('game_state');
    table.integer('prize_suit');
    table.specificType('prize_deck', 'INT[]');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('games', (table) =>
  {
    table.json('game_state');
    table.dropColumn('prize_suit');
    table.dropColumn('prize_deck', 'INT[]');
  })
};
