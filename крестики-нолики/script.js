const cells = document.querySelectorAll('.cell');
const message = document.getElementById('message');
const resetButton = document.getElementById('reset-button');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X'; // Игрок всегда X, компьютер всегда O
let gameActive = true;

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

function handleCellClick(event) {
    const cell = event.target;
    const cellIndex = parseInt(cell.dataset.index);

    if (board[cellIndex] !== '' || !gameActive) {
        return; // Клетка уже занята или игра завершена
    }

    board[cellIndex] = currentPlayer;
    cell.innerText = currentPlayer;

    checkWin();
    checkDraw();

    if (gameActive) {  // Если игра еще не завершена
        currentPlayer = 'O';  // Ход компьютера
        message.innerText = `Ход компьютера`;
        setTimeout(computerMove, 500); // Задержка перед ходом компьютера
    }
}


function computerMove() {
  if (!gameActive) return; // Если игра окончена, ничего не делаем

  let bestMove = findBestMove();
  if (bestMove !== null) {
    board[bestMove] = 'O';
    cells[bestMove].innerText = 'O';
    checkWin();
    checkDraw();
    currentPlayer = 'X';
    if (gameActive) {
        message.innerText = `Ход игрока: X`;
    }
  } else {
      //Если нет лучшего хода (все заполнено, но как-то не ничья, баг?),
      //заканчиваем игру. Это очень маловероятный случай, но лучше обработать.
      checkDraw();
  }
}


// Функция поиска лучшего хода (минимакс)
function findBestMove() {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = 'O';  // Try the move
            let score = minimax(board, 0, false); // Calculate the score
            board[i] = '';  // Undo the move

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}



//Минимакс функция (рекурсивная)
function minimax(board, depth, isMaximizing) {
    let scores = {
        'X': -1,
        'O': 1,
        'draw': 0
    };

    let result = checkWinnerForMinimax(board);
    if (result !== null) {
        return scores[result];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}


// Функция проверки победителя для минимакс алгоритма
function checkWinnerForMinimax(board) {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a]; // Возвращаем символ победителя ('X' или 'O')
        }
    }

    if (!board.includes('')) {
        return 'draw'; // Возвращаем 'draw', если ничья
    }

    return null; // Игра продолжается
}




function checkWin() {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            message.innerText = `Победил игрок: ${currentPlayer === 'X' ? 'X (Вы)' : 'O (Компьютер)'}!`;
            gameActive = false;
            return;
        }
    }
}

function checkDraw() {
    if (!board.includes('') && gameActive) {
        message.innerText = 'Ничья!';
        gameActive = false;
    }
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    message.innerText = `Ход игрока: ${currentPlayer}`;

    cells.forEach(cell => {
        cell.innerText = '';
    });
}

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

resetButton.addEventListener('click', resetGame);