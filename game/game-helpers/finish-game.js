require('dotenv').config();
const ENV         = process.env.ENV || "development";
const knexConfig  = require("../../knexfile");
const knex        = require("knex")(knexConfig[ENV]);

const finishGame = async (gameID, username) =>
{
  const query = await knex('players').select('games_won').where('id', username);

  let gamesWon = query[0].games_won;
  gamesWon++;

  await knex('players')
    .where('id', username)
    .update(
    {
      games_won: gamesWon
    });
}

module.exports = finishGame;
