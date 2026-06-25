/**
 * minigames.js - Mini Games: Catch The Fish, Chase The Yarn, Memory Match
 */

import { Sound } from './audio.js';
import { COLORS } from './pet.js';

export function renderGames(game) {
    const container = document.getElementById('games-selection-container');
    if (!container) return;
    container.innerHTML = '';

    const games = [
        { id: 'catchFish', title: 'Catch The Fish', desc: 'Test your timing skills!', icon: '🎣' },
        { id: 'chaseYarn', title: 'Chase The Yarn', desc: 'Click the moving yarn ball!', icon: '🧶' },
        { id: 'memoryMatch', title: 'Memory Match', desc: 'Test your memory patterns!', icon: '🃏' }
    ];

    games.forEach(g => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <div class="game-icon">${g.icon}</div>
            <div class="game-details">
                <div class="game-title">${g.title}</div>
                <div class="game-desc">${g.desc}</div>
            </div>
            <button class="btn-play-game" data-id="${g.id}">Play</button>
        `;

        card.querySelector('.btn-play-game').addEventListener('click', () => {
            startMiniGame(game, g.id);
        });

        container.appendChild(card);
    });
}

export function startMiniGame(game, id) {
    if (game.isSleepingState) return;
    game.activeGameId = id;
    
    document.getElementById('games-selection-container').style.display = 'none';
    const stage = document.getElementById('mini-game-stage');
    stage.style.display = 'flex';
    stage.innerHTML = ''; 

    if (id === 'catchFish') {
        initCatchFishGame(game, stage);
    } else if (id === 'chaseYarn') {
        initChaseYarnGame(game, stage);
    } else if (id === 'memoryMatch') {
        initMemoryMatchGame(game, stage);
    }
}

export function closeMiniGame(game) {
    if (game.activeGameTimer) {
        clearInterval(game.activeGameTimer);
        game.activeGameTimer = null;
    }
    game.activeGameId = null;
    document.getElementById('mini-game-stage').style.display = 'none';
    document.getElementById('games-selection-container').style.display = 'flex';
    renderGames(game);
}

function initCatchFishGame(game, stage) {
    stage.innerHTML = `
        <div class="game-header-bar">
            <span>🎣 Catch the Fish</span>
            <span id="game-score">Score: 0/5</span>
        </div>
        <canvas id="game-canvas" class="game-canvas-element" width="200" height="80"></canvas>
        <p style="font-size:0.75rem; text-align:center;">Click when the slider matches the Orange fish zone!</p>
        <button class="btn-close-game" id="btn-quit-game">Quit Game</button>
    `;

    document.getElementById('btn-quit-game').addEventListener('click', () => closeMiniGame(game));

    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    let sliderX = 0;
    let sliderSpeed = 4;
    const fishZoneX = 90;
    const fishZoneW = 20;
    let score = 0;

    const loop = () => {
        if (game.activeGameId !== 'catchFish') return;

        sliderX += sliderSpeed;
        if (sliderX > canvas.width || sliderX < 0) {
            sliderSpeed = -sliderSpeed;
        }

        ctx.fillStyle = '#1e1b29';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = COLORS.food; 
        ctx.fillRect(fishZoneX, 20, fishZoneW, 40);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px serif';
        ctx.fillText('🐟', fishZoneX + 2, 45);

        ctx.fillStyle = '#ec4899';
        ctx.fillRect(sliderX, 15, 6, 50);

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    canvas.addEventListener('click', () => {
        if (sliderX >= fishZoneX && sliderX <= fishZoneX + fishZoneW) {
            score++;
            Sound.playPet();
            document.getElementById('game-score').textContent = `Score: ${score}/5`;
            game.createFloatingParticle('🐟');

            sliderSpeed = sliderSpeed * 1.15; 
            
            if (score >= 5) {
                game.addCoins(30);
                game.addXP(20);
                game.triggerSpeechBubble("Wow! You caught all the fish! +30 Coins (+20 XP)");
                closeMiniGame(game);
            }
        } else {
            Sound.playSleep(); 
            game.triggerSpeechBubble("Missed! Try again.");
        }
    });
}

function initChaseYarnGame(game, stage) {
    stage.innerHTML = `
        <div class="game-header-bar">
            <span>🧶 Chase Yarn</span>
            <span id="game-score">Hits: 0/6</span>
        </div>
        <canvas id="game-canvas" class="game-canvas-element" width="200" height="150"></canvas>
        <p style="font-size:0.75rem; text-align:center;">Click the rolling yarn ball before time runs out!</p>
        <button class="btn-close-game" id="btn-quit-game">Quit Game</button>
    `;

    document.getElementById('btn-quit-game').addEventListener('click', () => closeMiniGame(game));

    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    let ballX = 100;
    let ballY = 75;
    let dx = 3;
    let dy = 2.5;
    const radius = 12;
    let hits = 0;

    const loop = () => {
        if (game.activeGameId !== 'chaseYarn') return;

        ballX += dx;
        ballY += dy;
        if (ballX - radius < 0 || ballX + radius > canvas.width) dx = -dx;
        if (ballY - radius < 0 || ballY + radius > canvas.height) dy = -dy;

        ctx.fillStyle = '#1e1b29';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = COLORS.toy; 
        ctx.beginPath();
        ctx.arc(ballX, ballY, radius, 0, 2*Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ballX, ballY, radius - 4, 0, Math.PI);
        ctx.stroke();

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const dist = Math.sqrt((clickX - ballX)**2 + (clickY - ballY)**2);
        if (dist <= radius + 5) {
            hits++;
            Sound.playPlay();
            document.getElementById('game-score').textContent = `Hits: ${hits}/6`;
            game.createFloatingParticle('🧶');

            dx = (dx > 0 ? 1 : -1) * (Math.abs(dx) + 0.6) * (Math.random() > 0.5 ? 1 : -1);
            dy = (dy > 0 ? 1 : -1) * (Math.abs(dy) + 0.6) * (Math.random() > 0.5 ? 1 : -1);

            if (hits >= 6) {
                game.addCoins(40);
                game.addXP(25);
                game.triggerSpeechBubble("Awesome chasing skills! +40 Coins (+25 XP)");
                closeMiniGame(game);
            }
        }
    });
}

function initMemoryMatchGame(game, stage) {
    stage.innerHTML = `
        <div class="game-header-bar">
            <span>🃏 Memory Match</span>
            <span id="game-turns">Pairs: 0/4</span>
        </div>
        <div class="memory-grid" id="mem-grid"></div>
        <button class="btn-close-game" id="btn-quit-game">Quit Game</button>
    `;

    document.getElementById('btn-quit-game').addEventListener('click', () => closeMiniGame(game));

    const grid = document.getElementById('mem-grid');
    const icons = ['🐟', '🧶', '🎀', '👑', '🐟', '🧶', '🎀', '👑'];
    
    icons.sort(() => Math.random() - 0.5);

    let flippedCards = [];
    let matchedPairs = 0;

    icons.forEach((icon, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.icon = icon;
        card.dataset.index = index;
        card.textContent = '❓';

        card.addEventListener('click', () => {
            if (card.classList.contains('flipped') || card.classList.contains('matched') || flippedCards.length >= 2) return;

            card.textContent = icon;
            card.classList.add('flipped');
            flippedCards.push(card);
            Sound.playPet();

            if (flippedCards.length === 2) {
                const c1 = flippedCards[0];
                const c2 = flippedCards[1];

                if (c1.dataset.icon === c2.dataset.icon) {
                    c1.classList.add('matched');
                    c2.classList.add('matched');
                    matchedPairs++;
                    document.getElementById('game-turns').textContent = `Pairs: ${matchedPairs}/4`;
                    flippedCards = [];

                    if (matchedPairs >= 4) {
                        setTimeout(() => {
                            game.addCoins(50);
                            game.addXP(30);
                            game.triggerSpeechBubble("Brilliant memory! Match completed: +50 Coins (+30 XP)");
                            closeMiniGame(game);
                        }, 800);
                    }
                } else {
                    setTimeout(() => {
                        c1.classList.remove('flipped');
                        c1.textContent = '❓';
                        c2.classList.remove('flipped');
                        c2.textContent = '❓';
                        flippedCards = [];
                    }, 1000);
                }
            }
        });

        grid.appendChild(card);
    });
}
