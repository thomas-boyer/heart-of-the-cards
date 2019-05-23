
exports.up = function(knex, Promise) {
  return knex.schema.createTable('games', (table) =>
    {
      table.increments('id');
      table.integer('game_player_rel_id');
      table.foreign('game_player_rel_id').references('game_players.id');
      table.dateTime('date_played');
      table.json('game_state');
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('games');
};
