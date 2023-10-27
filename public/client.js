
window.onscroll=function(){window.scrollTo(x, y);};
var HOST = location.origin.replace(/^http/, 'ws')

// creates connection
var ws = new WebSocket(HOST);

var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')
var $order = $('#order')


// test
var currentMove;
var showAll = false; 

var showLastSeen = true;

function ToggleLastSeen(){
  showLastSeen = !showLastSeen;
  showSecondBoard();
  console.log(showLastSeen)
}

var config = {
  position: 'start',
  showNotation: false,
  draggable: true,
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapbackEnd: onSnapbackEnd,
  onSnapEnd: onSnapEnd,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
}
function onSnapbackEnd(piece, square, position, orientation){
  // console.log('hello')
  setTimeout(function() {Show(player ? 'w' : 'b')}, 1)
}

var board = Chessboard('myBoard', config)

var lastSeen = Chessboard('lastSeen', {position : 'start', showNotation: false})



	// uses the minimax algorithm with alpha beta pruning to caculate the best move
	var calculateBestMove = function() {

    var possibleNextMoves = game.moves();
    var bestMove = -9999;
    var bestMoveFound;

    for(var i = 0; i < possibleNextMoves.length; i++) {
        var possibleNextMove = possibleNextMoves[i]
        game.move(possibleNextMove);
        var value = minimax(minimaxDepth, -10000, 10000, false);
        game.undo();
        if(value >= bestMove) {
            bestMove = value;
            bestMoveFound = possibleNextMove;
        }
    }
    return bestMoveFound;
};


// minimax with alhpha-beta pruning and search depth d = 3 levels
var minimax = function (depth, alpha, beta, isMaximisingPlayer) {
    if (depth === 0) {
        return -evaluateBoard(game.board());
    }

    var possibleNextMoves = game.moves();
    var numPossibleMoves = possibleNextMoves.length

    if (isMaximisingPlayer) {
        var bestMove = -9999;
        for (var i = 0; i < numPossibleMoves; i++) {
            game.move(possibleNextMoves[i]);
            bestMove = Math.max(bestMove, minimax(depth - 1, alpha, beta, !isMaximisingPlayer));
            game.undo();
            alpha = Math.max(alpha, bestMove);
            if(beta <= alpha){
              return bestMove;
            }
        }

    } else {
        var bestMove = 9999;
        for (var i = 0; i < numPossibleMoves; i++) {
            game.move(possibleNextMoves[i]);
            bestMove = Math.min(bestMove, minimax(depth - 1, alpha, beta, !isMaximisingPlayer));
            game.undo();
            beta = Math.min(beta, bestMove);
            if(beta <= alpha){
              return bestMove;
            }
        }
    }

  return bestMove;
};


// the evaluation function for minimax
var evaluateBoard = function (board) {
    var totalEvaluation = 0;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            totalEvaluation = totalEvaluation + getPieceValue(board[i][j], i, j);
        }
    }
    return totalEvaluation;
};


var reverseArray = function(array) {
    return array.slice().reverse();
};

