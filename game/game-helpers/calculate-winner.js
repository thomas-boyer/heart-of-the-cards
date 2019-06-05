const newRound = require('./new-round.js');
const updateGame = require('./update-game.js');
const finishGame = require('./finish-game.js');

const calculateWinner = async (socketClient, gameInfo, gameID, player1, player2) => {

  let roundWinner;
  let roundLoser;
  const game = gameInfo[gameID];

  if (game[player1].bet > game[player2].bet) {
    roundWinner = player1;
    roundLoser = player2;
    game[player1].score += prizeCard;

  } else if (game[player1].bet < game[player2].bet) {
    roundWinner = player2;
    roundLoser = player1;
    game[player2].score += prizeCard;

  } else if (game[player1].bet === game[player2].bet)
    socketClient.emit('draw',
      `Both players chose the same card. Nobody gets the point.`
    )

  // If there's a draw, do nothing.

  if (game[player1].bet !== game[player2].bet) {

    socketClient.emit('notDraw',
      `${game[player1].username} played ${game[player1].bet}. ${game[player2].username} played ${game[player2].bet}.
      ${game[player1].bet > game[player2].bet ? game[player1].username : game[player2].username} wins ${prizeCard} points!`
      )
  }
  game[player1].bet = null;
  game[player2].bet = null;

  game.roundNumber++;

  await updateGame(gameID,
  {
    prizeDeck: game.prizeDeck,
    playerOne: game[player1].username,
    playerTwo: game[player2].username,
    playerOneScore: game[player1].score,
    playerTwoScore: game[player2].score,
  });

  if (game.prizeDeck.length > 0) {
    setTimeout(function () {
      newRound(socketClient, gameInfo, gameID)
    }, 1000);
  }
  else {

    socketClient.emit('removeCard');

    let gameWinner;
    let gameLoser;

    if (game[player1].score > game[player2].score) {
      gameWinner = game[player1];
      gameLoser = game[player2];
    } else if (game[player2].score > game[player1].score) {
      gameWinner = game[player2];
      gameLoser = game[player1];
    }

    if (game[player1].score !== game[player2].score) {

      await finishGame(gameID, gameWinner.username);

      socketClient.emit('endgame', `The game is over. Player one's final score is ${game[player1].score}. Player two's final score is ${game[player2].score}. ${gameWinner.username} is the winner!`)
    } else {
      socketClient.emit('drawgame', `The game is over. Player one's final score is ${game[player1].score}. Player two's final score is ${game[player2].score}. There is no clear winner here, but that's okay. Everyone's a winner in god's eyes lmao.`)
    }
  }
}

module.exports = calculateWinner;
