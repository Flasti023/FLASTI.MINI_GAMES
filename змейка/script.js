const canvas = document.getElementById('snake-canvas');
const ctx = canvas.getContext('2d');

// Игровые переменные
let gridSize = 20; // Размер одной клетки (в пикселях)
let snake = [{x: 10, y: 10}];
let food = {x: 5, y: 5};
let dx = 1; // Направление по оси X (1 - вправо, -1 - влево, 0 - не двигаемся)
let dy = 0; // Направление по оси Y (1 - вниз, -1 - вверх, 0 - не двигаемся)
let score = 0;
let gameOver = false;
let gameInterval;
let canvasWidth, canvasHeight;

// DOM элементы
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');
const upButton = document.getElementById('up-button');
const downButton = document.getElementById('down-button');
const leftButton = document.getElementById('left-button');
const rightButton = document.getElementById('right-button');

// Функция для генерации случайных координат еды
function getRandomFoodPosition() {
    let foodX, foodY;
    do {
        foodX = Math.floor(Math.random() * (canvasWidth / gridSize));
        foodY = Math.floor(Math.random() * (canvasHeight / gridSize));
    } while (snake.some(segment => segment.x === foodX && segment.y === foodY)); // Проверка, чтобы еда не появлялась на змейке
    return {x: foodX, y: foodY};
}

// Функция для обновления игры
function update() {
    if (gameOver) {
        return; // Ничего не делаем, если игра окончена
    }

    // Обновление позиции головы змейки
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // Проверка столкновения с границами
    if (head.x < 0 || head.x >= canvasWidth / gridSize || head.y < 0 || head.y >= canvasHeight / gridSize) {
        endGame();
        return;
    }

    // Проверка столкновения с самим собой
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }

    // Добавление новой головы
    snake.unshift(head);

    // Если змейка съела еду
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.innerText = score;
        food = getRandomFoodPosition();
    } else {
        // Удаление хвоста (если не съели еду)
        snake.pop();
    }

    draw();
}

// Функция для отрисовки игры
function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Очистка экрана

    // Рисуем змейку
    snake.forEach(segment => {
        ctx.fillStyle = 'green';
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        ctx.strokeStyle = 'darkgreen';
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });

    // Рисуем еду
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

    // Отрисовка сетки (опционально)
    // for (let i = 0; i < canvasWidth / gridSize; i++) {
    //     ctx.strokeStyle = '#ccc';
    //     ctx.beginPath();
    //     ctx.moveTo(i * gridSize, 0);
    //     ctx.lineTo(i * gridSize, canvasHeight);
    //     ctx.stroke();
    // }
    // for (let j = 0; j < canvasHeight / gridSize; j++) {
    //     ctx.strokeStyle = '#ccc';
    //     ctx.beginPath();
    //     ctx.moveTo(0, j * gridSize);
    //     ctx.lineTo(canvasWidth, j * gridSize);
    //     ctx.stroke();
    // }
}

// Функция для управления направлением змейки
function changeDirection(direction) {
    switch (direction) {
        case 'up':
            if (dy !== 1) { // Предотвращаем движение назад
                dx = 0;
                dy = -1;
            }
            break;
        case 'down':
            if (dy !== -1) {
                dx = 0;
                dy = 1;
            }
            break;
        case 'left':
            if (dx !== 1) {
                dx = -1;
                dy = 0;
            }
            break;
        case 'right':
            if (dx !== -1) {
                dx = 1;
                dy = 0;
            }
            break;
    }
}


// Функция запуска игры
function startGame() {
    // Устанавливаем размеры канваса
    canvasWidth = canvas.width = canvas.offsetWidth;
    canvasHeight = canvas.height = canvas.offsetHeight;
    // Инициализация переменных
    gridSize = Math.min(canvasWidth, canvasHeight) / 20; // Адаптируем размер клетки
    snake = [{x: 10, y: 10}];
    food = getRandomFoodPosition();
    dx = 1;
    dy = 0;
    score = 0;
    scoreDisplay.innerText = score;
    gameOver = false;
    gameOverScreen.style.display = 'none'; // Скрываем экран "Game Over"
    // Запускаем игровой цикл
    clearInterval(gameInterval);
    gameInterval = setInterval(update, 100);  // Уменьшаем интервал, чтобы игра была быстрее
}


// Функция окончания игры
function endGame() {
    gameOver = true;
    clearInterval(gameInterval);
    finalScoreDisplay.innerText = score;
    gameOverScreen.style.display = 'flex'; // Показываем экран "Game Over"
}

// Обработчики событий для мобильных устройств
upButton.addEventListener('click', () => changeDirection('up'));
downButton.addEventListener('click', () => changeDirection('down'));
leftButton.addEventListener('click', () => changeDirection('left'));
rightButton.addEventListener('click', () => changeDirection('right'));

// Обработчик для кнопки перезапуска
restartButton.addEventListener('click', startGame);

// Инициализация игры при загрузке страницы и изменении размеров окна
window.onload = startGame;
window.addEventListener('resize', startGame);