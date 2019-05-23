
exports.up = function(knex, Promise) {
  return knex.schema.createTable('game_players', (table) =>
    {
      table.increments('id');
      table.string('player_id');
      table.foreign('player_id').references('players.id');
      table.integer('player_score');
    })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('game_players');
};
