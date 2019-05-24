exports.seed = function(knex, Promise) {
  return knex('game_players').del()
    .then(knex('games').del())
    .then(knex('players').del())
    .then(() => {

      return Promise.all([
        //players
        knex('players').insert({id: 'sawyerthecorgi'}),
        knex('players').insert({id: 'moviesnob94'}),
        knex('players').insert({id: 'loopylighthouse'}),
        knex('players').insert({id: 'kplusl'}),
        knex('players').insert({id: 'shades'}),
        knex('players').insert({id: 'playtone'}),
        knex('players').insert({id: 'ponyo'}),
        knex('players').insert({id: 'souske'}),
        knex('players').insert({id: 'ben-quadinaros'}),
        knex('players').insert({id: 'sebulba'}),
        knex('players').insert({id: 'sleepyguy94'}),
        knex('players').insert({id: 'goku'}),
        //games
        knex('games').insert({id: 0, date_played: new Date('May 1, 2019 12:00:00'), prize_suit: 0, prize_deck: null}),
        knex('games').insert({id: 1, date_played: new Date('May 2, 2019 12:00:00'), prize_suit: 0, prize_deck: null}),
        knex('games').insert({id: 2, date_played: new Date('May 3, 2019 12:00:00'), prize_suit: 0, prize_deck: null}),
        knex('games').insert({id: 3, date_played: new Date('May 4, 2019 12:00:00'), prize_suit: 0, prize_deck: null}),
        knex('games').insert({id: 4, date_played: new Date('May 5, 2019 12:00:00'), prize_suit: 0, prize_deck: null}),
        knex('games').insert({id: 5, date_played: new Date('May 6, 2019 12:00:00'), prize_suit: 0, prize_deck: null}),
        knex('games').insert({id: 6, date_played: new Date('May 7, 2019 12:00:00'), prize_suit: 0, prize_deck: null}),
        knex('games').insert({id: 7, date_played: new Date('May 8, 2019 12:00:00'), prize_suit: 0, prize_deck: null}),
        knex('games').insert({id: 8, date_played: new Date('May 9, 2019 12:00:00'), prize_suit: 0, prize_deck: null}),
        knex('games').insert({id: 9, date_played: new Date('May 10, 2019 12:00:00'), prize_suit: 0, prize_deck: null}),
        knex('games').insert({id: 10, date_played: new Date('May 11, 2019 12:00:00'), prize_suit: 0, prize_deck: null}),
        //game_players join table
        knex('game_players').insert({id: 0, game_id: 0, player_id: 'sawyerthecorgi', player_score: 34, player_suit: 1, player_cards: null, player_bet: null}),

        knex('game_players').insert({id: 1, game_id: 0, player_id: 'moviesnob94', player_score: 16, player_suit: 2, player_cards: null, player_bet: null}),
      //---------------------------------------------------------------------------------//
        knex('game_players').insert({id: 2, game_id: 1, player_id: 'loopylighthouse', player_score: 8, player_suit: 1, player_cards: null, player_bet: null}),

        knex('game_players').insert({id: 3, game_id: 1, player_id: 'kplusl', player_score: 26, player_suit: 2, player_cards: null, player_bet: null}),
      //---------------------------------------------------------------------------------//
        knex('game_players').insert({id: 4, game_id: 2, player_id: 'shades', player_score: 12, player_suit: 1, player_cards: null, player_bet: null}),

        knex('game_players').insert({id: 5, game_id: 2, player_id: 'playtone', player_score: 6, player_suit: 2, player_cards: null, player_bet: null}),
      //---------------------------------------------------------------------------------//
        knex('game_players').insert({id: 6, game_id: 3, player_id: 'ponyo', player_score: 45, player_suit: 1, player_cards: null, player_bet: null}),

        knex('game_players').insert({id: 7, game_id: 3, player_id: 'souske', player_score: 13, player_suit: 2, player_cards: null, player_bet: null}),
      //---------------------------------------------------------------------------------//
        knex('game_players').insert({id: 8, game_id: 4, player_id: 'ben-quadinaros', player_score: 0, player_suit: 1, player_cards: null, player_bet: null}),

        knex('game_players').insert({id: 9, game_id: 4, player_id: 'sebulba', player_score: 91, player_suit: 2, player_cards: null, player_bet: null}),
      //---------------------------------------------------------------------------------//
        knex('game_players').insert({id: 10, game_id: 5, player_id: 'sleepyguy94', player_score: 20, player_suit: 1, player_cards: null, player_bet: null}),

        knex('game_players').insert({id: 11, game_id: 5, player_id: 'goku', player_score: 54, player_suit: 2, player_cards: null, player_bet: null}),
        //---------------------------------------------------------------------------------//
        knex('game_players').insert({id: 12, game_id: 6, player_id: 'sawyerthecorgi', player_score: 20, player_suit: 1, player_cards: null, player_bet: null}),

        knex('game_players').insert({id: 13, game_id: 6, player_id: 'moviesnob94', player_score: 54, player_suit: 2, player_cards: null, player_bet: null}),
        //---------------------------------------------------------------------------------//
        knex('game_players').insert({id: 14, game_id: 7, player_id: 'loopylighthouse', player_score: 20, player_suit: 1, player_cards: null, player_bet: null}),

        knex('game_players').insert({id: 15, game_id: 7, player_id: 'kplusl', player_score: 54, player_suit: 2, player_cards: null, player_bet: null}),
        //---------------------------------------------------------------------------------//
        knex('game_players').insert({id: 16, game_id: 8, player_id: 'shades', player_score: 20, player_suit: 1, player_cards: null, player_bet: null}),

        knex('game_players').insert({id: 17, game_id: 8, player_id: 'playtone', player_score: 54, player_suit: 2, player_cards: null, player_bet: null}),
        //---------------------------------------------------------------------------------//
        knex('game_players').insert({id: 18, game_id: 9, player_id: 'ponyo', player_score: 20, player_suit: 1, player_cards: null, player_bet: null}),

        knex('game_players').insert({id: 19, game_id: 9, player_id: 'souske', player_score: 54, player_suit: 2, player_cards: null, player_bet: null}),
        //---------------------------------------------------------------------------------//
        knex('game_players').insert({id: 20, game_id: 10, player_id: 'ben-quadinaros', player_score: 20, player_suit: 1, player_cards: null, player_bet: null}),

        knex('game_players').insert({id: 21, game_id: 10, player_id: 'sebulba', player_score: 54, player_suit: 2, player_cards: null, player_bet: null})
      ]);

    })
};





