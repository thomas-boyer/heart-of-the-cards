require('dotenv').config();
const ENV         = process.env.ENV || "development";
const knexConfig  = require("../../knexfile");
const knex        = require("knex")(knexConfig[ENV]);

const initializeGameSetup = async () =>
{
  const gameMax = await knex('games').max('id');
  const gameID = gameMax[0].max + 1;

  await knex('games')
    .insert({ id: gameID });

  return gameID;
};

module.exports = initializeGameSetup;
