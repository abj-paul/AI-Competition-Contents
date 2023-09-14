// GOMOKU PIECE REPRESENATION FORMAT
const BLACK = 'b';
const EMPTY = '-';
const WHITE = 'w';
const BOARD_SIZE = 10;

let totalMoves = 1;

const PLAYER1_INFO = {
    "server_address": "http://localhost:3000/ai/solve",
    "name": "Stanform",
    "piece": BLACK,
    "color": "Black",
    "logo": "./resources/stanform-logo.webp"
};

const PLAYER2_INFO = {
    "server_address": "http://localhost:3000/ai/solve",
    "name": "Knights",
    "piece": WHITE,
    "color": "White",
    "logo": "./resources/knight-logo.jpg"
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
    addMove(`(5,4)`, PLAYER1_INFO.name);
    document.getElementById("opponentLabel").innerText = `${PLAYER1_INFO.name}(${PLAYER1_INFO.color}) Vs ${PLAYER2_INFO.name}(${PLAYER2_INFO.color})`;
    const player1Figure = document.getElementById("player1");
    player1Figure.querySelector("img").src = PLAYER1_INFO.logo;
    player1Figure.querySelector("figcaption").innerText = PLAYER1_INFO.name;
    const player2Figure = document.getElementById("player2");
    player2Figure.querySelector("img").src = PLAYER2_INFO.logo;
    player2Figure.querySelector("figcaption").innerText = PLAYER2_INFO.name;

    console.log("The game has started");

    while(!GAME_END_SIGNAL){
      wait_for_opponent_move(() => {
	  document.getElementById("player1").setAttribute("class","hide");
	  document.getElementById("player2").removeAttribute("class", "hide");
	  sleep(2000).then(()=>{
	      wait_for_opponent_move(() => {
		  document.getElementById("player2").setAttribute("class", "hide");
		  document.getElementById("player1").removeAttribute("class","hide");
		  
	      }, PLAYER2_INFO.server_address, PLAYER2_INFO);
	  });
	  
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
	let move = findDifferentCells(current_board_state, reply.state);
	current_board_state = reply.state;
	generateBoard();

	addMove(`(${move[0].row}, ${move[0].col})`, player.name);

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

// Function to add a move to the table
function addMove(moveNumber, player) {
    // Get the table body
    const tableBody = document.querySelector("#moveTable tbody");

    // Create a new row
    const newRow = document.createElement("tr");

    // Create and append cells for move number and player
    const moveCell = document.createElement("td");
    moveCell.textContent = moveNumber;
    newRow.appendChild(moveCell);

    const playerCell = document.createElement("td");
    playerCell.textContent = player;
    newRow.appendChild(playerCell);

    // Append the new row to the table body
    tableBody.appendChild(newRow);
}

function findDifferentCells(matrix1, matrix2) {
    const differences = [];

    // Check if the matrices have the same dimensions
    if (matrix1.length !== matrix2.length || matrix1[0].length !== matrix2[0].length) {
        console.error("Matrices have different dimensions");
        return differences;
    }

    for (let i = 0; i < matrix1.length; i++) {
        for (let j = 0; j < matrix1[i].length; j++) {
            if (matrix1[i][j] !== matrix2[i][j]) {
                differences.push({ row: i, col: j });
            }
        }
    }

    return differences;
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
