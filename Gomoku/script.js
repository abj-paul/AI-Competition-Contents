// GOMOKU PIECE REPRESENATION FORMAT
const BLACK = 'b';
const EMPTY = '-';
const WHITE = 'w';
const BOARD_SIZE = 10;

let totalMoves = 1;

const PLAYER1_INFO = {
    "server_address": "http://localhost:3000/ai/solve",
    "name": "DOMINATOR",
    "piece": BLACK
};

const PLAYER2_INFO = {
    "server_address": "http://localhost:3000/ai/solve",
    "name": "Uwu Player",
    "piece": WHITE
};

const INITIAL_STATE = [
  ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
  ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
  ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
  ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
  ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
  ['-', '-', '-', '-', 'w', '-', '-', '-', '-', '-'],
  ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
  ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
  ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
  ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-']
];


let current_board_state = INITIAL_STATE;
let GAME_END_SIGNAL = false;

function generateBoard() {
  // Removing Old Board
  let board = document.getElementById("board");
  while (board.firstChild) {
    board.removeChild(board.firstChild);
  }

  // Drawing New Board
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      let cell = document.createElement("div");
      cell.innerText = " ";
      cell.id = `${i}-${j}`;
      cell.classList.add("grid-item");

      document.getElementById("board").appendChild(cell);
      drawMove(i, j);
    }
  }
}

// Core Business Logic
async function gamePlay() {
  console.log("The game has started");

    while(!GAME_END_SIGNAL){
      wait_for_opponent_move(() => {
	  document.getElementById("faster").setAttribute("class","hide");
	  document.getElementById("aiisdeciding").removeAttribute("class", "hide");

	  wait_for_opponent_move(() => {
	      document.getElementById("faster").removeAttribute("class","hide");
	      document.getElementById("aiisdeciding").setAttribute("class", "hide");
	      
	  }, PLAYER2_INFO.server_address, PLAYER2_INFO);
	  
      }, PLAYER1_INFO.server_address, PLAYER1_INFO);

	await sleep(10000);

  }
}

async function wait_for_opponent_move(callback, server_address, player) {
  fetch(server_address, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
	state: current_board_state,
	player: player.piece
    }),
  })
    .then((response) => response.json())
    .then((reply) => {
      console.log(`Player ${player.name} has replied!`);
      current_board_state = reply.state;
	generateBoard();
	if(!GAME_END_SIGNAL) handlePostMoveOf(player.name);
      callback(); 
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });
}

// Check if the player has won after each move
function handlePostMoveOf(player){
    console.log(`Moves so far = ${totalMoves}`);
    totalMoves+=1;
    document.getElementById("moves").innerText = ` ${totalMoves} `;

    if (checkWin() == true) {
	GAME_END_SIGNAL = true;
	showResultModal(`${player} won!`);
    }
    if(totalMoves==100){
	GAME_END_SIGNAL = true;
	console.log("Over 100 moves, ending..");
    }
}






// Miscellaneous Functions
function sleep(ms) {
    console.log(`Sleeping for ${ms} ms.`);
  return new Promise(resolve => setTimeout(resolve, ms));
}

function drawMove(i, j) {
    if (current_board_state[i][j] == BLACK) {
        document.getElementById(`${i}-${j}`).classList.add("piece");
        document.getElementById(`${i}-${j}`).classList.add("black");
    }
    else if (current_board_state[i][j] == WHITE) {
        document.getElementById(`${i}-${j}`).classList.add("piece");
        document.getElementById(`${i}-${j}`).classList.add("white");
    }
}


function showResultModal(message) {
  document.getElementById("resultMessage").textContent = message;
  $("#resultModal").modal("show");
}


function checkWin() {
  const directions = [
    [0, 1], // Horizontal
    [1, 0], // Vertical
    [1, 1], // Diagonal \
    [1, -1], // Diagonal /
  ];

  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      for (const [dx, dy] of directions) {
        let continuousCount = 0;
        let currentPlayer = current_board_state[i][j];

        if (currentPlayer === EMPTY) {
          continue;
        }

        for (let step = 0; step < 5; step++) {
          const x = i + step * dx;
          const y = j + step * dy;

          if (
            x >= 0 &&
            x < BOARD_SIZE &&
            y >= 0 &&
            y < BOARD_SIZE &&
            current_board_state[x][y] === currentPlayer
          ) {
            continuousCount++;
          } else {
            break;
          }
        }

        if (
          continuousCount === 5 &&
          (currentPlayer === BLACK || currentPlayer === WHITE)
        ) {
          return true;
        }
      }
    }
  }

  return false;
}
