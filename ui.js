/**
 * ui.js - Handles UI binding, Event listeners, Tutorial steps, Dev panel, and Floating particles
 */

import { Sound } from './audio.js';

export function updateUI(game) {
    const h = Math.round(game.stats.hunger);
    const ha = Math.round(game.stats.happiness);
    const e = Math.round(game.stats.energy);
    const coins = game.stats.coins;
    const friendLvl = game.stats.friendshipLevel;
    const friendXp = game.stats.friendshipXp;
    const friendNeeded = game.stats.friendshipXpNeeded;

    // Populate cached dom variables
    game.dom.hungerVal.textContent = `${h}/100`;
    game.dom.happinessVal.textContent = `${ha}/100`;
    game.dom.energyVal.textContent = `${e}/100`;

    game.dom.hungerFill.style.width = `${h}%`;
    game.dom.happinessFill.style.width = `${ha}%`;
    game.dom.energyFill.style.width = `${e}%`;

    game.dom.lvlVal.textContent = game.stats.level;
    game.dom.xpText.textContent = `${game.stats.xp} / ${game.stats.xpNeeded}`;
    game.dom.xpFill.style.width = `${(game.stats.xp / game.stats.xpNeeded) * 100}%`;

    game.dom.coinVal.textContent = coins;
    game.dom.friendLvl.textContent = friendLvl;
    game.dom.friendXpText.textContent = `${friendXp} / ${friendNeeded}`;
    game.dom.friendFill.style.width = `${(friendXp / friendNeeded) * 100}%`;

    const diffMs = Date.now() - game.history.createdDate;
    const daysAlive = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    game.dom.daysAlive.textContent = daysAlive;

    game.dom.statFeeds.textContent = game.history.totalFeeds;
    game.dom.statPlays.textContent = game.history.totalPlays;
    game.dom.statPets.textContent = game.history.totalPets;
    game.dom.statLevelups.textContent = game.history.totalLevelups;
}

export function triggerSpeechBubble(text) {
    const bubble = document.getElementById('thought-text');
    if (bubble) bubble.textContent = text;
}

export function createFloatingParticle(emoji) {
    const overlay = document.getElementById('particles-overlay');
    if (!overlay) return;

    const particle = document.createElement('div');
    particle.className = 'floating-particle';
    particle.textContent = emoji;

    const randX = 35 + Math.random() * 30; 
    const randY = 40 + Math.random() * 20; 

    particle.style.left = `${randX}%`;
    particle.style.top = `${randY}%`;

    overlay.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 1200);
}

export function startTutorial(game) {
    game.tutorialStep = 0;
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        showTutorialStep(game);
    }
}

export function showTutorialStep(game) {
    const titleEl = document.getElementById('tutorial-title');
    const textEl = document.getElementById('tutorial-text');
    
    // Remove spotlight from previous elements
    document.querySelectorAll('.spotlight-active').forEach(el => el.classList.remove('spotlight-active'));

    const steps = [
        {
            title: "Welcome to PixelPal!",
            text: "Meet Pixel, your virtual cozy cat companion! Let's show you how to take care of them.",
            highlightId: "cat-stage-wrapper"
        },
        {
            title: "Keep Pixel Healthy",
            text: "Watch these meters: Satiety, Happiness, and Energy! If they drop too low, Pixel will become hungry or sleepy.",
            highlightId: "hunger-fill"
        },
        {
            title: "Interact & Level Up",
            text: "Use actions (Feed, Play, Pet, Sleep) or purchase accessories/furniture in the Shop tab to earn coins and raise Friendship levels!",
            highlightId: "btn-feed"
        }
    ];

    const step = steps[game.tutorialStep];
    if (titleEl && textEl) {
        titleEl.textContent = step.title;
        textEl.textContent = step.text;
    }

    const highlightEl = document.getElementById(step.highlightId);
    if (highlightEl) {
        highlightEl.classList.add('spotlight-active');
    }
}

export function nextTutorial(game) {
    game.tutorialStep++;
    if (game.tutorialStep < 3) {
        showTutorialStep(game);
    } else {
        completeTutorial(game);
    }
}

export function completeTutorial(game) {
    document.getElementById('tutorial-overlay').style.display = 'none';
    document.querySelectorAll('.spotlight-active').forEach(el => el.classList.remove('spotlight-active'));
    localStorage.setItem('pixelpal_tutorial_completed', 'true');
    game.triggerSpeechBubble("Tutorial complete! Let's become best friends! 😸");
}

export function toggleDevPanel(game) {
    const panel = document.getElementById('dev-panel-overlay');
    if (!panel) return;

    if (panel.style.display === 'none') {
        panel.style.display = 'flex';
        updateDevPanelData(game);
    } else {
        panel.style.display = 'none';
    }
}

export function updateDevPanelData(game) {
    document.getElementById('dev-lvl-val').textContent = game.stats.level;
    document.getElementById('dev-xp-val').textContent = `${game.stats.xp} / ${game.stats.xpNeeded}`;
    document.getElementById('dev-coins-val').textContent = game.stats.coins;
    document.getElementById('dev-friend-val').textContent = `${game.stats.friendshipLevel} (XP: ${game.stats.friendshipXp})`;
    document.getElementById('dev-prestige-val').textContent = game.prestige.count;
}

