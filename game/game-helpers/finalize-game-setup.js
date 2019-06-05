require('dotenv').config();
const ENV         = process.env.ENV || "development";
const knexConfig  = require("../../knexfile");
const knex        = require("knex")(knexConfig[ENV]);

const finalizeGameSetup = async (data, gameID) =>
{
  const gamePlayerMax = await knex('game_players').max('id');
  const gamePlayerID = gamePlayerMax[0].max + 1;

  await knex('games')
    .where('id', gameID)
    // Determine the prize suit and prize deck order in front-end, and send that through request body
    .update({
      date_played: new Date(),
      prize_suit: data.prize_suit,
      prize_deck: data.prize_deck });

  await knex('players')
    .select('id').where('id', data.playerOne)
    .then( (result) =>
      {
        if (!result.length)
        {
          return knex('players').insert({ id: data.playerOne, games_won: 0 });
        }
      });

  await knex('players')
    .select('id').where('id', data.playerTwo)
    .then( (result) =>
      {
        if (!result.length)
        {
          return knex('players').insert({ id: data.playerTwo, games_won: 0 });
        }
      });

    //Determine the player IDs and their suits in the front-end
  await knex('game_players')
    .insert([{
      id: gamePlayerID,
      game_id: gameID,
      player_id: data.playerOne,
      player_score: 0,
      player_suit: data.playerOneSuit,
      player_cards: [1,2,3,4,5,6,7,8,9,10,11,12,13]
    },
    {
      id: gamePlayerID + 1,
      game_id: gameID,
      player_id: data.playerTwo,
      player_score: 0,
      player_suit: data.playerTwoSuit,
      player_cards: [1,2,3,4,5,6,7,8,9,10,11,12,13]
    }]);
}

module.exports = finalizeGameSetup;
