"use strict";

const turnText = document.querySelector(".turn-for");
const turnX = document.querySelector(".turn--X");
const turnO = document.querySelector(".turn--O");

const buttonBot = document.querySelector(".bot");
const buttonfriend = document.querySelector(".friend");
const buttonReset = document.querySelector(".reset");

const huPlayer = "O";
const aiPlayer = "X";
const cells = document.querySelectorAll(".cell");
const endGame = document.querySelector(".end-game");

//  all possible win combination  //
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

class App {
  //  Properties   //

  originBoard;
  bindTurnClick;
  currPlayer = "bot";
  currTurn = "O";
  flag = true;

  //   constructor    //

  constructor() {
    this.resetGame();
  }

  //  Methods   //

  //  reset all things  //

  resetGame() {
    this.initialize();
    buttonBot.addEventListener(
      "click",
      this.addButtonClasses.bind(this, buttonBot, buttonfriend, "friend", "bot")
    );
    buttonfriend.addEventListener(
      "click",
      this.addButtonClasses.bind(this, buttonfriend, buttonBot, "bot", "friend")
    );
    buttonReset.addEventListener("click", this.startGame.bind(this));
  }

  addButtonClasses(b1, b2, a1, a2) {
    this.currPlayer = a2;
    b1.classList.add("hidden");
    b2.classList.remove("hidden");
    buttonReset.classList.remove("hidden", a1);
    buttonReset.classList.add(a2);
    this.startGame();
  }

  // Initialize every cells empty and create a new board  //

  initialize() {
    this.bindTurnClick = this.turnClick.bind(this);
    this.originBoard = Array.from(Array(9).keys());
    for (let i = 0; i < cells.length; i++) {
      cells[i].textContent = "";
      cells[i].style.backgroundColor = "transparent";
      cells[i].addEventListener("click", this.bindTurnClick);
    }
  }

  turnActive(_turn) {
    if (_turn === turnO) {
      turnO.classList.add("turn--active");
      turnX.classList.remove("turn--active");
      turnText.textContent =
        this.currPlayer === "bot" ? "your turn" : "player 1";
    } else {
      turnO.classList.remove("turn--active");
      turnX.classList.add("turn--active");
      turnText.textContent =
        this.currPlayer === "bot" ? "bot's turn" : "player 2";
    }
  }

  //  Main code start from here //

  startGame() {
    this.flag = true;
    endGame.classList.add("hidden");
    // turnO.classList.add("turn--active");
    // turnX.classList.remove("turn--active");
    this.turnActive(turnO);

    this.initialize();
  }

  //  when user click a cell turnClick willbe called  //

  turnClick(square) {
    if (this.currPlayer === "bot") {
      this.turn(square.target.id, huPlayer);

      if (!this.checkTie()) {
        setTimeout(() => {
          if (this.flag) {
            const temp = [0, 2, 4, 6, 8].filter(
              (el) => el !== +square.target.id
            );

            const randInd = Math.floor(Math.random() * temp.length);
            this.turn(String(temp[randInd]), aiPlayer);
            this.flag = false;
          } else this.turn(String(this.bestSpot()), aiPlayer);
        }, 1000);
      }
    } else {
      this.turn(square.target.id, this.currTurn);
      this.currTurn = this.currTurn === "O" ? "X" : "O";
    }
  }

  // store the current state of the cell and check for wiining and tieing

  turn(squareId, player) {
    this.originBoard[squareId] = player;

    document.getElementById(squareId).textContent = player;

    cells[squareId].removeEventListener("click", this.bindTurnClick);

    let gameWon = this.checkWin(this.originBoard, player);

    if (this.checkTie()) this.declareWiner("Tie");

    if (gameWon) this.gameOver(gameWon);

    if (player === huPlayer) {
      this.turnActive(turnX);
    }
    if (player === aiPlayer) {
      this.turnActive(turnO);
    }
  }

  //  check for wining  //
  //  if win then return an object else null  //

  checkWin(board, player) {
    let gameWon = null;

    for (let i = 0; i < winCombos.length; i++) {
      if (winCombos[i].every((index) => board[index] === player)) {
        gameWon = { index: i, winner: player };
        break;
      }
    }

    return gameWon;
  }

  //  check for tie ; return type boolean  //

  checkTie() {
    for (let i = 0; i < 9; i++) {
      if (typeof this.originBoard[i] === "number") return false;
    }
    return true;
  }

  //  when a player win gameOver funtion willbe called  //

  gameOver(gameWon) {
    winCombos[gameWon.index].forEach((el) => {
      cells[el].style.backgroundColor = "#40a578";
    });

    this.declareWiner(gameWon.winner);
  }

  //  when a game is finished declareWiner will be called  //

  declareWiner(who) {
    for (let i = 0; i < cells.length; i++) {
      cells[i].removeEventListener("click", this.bindTurnClick);
    }
    endGame.classList.remove("hidden");
    if (who === "Tie") {
      endGame.textContent = "Tie";
      return;
    }
    if (this.currPlayer === "bot")
      endGame.textContent = who === huPlayer ? "You Win" : "You Lose";
    else
      endGame.textContent =
        who === huPlayer
          ? `${turnText.textContent} Win`
          : `${turnText.textContent} Lose`;
  }

  //  to make a list with empty places from the current board  //

  emptyPlace(board) {
    return board.filter((s) => typeof s === "number");
  }

  //  select a best index for bot  //

  bestSpot() {
    return this.minimax(this.originBoard, aiPlayer).index;
  }

  //  to get the best index for bot calculate all the situation and return a move  //

  minimax(newBoard, player) {
    let availableSpot = this.emptyPlace(newBoard);

    //  base cases  //

    if (this.checkWin(newBoard, huPlayer)) {
      return { score: -10 };
    } else if (this.checkWin(newBoard, aiPlayer)) {
      return { score: 20 };
    } else if (availableSpot.length === 0) return { score: 0 };

    //  to store all the possible moves  //

    let moves = [];

    for (let i = 0; i < availableSpot.length; i++) {
      let move = {};
      move.index = availableSpot[i];
      newBoard[availableSpot[i]] = player;

      if (player === aiPlayer) {
        let result = this.minimax(newBoard, huPlayer);
        move.score = result.score;
      } else {
        let result = this.minimax(newBoard, aiPlayer);
        move.score = result.score;
      }

      newBoard[availableSpot[i]] = move.index;
      moves.push(move);
    }

    let bestMove;

    //  if current player is bot  //

    if (player === aiPlayer) {
      let bestScore = -Infinity;

      for (let i = 0; i < moves.length; i++) {
        if (bestScore < moves[i].score) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      //  if current player is human  //
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
}

//  creat an object

const app = new App();
