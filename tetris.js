const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const wordElement = document.getElementById('word');
const pacman = new Pacman();

context.scale(32, 32);
nextContext.scale(32, 32);

const pieces = [
    [[1,1,1,1]], // I
    [[1,1],[1,1]], // O
    [[0,1,0],[1,1,1]], // T
    [[0,0,1],[1,1,1]], // L
    [[1,0,0],[1,1,1]], // J
    [[0,1,1],[1,1,0]], // S
    [[1,1,0],[0,1,1]]  // Z
];

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let score = 0;
let level = 1;

const arena = createMatrix(10, 20);
let player = createPiece();
let nextPiece = createPiece();

// Добавляем блокировку игры
let gameStarted = false;

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece() {
    const pieceIndex = Math.floor(Math.random() * pieces.length);
    const piece = {
        pos: {x: 0, y: 0},
        matrix: pieces[pieceIndex].map(row => row.slice()),
        letters: pieces[pieceIndex].map(row => 
            row.map(value => value ? getRandomLetter() : 0)
        )
    };
    piece.pos.x = Math.floor((10 - piece.matrix[0].length) / 2);
    return piece;
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

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = player.letters[y][x];
            }
        });
    });
}

function rotate(matrix, letters) {
    // Создаем временные копии матриц с правильными размерами
    const N = matrix.length;
    const M = matrix[0].length; // Учитываем, что матрица может быть не квадратной
    const rotatedMatrix = Array(M).fill().map(() => Array(N).fill(0));
    const rotatedLetters = Array(M).fill().map(() => Array(N).fill(0));
    
    // Поворачиваем матрицы на 90 градусов по часовой стрелке
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < M; j++) {
            rotatedMatrix[j][N-1-i] = matrix[i][j];
            rotatedLetters[j][N-1-i] = letters[i][j];
        }
    }
    
    // Возвращаем повернутые матрицы вместо изменения оригинальных
    return {
        matrix: rotatedMatrix,
        letters: rotatedLetters
    };
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
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
    player = nextPiece;
    nextPiece = createPiece();
    player.pos.y = 0;
    player.pos.x = Math.floor((arena[0].length - player.matrix[0].length) / 2);
    
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        score = 0;
        level = 1;
        dropInterval = 1000;
        updateScore();
    }
}

function playerRotate() {
    const pos = player.pos.x;
    let offset = 1;
    
    // Создаем копии матриц
    const matrixCopy = player.matrix.map(row => [...row]);
    const lettersCopy = player.letters.map(row => [...row]);
    
    // Получаем повернутые матрицы
    const rotated = rotate(matrixCopy, lettersCopy);
    
    // Проверяем, возможен ли поворот
    const tempPlayer = {
        pos: { x: player.pos.x, y: player.pos.y },
        matrix: rotated.matrix
    };
    
    let canRotate = true;
    while (collide(arena, tempPlayer)) {
        tempPlayer.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (Math.abs(offset) > rotated.matrix[0].length) {
            canRotate = false;
            break;
        }
    }
    
    // Если поворот возможен, применяем его
    if (canRotate) {
        player.matrix = rotated.matrix;
        player.letters = rotated.letters;
        player.pos.x = tempPlayer.pos.x;
    }
}

function updateScore() {
    console.log('Обновляем счет:', score); // Для отладки
    scoreElement.textContent = score.toString();
    levelElement.textContent = level.toString();
}

function draw() {
    // Очищаем поле
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем сетку точек
    context.fillStyle = '#1919A6';
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
            if (arena[y][x] === 0) {
                context.beginPath();
                context.arc(x + 0.5, y + 0.5, 0.05, 0, Math.PI * 2);
                context.fill();
            }
        }
    }
    
    // Рисуем арену
    arena.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                // Рисуем фон клетки
                context.fillStyle = '#000099';
                context.fillRect(x, y, 1, 1);
                
                // Рисуем букву
                context.fillStyle = '#FFFF00';
                context.font = '0.8px "Press Start 2P"';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(value, x + 0.5, y + 0.5);
            }
        });
    });
    
    // Рисуем текущую фигуру
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                // Рисуем фон клетки
                context.fillStyle = '#000099';
                context.fillRect(x + player.pos.x, y + player.pos.y, 1, 1);
                
                // Рисуем букву
                context.fillStyle = '#FFFF00';
                context.font = '0.8px "Press Start 2P"';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(
                    player.letters[y][x],
                    x + player.pos.x + 0.5,
                    y + player.pos.y + 0.5
                );
            }
        });
    });
    
    // Рисуем следующую фигуру
    nextContext.fillStyle = '#000';
    nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    nextPiece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                // Рисуем фон клетки
                nextContext.fillStyle = '#000099';
                nextContext.fillRect(x + 1, y + 1, 1, 1);
                
                // Рисуем букву
                nextContext.fillStyle = '#FFFF00';
                nextContext.font = '0.8px "Press Start 2P"';
                nextContext.textAlign = 'center';
                nextContext.textBaseline = 'middle';
                nextContext.fillText(
                    nextPiece.letters[y][x],
                    x + 1.5,
                    y + 1.5
                );
            }
        });
    });
    
    // Рисуем пакмана
    pacman.draw(context);
}

function update(time = 0) {
    if (!gameStarted) {
        requestAnimationFrame(update);
        return;
    }

    const deltaTime = time - lastTime;
    lastTime = time;
    
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    
    draw();
    requestAnimationFrame(update);
}

function startGame() {
    gameStarted = true;
    update();
}

document.addEventListener('keydown', event => {
    if (!gameStarted) {
        console.log('Дождитесь загрузки словаря...');
        return;
    }

    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 38) {
        playerRotate();
    }
    
    // Управление пакманом
    switch (event.key.toLowerCase()) {
        case 'w':
            pacman.move(0, -1, arena);
            break;
        case 's':
            pacman.move(0, 1, arena);
            break;
        case 'a':
            pacman.move(-1, 0, arena);
            break;
        case 'd':
            pacman.move(1, 0, arena);
            break;
        case ' ':
            const letter = pacman.selectLetter(arena);
            if (letter) {
                wordElement.textContent = pacman.selectedLetters.join('');
            }
            break;
        case 'enter':
            const result = pacman.checkWord(arena);
            if (result.valid) {
                alert('Вы нашли слово!');
                score += result.score;
                updateScore();
                dropLetters();
                draw();
            } else {
                alert('Такого слова не существует');
            }
            wordElement.textContent = '';
            break;
    }
});

function dropLetters() {
    // Проходим по каждому столбцу
    for (let x = 0; x < arena[0].length; x++) {
        let writePos = arena.length - 1;
        // Собираем все буквы в столбце
        const letters = [];
        for (let y = arena.length - 1; y >= 0; y--) {
            if (arena[y][x] !== 0) {
                letters.push(arena[y][x]);
                arena[y][x] = 0; // Очищаем старую позицию
            }
        }
        // Расставляем буквы снизу вверх
        for (const letter of letters) {
            arena[writePos][x] = letter;
            writePos--;
        }
    }
    console.log('Буквы сдвинуты вниз');
}

// Запускаем первый кадр анимации, но игра не начнется, пока не загрузится словарь
requestAnimationFrame(update); 