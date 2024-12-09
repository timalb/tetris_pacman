class Pacman {
    constructor() {
        this.pos = { x: 0, y: 0 };
        this.selectedLetters = [];
        this.selectedPositions = [];
        this.mouthAngle = 0.2;
        this.mouthDirection = 0.02;
    }

    move(dx, dy, arena) {
        const newX = this.pos.x + dx;
        const newY = this.pos.y + dy;
        
        if (newX >= 0 && newX < 10 && newY >= 0 && newY < 20) {
            this.pos.x = newX;
            this.pos.y = newY;
        }
    }

    selectLetter(arena) {
        const letter = arena[this.pos.y][this.pos.x];
        if (letter !== 0) {
            const alreadySelected = this.selectedPositions.some(
                pos => pos.x === this.pos.x && pos.y === this.pos.y
            );
            if (!alreadySelected) {
                const normalizedLetter = letter.toLowerCase().replace(/[^а-яё]/g, '');
                if (normalizedLetter) {
                    this.selectedLetters.push(normalizedLetter);
                    this.selectedPositions.push({x: this.pos.x, y: this.pos.y});
                    console.log('Выбрана буква:', normalizedLetter);
                    return letter;
                }
            }
        }
        return null;
    }

    checkWord(arena) {
        if (this.selectedLetters.length === 0) {
            return { valid: false, score: 0 };
        }

        const word = this.selectedLetters.join('');
        console.log('Составленное слово:', word);
        
        if (RUSSIAN_NOUNS.length === 0) {
            console.warn('Словарь еще не загружен');
            this.clearSelection();
            return { valid: false, score: 0 };
        }
        
        if (isValidWord(word)) {
            console.log('Слово найдено в словаре:', word);
            
            // Удаляем буквы с поля
            for (const pos of this.selectedPositions) {
                arena[pos.y][pos.x] = 0;
            }
            
            const wordScore = word.length * 100;
            console.log('Начислено очков:', wordScore);
            
            // Очищаем выбранные буквы
            this.clearSelection();
            
            return { valid: true, score: wordScore };
        }
        
        console.log('Слово не найдено в словаре:', word);
        this.clearSelection();
        return { valid: false, score: 0 };
    }

    clearSelection() {
        this.selectedLetters = [];
        this.selectedPositions = [];
    }

    draw(context) {
        // Анимация рта
        this.mouthAngle += this.mouthDirection;
        if (this.mouthAngle > 0.3 || this.mouthAngle < 0.1) {
            this.mouthDirection = -this.mouthDirection;
        }

        // Рисуем Пакмана
        context.fillStyle = '#ffff00';
        context.beginPath();
        context.arc(
            this.pos.x + 0.5,
            this.pos.y + 0.5,
            0.4,
            this.mouthAngle * Math.PI,
            (2 - this.mouthAngle) * Math.PI
        );
        context.lineTo(this.pos.x + 0.5, this.pos.y + 0.5);
        context.fill();

        // Рисуем глаз
        context.fillStyle = '#000';
        context.beginPath();
        context.arc(
            this.pos.x + 0.5,
            this.pos.y + 0.3,
            0.08,
            0,
            Math.PI * 2
        );
        context.fill();

        // Подсвечиваем выбранные позиции
        this.selectedPositions.forEach(pos => {
            context.strokeStyle = '#ffff00';
            context.lineWidth = 0.1;
            context.strokeRect(pos.x + 0.1, pos.y + 0.1, 0.8, 0.8);
        });
    }
} 