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
  //   state: 0
  //   turn: true
  //.  opId: //
  //   cardString:
  // }

let connectCounter = 0;
let p1id;
let p2id;

// Whenever a new socket connects
io.on('connection', function(socket) {
  console.log(`User ${socket.id} has connected to the game.`);

   // Track number of players connected, assignment of player1/2 designations
  connectCounter++;
  if (connectCounter === 1) {
    console.log('Are we in?')
    socket.on('socketAssignment', function () {
      p1id = socket.id
      playerInfo[socket.id] = {
        designation: 'player1',
        id: socket.id,
        state: 0
      }
    })
    console.log('within the if statement', playerInfo)
  } else if (connectCounter === 2) {
    socket.on('socketAssignment', function () {
      p2id = socket.id
      playerInfo[socket.id] = {
        designation: 'player2',
        id: socket.id,
        state: 0,
        opId: playerInfo[p1id]['id']
      }
      playerInfo[p1id]['opId'] = playerInfo[p2id]['id'];
    })
    console.log('also within the if statement', playerInfo)
  }
   //Whenever a socket disconnects
   socket.on('disconnect', function () {
      console.log(`User ${socket.id} has disconnected`);
      connectCounter--;
   });
   console.log(connectCounter);

// Ensuring two players are in game before defining player attributes
  if (connectCounter === 2) {
    // Set the suit of player 1
    playerInfo[p1id].suit = availableSuits[Math.floor(Math.random() * 4)];
    if (playerInfo[p1id].suit === availableSuits[availableSuits.length - 1])
    {
      availableSuits.pop();
    }
    else availableSuits.splice(availableSuits.indexOf(playerInfo[p1id].suit), 1);


    playerInfo[p2id].suit = availableSuits[Math.floor(Math.random() * 3)];
    if (playerInfo[p2id].suit === availableSuits[availableSuits.length - 1])
    {
      availableSuits.pop();
    }
    else availableSuits.splice(availableSuits.indexOf(playerInfo[p2id].suit), 1);


    let prizeSuit = availableSuits[Math.floor(Math.random() * 2)];
    if (prizeSuit === availableSuits[availableSuits.length - 1])
    {
      availableSuits.pop();
    }
    else availableSuits.splice(availableSuits.indexOf(prizeSuit), 1);

    playerInfo[p1id].cardString = '';
    let playerOnePlayedCard;

    playerInfo[p2id].cardString='';
    let playerTwoPlayedCard;

    let playerOneBet = 0;
    let playerTwoBet = 0;

    let playerOneScore = 0;
    let playerTwoScore = 0;

    for (let card of playerOneCards)
    {
      playerInfo[p1id].cardString += Object.values(card) + ' ';
    }

    for (let card of playerTwoCards)
    {
      playerInfo[p2id].cardString += Object.values(card) + ' ';
    }

    // const main = async () => {
    //   while (prizeCards.length > 0)
    //   {
    //     let prizeCard = prizeCards[Math.floor(Math.random() * prizeCards.length)];
    //     if (prizeCard === prizeCards[prizeCards.length - 1])
    //     {
    //       prizeCards.pop();
    //     }
    //     else prizeCards.splice(prizeCards.indexOf(prizeCard), 1);

    //     io.emit('prizecard', `A prize card is flipped over.
    //       It is the ${Object.values(prizeCard)} of ${suits[prizeSuit]}.`)

    //     question1();
    //     // await question1();
    //     await question2();

    //     if (playerOneBet > playerTwoBet)
    //     {
    //       playerOneScore += parseInt(calculateValue(Object.keys(prizeCard)[0]));
    //     }
    //     else if (playerOneBet < playerTwoBet)
    //     {
    //       playerTwoScore += parseInt(calculateValue(Object.keys(prizeCard)[0]));
    //     }
    //     console.log('Player one score:', playerOneScore);
    //     console.log('Player two score:', playerTwoScore);
    //   }

    //   console.log(`Player ${playerOneScore > playerTwoScore ? 'One' : 'Two'} is the winner!`)

    //   readline.close();
    // }

    const mainGame = function () {

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
      /*
      roundScores = {
        1 : { player1: 9
              player2 : 5
            }
      }
      */

      io.emit('welcome', JSON.stringify(`Hi~! Welcome to the test Goofspiel game.
        Player one's suit is ${suits[playerInfo[p1id].suit]}.
        Player two's suit is ${suits[playerInfo[p2id].suit]}.
        The prize suit is ${suits[prizeSuit]}.
        Game is starting now.

      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`)
      )

      while (prizeCards.length > 0)
      {
        let prizeCard = prizeCards[Math.floor(Math.random() * prizeCards.length)];
        if (prizeCard === prizeCards[prizeCards.length - 1])
        {
          prizeCards.pop();
        }
        else prizeCards.splice(prizeCards.indexOf(prizeCard), 1);

        console.log('Remaining prize cards: ', prizeCards.length)

        io.emit('pleaseChoose', `Round ${roundNumber} : A prize card is flipped over.
          It is the ${Object.values(prizeCard)} of ${suits[prizeSuit]}.
          Please select a card.`);

        let finishedMoves = 0;

        socket.on('cardChoice', (cardValue) => {
          // for loop to assign a player score
          for (let player in playerInfo) {
            if (player === socket.id) {
              roundScores[roundNumber][playerInfo[socket.id][designation]] = cardValue
            }
          }
          finishedMoves++;
        })
          // if statement to check if both scores are present
        // return new promise
        //   if (roundScores[roundNumber]['player1']) && (roundScores[roundNumber]['player2']) {
        //     resolve
        //   })
        /*
        async function waitForMoves() {
          return new Promise((res, rej) => {
            if (finishedMoves === 2) {
              finishedMoves = 0;
              console.log("Done");
              resolve();
            }
          });
        }

        waitForMoves();
            // Compare numbers to find winner.

            // Create players' cumulative scores

            // Output the winner using an emit

            // Update the round number

            // Don't allow the while loop to

        */

      // socket.on('message', function (e) {
      //   console.log('CardPlayed: ', e.cardPlayed);
      //
      //   console.log(socket.id, playerInfo)
      // })

      } // This closes the prize cards counter
    } // This closes the main game function

    // const question1 = () => {
    //   // return new Promise((resolve, reject) => {
    //     console.log('Running question 1.')
    //     io.to(`${playerInfo.player1.id}`).emit(
    //       'player1turn',
    //       `Player One: Please play an available card. Available cards: ${playerInfo.player1.cardString}`,
    //     )

    //     socket.on('message', function (player1card) {
    //       console.log('Am I here? My card is', player1card)
    //       playerInfo.player1.cardString = playerInfo.player1.cardString.replace(player1card, '');
    //       console.log(playerInfo.player1.cardString)
    //       resolve();
    //     })



        // console.log('okokok');



        // playerOneBet = parseInt(answerIndex);

        // playerOnePlayedCard = playerOneCards.find((element) => {return Object.keys(element)[0] === answerIndex});

        // playerOneCards.splice(playerOneCards.indexOf(playerOnePlayedCard), 1);

        // playerOneCardsString = '';

        // for (card of playerOneCards)
        // {
          // playerOneCardsString += Object.values(card) + ' ';
        // }



      // })
    // }
    // console.log('okokokokok')
    // const question2 = () => {
    //   return new Promise((resolve, reject) => {
    //     console.log('Running question 2.')
    //     readline.question(`Player Two: Please play an available card.
    //       Available cards: ${playerTwoCardsString}

    //       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //       `, (answer) => {
    //         console.log(`You played the ${answer} of ${suits[playerTwoSuit]}.`)

    //         let answerIndex = calculateValue(answer);

    //         playerTwoBet = parseInt(answerIndex);

    //         playerTwoPlayedCard = playerTwoCards.find((element) => {return Object.keys(element)[0] === answerIndex});

    //         playerTwoCards.splice(playerTwoCards.indexOf(playerTwoPlayedCard), 1);

    //         playerTwoCardsString = '';

    //         for (card of playerTwoCards)
    //         {
    //           playerTwoCardsString += Object.values(card) + ' ';
    //         }


    //         resolve();
    //     });

    //   })
    // }

  // main();
  mainGame();
  } // This is closing the if statement


}); // This is closing the socket connection

server.listen(PORT, () => {
  console.log('Server is live on PORT:' + PORT);
});
