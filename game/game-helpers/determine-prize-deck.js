const cardValues = [1,2,3,4,5,6,7,8,9,10,11,12,13];

function determinePrizeDeck(gameInfo, gameID)
{
  let prizeDeck = [];

  for (let i = 0; i < 13; i++)
  {
    let randomCardIndex = Math.floor(Math.random() * cardValues.length);
    let randomCard;
    if (randomCardIndex === cardValues.length)
    {
      randomCard = cardValues.pop();
    }
    else randomCard = cardValues.splice(randomCardIndex, 1)[0];

    prizeDeck.push(randomCard);
  }

  return prizeDeck;
}

module.exports = determinePrizeDeck;
