// const cards =
// [
//   {
//     rank: 1,
//     suit: 0
//   },
//   {
//     rank: 2,
//     suit: 0
//   },
//   {
//     rank: 3,
//     suit: 0
//   },
//   {
//     rank: 4,
//     suit: 0
//   },
//   {
//     rank: 5,
//     suit: 0
//   },
//   {
//     rank: 6,
//     suit: 0
//   },
//   {
//     rank: 7,
//     suit: 0
//   },
//   {
//     rank: 8,
//     suit: 0
//   },
//   {
//     rank: 9,
//     suit: 0
//   },
//   {
//     rank: 10,
//     suit: 0
//   },
//   {
//     rank: 11,
//     suit: 0
//   },
//   {
//     rank: 12,
//     suit: 0
//   },
//   {
//     rank: 13,
//     suit: 0
//   },
//   {
//     rank: 1,
//     suit: 1
//   },
//   {
//     rank: 2,
//     suit: 1
//   },
//   {
//     rank: 3,
//     suit: 1
//   },
//   {
//     rank: 4,
//     suit: 1
//   },
//   {
//     rank: 5,
//     suit: 1
//   },
//   {
//     rank: 6,
//     suit: 1
//   },
//   {
//     rank: 7,
//     suit: 1
//   },
//   {
//     rank: 8,
//     suit: 1
//   },
//   {
//     rank: 9,
//     suit: 1
//   },
//   {
//     rank: 10,
//     suit: 1
//   },
//   {
//     rank: 11,
//     suit: 1
//   },
//   {
//     rank: 12,
//     suit: 1
//   },
//   {
//     rank: 13,
//     suit: 1
//   },
//   {
//     rank: 1,
//     suit: 2
//   },
//   {
//     rank: 2,
//     suit: 2
//   },
//   {
//     rank: 3,
//     suit: 2
//   },
//   {
//     rank: 4,
//     suit: 2
//   },
//   {
//     rank: 5,
//     suit: 2
//   },
//   {
//     rank: 6,
//     suit: 2
//   },
//   {
//     rank: 7,
//     suit: 2
//   },
//   {
//     rank: 8,
//     suit: 2
//   },
//   {
//     rank: 9,
//     suit: 2
//   },
//   {
//     rank: 10,
//     suit: 2
//   },
//   {
//     rank: 11,
//     suit: 2
//   },
//   {
//     rank: 12,
//     suit: 2
//   },
//   {
//     rank: 13,
//     suit: 2
//   },
//   {
//     rank: 1,
//     suit: 3
//   },
//   {
//     rank: 2,
//     suit: 3
//   },
//   {
//     rank: 3,
//     suit: 3
//   },
//   {
//     rank: 4,
//     suit: 3
//   },
//   {
//     rank: 5,
//     suit: 3
//   },
//   {
//     rank: 6,
//     suit: 3
//   },
//   {
//     rank: 7,
//     suit: 3
//   },
//   {
//     rank: 8,
//     suit: 3
//   },
//   {
//     rank: 9,
//     suit: 3
//   },
//   {
//     rank: 10,
//     suit: 3
//   },
//   {
//     rank: 11,
//     suit: 3
//   },
//   {
//     rank: 12,
//     suit: 3
//   },
//   {
//     rank: 13,
//     suit: 3
//   },
// ]


const suits =
{
  0: 'spades',
  1: 'hearts',
  2: 'clubs',
  3: 'diamonds'
};

const cards =
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

function calculateValue(card)
{
  if (card === 'ace')
  {
    return '1';
  }
  else if (card === 'jack')
  {
    return '11';
  }
  else if (card === 'queen')
  {
    return '12';
  }
  else if (card === 'king')
  {
    return '13';
  }
  else return card;
}

let availableSuits = [0,1,2,3];
let playerOneSuit = availableSuits[Math.floor(Math.random() * 4)];
if (playerOneSuit === availableSuits[availableSuits.length - 1])
{
  availableSuits.pop();
}
else availableSuits.splice(availableSuits.indexOf(playerOneSuit), 1);

let playerTwoSuit = availableSuits[Math.floor(Math.random() * 3)];
if (playerTwoSuit === availableSuits[availableSuits.length - 1])
{
  availableSuits.pop();
}
else availableSuits.splice(availableSuits.indexOf(playerTwoSuit), 1);

let prizeSuit = availableSuits[Math.floor(Math.random() * 2)];
if (prizeSuit === availableSuits[availableSuits.length - 1])
{
  availableSuits.pop();
}
else availableSuits.splice(availableSuits.indexOf(prizeSuit), 1);

console.log(`Hi~! Welcome to the test Goofspiel game.
  Player one's suit is ${suits[playerOneSuit]}.
  Player two's suit is ${suits[playerTwoSuit]}.
  The prize suit is ${suits[prizeSuit]}.

  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  `);


const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});




let playerOneCardsString = '';
let playerOnePlayedCard;

let playerTwoCardsString = '';
let playerTwoPlayedCard;

let playerOneBet = 0;
let playerTwoBet = 0;

let playerOneScore = 0;
let playerTwoScore = 0;

for (card of playerOneCards)
{
  playerOneCardsString += Object.values(card) + ' ';
}

for (card of playerTwoCards)
{
  playerTwoCardsString += Object.values(card) + ' ';
}

const question1 = () => {
  return new Promise((resolve, reject) => {
    readline.question(`Player One: Please play an available card.
      Available cards: ${playerOneCardsString}

      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `, (answer) => {
        console.log(`You played the ${answer} of ${suits[playerOneSuit]}.


















          `)

        let answerIndex = calculateValue(answer);

        playerOneBet = parseInt(answerIndex);

        playerOnePlayedCard = playerOneCards.find((element) => {return Object.keys(element)[0] === answerIndex});

        playerOneCards.splice(playerOneCards.indexOf(playerOnePlayedCard), 1);

        playerOneCardsString = '';

        for (card of playerOneCards)
        {
          playerOneCardsString += Object.values(card) + ' ';
        }


        resolve();
    })
  })
}

const question2 = () => {
  return new Promise((resolve, reject) => {
    readline.question(`Player Two: Please play an available card.
      Available cards: ${playerTwoCardsString}

      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `, (answer) => {
        console.log(`You played the ${answer} of ${suits[playerTwoSuit]}.

















          `)

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

    console.log(`A prize card is flipped over.
      It is the ${Object.values(prizeCard)} of ${suits[prizeSuit]}.

      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `);

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






// let rank;
// if (card.rank === 1)
// {
//   rank = 'ace';
// }
// else if (card.rank === 11)
// {
//   rank = 'jack';
// }
// else if (card.rank === 12)
// {
//   rank = 'queen';
// }
// else if (card.rank === 13)
// {
//   rank = 'king';
// }
// else rank = card.rank;

