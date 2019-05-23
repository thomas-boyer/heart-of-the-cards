exports.up = function(knex, Promise) {
  return knex.schema.createTable('players', (table) =>
  {
    table.string('id').unique();
    table.integer('games_played');
    table.integer('games_won');
  })
  // .createTable('game_player_relationships', (table) =>
  // {
  //   table.increments('id');
  //   table.string('player_id');
  //   table.foreign('player_id').references('players.id');
  //   table.integer('player_score');
  // })
  // .createTable('games', (table) =>
  // {
  //   table.increments('id');
  //   table.dateTime('date_played');
  //   table.string('player_1');
  //   table.foreign('player_1').references('game_player_relationships.player_id');
  //   table.string('player_2');
  //   table.foreign('player_2').references('game_player_relationships.player_id');
  //   table.json('game_state');
  // })
  // .table('game_player_relationships', (table) =>
  // {
  //   table.foreign('game_id').references('games.id');
  // })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('players')
};
