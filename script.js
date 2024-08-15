"use strict";

const allTurn = document.querySelector(".turn");
const turnX = document.querySelector(".turn--X");
const turnO = document.querySelector(".turn--O");

const buttonBot = document.querySelector(".bot");
const buttonfriend = document.querySelector(".friend");
const buttonReset = document.querySelector(".reset");

const huPlayer = "O";
const aiPlayer = "X";
const cells = document.querySelectorAll(".cell");
const endGame = document.querySelector(".end-game");
const replay = document.querySelector(".reset");

let originBoard;
let currPlayer = "bot";
let currTurn = "O";
let flag = true;

const winCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

for (let i = 0; i < cells.length; i++) {
  cells[i].textContent = "";
  cells[i].style.backgroundColor = "transparent";
  cells[i].addEventListener("click", turnClick);
}

buttonBot.addEventListener("click", () => {
  currPlayer = "bot";
  buttonBot.classList.add("hidden");
  buttonReset.classList.remove("hidden", "friend");
  buttonReset.classList.add("bot");
  buttonfriend.classList.remove("hidden");
  startGame();
});
buttonfriend.addEventListener("click", () => {
  currPlayer = "friend";
  buttonfriend.classList.add("hidden");
  buttonReset.classList.remove("hidden", "bot");
  buttonReset.classList.add("friend");
  buttonBot.classList.remove("hidden");
  startGame();
});
buttonReset.addEventListener("click", () => {
  startGame();
});

replay.addEventListener("click", startGame);

function startGame() {
  flag = true;
  endGame.classList.add("hidden");
  originBoard = Array.from(Array(9).keys());
  turnO.classList.add("turn--active");
  turnX.classList.remove("turn--active");

  for (let i = 0; i < cells.length; i++) {
    cells[i].textContent = "";
    cells[i].style.backgroundColor = "transparent";
    cells[i].addEventListener("click", turnClick);
  }
}

function turnClick(square) {
  if (currPlayer === "bot") {
    turn(square.target.id, huPlayer);
    if (!checkTie()) {
      setTimeout(() => {
        if (flag) {
          const temp = [0, 2, 4, 6, 8].filter((el) => el !== +square.target.id);
          // console.log(temp);
          // console.log(square.target.id);
          const randInd = Math.floor(Math.random() * temp.length);

          turn(temp[randInd], aiPlayer);
          flag = false;
        } else turn(bestSpot(), aiPlayer);
      }, 1000);
    }
  } else {
    turn(square.target.id, currTurn);
    currTurn = currTurn === "O" ? "X" : "O";
  }
}

function turn(squareId, player) {
  originBoard[squareId] = player;
  const temp = document.getElementById(squareId);
  temp.textContent = player;
  cells[squareId].removeEventListener("click", turnClick);

  let gameWon = checkWin(originBoard, player);
  if (checkTie()) declareWiner("Tie");
  if (gameWon) gameOver(gameWon);

  if (player === huPlayer) {
    turnX.classList.add("turn--active");
    turnO.classList.remove("turn--active");
  }
  if (player === aiPlayer) {
    turnO.classList.add("turn--active");
    turnX.classList.remove("turn--active");
  }
}

function checkWin(board, player) {
  let gameWon = null;

  for (let i = 0; i < winCombos.length; i++) {
    if (winCombos[i].every((index) => board[index] === player)) {
      gameWon = { index: i, winner: player };
      break;
    }
  }

  return gameWon;
}

function gameOver(gameWon) {
  winCombos[gameWon.index].forEach((el) => {
    cells[el].style.backgroundColor = "#40a578";
  });

  declareWiner(gameWon.winner);
}

function declareWiner(who) {
  for (let i = 0; i < cells.length; i++) {
    cells[i].removeEventListener("click", turnClick);
  }
  endGame.classList.remove("hidden");
  if (who === "Tie") {
    endGame.textContent = "Tie";
    return;
  }
  endGame.textContent = who === huPlayer ? "You Win" : "You Lose";
}

function checkTie() {
  for (let i = 0; i < 9; i++) {
    if (typeof originBoard[i] === "number") return false;
  }
  return true;
}

function emptyPlace(board) {
  return board.filter((s) => typeof s === "number");
}

function bestSpot() {
  return minimax(originBoard, aiPlayer).index;
}

function minimax(newBoard, player) {
  let availableSpot = emptyPlace(newBoard);

  if (checkWin(newBoard, huPlayer)) {
    return { score: -10 };
  } else if (checkWin(newBoard, aiPlayer)) {
    return { score: 20 };
  } else if (availableSpot.length === 0) return { score: 0 };

  let moves = [];

  for (let i = 0; i < availableSpot.length; i++) {
    let move = {};
    move.index = availableSpot[i];
    newBoard[availableSpot[i]] = player;

    if (player === aiPlayer) {
      let result = minimax(newBoard, huPlayer);
      move.score = result.score;
    } else {
      let result = minimax(newBoard, aiPlayer);
      move.score = result.score;
    }

    newBoard[availableSpot[i]] = move.index;
    moves.push(move);
  }

  let bestMove;

  if (player === aiPlayer) {
    let bestScore = -Infinity;

    for (let i = 0; i < moves.length; i++) {
      if (bestScore < moves[i].score) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = Infinity;

    for (let i = 0; i < moves.length; i++) {
      if (bestScore > moves[i].score) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}
