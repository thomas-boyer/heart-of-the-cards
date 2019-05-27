"use strict";

require('dotenv').config();


const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();
const server      = require('http').Server(app);
const io          = require('socket.io')(server);

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

const cookieParser = require('cookie-parser');
app.use(cookieParser());


// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");

let usernames = {};
// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.

// Temporarily disabled morgan for console.log clarity
// app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));
// app.use(express.static(__dirname + '/public'));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
// app.use("/styles", sass({
//   src: __dirname + "/styles",
//   dest: __dirname + "/public/styles",
//   debug: true,
//   outputStyle: 'expanded'
// }));
app.use(express.static("public"));
app.use(express.static("./node_modules"))

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));

app.get("/gamecentre", (req, res) => {
  res.render("gamecentre", {
    page_name: 'gamecentre'
  });
});

app.get("/game", (req, res) => {
  res.render("game", {
    page_name: 'game'
  });
});

app.post("/login", (req, res) => {

  res.cookie('id', req.body.id);

  knex('players')
    .select('id').where('id', req.body.id)
    .then( (result) =>
      {
        if (!result.length)
        {
          return knex('players').insert({ id: req.body.id, games_won: 0 });
        }
      });
  res.redirect("/gamecentre");
});

app.get("/login", (req, res) => {

  if (req.cookies.id) res.redirect("/gamecentre");
  res.render("index");
});

///////////////////////////////////////THOMAS'S WORK

app.get("/archive", (req, res) => {
  knex('games')
    .join('game_players', 'games.id', '=', 'game_players.game_id')
    .join('players', 'players.id', '=', 'game_players.player_id')
    // .select('*')
    .select('games.id', 'date_played', knex.raw('array_agg(players.id) AS players'), knex.raw('array_agg(game_players.player_score) AS scores'))
    .groupBy('games.id')
    .orderBy('date_played', 'desc')
    .then(function(result)
      {
        const templateVars = {games: result, page_name: "archive"};
        res.render("archive", templateVars);
      });
});

///////////////////////////////////////END OF THOMAS'S WORK

app.get("/leaderboard", (req, res) => {

  knex('players')
  .select('*')
  .orderBy('games_won', 'desc')
  .then(function(result)
    {
      const templateVars = {players: result, page_name: "leaderboard"};
      res.render("leaderboard", templateVars);
    });
});

// Home page
app.get("/", (req, res) => {

  if (req.cookies.id) res.redirect("/gamecentre");
  else res.redirect("/login");
});

// Socket set-up
// app.get('/', function (req, res) {
//   res.sendFile(__dirname + '/views/game.ejs');
// });

const suits =
{
  0: 'spades',
  1: 'hearts',
  2: 'clubs',
  3: 'diamonds'
};

let cardValues = [1,2,3,4,5,6,7,8,9,10,11,12,13];

const playerOneCards =
[
  {1: 'ace'},
  {2: 2},
  {3: 3},
  {4: 4},
  {5: 5},
  {6: 6},
  {7: 7},
  {8: 8},
  {9: 9},
  {10: 10},
  {11: 'jack'},
  {12: 'queen'},
  {13: 'king'}
]

const playerTwoCards =
[
  {1: 'ace'},
  {2: 2},
  {3: 3},
  {4: 4},
  {5: 5},
  {6: 6},
  {7: 7},
  {8: 8},
  {9: 9},
  {10: 10},
  {11: 'jack'},
  {12: 'queen'},
  {13: 'king'}
]

let availableSuits = [0,1,2,3];

let gameInfo = {};

let connectCounter = 0;
let p1id;
let p2id;

let roundNumber = 1;

let roundWinner;
let roundLoser;

let gameWinner;
let gameLoser;

let prizeCard;
let prizeSuit;

