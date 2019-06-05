function determineSuits(gameInfo, player1, player2)
{
  let availableSuits = [0,1,2,3];

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
}

module.exports = determineSuits;
