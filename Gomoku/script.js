// GOMOKU PIECE REPRESENATION FORMAT
const BLACK = 'b';
const EMPTY = '-';
const WHITE = 'w';
const BOARD_SIZE = 10;

let totalMoves = 1;

const GOMOKU_PLAYER1_ADDRESS = "http://localhost:3000/ai/solve";
const GOMOKU_PLAYER2_ADDRESS = "http://localhost:3000/ai/solve";


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

    while(totalMoves<100){
      wait_for_opponent_move(() => {
	  document.getElementById("faster").setAttribute("class","hide");
	  document.getElementById("aiisdeciding").removeAttribute("class", "hide");

	  wait_for_opponent_move(() => {
	      document.getElementById("faster").removeAttribute("class","hide");
	      document.getElementById("aiisdeciding").setAttribute("class", "hide");
	      
	  }, GOMOKU_PLAYER2_ADDRESS, WHITE);
	  
      }, GOMOKU_PLAYER1_ADDRESS, BLACK);

	await sleep(10000);

  }
}

async function wait_for_opponent_move(callback, server_address, player) {
  fetch(GOMOKU_PLAYER1_ADDRESS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
	state: current_board_state,
	player: player
    }),
  })
    .then((response) => response.json())
    .then((reply) => {
      console.log(`Player ${player} has replied!`);
      current_board_state = reply.state;
	generateBoard();
	handlePostMoveOf(player);
      callback(); 
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });
}

function handlePostMoveOf(player){
    console.log(`Moves so far = ${totalMoves}`);
    totalMoves+=1;

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

async function waitForPlayerMove(callback,playerAddress, playerColor) {
  console.log(`Waiting for ${playerColor} player's move...`);
  
  return new Promise((resolve) => {
    wait_for_opponent_move(callback, playerAddress, playerColor);
  });
}

function sleep(ms) {
    console.log(`Sleeping for ${ms} ms.`);
  return new Promise(resolve => setTimeout(resolve, ms));
}

function resetBoard(){
    current_board_state = [
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

    generateBoard();
    console.log("The board has been reset");
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
