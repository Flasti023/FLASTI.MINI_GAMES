const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-button');
const leftButton = document.getElementById('left-button');
const rightButton = document.getElementById('right-button');
const downButton = document.getElementById('down-button');
const rotateButton = document.getElementById('rotate-button');

let arenaWidth = 12;
let arenaHeight = 20;

const colors = [
  null,
  '#FF0D72',
  '#0DC2FF',
  '#0DFF72',
  '#F538FF',
  '#FF8E0D',
  '#FFE138',
  '#3877FF',
];

let arena = createMatrix(arenaWidth, arenaHeight);

let player = {
    pos: {x: 5, y: 0},
    matrix: createPiece('T'), // Начнем с Т-образной фигуры
    score: 0,
};

let dropCounter = 0;
let dropInterval = 1000;  // Падение раз в секунду
let isGameRunning = false;
let scale = 20;  // Изначальный масштаб

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}


function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}


function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}


function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}


function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}


function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}


function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function updateScore() {
    scoreElement.innerText = player.score;
}


function createPiece(type)
{
    if (type === 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === 'J') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}

function update(time = 0) {
    if (!isGameRunning) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update); // Оптимизированный цикл анимации
}


let lastTime = 0;

function adjustCanvasSize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Рассчитываем оптимальные размеры канваса, сохраняя пропорции 9:16
    let canvasWidth = windowWidth * 0.9; // Занимает 90% ширины экрана
    let canvasHeight = canvasWidth * (16 / 9);

    // Если вычисленная высота больше, чем доступная высота экрана,
    // то ограничиваем высоту и пересчитываем ширину
    if (canvasHeight > windowHeight * 0.6) { //Занимает 60% высоты экрана
        canvasHeight = windowHeight * 0.6;
        canvasWidth = canvasHeight * (9 / 16);
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Пересчитываем масштаб, чтобы игра корректно отображалась
    scale = canvasWidth / arenaWidth;  // Определяем новый масштаб
    context.scale(scale, scale); // Устанавливаем масштаб

}

// Обработчики событий
startButton.addEventListener('click', () => {
    if (!isGameRunning) {
        startGame();
    } else {
        stopGame(); // Необязательно, можно добавить функцию остановки
    }
});

leftButton.addEventListener('click', () => {
    if (isGameRunning) {
        playerMove(-1);
    }
});

rightButton.addEventListener('click', () => {
    if (isGameRunning) {
        playerMove(1);
    }
});

downButton.addEventListener('click', () => {
    if (isGameRunning) {
        playerDrop();
    }
});

rotateButton.addEventListener('click', () => {
    if (isGameRunning) {
        playerRotate(1);
    }
});

// Добавьте обработчики касаний (touch events) по необходимости
// canvas.addEventListener('touchstart', (event) => {
//     // Обработка касаний для управления (например, свайпы)
// });


function startGame() {
    isGameRunning = true;
    arena.forEach(row => row.fill(0));  // Очистить поле
    playerReset();
    updateScore();
    lastTime = 0;  // Сброс времени для нормального начала падения
    update();
    startButton.innerText = 'Игра идет'; // Или 'Пауза', если добавите функцию паузы
}

function stopGame() {
    isGameRunning = false;
    startButton.innerText = 'Старт';
}

// Вызываем adjustCanvasSize при загрузке страницы и при изменении размеров окна
window.addEventListener('load', adjustCanvasSize);
window.addEventListener('resize', adjustCanvasSize);