require('dotenv').config();
const ENV         = process.env.ENV || "development";
const knexConfig  = require("../../knexfile");
const knex        = require("knex")(knexConfig[ENV]);

const updateGame = async (gameID, data) =>
{
  await knex('games')
    .where('id', gameID)
    .update({ prize_deck: data.prizeDeck });

  await knex('game_players')
    .where(
      {
        'player_id': data.playerOne,
        'game_id': gameID
      })
    .update(
      {
        player_score: data.playerOneScore
      });

  await knex('game_players').where(
    {
      'player_id': data.playerTwo,
      'game_id': gameID
    })
  .update(
    {
      player_score: data.playerTwoScore
    });
}

module.exports = updateGame;
