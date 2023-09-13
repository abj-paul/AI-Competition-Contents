// GOMOKU PIECE REPRESENATION FORMAT
const BLACK = 'b';
const EMPTY = '-';
const WHITE = 'w';
const BOARD_SIZE = 10;

let totalMoves = 1;

const GOMOKU_PLAYER1_ADDRESS = "http://localhost:3000/ai/solve";
const GOMOKU_PLAYER2_ADDRESS = "http://localhost:3000/ai/solve";


let CURRENT_TURN = BLACK;
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

function generateBoard() {
  // Removing Old Board
  let board = document.getElementById("board");
  while (board.firstChild) {
    board.removeChild(board.firstChild);
  }

  // Drawing New Board
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      let cell = document.createElement("button");
      cell.innerText = " ";
      cell.id = `${i}-${j}`;
      cell.classList.add("grid-item");
      cell.onclick = function (event) {
        makeMove(i, j);
      };
      document.getElementById("board").appendChild(cell);
      drawMove(i, j);
    }
  }
}

function wait_for_opponent_move(callback, server_address) {
  console.log("Waiting for AI Move");
  fetch(GOMOKU_PLAYER1_ADDRESS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      state: current_board_state,
    }),
  })
    .then((response) => response.json())
    .then((reply) => {
      console.log("AI has replied!");
      current_board_state = reply.state;
      generateBoard();
      document.getElementById("aiisdeciding").setAttribute("class", "hide");
      document.getElementById("faster").removeAttribute("class", "hide");
      callback(); // Call the callback function
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });
}


function makeMove(i, j) {

  wait_for_opponent_move(() => {
    if (checkWin() == true) {
      showResultModal("You won!");
      return;
    }
    
    document.getElementById("faster").setAttribute("class","hide");
    document.getElementById("aiisdeciding").removeAttribute("class", "hide");


    if (CURRENT_TURN == BLACK) {
      CURRENT_TURN = WHITE;
    } else {
      CURRENT_TURN = BLACK;
    }

    if (checkWin() == true) {
      showResultModal("AI won!");
      return;
    }
    
  }, GOMOKU_PLAYER1_ADDRESS);

  totalMoves+=1;

  wait_for_opponent_move(() => {
    if (checkWin() == true) {
      showResultModal("You won!");
      return;
    }
    
    document.getElementById("faster").setAttribute("class","hide");
    document.getElementById("aiisdeciding").removeAttribute("class", "hide");


    if (CURRENT_TURN == BLACK) {
      CURRENT_TURN = WHITE;
    } else {
      CURRENT_TURN = BLACK;
    }

    if (checkWin() == true) {
      showResultModal("AI won!");
      return;
    }
    
  }, GOMOKU_PLAYER2_ADDRESS);

  totalMoves+=1;

}



// Miscellaneous Functions

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
    CURRENT_TURN = BLACK;
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