// Whenever a new socket connects
io.on('connection', async (socket) => {
  console.log(`User ${socket.id} has connected to the game.`);

  let gameID;

   // Track number of players connected, assignment of player designations
  socket.on('socketAssignment', async () => {

    if (connectCounter === 0) {
      gameID = await writeNewGame();

      let cookie = socket.handshake.headers.cookie;
      let userID = cookie.substring(cookie.indexOf("id=") + 3);
      if (userID.includes(';'))
      {
        userID = userID.substring(0, userID.indexOf(";"));
      }

      p1id = socket.id;

      gameInfo[gameID] = {};
      gameInfo[gameID][p1id] =
      {
        username : userID,
        designation : 'player1',
        id : socket.id,
        score : 0,
        bet : null,
        cards : [1,2,3,4,5,6,7,8,9,10,11,12,13]
      }

    connectCounter++
    io.to(`${socket.id}`).emit('pending', 'Waiting for an opponent...');
    console.log(connectCounter, 'players now connected')

    } else if (connectCounter === 1) {

      let gameID = await joinExistingGame();

      let cookie = socket.handshake.headers.cookie;
      let userID = cookie.substring(cookie.indexOf("id=") + 3);
      if (userID.includes(';'))
      {
        userID = userID.substring(0, userID.indexOf(";"));
      }

      p2id = socket.id;

      p1id = Object.keys(gameInfo[gameID])[0];

      gameInfo[gameID][p2id] =
      {
        username : userID,
        designation : 'player2',
        id : socket.id,
        score : 0,
        opId : p1id,
        bet : null,
        cards : [1,2,3,4,5,6,7,8,9,10,11,12,13]
      }

      gameInfo[gameID][p1id].opId = p2id;

      connectCounter++;
      console.log(connectCounter, 'players now connected')

      io.emit('foundopponent', 'Opponent found, game starting...')
      await mainGame(gameID, gameInfo[gameID][p1id].id, gameInfo[gameID][p2id].id);
      newRound(gameID);
    }
  })

  const calculateWinner = async (gameID, player1, player2) => {

    let roundWinner;
    let roundLoser;

    if (gameInfo[gameID][player1].bet > gameInfo[gameID][player2].bet) {
      roundWinner = player1;
      roundLoser = player2;
      gameInfo[gameID][player1].score += prizeCard;

    } else if (gameInfo[gameID][player1].bet < gameInfo[gameID][player2].bet) {
      roundWinner = player2;
      roundLoser = player1;
      gameInfo[gameID][player2].score += prizeCard;

    } else if (gameInfo[gameID][player1].bet === gameInfo[gameID][player2].bet)
      io.emit('draw',
        `Both players chose the same card. Nobody gets the point.`
      )

    // If there's a draw, do nothing.
    // Send the winner a message and the loser a message;:

    if (gameInfo[gameID][player1].bet !== gameInfo[gameID][player2].bet) {
      io.to(`${roundLoser}`).emit('lose',
        `You played ${gameInfo[gameID][roundLoser].bet}. Your opponent played ${gameInfo[gameID][roundWinner].bet} Your opponent had the high card. Your current score: ${gameInfo[gameID][roundLoser].score} Your opponent's score: ${gameInfo[gameID][roundWinner].score}.`
        )

      io.to(`${roundWinner}`).emit('win',
        `You played ${gameInfo[gameID][roundWinner].bet}. Your opponent played ${gameInfo[gameID][roundLoser].bet}. Congratulations, you had the high card. Your current score: ${gameInfo[gameID][roundWinner].score} Your opponent's score: ${gameInfo[gameID][roundLoser].score}.`
        )

    }
    gameInfo[gameID][player1].bet = null;
    gameInfo[gameID][player2].bet = null;

    console.log("Game INFO:", gameInfo);

    gameInfo[gameID].roundNumber++;

    await updateGame(gameID,
    {
      prizeDeck: gameInfo[gameID].prizeDeck,
      playerOne: gameInfo[gameID][player1].username,
      playerTwo: gameInfo[gameID][player2].username,
      playerOneScore: gameInfo[gameID][player1].score,
      playerTwoScore: gameInfo[gameID][player2].score,
    });


    console.log('We are at the start of round', gameInfo[gameID].roundNumber)


    if (gameInfo[gameID].prizeDeck.length > 0) {
      newRound(gameID);
    }
    else {

      let gameWinner;
      let gameLoser;

      if (gameInfo[gameID][player1].score > gameInfo[gameID][player2].score) {
        gameWinner = gameInfo[gameID][player1];
        gameLoser = gameInfo[gameID][player2];
      } else if (gameInfo[gameID][player2].score > gameInfo[gameID][player1].score) {
        gameWinner = gameInfo[gameID][player2];
        gameLoser = gameInfo[gameID][player1];
      }

      if (gameInfo[gameID][player1].score !== gameInfo[gameID][player2].score) {

        await finishGame(gameID, gameWinner.username);

        io.emit('endgame', `The game is over. Player one's final score is ${gameInfo[gameID][player1].score} Player two's final score is ${gameInfo[gameID][player2].score} ${gameWinner['designation']} is the winner!`)
      } else {
        io.emit('drawgame', `The game is over. Player one's final score is ${gameInfo[gameID][player1].score} Player two's final score is ${gameInfo[gameID][player2].score} There is no clear winner here, but that's okay. Everyone's a winner in god's eyes lmao.`)
      }
    }
  }

  const newRound = function (gameID) {
    // Set prize.
    prizeCard = gameInfo[gameID].prizeDeck.pop();

    // Send message
    io.emit('pleaseChoose', `Round ${roundNumber} : A prize card is flipped over. It is the ${Object.values(prizeCard)} of ${suits[gameInfo[gameID].prizeSuit]}. Please select a card.`, gameID);
  }

   // Assigning the player's values to the object
  socket.on('cardChoice', async (cardValue, gameID) => {
    for (let player in gameInfo[gameID]) {
      if (player === socket.id) {

        let playerCards = gameInfo[gameID][player].cards;

        // Assign player bet for the round:
        gameInfo[gameID][player].bet = cardValue;
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
              player_id: gameInfo[gameID][player].username
            })
          .update(
            {
              player_cards: playerCards,
              player_bet: cardValue
            });

        let opId = gameInfo[gameID][player].opId;

        if (gameInfo[gameID][player].bet && gameInfo[gameID][opId].bet) {
          calculateWinner(gameID, player, opId);
        }
      }
    }
    //console.log('The hand of', socket.id, gameInfo[gameID][socket.id].cards)
    io.to(`${socket.id}`).emit('Selected')
  })

   //Whenever a socket disconnects
  socket.on('disconnect', function () {
    console.log(`User ${socket.id} has disconnected`);
    connectCounter--;
  });

  const mainGame = async (gameID, player1, player2) => {
    console.log('In the main game now.')

    // Generate random suit player one.
    gameInfo[gameID][player1].suit = availableSuits[Math.floor(Math.random() * 4)];
    if (gameInfo[gameID][player1].suit === availableSuits[availableSuits.length - 1])
    {
      availableSuits.pop();
    }
    else availableSuits.splice(availableSuits.indexOf(gameInfo[gameID][player1].suit), 1);

    // Generate random suit player two.
    gameInfo[gameID][player2].suit = availableSuits[Math.floor(Math.random() * 3)];
    if (gameInfo[gameID][player2].suit === availableSuits[availableSuits.length - 1])
    {
      availableSuits.pop();
    }
    else availableSuits.splice(availableSuits.indexOf(gameInfo[gameID][player2].suit), 1);

    // Generate prize suit
    gameInfo[gameID].prizeSuit = availableSuits[Math.floor(Math.random() * 2)];
    if (gameInfo[gameID].prizeSuit === availableSuits[availableSuits.length - 1])
    {
      availableSuits.pop();
    }
    else availableSuits.splice(availableSuits.indexOf(gameInfo[gameID].prizeSuit), 1);

    gameInfo[gameID].prizeDeck = [];
    gameInfo[gameID].roundNumber = 1;

    for (let i = 0; i < 13; i++)
    {
      let randomCardIndex = Math.floor(Math.random() * cardValues.length);
      let randomCard;
      if (randomCardIndex === cardValues.length)
      {
        randomCard = cardValues.pop();
      }
      else randomCard = cardValues.splice(randomCardIndex, 1)[0];

      gameInfo[gameID].prizeDeck.push(randomCard);
    }

    await finalizeGame(
      {
        prize_suit: gameInfo[gameID].prizeSuit,
        prize_deck: gameInfo[gameID].prizeDeck,
        playerOne: gameInfo[gameID][player1].username,
        playerTwo: gameInfo[gameID][player2].username,
        playerOneSuit: gameInfo[gameID][player1].suit,
        playerTwoSuit: gameInfo[gameID][player2].suit
      }, gameID);

    gameInfo[gameID][player1].cardString = '';

    gameInfo[gameID][player2].cardString='';

    for (let card of playerOneCards)
    {
      gameInfo[gameID][player1].cardString += Object.values(card) + ' ';
    }

    for (let card of playerTwoCards)
    {
      gameInfo[gameID][player2].cardString += Object.values(card) + ' ';
    }

<<<<<<< HEAD
    io.emit('welcome', JSON.stringify(`Hi~! Welcome to the test Goofspiel game. Player one's suit is ${suits[gameInfo[gameID][player1].suit]}. Player two's suit is ${suits[gameInfo[gameID][player2].suit]}. The prize suit is ${suits[gameInfo[gameID][prizeSuit]]}. Game is starting now.`));
=======
    io.emit('welcome', JSON.stringify(`Hi~! Welcome to the test Goofspiel game. Player one's suit is ${suits[gameInfo[gameID][player1].suit]}. Player two's suit is ${suits[gameInfo[gameID][player2].suit]}. The prize suit is ${suits[gameInfo[gameID][prizeSuit]]}. Game is starting now.`), suits[gameInfo[gameID][player1].suit], suits[gameInfo[gameID][player2].suit], suits[gameInfo[gameID].prizeSuit]);
>>>>>>> master
  } // This closes the main game function

}); // This is closing the socket connection

const writeNewGame = async () =>
{
  const gameMax = await knex('games').max('id');
  const gameID = gameMax[0].max + 1;

  await knex('games')
    .insert({ id: gameID });

  return gameID;
}

const joinExistingGame = async () =>
{
  const availableGame = await knex('games')
    .max('id').whereNull('date_played');

  return availableGame[0].max;
}

const finalizeGame = async (data, gameID) =>
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

const updateGame = async (gameID, data) =>
{
  console.log("Player one:", data.playerOneScore)
  console.log("Player two:", data.playerTwoScore)

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

server.listen(PORT, () => {
  console.log('Server is live on PORT:' + PORT);
});
