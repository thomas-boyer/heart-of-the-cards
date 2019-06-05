const cardKey =
{
  1: 'ace',
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  11: 'jack',
  12: 'queen',
  13: 'king'
}

const suits =
{
  0: 'spades',
  1: 'hearts',
  2: 'clubs',
  3: 'diamonds'
};

const newRound = function (socketClient, gameInfo, gameID) {
  // Set prize.
  prizeCard = gameInfo[gameID].prizeDeck.pop();

  socketClient.emit('removeCard');

  // Send message
  socketClient.emit('pleaseChoose', `Round ${gameInfo[gameID].roundNumber} : A prize card is flipped over. It is the ${cardKey[prizeCard]} of ${suits[gameInfo[gameID].prizeSuit]}. Please select a card.`, gameID);
}

module.exports = newRound;
