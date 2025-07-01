document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('game-board');
    const rollDiceBtn = document.getElementById('roll-dice-btn');
    const playerTurnDisplay = document.getElementById('player-turn');
    const diceResultDisplay = document.getElementById('dice-result');
    const winnerMessage = document.getElementById('winner-message');

    const boardSize = 100;
    const players = [
        { id: 1, position: 1, element: createPlayerElement(1) },
        { id: 2, position: 1, element: createPlayerElement(2) }
    ];
    let currentPlayerIndex = 0;
    
    // Key: start_cell, Value: end_cell
    const snakesAndLadders = {
        // Ladders
        4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91,
        // Snakes
        17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 99: 78
    };

    function createBoard() {
        const cells = [];
        for (let i = boardSize; i >= 1; i--) {
            cells.push(i);
        }

        // Reverse rows to get the correct snake and ladder layout
        const finalCells = [];
        for(let i = 0; i < 10; i++){
            const row = cells.slice(i * 10, (i + 1) * 10);
            if(i % 2 !== 0){
                row.reverse();
            }
            finalCells.push(...row);
        }

        finalCells.forEach(num => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.cell = num;
            
            const cellNumber = document.createElement('span');
            cellNumber.textContent = num;
            cell.appendChild(cellNumber);

            if (snakesAndLadders[num]) {
                cell.classList.add(snakesAndLadders[num] > num ? 'ladder-start' : 'snake-head');
            }
            board.appendChild(cell);
        });

        players.forEach(player => board.appendChild(player.element));
        updatePlayerPositions();
    }

    function createPlayerElement(playerId) {
        const playerElement = document.createElement('div');
        playerElement.classList.add('player');
        playerElement.id = `player${playerId}`;
        return playerElement;
    }

    function updatePlayerPositions() {
        players.forEach(player => {
            const cell = document.querySelector(`.cell[data-cell='${player.position}']`);
            if (cell) {
                cell.appendChild(player.element);
            }
        });
    }

    function rollDice() {
        return Math.floor(Math.random() * 6) + 1;
    }

    function switchPlayer() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        playerTurnDisplay.textContent = `Giliran: Pemain ${players[currentPlayerIndex].id}`;
    }

    function movePlayer(player, steps) {
        let newPosition = player.position + steps;

        if (newPosition > boardSize) {
            newPosition = player.position; // Stay in place if roll exceeds board
        } else {
            player.position = newPosition;
        }
        
        diceResultDisplay.textContent = `Pemain ${player.id} maju ${steps} langkah ke petak ${player.position}`;
        updatePlayerPositions();

        setTimeout(() => {
            // Check for snakes or ladders
            if (snakesAndLadders[player.position]) {
                const endPosition = snakesAndLadders[player.position];
                const type = endPosition > player.position ? 'tangga' : 'ular';
                alert(`Pemain ${player.id} menemukan ${type}! Pindah ke petak ${endPosition}.`);
                player.position = endPosition;
                updatePlayerPositions();
            }

            // Check for winner
            if (player.position === boardSize) {
                showWinner(player);
                return;
            }

            // Switch to next player
            switchPlayer();
            rollDiceBtn.disabled = false;
        }, 800);
    }

    function showWinner(player) {
        winnerMessage.querySelector('p').textContent = `Pemain ${player.id} Menang! 🎉`;
        winnerMessage.classList.remove('hidden');
        rollDiceBtn.style.display = 'none';
        playerTurnDisplay.style.display = 'none';
        diceResultDisplay.style.display = 'none';
    }

    rollDiceBtn.addEventListener('click', () => {
        rollDiceBtn.disabled = true;
        const steps = rollDice();
        const currentPlayer = players[currentPlayerIndex];
        movePlayer(currentPlayer, steps);
    });

    createBoard();
});