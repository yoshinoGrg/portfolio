const boardElement = document.getElementById("board");
const statusText = document.getElementById("status");
const difficultySelect = document.getElementById("difficulty");

let board = ["", "", "", "", "", "", "", "", ""];
let gameOver = false;

function createBoard() {
    boardElement.innerHTML = "";
    board.forEach((cell, index) => {
        const div = document.createElement("div");
        div.classList.add("cell");
        div.innerText = cell;
        div.addEventListener("click", () => playerMove(index));
        boardElement.appendChild(div);
    });
}

function checkWinner(b, player) {
    const wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    return wins.some(w => w.every(i => b[i] === player));
}

function isDraw(b) {
    return b.every(c => c !== "");
}

function minimax(b, depth, isAI) {
    if (checkWinner(b, "O")) return 10 - depth;
    if (checkWinner(b, "X")) return depth - 10;
    if (isDraw(b)) return 0;

    if (isAI) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (b[i] === "") {
                b[i] = "O";
                let score = minimax(b, depth + 1, false);
                b[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (b[i] === "") {
                b[i] = "X";
                let score = minimax(b, depth + 1, true);
                b[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function aiMove() {
    let emptyCells = board
        .map((v, i) => v === "" ? i : null)
        .filter(v => v !== null);

    if (emptyCells.length === 0) return;

    if (difficultySelect.value === "easy") {
        let r = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[r] = "O";
    } 
    else {
        let bestScore = -Infinity;
        let move;

        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = "O";
                let score = minimax(board, 0, false);
                board[i] = "";
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        board[move] = "O";
    }
}

function playerMove(index) {
    if (board[index] !== "" || gameOver) return;

    board[index] = "X";

    if (checkWinner(board, "X")) {

    statusText.innerText =
    "You Won!";

    gameOver = true;

    createBoard();

    const difficulty =
    document.getElementById("difficulty").value;

    const victoryMessage =
    document.getElementById("victory-message");

    if(difficulty === "hard"){

        victoryMessage.style.display =
        "block";

    }

    return;
}

    if (isDraw(board)) {
        statusText.innerText = "SAD!!";
        gameOver = true;
        createBoard();
        return;
    }

    aiMove();

    if (checkWinner(board, "O")) {
        statusText.innerText = "Noob!!";
        gameOver = true;
    } else if (isDraw(board)) {
        statusText.innerText = "Damn..";
        gameOver = true;
    }

    createBoard();
}

function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    gameOver = false;
    statusText.innerText = "";
    createBoard();
    document.getElementById(
    "victory-message"
).style.display = "none";
}


createBoard();