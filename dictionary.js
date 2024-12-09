let RUSSIAN_NOUNS = [];
let dictionaryLoaded = false;

// Создаем контейнер для загрузки
const loadingContainer = document.createElement('div');
loadingContainer.style.position = 'fixed';
loadingContainer.style.top = '50%';
loadingContainer.style.left = '50%';
loadingContainer.style.transform = 'translate(-50%, -50%)';
loadingContainer.style.background = 'rgba(0,0,0,0.9)';
loadingContainer.style.color = 'white';
loadingContainer.style.padding = '20px';
loadingContainer.style.borderRadius = '10px';
loadingContainer.style.textAlign = 'center';
loadingContainer.style.zIndex = '1000';
loadingContainer.style.minWidth = '300px';
loadingContainer.style.fontFamily = '"Press Start 2P", Arial, sans-serif';

// Создаем заголовок
const header = document.createElement('h2');
header.textContent = 'Загрузка словаря';
header.style.marginBottom = '20px';
loadingContainer.appendChild(header);

// Создаем текст инструкции
const instruction = document.createElement('p');
instruction.textContent = 'Выберите файл словаря (words.txt)';
instruction.style.marginBottom = '20px';
loadingContainer.appendChild(instruction);

// Создаем кнопку выбора файла
const fileButton = document.createElement('button');
fileButton.textContent = 'Выбрать файл словаря';
fileButton.style.padding = '10px 20px';
fileButton.style.fontSize = '16px';
fileButton.style.cursor = 'pointer';
loadingContainer.appendChild(fileButton);

// Создаем статус загрузки
const status = document.createElement('p');
status.style.marginTop = '20px';
loadingContainer.appendChild(status);

document.body.appendChild(loadingContainer);

// Создаем скрытый input для файла
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.style.display = 'none';
fileInput.accept = '.txt';
document.body.appendChild(fileInput);

// Функция для очистки и нормализации слова
function normalizeWord(word) {
    return word
        .toLowerCase()
        .trim()
        .replace(/[^а-яё]/g, '');
}

// Обработчик выбора файла
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) {
        status.textContent = 'Файл не выбран';
        return;
    }

    status.textContent = 'Загрузка словаря...';
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            
            // Разбиваем содержимое на слова и нормализуем их
            RUSSIAN_NOUNS = content
                .split('\n')
                .map(word => normalizeWord(word))
                .filter(word => word.length > 0);

            if (RUSSIAN_NOUNS.length === 0) {
                throw new Error('Словарь пуст');
            }

            // Отладочная информация
            console.log('Словарь загружен, количество слов:', RUSSIAN_NOUNS.length);
            console.log('Первые 10 слов:', RUSSIAN_NOUNS.slice(0, 10));

            dictionaryLoaded = true;
            status.textContent = `Словарь успешно загружен (${RUSSIAN_NOUNS.length} слов)`;
            status.style.color = '#4CAF50';
            
            setTimeout(() => {
                loadingContainer.style.display = 'none';
                startGame();
            }, 2000);

        } catch (error) {
            console.error('Ошибка при обработке файла:', error);
            status.textContent = 'Ошибка при обработке файла: ' + error.message;
            status.style.color = '#f44336';
        }
    };
    
    reader.onerror = function(error) {
        console.error('Ошибка чтения файла:', error);
        status.textContent = 'Ошибка чтения файла';
        status.style.color = '#f44336';
    };
    
    reader.readAsText(file, 'UTF-8');
});

// Привязываем кнопку к input file
fileButton.addEventListener('click', () => fileInput.click());

// Функция проверки слова
function isValidWord(word) {
    if (!dictionaryLoaded) {
        console.warn('Словарь еще не загружен');
        loadingContainer.style.display = 'block';
        status.textContent = 'Необходимо загрузить словарь';
        return false;
    }

    const normalizedWord = normalizeWord(word);
    console.log('Проверяем слово:', normalizedWord);
    
    const result = RUSSIAN_NOUNS.includes(normalizedWord);
    console.log('Результат проверки:', result);
    
    if (!result) {
        // Выводим отладочную информацию
        console.log('Слово не найдено в словаре');
        console.log('Текущее слово:', normalizedWord);
        console.log('Похожие слова:', RUSSIAN_NOUNS.filter(w => 
            w.length === normalizedWord.length && 
            w.slice(0, 2) === normalizedWord.slice(0, 2)
        ).slice(0, 5));
    }
    
    return result;
}