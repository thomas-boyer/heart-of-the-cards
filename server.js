"use strict";

require('dotenv').config();


const PORT        = process.env.PORT || 8080;
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

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/gamecentre", (req, res) => {
  res.render("gamecentre");
});

app.get("/game", (req, res) => {
  res.render("game");
});

app.get("/archive", (req, res) => {
  res.render("archive");
});

app.get("/leaderboard", (req, res) => {
  res.render("leaderboard");
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
  // player 1{
  //   id : socket.id
  //   suit:
  //   cardString:
  // }

let connectCounter = 0;

// Whenever a new socket connects
io.on('connection', function(socket) {
   console.log(`User ${socket.id} has connected to the game.`);

   // Track number of players connected, assignment of player1/2 designations
   connectCounter++;
   if (connectCounter === 1) {
    playerInfo.player1 = {
      id: socket.id
   }
   } else if (connectCounter === 2) {
    playerInfo.player2 = {
      id: socket.id
    }
   }

   //Whenever a socket disconnects
   socket.on('disconnect', function () {
      console.log(`User ${socket.id} has disconnected`);
      connectCounter--;
   });

// Ensuring two players are in game before defining player attributes
  if (connectCounter === 2) {

    // Set the suit of player 1
    playerInfo.player1.suit = availableSuits[Math.floor(Math.random() * 4)];
    if (playerInfo.player1.suit === availableSuits[availableSuits.length - 1])
    {
      availableSuits.pop();
    }
    else availableSuits.splice(availableSuits.indexOf(playerInfo.player1.suit), 1);


    playerInfo.player2.suit = availableSuits[Math.floor(Math.random() * 3)];
    if (playerInfo.player2.suit === availableSuits[availableSuits.length - 1])
    {
      availableSuits.pop();
    }
    else availableSuits.splice(availableSuits.indexOf(playerInfo.player2.suit), 1);


    let prizeSuit = availableSuits[Math.floor(Math.random() * 2)];
    if (prizeSuit === availableSuits[availableSuits.length - 1])
    {
      availableSuits.pop();
    }
    else availableSuits.splice(availableSuits.indexOf(prizeSuit), 1);

    io.emit('welcome',
    JSON.stringify({message : `Hi~! Welcome to the test Goofspiel game.
      Player one's suit is ${suits[playerInfo.player1.suit]}.
      Player two's suit is ${suits[playerInfo.player2.suit]}.
      The prize suit is ${suits[prizeSuit]}.

      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `})
    )

    // let playerOneCardsString = '';
    playerInfo.player1.cardString = '';
    let playerOnePlayedCard;

    // let playerTwoCardsString = '';
    playerInfo.player2.cardString='';
    let playerTwoPlayedCard;

    let playerOneBet = 0;
    let playerTwoBet = 0;

    let playerOneScore = 0;
    let playerTwoScore = 0;

    for (let card of playerOneCards)
    {
      playerInfo.player1.cardString += Object.values(card) + ' ';
    }

    for (let card of playerTwoCards)
    {
      playerInfo.player2.cardString += Object.values(card) + ' ';
    }

    const question1 = () => {
      return new Promise((resolve, reject) => {

        io.to(`${playerInfo.player1.id}`).emit(
          'player1turn',
          `Player One: Please play an available card. Available cards: ${playerInfo.player1.cardString}`,
        )

        socket.on('cardpick', function (player1card) {
          console.log('Am I here?')
          playerInfo.player1.cardString = playerInfo.player1.cardString.replace(player1card, '');
          console.log(playerInfo.player1.cardString)
          resolve();
        })

        // console.log('okokok');



        // playerOneBet = parseInt(answerIndex);

        // playerOnePlayedCard = playerOneCards.find((element) => {return Object.keys(element)[0] === answerIndex});

        // playerOneCards.splice(playerOneCards.indexOf(playerOnePlayedCard), 1);

        // playerOneCardsString = '';

        // for (card of playerOneCards)
        // {
          // playerOneCardsString += Object.values(card) + ' ';
        // }



      })
    }
    // console.log('okokokokok')
    const question2 = () => {
      return new Promise((resolve, reject) => {
        readline.question(`Player Two: Please play an available card.
          Available cards: ${playerTwoCardsString}

          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          `, (answer) => {
            console.log(`You played the ${answer} of ${suits[playerTwoSuit]}.`)

            let answerIndex = calculateValue(answer);

            playerTwoBet = parseInt(answerIndex);

            playerTwoPlayedCard = playerTwoCards.find((element) => {return Object.keys(element)[0] === answerIndex});

            playerTwoCards.splice(playerTwoCards.indexOf(playerTwoPlayedCard), 1);

            playerTwoCardsString = '';

            for (card of playerTwoCards)
            {
              playerTwoCardsString += Object.values(card) + ' ';
            }


            resolve();
        });

      })
    }

    const main = async () => {
      while (prizeCards.length > 0)
      {
        let prizeCard = prizeCards[Math.floor(Math.random() * prizeCards.length)];
        if (prizeCard === prizeCards[prizeCards.length - 1])
        {
          prizeCards.pop();
        }
        else prizeCards.splice(prizeCards.indexOf(prizeCard), 1);

        io.emit('prizecard', `A prize card is flipped over.
          It is the ${Object.values(prizeCard)} of ${suits[prizeSuit]}.`)

        await question1();
        await question2();

        if (playerOneBet > playerTwoBet)
        {
          playerOneScore += parseInt(calculateValue(Object.keys(prizeCard)[0]));
        }
        else if (playerOneBet < playerTwoBet)
        {
          playerTwoScore += parseInt(calculateValue(Object.keys(prizeCard)[0]));
        }
        console.log('Player one score:', playerOneScore);
        console.log('Player two score:', playerTwoScore);
      }

      console.log(`Player ${playerOneScore > playerTwoScore ? 'One' : 'Two'} is the winner!`)

      readline.close();
    }
    main();
  }
});

server.listen(PORT, () => {
  console.log('Server is live on PORT:' + PORT);
});
