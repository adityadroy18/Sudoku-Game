let currentGrid = [];
let solutionGrid = [];
let history = [];
let historyIndex = -1;
let timerInterval = null;
let elapsedTime = 0;

document.addEventListener('DOMContentLoaded', () => {
    const sudokuGrid = document.querySelector('.sudoku-grid');
    
    // Initialize the game
    function initializeGame(difficulty = 'easy') {
        const emptyGrid = Array(9).fill(0).map(() => Array(9).fill(0));
        solutionGrid = JSON.parse(JSON.stringify(emptyGrid));
        generateSudoku(solutionGrid);
        currentGrid = JSON.parse(JSON.stringify(solutionGrid));
        removeCells(currentGrid, difficulty);
        history = [JSON.parse(JSON.stringify(currentGrid))];
        historyIndex = 0;

        drawGrid(currentGrid);
        startTimer();
    }

    // Generate a valid Sudoku solution using backtracking
    function generateSudoku(grid) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        
        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
        
        function solve(grid) {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (grid[row][col] === 0) {
                        shuffle(numbers);
                        for (const num of numbers) {
                            if (isValidMove(grid, row, col, num)) {
                                grid[row][col] = num;

                                if (solve(grid)) return true;

                                grid[row][col] = 0; // Backtrack
                            }
                        }
                        return false; // No valid number found
                    }
                }
            }
            return true; // Solved
        }

        solve(grid);
        return grid;
    }

    // Remove cells to create a puzzle
    function removeCells(grid, difficulty) {
        let cellsToRemove =
            difficulty === 'easy' ? 30 : difficulty === 'medium' ? 40 : 50;

        while (cellsToRemove > 0) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);

            if (grid[row][col] !== 0) {
                grid[row][col] = 0;
                cellsToRemove--;
            }
        }
    }

    // Validate a move
    function isValidMove(grid, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (grid[row][i] === num || grid[i][col] === num) return false;

            const boxRowStart = Math.floor(row / 3) * 3 + Math.floor(i / 3);
            const boxColStart = Math.floor(col / 3) * 3 + (i % 3);

            if (grid[boxRowStart][boxColStart] === num) return false;
        }
        return true;
    }

    // Draw the Sudoku grid
    function drawGrid(grid) {
        sudokuGrid.innerHTML = '';
        
        grid.forEach((row, rowIndex) => {
            row.forEach((cellValue, colIndex) => {
                const cellElement = document.createElement('div');
                cellElement.classList.add('cell');

                if (cellValue !== 0) {
                    cellElement.textContent = cellValue;
                } else {
                    const inputElement = document.createElement('input');
                    inputElement.type = 'text';
                    inputElement.maxLength = '1';

                    inputElement.addEventListener('input', () => {
                        const value = parseInt(inputElement.value);

                        if (!value || value < 1 || value > 9 || !isValidMove(currentGrid, rowIndex, colIndex, value)) {
                            inputElement.classList.add('invalid');
                        } else {
                            inputElement.classList.remove('invalid');
                            currentGrid[rowIndex][colIndex] = value;

                            saveHistory();
                        }
                    });

                    cellElement.appendChild(inputElement);
                }

                sudokuGrid.appendChild(cellElement);
            });
        });
    }

    // Save the current state to history
    function saveHistory() {
        history.splice(historyIndex + 1);
        history.push(JSON.parse(JSON.stringify(currentGrid)));
        historyIndex++;
    }

    // Undo and Redo functionality
    document.getElementById('undo').addEventListener('click', () => {
        if (historyIndex > 0) {
            historyIndex--;
            currentGrid = JSON.parse(JSON.stringify(history[historyIndex]));
            drawGrid(currentGrid);
        }
    });

    document.getElementById('redo').addEventListener('click', () => {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            currentGrid = JSON.parse(JSON.stringify(history[historyIndex]));
            drawGrid(currentGrid);
        }
    });

    // New Game functionality
    document.getElementById('newGame').addEventListener('click', () => {
        stopTimer();
        elapsedTime = 0;
        document.getElementById('timer').textContent = 'Time: 00:00';
        initializeGame(document.getElementById('difficulty').value);
    });

    // Reset Game functionality
    document.getElementById('resetGame').addEventListener('click', () => {
        stopTimer();
        elapsedTime = 0;
        document.getElementById('timer').textContent = 'Time: 00:00';
        drawGrid(history[0]);
    });

    // Timer functionality
    function startTimer() {
        timerInterval = setInterval(() => {
            elapsedTime++;
            const minutes = Math.floor(elapsedTime / 60);
            const seconds = elapsedTime % 60;
            document.getElementById('timer').textContent = `Time: ${padZero(minutes)}:${padZero(seconds)}`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function padZero(num) {
        return num.toString().padStart(2, '0');
    }

    initializeGame('easy');
});