export function triggerRandomEvent(game) {
    const events = [
        {
            title: '🪙 Coin Found!',
            desc: 'Pixel discovered a lost shiny coin buried in the cozy rug!',
            choices: [
                { text: 'Claim Coin (+30 Coins)', action: () => { game.addCoins(30); game.triggerSpeechBubble("Wonderful! Added +30 coins."); } }
            ]
        },
        {
            title: '🎁 Mystery Gift!',
            desc: 'Pixel brought you a gift from the backyard cabinet!',
            choices: [
                { text: 'Unwrap Gift (Receive Fish)', action: () => { 
                    game.inventory.food.fish = (game.inventory.food.fish || 0) + 1;
                    game.renderInventory();
                    game.triggerSpeechBubble("Sweet! Added 1 Fish to Inventory."); 
                } }
            ]
        },
        {
            title: '🧹 Sticky Mess!',
            desc: 'Oh no! Pixel knocked over the flower pot in the living room!',
            choices: [
                { text: 'Clean Mess Up (-10 Coins)', action: () => { game.stats.coins = Math.max(0, game.stats.coins - 10); game.updateUI(); game.triggerSpeechBubble("Cleaned up! Mess is gone."); } },
                { text: 'Ignore Mess (-15 Happiness)', action: () => { game.stats.happiness = Math.max(0, game.stats.happiness - 15); game.updateUI(); game.triggerSpeechBubble("Ignored. Pixel feels bad about the mess."); } }
            ]
        }
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    const stageWrapper = document.getElementById('cat-stage-wrapper');
    
    const overlay = document.createElement('div');
    overlay.className = 'event-overlay';
    overlay.id = 'event-bubble-overlay';

    const card = document.createElement('div');
    card.className = 'event-card';

    let choicesHTML = '';
    event.choices.forEach((choice, idx) => {
        choicesHTML += `<button class="btn-choice" data-idx="${idx}">${choice.text}</button>`;
    });

    card.innerHTML = `
        <div class="event-title">${event.title}</div>
        <div class="event-desc">${event.desc}</div>
        <div class="event-choices">${choicesHTML}</div>
    `;

    overlay.appendChild(card);
    stageWrapper.appendChild(overlay);

    Sound.playAchievement();

    card.querySelectorAll('.btn-choice').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx);
            event.choices[idx].action();
            overlay.remove();
            game.saveGame();
        });
    });
}

export function bindEvents(game) {
    document.getElementById('btn-feed').addEventListener('click', () => game.feed());
    document.getElementById('btn-play').addEventListener('click', () => game.play());
    document.getElementById('btn-sleep').addEventListener('click', () => game.toggleSleep());
    document.getElementById('btn-pet').addEventListener('click', () => game.pet());

    document.getElementById('claim-reward-btn').addEventListener('click', () => game.claimDailyReward());
    document.getElementById('btn-reset').addEventListener('click', () => game.resetProgress());

    // Save Hardening: Export & Import events
    document.getElementById('btn-export-save').addEventListener('click', () => game.exportSave());
    document.getElementById('btn-import-save').addEventListener('click', () => {
        document.getElementById('save-file-input').click();
    });
    document.getElementById('save-file-input').addEventListener('change', (e) => game.importSave(e));

    // Volume control range slider bindings
    const volSlider = document.getElementById('volume-slider');
    volSlider.addEventListener('input', (e) => {
        const vol = parseInt(e.target.value) / 100;
        Sound.setVolume(vol);
        localStorage.setItem('pixelpal_volume', vol);
    });

    // Version badge Dev panel clicks trigger
    document.getElementById('version-badge').addEventListener('click', () => {
        game.badgeClicks++;
        if (game.badgeClicks >= 5) {
            game.badgeClicks = 0;
            game.toggleDevPanel();
        }
    });

    // Dev panel actions bindings
    document.getElementById('btn-dev-close').addEventListener('click', () => game.toggleDevPanel());
    document.getElementById('btn-dev-add-coins').addEventListener('click', () => game.devAddCoins());
    document.getElementById('btn-dev-add-xp').addEventListener('click', () => game.devAddXP());
    document.getElementById('btn-dev-add-friend').addEventListener('click', () => game.devAddFriendship());
    document.getElementById('btn-dev-lvl-up').addEventListener('click', () => game.devInstantLevelUp());
    document.getElementById('btn-dev-skip-time').addEventListener('click', () => game.devSkipTime());

    // Onboarding Tutorial buttons bindings
    document.getElementById('btn-tutorial-skip').addEventListener('click', () => game.completeTutorial());
    document.getElementById('btn-tutorial-next').addEventListener('click', () => game.nextTutorial());

    document.getElementById('prestige-claim-btn').addEventListener('click', () => game.prestigeRebirth());

    const soundBtn = document.getElementById('sound-toggle-btn');
    soundBtn.addEventListener('click', () => {
        const isEnabled = Sound.toggle();
        soundBtn.textContent = isEnabled ? "🔊 Sound On" : "🔇 Muted";
        localStorage.setItem('pixelpal_sound_enabled', isEnabled);
        Sound.playPet();
    });

    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const targetTab = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
            document.getElementById(targetTab).classList.add('active');

            if (targetTab === 'tab-shop') game.renderShop();
            if (targetTab === 'tab-inventory') game.renderInventory();
            if (targetTab === 'tab-quests') game.renderQuests();
            if (targetTab === 'tab-collection') game.renderCollection();
            if (targetTab === 'tab-prestige') game.renderPrestige();
        });
    });

    document.querySelectorAll('.col-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.col-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            game.renderCollection();
        });
    });
}
