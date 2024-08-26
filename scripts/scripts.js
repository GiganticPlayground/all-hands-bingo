let gameComplete = false;
let winningCells = [];

// Function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

function generateNewCard() {
    let selectedCard;
    const currentCard = JSON.parse(localStorage.getItem('bingoCard'));

    // Select a card different from the current one
    do {
        const randomIndex = Math.floor(Math.random() * cards.length);
        selectedCard = cards[randomIndex];
    } while (JSON.stringify(selectedCard) === JSON.stringify(currentCard));

    // Flatten and shuffle the entire card to randomize positions within the card
    selectedCard = shuffleArray(selectedCard.flat());

    // Reconstruct the shuffled card to maintain 5x5 shape
    let shuffledCard = [];
    for (let i = 0; i < 25; i += 5) {
        shuffledCard.push(selectedCard.slice(i, i + 5));
    }

    // Clear the board
    const bingoCardContainer = document.getElementById('bingoCard');
    bingoCardContainer.innerHTML = '';

    gameComplete = false;
    winningCells = [];
    localStorage.setItem('checkedCells', JSON.stringify([])); // Clear checkedCells in local storage
    populateCard(shuffledCard);
    localStorage.setItem('bingoCard', JSON.stringify(shuffledCard));
}

function populateCard(card) {
    const bingoCardContainer = document.getElementById('bingoCard');
    card.flat().forEach((word, index) => {
        const cell = document.createElement('div');
        cell.className = 'bingo-cell';
        const cellContent = document.createElement('div');
        cellContent.innerText = word;
        cell.appendChild(cellContent);
        cell.dataset.index = index;
        cell.onclick = toggleCheck;
        bingoCardContainer.appendChild(cell);
    });
    loadCheckedStatus();
}

function toggleCheck(event) {
    const cell = event.currentTarget;
    const index = parseInt(cell.dataset.index);
    let checkedCells = JSON.parse(localStorage.getItem('checkedCells')) || [];

    if (cell.classList.contains('selected')) {
        if (gameComplete) {
            if (!winningCells.includes(index)) return; // Allow unchecking only if part of win line
        }
        cell.classList.remove('selected');
        winningCells = winningCells.filter(i => i !== index);
        checkedCells = checkedCells.filter(i => i !== index);
        localStorage.setItem('checkedCells', JSON.stringify(checkedCells));
    } else {
        if (gameComplete) {
            if (!winningCells.includes(index)) return; // Prevent checking new cells after win, except winning line cells
        }
        cell.classList.add('selected');
        checkedCells.push(index);
        localStorage.setItem('checkedCells', JSON.stringify(checkedCells));
    }

    if (checkForWin()) {
        gameComplete = true;
        markWinningCells();
    } else {
        gameComplete = false;
        // Remove all .win classes if there's no win condition anymore
        document.querySelectorAll('.bingo-cell').forEach(cell => cell.classList.remove('win'));
    }
}

function loadCheckedStatus() {
    const checkedCells = JSON.parse(localStorage.getItem('checkedCells')) || [];
    checkedCells.forEach(index => {
        const cell = document.querySelector(`.bingo-cell[data-index='${index}']`);
        if (cell) {
            cell.classList.add('selected');
        }
    });
    if (checkForWin()) {
        gameComplete = true;
        markWinningCells();
    }
}

function checkForWin() {
    const bingoCardContainer = document.querySelectorAll('.bingo-cell');
    const indexGrid = Array.from({ length: 5 }, () => []);

    bingoCardContainer.forEach((cell, index) => {
        const rowIndex = Math.floor(index / 5);
        indexGrid[rowIndex].push(cell.classList.contains('selected'));
    });

    // Check rows and columns for win
    for (let i = 0; i < 5; i++) {
        if (indexGrid[i].every(Boolean)) {
            winningCells = indexGrid[i].map((_, j) => i * 5 + j);
            return true;
        }
        if (indexGrid.map(row => row[i]).every(Boolean)) {
            winningCells = indexGrid.map((_, j) => j * 5 + i);
            return true;
        }
    }

    // Check diagonals for win
    if ([0, 1, 2, 3, 4].every(i => indexGrid[i][i])) {
        winningCells = [0, 6, 12, 18, 24];
        return true;
    }
    if ([0, 1, 2, 3, 4].every(i => indexGrid[i][4 - i])) {
        winningCells = [4, 8, 12, 16, 20];
        return true;
    }
    winningCells = []; // Reset if no win found
    return false;
}

function markWinningCells() {
    winningCells.forEach(index => {
        const cell = document.querySelector(`.bingo-cell[data-index='${index}']`);
        if (cell) {
            cell.classList.add('win');
        }
    });
}

window.onload = function() {
    const storedCard = JSON.parse(localStorage.getItem('bingoCard'));
    if (storedCard) {
        populateCard(storedCard);
    }
};