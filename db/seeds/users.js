exports.seed = function(knex, Promise) {
  return knex('players').del()
    // .then(knex('games').del()
    // .then(knex('game_player_relationships').del()
    .then(function () {
      return Promise.all([
        knex('players').insert({id: 'coolguy94', games_played: 34, games_won: 20}),
        knex('players').insert({id: 'thomas49', games_played: 102, games_won: 32}),
        // knex('games').insert(
        //   {
        //     date_played: Date.parse('2019-05-23T16:21:24.982Z'),
        //     game_state:
        //     {
        //       move: 3,
        //       player_1_score: 10,
        //       player_2_score: 5
        //     }
        //   })
      ]);
    });
};
