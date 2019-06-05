require('dotenv').config();
const ENV         = process.env.ENV || "development";
const knexConfig  = require("../../knexfile");
const knex        = require("knex")(knexConfig[ENV]);

const joinExistingGame = async () =>
{
  const availableGame = await knex('games')
    .max('id').whereNull('date_played');

  return availableGame[0].max;
}

module.exports = joinExistingGame;
