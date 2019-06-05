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
const onConnect   = require('./socket/on-connect.js');

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

const cookieParser = require('cookie-parser');
app.use(cookieParser());

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

let gameInfo = {};
let connectCounter = 0;

// Whenever a new socket connects
io.on('connection', function(socket){
  connectCounter++;
  onConnect(io, socket, gameInfo, connectCounter);
})

server.listen(PORT, () => {
  console.log('Server is live on PORT:' + PORT);
});
