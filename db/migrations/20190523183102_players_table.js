exports.up = function(knex, Promise) {
  return knex.schema.createTable('players', (table) =>
  {
    table.string('id').unique();
    table.integer('games_played');
    table.integer('games_won');
  })

};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('players')
};
