const initializeGameSetup = require('../game/game-helpers/initialize-game-setup.js');
const joinExistingGame = require('../game/game-helpers/join-existing-game.js');
const determineSuits = require('../game/game-helpers/determine-suits.js');
const determinePrizeDeck = require('../game/game-helpers/determine-prize-deck.js')
const finalizeGameSetup = require('../game/game-helpers/finalize-game-setup.js');
const newRound = require('../game/game-helpers/new-round.js');
const calculateWinner = require('../game/game-helpers/calculate-winner.js');

require('dotenv').config();
const ENV         = process.env.ENV || "development";
const knexConfig  = require("../knexfile");
const knex        = require("knex")(knexConfig[ENV]);

const suits =
{
  0: 'spades',
  1: 'hearts',
  2: 'clubs',
  3: 'diamonds'
};

const socketAssignment = async (socketClient, socket, gameInfo, connectCounter) =>
{
  let cookie = socket.handshake.headers.cookie;
  let userID = cookie.substring(cookie.indexOf("id=") + 3);
  if (userID.includes(';'))
  {
    userID = userID.substring(0, userID.indexOf(";"));
  }

  if (connectCounter === 1) {
    gameID = await initializeGameSetup();

    gameInfo[gameID] = {};
    gameInfo[gameID][socket.id] =
    {
      username : userID,
      designation : 'p1id',
      id : socket.id,
      score : 0,
      bet : null,
      cards : [1,2,3,4,5,6,7,8,9,10,11,12,13]
    }

    socketClient.to(`${socket.id}`).emit('pending', 'Waiting for an opponent...');
    console.log(connectCounter, 'player now connected')

  } else if (connectCounter === 2) {

    console.log(connectCounter, 'players now connected')

    let gameID = await joinExistingGame();
    const game = gameInfo[gameID];

    p1id = Object.keys(game)[0];

    game[socket.id] =
    {
      username : userID,
      designation : 'socket.id',
      id : socket.id,
      score : 0,
      opId : p1id,
      bet : null,
      cards : [1,2,3,4,5,6,7,8,9,10,11,12,13]
    }

    game[p1id].opId = socket.id;

    socketClient.emit('foundopponent', 'Opponent found, game starting...')

    determineSuits(gameInfo, p1id, socket.id);
    game.prizeDeck = determinePrizeDeck(gameInfo, gameID);
    game.roundNumber = 1;

    await finalizeGameSetup(
      {
        prize_suit: game.prizeSuit,
        prize_deck: game.prizeDeck,
        playerOne: game[p1id].username,
        playerTwo: game[socket.id].username,
        playerOneSuit: game[p1id].suit,
        playerTwoSuit: game[socket.id].suit
      }, gameID);

    socketClient.emit('welcome', suits[gameInfo[gameID][p1id].suit], suits[gameInfo[gameID][socket.id].suit], suits[gameInfo[gameID].prizeSuit], gameInfo[gameID].prizeDeck);
    newRound(socketClient, gameInfo, gameID);
  }
};

const cardChoice = async (socketClient, gameInfo, cardValue, gameID, playerID) =>
{
  const game = gameInfo[gameID];

  for (let player in game) {

    if (player === playerID) {

      let playerCards = game[player].cards;

      // Assign player bet for the round:
      game[player].bet = cardValue;
      let indexOfBet = playerCards.indexOf(cardValue);

      if (indexOfBet === playerCards.length - 1)
      {
        playerCards.pop();
      }
      else playerCards.splice(indexOfBet, 1);

      await knex('game_players')
        .where(
          {
            game_id: gameID,
            player_id: game[player].username
          })
        .update(
          {
            player_cards: playerCards,
            player_bet: cardValue
          });

      let opId = game[player].opId;

      if (game[player].bet && game[opId].bet) {
        calculateWinner(socketClient, gameInfo, gameID, player, opId);
      }
    }
  }
}

module.exports = {socketAssignment, cardChoice};