var whitePawnEval =
    [
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
        [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
        [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
        [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
        [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
        [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
        [0.5,  1.0,  1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
    ];

var blackPawnEval = reverseArray(whitePawnEval);

var knightEval =
    [
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
        [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
        [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
        [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
        [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
        [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
        [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
    ];

var whiteBishopEval = [
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
    [ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
    [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
    [ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
    [ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];

var blackBishopEval = reverseArray(whiteBishopEval);

var whiteRookEval = [
    [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
    [  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
];

var blackRookEval = reverseArray(whiteRookEval);

var evalQueen = [
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];

var whiteKingEval = [

    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
    [ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
    [  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0 ],
    [  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]
];

var blackKingEval = reverseArray(whiteKingEval);


var getPieceValue = function (piece, x, y) {
    if (piece === null) {
        return 0;
    }

    var absoluteValue = getAbsoluteValue(piece, piece.color === 'w', x ,y);

    if(piece.color === 'w'){
      return absoluteValue;
    } else {
      return -absoluteValue;
    }
};


var getAbsoluteValue = function (piece, isWhite, x ,y) {
      if (piece.type === 'p') {
          return 10 + ( isWhite ? whitePawnEval[y][x] : blackPawnEval[y][x] );
      } else if (piece.type === 'r') {
          return 50 + ( isWhite ? whiteRookEval[y][x] : blackRookEval[y][x] );
      } else if (piece.type === 'n') {
          return 30 + knightEval[y][x];
      } else if (piece.type === 'b') {
          return 30 + ( isWhite ? whiteBishopEval[y][x] : blackBishopEval[y][x] );
      } else if (piece.type === 'q') {
          return 90 + evalQueen[y][x];
      } else if (piece.type === 'k') {
          return 900 + ( isWhite ? whiteKingEval[y][x] : blackKingEval[y][x] );
      }
};

function showSecondBoard(){
  // lastSeen.clear(false)
  // lastSeen = Chessboard('lastSeen', {position : board.fen(), showNotation: true})
  pos = lastSeen.position()
  asdf =  document.getElementById('lastSeen')
  console.log(asdf)
  for (var key in pos){
    // key is piece location, value is piece type ie bp = black pawn
    var value = pos[key]
    if (value[0] != get_player_color()){
    var test1 = asdf.querySelector(`[data-square="${key}"]`);
    if (test1){
    // console.log(test1);
    var test2 = test1.lastChild
    // console.log(test2)
    if (test2){
      if (showLastSeen){
      test2.setAttribute("style","width:49px;height:49px;opacity:0.25");
      } else {
      test2.setAttribute("style","width:49px;height:49px;opacity:0");
      }
      // console.log('showing' + test2);
    }
  } 
}
  }
  asdf =  document.getElementById('lastSeen')
chars = "abcdefgh".split('')
  chars.forEach(c => {
  for (i = 1; i <= 8; i++){
    key = c + `${i}`
    // console.log(key)
    var test1 = asdf.querySelector(`[data-square="${key}"]`);
    if (test1) {
      test1.setAttribute("style","width:49px;height:49px; background-color : rgba(0, 0, 0, 0);");
    }
  }
  })
}
// one way to add krielspiel variant is to use the game.js
// logic to figure out which pieces are black and which pieces are white
// then guess the img id and location and manually edit css
// seems easier than trying to modify chessboard.js, library code is unreadable
// 1 for white

player = 1

has_received_msg = false

ws.onmessage = function (event) {
  var msg = JSON.parse(event.data)
  switch(msg.type) {
    case "state":
      has_received_msg = true
      test1 = board.position(msg.content, false);
      test2 = game.load(msg.content)
      showSecondBoard()
      
      if (game.in_checkmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.'
        setTimeout(function() {          
          send_Reset();
        }, 100)
      } else {
        // For AI
        // if (player == 0){
        //   if (game.turn() === 'b'){
        //     minimaxDepth = 1
        //     console.log("calculating best move")
        //     var bestMove = calculateBestMove();
        //     console.log(bestMove)
        //     setTimeout(function() {          
        //       game.move(bestMove);
        //       sendState(game.fen())
        //       board.position(game.fen(), false);
        //     }, 1)

        //   }
        // }
    }
    // console.log(msg.move)
    if (msg.move){
      showAll = "captured" in msg.move || game.in_check(); 
      currentMove = msg.move;

      
      if (showAll){
        lastSeen.position(game.fen())
        showSecondBoard()
      }
    }
    if (player < 2){ 
        // player
      setTimeout(function() {Show(player ? 'w' : 'b'); removeGreySquares()}, 1)
      } else {
        // observer
        board = Chessboard('myBoard', {draggable:false})
        board.position(msg.content, false);
        
  
        // Show all piece if observer
        pos = board.position()
        for (var key in pos){
          var test1 = document.querySelector(`[data-square="${key}"]`);
          var test2 = test1.lastChild
          if (test2){
          test2.setAttribute("style","width:49px;height:49px;opacity:1");
          }
        }
      }
      updateStatus()
      break;
    case "time":
      el = document.getElementById('server-time');
      el.innerHTML = 'Server time: ' + msg.text;
      break;
    case "order":
      player = msg.content;
      color = player ? 'white' : 'black';
      updateStatus()
    break;
    case "reset":
      reset_board()
    break;
    case "quit":
      console.log("received quit signal")
      alert("Opponent has dced! Please refresh to join another game");
      ws.close()
    break;
  }
};

var whiteSquareGrey = '#a9a9a9'
var blackSquareGrey = '#6969a9'
var Grey = '#696969'

var blue = '#0000FF'
var yellow  = '	#FFFF00'

function removeGreySquares () {
  $('#myBoard .square-55d63').css('background', '')
  Show(player ? 'w' : 'b')
}

function GreySquare (square) {
  var $square = $('#myBoard .square-' + square)

  // var background = whiteSquareGrey
  // if ($square.hasClass('black-3c85d')) {
  //   background = blackSquareGrey
  // }
  $square.css('background', Grey)
}

function blueSquare (square) {
  var $square = $('#myBoard .square-' + square)
  $square.css('background', blue)
}

function reset_board(){
  board.start()
  game = new Chess()
  canbeseen = []
}
function get_player_color(){
  return player ? 'w' : 'b'
}

function send_Reset() {
  const msg = {
    type: "reset",
    date: Date.now()
  }
  final_msg = JSON.stringify(msg) 
  ws.send(final_msg)
  reset_board()
}

function Show(color_to_show){
  state = game.fen().split(' ')

  // want this to work even if it is not your turn, as Chess.js 
  // takes into account who's turn it is when considering legal moves
  state[1] = color_to_show
  game_in_players_move = state.join(' ')
  // console.log(game_in_players_move)
  new_game = new Chess(game_in_players_move)
  moves = new_game.moves({verbose: true})
  
  
  canbeseen = []
  moves.forEach(element => {
    canbeseen.push(element.to)
    // if (element.flags == 'c' ){
      
    // }
  });

  


  // makes a new game that has deleted all opposite color pieces,
  // so i can see where pawns could possibly move
  // later will check if any pawns non capture moves would run into enemy pieces
  // in which case, will reveal the piece 
  new_game2 = new Chess(game_in_players_move)

  chars = "abcdefgh".split('')
  // console.log(color_to_show)
  chars.forEach(c => {
  for (i = 1; i <= 8; i++){
      piece_position = c+i.toString()
      piece = new_game2.get(piece_position)
      if (piece){
        if (piece['color'] != color_to_show) {
          new_game2.remove(piece_position)
        } 
      } 
    }
  })
  // console.log(new_game2.ascii())

  moves = new_game2.moves({verbose: true})
  pawnmoves = []
  moves.forEach(element => {
    if (element.piece == 'p' ){
      pawnmoves.push(element.to)
    }
  });

  pos = board.position()

  if (currentMove && currentMove.color != get_player_color()){
    if (canbeseen.includes(currentMove.to) || pawnmoves.includes(currentMove.to)) {
      var $square = $('#myBoard .square-' + currentMove.to)
      $square.css('background', yellow)
      $square = $('#myBoard .square-' + currentMove.from)
      $square.css('background', yellow)
    } 
}

  for (var key in pos){
    // key is piece location, value is piece type ie bp = black pawn
    var value = pos[key]
    if (value[0] == color_to_show 
    || canbeseen.includes(key)
    || (value[0] != color_to_show && pawnmoves.includes(key)) || showAll
       ){
        var test1 = document.querySelector(`[data-square="${key}"]`);
        
        if (test1){
        var test2 = test1.lastChild;

        if (test2){
        test2.setAttribute("style","width:49px;height:49px;opacity:1");
        }
        }
    }
  }
  // console.log(canbeseen)
  // Show fog if board is not being reveleaed
  if (!showAll) {
    chars.forEach(c => {
    for (i = 1; i <= 8; i++){
        piece_position = c+i.toString()
        piece = game.get(piece_position)
        // if (i == 4 && c == 'g') {
        // console.log(piece_position)
        // console.log((piece && piece['color'] == get_player_color()));
        // console.log(canbeseen.includes(piece_position));
        // console.log(pawnmoves.includes(piece_position));
        if ((piece != null && piece['color'] == get_player_color()) || canbeseen.includes(piece_position) || pawnmoves.includes(piece_position)) {
          // console.log(piece_position + " should be seen");
        } else{
          // console.log("adding fog to " + piece_position);
          GreySquare(piece_position)
        }
        // } 
      }
      })
  }
}

function sendState(state, move){
  const msg = {
    type: "state",
    state: state,
    move: move,
    date: Date.now()
  }
  final_msg = JSON.stringify(msg) 
  ws.send(final_msg)
}

function sendMsg(content, type){
  const msg = {
    type: type,
    content: content,
    date: Date.now()
  }
  final_msg = JSON.stringify(msg) 
  ws.send(final_msg)

}

$('#ResetBtn').on('click', send_Reset)
$('#ToggleLastSeenBtn').on('click', ToggleLastSeen)


// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js


function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  player_color =  player ? 'w' : 'b'
  // console.log('turn for ' + game.turn())
  // only pick up pieces for the side to move
  // console.log('player color ' + player_color)
  if ((player_color == 'w' && game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (player_color == 'b' && game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

function onDrop (source, target, piece, newPos, oldPos, orienation) {
  removeGreySquares()
  // console.log('fen ' + game.fen())
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })
  // console.log('fen ' + game.fen())
  // console.log("illegal")
  // illegal move
  if (move === null) return 'snapback';

  currentMove = move;
  showAll = false;
  // board.position(move, false);
  
  updateStatus()
}
function onMouseoverSquare (square, piece) {
  
  showSecondBoard()
  // removeGreySquares();
  // console.log(piece)
  if (piece) {
    player_color = player ? 'w' : 'b'
    state = game.fen().split(' ')

    // want this to work even if it is not your turn, as Chess.js 
    // takes into account who's turn it is when considering legal moves
    state[1] = player_color
    game_in_players_move = state.join(' ')
    new_game = new Chess(game_in_players_move)
    if (piece[0] != player_color) return
    // get list of possible moves for this square
    var moves = new_game.moves({
      square: square,
      verbose: true
    })

    // exit if there are no moves available for this square
    if (moves.length === 0) return

    // highlight the square they moused over
    blueSquare(square)

    // highlight the possible squares for this piece
    for (var i = 0; i < moves.length; i++) {
      blueSquare(moves[i].to)
    }
  }
}
function onMouseoutSquare (square, piece) {
  removeGreySquares()
}
// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen(), false)
  // setTimeout(function() {Show(player ? 'w' : 'b')}, 1)
  Show(player ? 'w' : 'b')
  sendState(game.fen(), currentMove)
  // sendMsg(currentMove, "move")
}

function updateStatus () {
  var status = ''

  // var moveColor = 'White'
  // if (game.turn() === 'b') {
  //   moveColor = 'Black'
  // }
  var state = game.fen().split(' ')
  // console.log(state[1])
  var moveColor = state[1] == 'w' ? 'white' : 'black'

  // checkmate?
  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
  }

  // draw?
  else if (game.in_draw()) {
    status = 'Game over, drawn position'
  }

  // game still on
  else {
    status = moveColor + ' to move'

    // check?
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }
  }
  if (has_received_msg == false) {
    status = "<p> waiting for opponent </p><p>(open another instance of webpage to join) </p>"
  }
  $status.html(status)
  $fen.html(game.fen())
  $pgn.html(game.pgn())
  $order.html(player ? 'white' : 'black')
}

