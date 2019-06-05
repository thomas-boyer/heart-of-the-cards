$(document).ready(function(){

  // Identify the IP address and PORT that a socket will connect to.
  const socket = io.connect('http://localhost:8080');

  function showNotification () {
    $('.toast').toast('show');
  }

  function hideNotification() {
    $('.toast').toast('hide');
  }

  // Handler function for receiving player info assignment messages
  socket.on('connect', function () {
    socket.emit('socketAssignment')
  })

  socket.on('pending', function (message) {
    $('.toast .toast-body').append(message)
    showNotification();
  })

  socket.on('foundopponent', function (message) {

    $('.toast .toast-body').empty().append(message);

    showNotification();
  })

  socket.on('removeCard', function()
    {
      $('#game-play > div:last-of-type').remove();
    });

  // Handler function for welcome message
  socket.on('welcome', function (playerOneSuit, playerTwoSuit, prizeSuit, prizeCards) {

    $('.player1-cards > div').addClass(playerOneSuit);
    $('.player2-cards > div').addClass(playerTwoSuit);

    for (let i = 0; i < 13; i++)
    {
      $('#game-play').append(`<div class="card rank${prizeCards[i]} ${prizeSuit}" data-value="${prizeCards[i]}"><div class="face"></div></div>`);
    }

    $('#game-play').append('<div></div>');

  });

  // socket.on('removeCard', function()
  // {
  //   $('#game-play > div:last-of-type').remove();
  // })

  // Handler function for choice message
  socket.on('pleaseChoose', function (message, gameID) {

      $('.toast .toast-body').empty().append(message);
      showNotification();

      $('.player2-cards .card').click(function (event) {
        event.preventDefault();
        $('.card').off('click');
        $(this).hide();
        socket.emit('cardChoice', $(this).data('value'), gameID);
      })
  })

  socket.on('notDraw', function (message) {
    $('.toast .toast-body').empty().append(message);
    showNotification();
  })

  socket.on('draw', function (message) {
    $('.toast .toast-body').empty().append(message);
    showNotification();
  })

  socket.on('endgame', function (message) {
    $('.toast .toast-body').empty().append(message);
    showNotification();
  })

  socket.on('drawgame', function (message) {
    $('.toast .toast-body').empty().append(message);
    showNotification();
  })

});
