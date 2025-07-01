document.addEventListener('DOMContentLoaded', () => {
    // =================================================
    // BAGIAN UNTUK INSTALASI PROGRESSIVE WEB APP (PWA)
    // =================================================
    let deferredPrompt;
    const installBtn = document.getElementById('install-btn');

    // Menampilkan log di console untuk debugging
    console.log('Script PWA dimuat. Menunggu event beforeinstallprompt...');

    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('Event beforeinstallprompt berhasil dijalankan!');
        // Mencegah browser menampilkan prompt default (misalnya di Chrome Mobile)
        e.preventDefault();
        // Simpan event untuk digunakan nanti
        deferredPrompt = e;
        // Tampilkan tombol install yang kita buat
        installBtn.classList.remove('hidden');
    });

    installBtn.addEventListener('click', () => {
        console.log('Tombol install diklik.');
        // Sembunyikan tombol setelah diklik
        installBtn.classList.add('hidden');
        // Tampilkan prompt instalasi
        deferredPrompt.prompt();
        // Tunggu respons dari pengguna
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Pengguna menyetujui instalasi');
            } else {
                console.log('Pengguna menolak instalasi');
            }
            deferredPrompt = null;
        });
    });

    // =================================================
    // BAGIAN UTAMA LOGIKA PERMAINAN ULAR TANGGA
    // =================================================

    // Elemen-elemen dari HTML
    const modeSelection = document.getElementById('mode-selection');
    const pvcBtn = document.getElementById('pvc-btn');
    const pvpBtn = document.getElementById('pvp-btn');
    const gameContainer = document.getElementById('game-container');
    const board = document.getElementById('game-board');
    const rollDiceBtn = document.getElementById('roll-dice-btn');
    const playerTurnDisplay = document.getElementById('player-turn');
    const diceResultDisplay = document.getElementById('dice-result');
    const winnerMessage = document.getElementById('winner-message');

    // Pengaturan awal game
    const boardSize = 100;
    let players = [];
    let currentPlayerIndex = 0;
    let gameMode = '';

    // Definisi posisi ular dan tangga
    const snakesAndLadders = {
        4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91, // Tangga
        17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 99: 78  // Ular
    };

    // [PERBAIKAN] Memastikan layar pemilihan mode selalu tampil saat pertama kali dibuka
    modeSelection.classList.remove('hidden');
    gameContainer.classList.add('hidden');

    // Event listener untuk tombol pemilihan mode
    pvpBtn.addEventListener('click', () => {
        gameMode = 'pvp';
        startGame();
    });

    pvcBtn.addEventListener('click', () => {
        gameMode = 'pvc';
        startGame();
    });

    // Fungsi untuk memulai permainan setelah mode dipilih
    function startGame() {
        modeSelection.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        setupPlayers();
        createBoard();
        updatePlayerTurnDisplay();
    }

    // Fungsi untuk mengatur pemain berdasarkan mode
    function setupPlayers() {
        players = [
            { id: 1, name: 'Pemain 1', position: 1, element: createPlayerElement(1), isAI: false },
            { id: 2, name: (gameMode === 'pvc' ? 'Komputer' : 'Pemain 2'), position: 1, element: createPlayerElement(2), isAI: (gameMode === 'pvc') }
        ];
    }

    // Fungsi untuk membuat papan permainan secara dinamis
    function createBoard() {
        board.innerHTML = '';
        const cells = [];
        for (let i = boardSize; i >= 1; i--) cells.push(i);

        const finalCells = [];
        for (let i = 0; i < 10; i++) {
            const row = cells.slice(i * 10, (i + 1) * 10);
            if (i % 2 !== 0) row.reverse();
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

    // Fungsi untuk membuat elemen visual pemain
    function createPlayerElement(playerId) {
        const playerElement = document.createElement('div');
        playerElement.classList.add('player');
        playerElement.id = `player${playerId}`;
        return playerElement;
    }

    // Fungsi untuk memperbarui posisi pion pemain di papan
    function updatePlayerPositions() {
        players.forEach(player => {
            const cell = document.querySelector(`.cell[data-cell='${player.position}']`);
            if (cell) cell.appendChild(player.element);
        });
    }
    
    // Fungsi untuk menampilkan giliran siapa yang sedang bermain
    function updatePlayerTurnDisplay() {
        const currentPlayer = players[currentPlayerIndex];
        playerTurnDisplay.textContent = `Giliran: ${currentPlayer.name}`;
    }

    // Fungsi untuk mengocok dadu
    function rollDice() {
        return Math.floor(Math.random() * 6) + 1;
    }

    // Fungsi untuk mengganti giliran pemain
    function switchPlayer() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        updatePlayerTurnDisplay();
        
        const nextPlayer = players[currentPlayerIndex];
        if (nextPlayer.isAI) {
            rollDiceBtn.disabled = true;
            setTimeout(aiTurn, 1200); // Beri jeda agar terasa seperti komputer "berpikir"
        } else {
            rollDiceBtn.disabled = false;
        }
    }

    // Fungsi untuk memindahkan pemain
    function movePlayer(player, steps) {
        let newPosition = player.position + steps;
        if (newPosition > boardSize) {
            newPosition = player.position; // Jika langkah melebihi 100, pemain tetap di tempat
        } else {
            player.position = newPosition;
        }

        diceResultDisplay.textContent = `${player.name} maju ${steps} langkah ke petak ${player.position}`;
        updatePlayerPositions();

        // Jeda untuk memeriksa ular atau tangga
        setTimeout(() => {
            if (snakesAndLadders[player.position]) {
                const endPosition = snakesAndLadders[player.position];
                const type = endPosition > player.position ? 'tangga' : 'ular';
                alert(`${player.name} menemukan ${type}! Pindah ke petak ${endPosition}.`);
                player.position = endPosition;
                updatePlayerPositions();
            }

            if (player.position === boardSize) {
                showWinner(player);
                return;
            }

            // Ganti giliran setelah semua pergerakan selesai
            switchPlayer();
        }, 800);
    }

    // Fungsi untuk giliran komputer (AI)
    function aiTurn() {
        const steps = rollDice();
        movePlayer(players[currentPlayerIndex], steps);
    }

    // Fungsi untuk menampilkan pesan pemenang
    function showWinner(player) {
        winnerMessage.querySelector('p').textContent = `${player.name} Menang! 🎉`;
        winnerMessage.classList.remove('hidden');
        document.querySelector('.controls').style.display = 'none'; // Sembunyikan kontrol game
    }

    // Event listener untuk tombol kocok dadu
    rollDiceBtn.addEventListener('click', () => {
        const currentPlayer = players[currentPlayerIndex];
        if (currentPlayer.isAI) return; // Mencegah pemain mengklik saat giliran AI

        rollDiceBtn.disabled = true;
        const steps = rollDice();
        movePlayer(currentPlayer, steps);
    });
});