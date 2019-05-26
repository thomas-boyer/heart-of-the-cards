"use strict";

require('dotenv').config();


const PORT        = process.env.PORT || 8081;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

const cookieSession = require('cookie-session');
app.use(cookieSession({ name: 'session', keys: ['key1', 'key2'] }));

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");

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
  res.render("gamecentre");
});

app.get("/game", (req, res) => {
  res.render("game");
});

app.post("/login", (req, res) => {
  req.session.id = req.body.id;

  knex('players')
    .select('id').where('id', req.body.id)
    .then( (result) =>
      {
        if (!result.length)
        {
          return knex('players').insert({ id: req.body.id, games_won: 0 });
        }
      })
  res.redirect("/gamecentre");
});

app.get("/login", (req, res) => {

  if (req.session.id) res.redirect("/gamecentre");
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
        const templateVars = {games: result};
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
      const templateVars = {players: result};
      res.render("leaderboard", templateVars);
    });
});

// Home page
app.get("/", (req, res) => {

  if (req.session.id) res.redirect("/gamecentre");
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

const cardKey =
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

const prizeCards =
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

let playerInfo = {}
  // socket id : {}
  //   designation: player1
  //   id : socket.id
  //   score: 0
  //   turn: true
  //.  opId: //
  //   cardString:
  //   cumScore:
  // }

let connectCounter = 0;
let p1id;
let p2id;

let roundNumber = 1;
let roundScores = {
  1 : {},
  2 : {},
  3 : {},
  4 : {},
  5 : {},
  6 : {},
  7 : {},
  8 : {},
  9 : {},
  10 : {},
  11 : {},
  12 : {},
  13 : {}
};

let roundWinner;
let roundLoser;

let gameWinner;
let gameLoser;

let prizeCard;
let prizeSuit;

// Whenever a new socket connects
io.on('connection', function(socket) {
  console.log(`User ${socket.id} has connected to the game.`);

   // Track number of players connected, assignment of player designations
  socket.on('socketAssignment', function () {
    if (connectCounter === 0) {
      p1id = socket.id
      playerInfo[socket.id] = {
        designation: 'player1',
        id: socket.id,
        score: 0
      }
    connectCounter++
    console.log(connectCounter, 'players now connected')
    } else if (connectCounter === 1) {
      p2id = socket.id
      playerInfo[socket.id] = {
        designation: 'player2',
        id: socket.id,
        score: 0,
        opId: playerInfo[p1id]['id']
      }
      playerInfo[p1id]['opId'] = playerInfo[p2id]['id'];

      connectCounter++;

      console.log(connectCounter, 'players now connected')

      mainGame();
      newRound();
    }
  })

  const calculateWinner = function () {
    if (roundScores[roundNumber][p1id] > roundScores[roundNumber][p2id]) {
      roundWinner = p1id
      roundLoser = p2id
      playerInfo[p1id]['score'] += Number(Object.keys(prizeCard)[0])

    } else if (roundScores[roundNumber][p2id] > roundScores[roundNumber][p1id]) {
      roundWinner = p2id
      roundLoser = p1id
      playerInfo[p2id]['score'] += Number(Object.keys(prizeCard)[0])

    } else if (roundScores[roundNumber][p1id] == roundScores[roundNumber][p2id])
      io.emit('draw',
        `Both players chose the same card. Nobody gets the point.`
      )
    // If there's a draw, do nothing.
    // Send the winner a message and the loser a message;:

    if (roundScores[roundNumber][p1id] !== roundScores[roundNumber][p2id]) {
      io.to(`${roundLoser}`).emit('lose',
        `You played ${roundScores[roundNumber][roundLoser]}.
        Your opponent played ${roundScores[roundNumber][roundWinner]}
        Your opponent had the high card.
        Your current score: ${playerInfo[roundLoser]['score']}
        Your opponent's score: ${playerInfo[roundWinner]['score']}`
        )

      io.to(`${roundWinner}`).emit('win',
        `You played ${roundScores[roundNumber][roundWinner]}.
        Your opponent played ${roundScores[roundNumber][roundLoser]}
        Congratulations, you had the high card.
        Your current score: ${playerInfo[roundWinner]['score']}
        Your opponent's score: ${playerInfo[roundLoser]['score']}`
        )
    }

    roundNumber++
    console.log('We are at the start of round', roundNumber)

    if (roundNumber <= 13) {
      newRound();
    } else {
      if (playerInfo[p1id]['score'] > playerInfo[p2id]['score']) {
        gameWinner = p1id
        gameLoser = p2id
      } else if (playerInfo[p2id]['score'] > playerInfo[p1id]['score']) {
        gameWinner = p2id
        gameLoser = p1id
      }
      if (playerInfo[p1id]['score'] !== playerInfo[p2id]['score']) {
        io.emit('endgame', `The game is over.
          Player one's final score is ${playerInfo[p1id]['score']}
          Player two's final score is ${playerInfo[p2id]['score']}
          ${playerInfo[gameWinner]['designation']} is the winner!
          `)
      } else {
        io.emit('drawgame', `The game is over.
          Player one's final score is ${playerInfo[p1id]['score']}
          Player two's final score is ${playerInfo[p2id]['score']}
          There is no clear winner here, but that's okay.
          Everyone's a winner in god's eyes lmao.
          `)
      }
    }
  }

  const newRound = function () {
    // Set prize.
    prizeCard = prizeCards[Math.floor(Math.random() * prizeCards.length)];
    if (prizeCard === prizeCards[prizeCards.length - 1]) {
      prizeCards.pop();
    }
    else prizeCards.splice(prizeCards.indexOf(prizeCard), 1);

    // Send message
    io.emit('pleaseChoose', `Round ${roundNumber} : A prize card is flipped over.
        It is the ${Object.values(prizeCard)} of ${suits[prizeSuit]}.
        Please select a card.`);
  }

   // Assigning the player's values to the object
  socket.on('cardChoice', (cardValue) => {
    for (let player in playerInfo) {
      if (player === socket.id) {
        // Assign player score for the round:
        roundScores[roundNumber][playerInfo[player]['id']] = cardValue
        // Remove the card played from the player's hand:
        playerInfo[player]['cardString'] = playerInfo[player]['cardString'].replace(` ${cardKey[cardValue - 1][cardValue]}`, '')
      }
    }
    console.log('The hand of', socket.id, playerInfo[socket.id]['cardString'])
    io.to(`${socket.id}`).emit('Selected')
    if (roundScores[roundNumber][p1id] && roundScores[roundNumber][p2id]) {
      calculateWinner();
    }
  })

   //Whenever a socket disconnects
  socket.on('disconnect', function () {
    console.log(`User ${socket.id} has disconnected`);
    connectCounter--;
  });

  const mainGame = function () {
    console.log('In the main game now.')

    // Generate random suit player one.
    playerInfo[p1id].suit = availableSuits[Math.floor(Math.random() * 4)];
    if (playerInfo[p1id].suit === availableSuits[availableSuits.length - 1])
    {
      availableSuits.pop();
    }
    else availableSuits.splice(availableSuits.indexOf(playerInfo[p1id].suit), 1);

    // Generate random suit player two.
    playerInfo[p2id].suit = availableSuits[Math.floor(Math.random() * 3)];
    if (playerInfo[p2id].suit === availableSuits[availableSuits.length - 1])
    {
      availableSuits.pop();
    }
    else availableSuits.splice(availableSuits.indexOf(playerInfo[p2id].suit), 1);

    // Generate prize suit
    prizeSuit = availableSuits[Math.floor(Math.random() * 2)];
    if (prizeSuit === availableSuits[availableSuits.length - 1])
    {
      availableSuits.pop();
    }
    else availableSuits.splice(availableSuits.indexOf(prizeSuit), 1);

    // Create hand

    playerInfo[p1id].cardString = '';

    playerInfo[p2id].cardString='';

    for (let card of playerOneCards)
    {
      playerInfo[p1id].cardString += Object.values(card) + ' ';
    }

    for (let card of playerTwoCards)
    {
      playerInfo[p2id].cardString += Object.values(card) + ' ';
    }


    io.emit('welcome', JSON.stringify(`Hi~! Welcome to the test Goofspiel game.
        Player one's suit is ${suits[playerInfo[p1id].suit]}.
        Player two's suit is ${suits[playerInfo[p2id].suit]}.
        The prize suit is ${suits[prizeSuit]}.
        Game is starting now.`)
      )
  } // This closes the main game function

}); // This is closing the socket connection


server.listen(PORT, () => {
  console.log('Server is live on PORT:' + PORT);
});
