const {socketAssignment, cardChoice} = require('./socket-handlers.js');

function onConnect(socketClient, socket, gameInfo, connectCounter)
{
  console.log(`User ${socket.id} has connected to the game.`);

   // Track number of players connected, assignment of player designations
  socket.on('socketAssignment', function() {
    socketAssignment(socketClient, socket, gameInfo, connectCounter);
  });

  // Assigning the player's values to the object
  socket.on('cardChoice', function(cardValue, gameID) {
    cardChoice(socketClient, gameInfo, cardValue, gameID, socket.id);
  });

   //Whenever a socket disconnects
  socket.on('disconnect', function () {
    console.log(`User ${socket.id} has disconnected`);
    connectCounter--;
  });
}

module.exports = onConnect;
