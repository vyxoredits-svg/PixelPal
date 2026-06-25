/**
 * game.js - Main orchestrator module for PixelPal
 */

import { Sound } from './audio.js';
import { PixelCatRenderer } from './pet.js';
import { renderShop } from './shop.js';
import { renderInventory } from './inventory.js';
import { resetQuests, updateQuestProgress, renderQuests } from './quests.js';
import { renderGames } from './minigames.js';
import { saveGame, loadGame, exportSave, importSave } from './save.js';
import * as UI from './ui.js';

export class PixelPal {
    constructor() {
        this.stats = {
            hunger: 100,
            happiness: 100,
            energy: 100,
            level: 1,
            xp: 0,
            xpNeeded: 80, 
            coins: 100, 
            friendshipLevel: 1, 
            friendshipXp: 0,
            friendshipXpNeeded: 100
        };

        this.history = {
            totalFeeds: 0,
            totalPlays: 0,
            totalPets: 0,
            totalLevelups: 0,
            createdDate: Date.now(),
            lastLoginDate: Date.now()
        };

        this.achievements = {
            firstMeal: false,
            bestFriend: false,
            nightOwl: false,
            happyCat: false,
            level10: false
        };

        this.cosmetics = {
            unlocked: ['none'],
            equipped: 'none'
        };

        this.inventory = {
            food: { fish: 0, premiumFish: 0, tuna: 0, salmon: 0 },
            toys: [],
            furniture: []
        };

        this.quests = {
            daily: [
                { id: 'feed3', desc: 'Feed Pixel 3 times', count: 0, target: 3, rewarded: false, type: 'coins', amt: 50 },
                { id: 'pet5', desc: 'Pet Pixel 5 times', count: 0, target: 5, rewarded: false, type: 'coins', amt: 50 },
                { id: 'play2', desc: 'Play with Pixel 2 times', count: 0, target: 2, rewarded: false, type: 'coins', amt: 50 }
            ],
            weekly: [
                { id: 'happy100', desc: 'Reach 100 Happiness', count: 0, target: 100, rewarded: false, type: 'xp', amt: 150 },
                { id: 'earn500', desc: 'Earn 500 Coins', count: 0, target: 500, rewarded: false, type: 'coins', amt: 200 },
                { id: 'gainLvl', desc: 'Gain a level', count: 0, target: 1, rewarded: false, type: 'cosmetic', val: 'headset' }
            ],
            lastAssigned: Date.now()
        };

        this.collection = {
            fish: [],
            toys: [],
            accessories: [],
            furniture: []
        };

        this.prestige = {
            count: 0,
            multiplier: 1.0,
            title: 'Companion'
        };

        this.state = 'idle'; 
        this.actionActive = false;
        this.actionType = '';
        this.actionTimer = null;
        this.isSleepingState = false; 

        this.activeGameId = null;
        this.activeGameTimer = null;

        this.messages = [
            "Mew! I love playing with yarn!",
            "Is it snack time yet?",
            "Purr... you are a great friend.",
            "Zzz... chasing virtual mice...",
            "Happy to hang out with you!",
            "Can I get a little pet?",
            "I'm feeling very cozy today!"
        ];

        this.badgeClicks = 0;
        this.tutorialStep = 0;

        this.renderer = new PixelCatRenderer('cat-canvas');

        // Cache DOM elements for rendering loop optimization
        this.dom = {
            hungerVal: document.getElementById('hunger-value'),
            happinessVal: document.getElementById('happiness-value'),
            energyVal: document.getElementById('energy-value'),
            hungerFill: document.getElementById('hunger-fill'),
            happinessFill: document.getElementById('happiness-fill'),
            energyFill: document.getElementById('energy-fill'),
            lvlVal: document.getElementById('lvl-value'),
            xpText: document.getElementById('xp-text'),
            xpFill: document.getElementById('xp-fill'),
            coinVal: document.getElementById('coin-value'),
            friendLvl: document.getElementById('friend-lvl'),
            friendXpText: document.getElementById('friend-xp-text'),
            friendFill: document.getElementById('friend-fill'),
            daysAlive: document.getElementById('stat-days-alive'),
            statFeeds: document.getElementById('stat-total-feeds'),
            statPlays: document.getElementById('stat-total-plays'),
            statPets: document.getElementById('stat-total-pets'),
            statLevelups: document.getElementById('stat-total-levelups'),
            sleepBtnText: document.getElementById('sleep-btn-text')
        };

        this.loadGame();
        this.bindEvents();
        this.checkDailyReward();
        
        // Start loops
        this.startGameLoop();
        this.startRenderLoop();

        // Check if onboarding is needed
        if (!localStorage.getItem('pixelpal_tutorial_completed')) {
            this.startTutorial();
        }
    }

    loadGame() {
        loadGame(this);
    }

    saveGame() {
        saveGame(this);
    }

    startGameLoop() {
        setInterval(() => {
            if (!this.isSleepingState) {
                this.stats.hunger = Math.max(0, this.stats.hunger - 0.5);
                
                let hapDecay = 0.33;
                if (this.inventory.furniture.includes('luxuryRug')) {
                    hapDecay = 0.22; 
                }
                this.stats.happiness = Math.max(0, this.stats.happiness - hapDecay);
                this.stats.energy = Math.max(0, this.stats.energy - 0.4);
            } else {
                let restoreAmt = 1.5;
                if (this.inventory.furniture.includes('betterBed')) {
                    restoreAmt = 1.8;
                }
                this.stats.energy = Math.min(100, this.stats.energy + restoreAmt);
                this.stats.hunger = Math.max(0, this.stats.hunger - 0.3);
                
                if (this.stats.energy >= 100) {
                    this.toggleSleep(true); 
                }
            }

            this.updateQuestProgress('happy100', this.stats.happiness);

            this.checkStateRules();
            this.checkAchievementUnlocks();
            this.updateUI();
        }, 10000); 

        setInterval(() => {
            this.saveGame();
        }, 15000);

        setInterval(() => {
            if (!this.isSleepingState && Math.random() > 0.4 && !document.getElementById('event-bubble-overlay')) {
                if (Math.random() < 0.1) {
                    this.triggerRandomEvent();
                } else {
                    const randomMsg = this.messages[Math.floor(Math.random() * this.messages.length)];
                    this.triggerSpeechBubble(randomMsg);
                }
            }
        }, 20000);
    }

    startRenderLoop() {
        let lastTime = 0;
        const fpsLimit = 30;
        const interval = 1000 / fpsLimit;
        
        const render = (time) => {
            const delta = time - lastTime;
            if (delta >= interval) {
                lastTime = time - (delta % interval);
                const cosmetic = this.cosmetics ? this.cosmetics.equipped : 'none';
                const furn = this.inventory ? this.inventory.furniture : [];
                this.renderer.render(this.state, this.actionActive, this.actionType, this.stats.level, cosmetic, furn);
            }
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }

    // Offline progression simulation. Triggers when the user returns after closing the tab.
    processOfflineProgression(totalSeconds) {
        const decayHungerRate = 45;
        const decayHappinessRate = 60;
        const decayEnergyRate = 30;
        const restoreEnergyRate = 40;

        let hungerDecay = Math.floor(totalSeconds / decayHungerRate);
        let happinessDecay = Math.floor(totalSeconds / decayHappinessRate);

        let sleepSpeed = 3;
        if (this.inventory.furniture.includes('betterBed')) {
            sleepSpeed = 3.6; 
        }

        this.stats.hunger = Math.max(0, this.stats.hunger - hungerDecay);
        this.stats.happiness = Math.max(0, this.stats.happiness - happinessDecay);

        if (this.isSleepingState) {
            const energyNeeded = 100 - this.stats.energy;
            const ticksToFull = Math.ceil(energyNeeded / sleepSpeed);
            const secondsToFull = ticksToFull * restoreEnergyRate;

            if (totalSeconds >= secondsToFull) {
                this.stats.energy = 100;
                const remainingSeconds = totalSeconds - secondsToFull;
                const energyDecay = Math.floor(remainingSeconds / decayEnergyRate);
                this.stats.energy = Math.max(0, this.stats.energy - energyDecay);
                this.isSleepingState = false;
                this.state = 'idle';
            } else {
                const energyRestored = Math.floor(totalSeconds / restoreEnergyRate) * sleepSpeed;
                this.stats.energy = Math.min(100, this.stats.energy + energyRestored);
            }
        } else {
            const energyDecay = Math.floor(totalSeconds / decayEnergyRate);
            this.stats.energy = Math.max(0, this.stats.energy - energyDecay);
        }

        this.triggerSpeechBubble(`While you were gone for ${this.formatTime(totalSeconds)}, Pixel was simulated offline!`);
    }

    formatTime(seconds) {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        return `${hrs}h ${mins % 60}m`;
    }

    checkStateRules() {
        if (this.isSleepingState) {
            this.state = 'sleeping';
            return;
        }

        if (this.stats.hunger < 35) {
            this.state = 'hungry';
        } else if (this.stats.energy < 30) {
            this.state = 'sleepy';
        } else if (this.stats.happiness > 75) {
            this.state = 'happy';
        } else {
            this.state = 'idle';
        }

        const overlayBadge = document.getElementById('status-overlay-badge');
        if (overlayBadge) overlayBadge.textContent = this.state.toUpperCase();
    }

    addXP(amount) {
        let finalAmt = Math.round(amount * this.prestige.multiplier);
        this.stats.xp += finalAmt;
        this.createFloatingParticle('✨');

        if (this.stats.xp >= this.stats.xpNeeded) {
            this.stats.xp -= this.stats.xpNeeded;
            this.stats.level += 1;
            this.history.totalLevelups += 1;
            this.stats.xpNeeded = this.stats.level * 80;
            
            const levelCoins = Math.round(50 * this.prestige.multiplier);
            this.addCoins(levelCoins);
            this.updateQuestProgress('gainLvl', 1);

            Sound.playLevelUp();
            this.triggerSpeechBubble(`✨ Oh look! Pixel grew stronger and is now Level ${this.stats.level}! (+${levelCoins} coins) 🎉`);
            this.createFloatingParticle('🎉');
            this.saveGame();
            this.renderCloset(); 
            this.renderPrestige();
        }
    }

    addCoins(amount) {
        const finalCoins = Math.round(amount * this.prestige.multiplier);
        this.stats.coins += finalCoins;
        this.createFloatingParticle('🪙');
        this.updateQuestProgress('earn500', finalCoins);
        this.updateUI();
    }

    addFriendshipXp(amount) {
        this.stats.friendshipXp += amount;
        if (this.stats.friendshipXp >= this.stats.friendshipXpNeeded) {
            this.stats.friendshipXp -= this.stats.friendshipXpNeeded;
            this.stats.friendshipLevel += 1;
            this.stats.friendshipXpNeeded = this.stats.friendshipLevel * 100;
            Sound.playLevelUp();
            this.triggerSpeechBubble(`🤝 Pixel seems a little closer to you today! Friendship level up! ❤️`);
            this.createFloatingParticle('💖');
            
            if (this.stats.friendshipLevel === 5) {
                this.messages.push("Mew! You are my absolute best friend in the universe!");
                this.notifyAchievementUnlock("Best Friend Milestones", "Unlocked special messages.");
            }
        }
        this.updateUI();
    }

    feed() {
        if (this.isSleepingState) return;
        if (this.stats.hunger >= 100) {
            this.triggerSpeechBubble("Pixel is already full! 😺");
            return;
        }

        this.stats.hunger = Math.min(100, this.stats.hunger + 25);
        this.history.totalFeeds += 1;
        
        Sound.playFeed();
        this.addXP(10);
        this.addCoins(5);
        this.addFriendshipXp(10);
        this.triggerActionAnimation('feed');
        this.triggerSpeechBubble("Yum! Crispy fish snack! 🐟");
        this.createFloatingParticle('🐟');
        
        this.unlockCollectionItem('fish', 'fish');
        this.updateQuestProgress('feed3', 1);

        this.checkAchievementUnlocks();
        this.updateUI();
        this.saveGame();
    }

    play() {
        if (this.isSleepingState) return;
        if (this.stats.energy < 15) {
            this.triggerSpeechBubble("Too tired to play... zZZ 💤");
            return;
        }

        this.stats.happiness = Math.min(100, this.stats.happiness + 20);
        this.stats.energy = Math.max(0, this.stats.energy - 15);
        this.history.totalPlays += 1;

        Sound.playPlay();

        let xpAmt = 20;
        if (this.inventory.furniture.includes('scratchingTower')) {
            xpAmt = 25;
        }

        this.addXP(xpAmt);
        this.addCoins(10);
        this.addFriendshipXp(15);

        this.triggerActionAnimation('play');
        this.triggerSpeechBubble("Boing! Love this ball of yarn! 🎾");
        this.createFloatingParticle('🧶');

        this.unlockCollectionItem('toys', 'yarnBall');
        this.updateQuestProgress('play2', 1);

        this.checkAchievementUnlocks();
        this.updateUI();
        this.saveGame();
    }

    toggleSleep(forceWake = false) {
        if (this.isSleepingState || forceWake) {
            this.isSleepingState = false;
            this.state = 'idle';
            this.dom.sleepBtnText.textContent = "Sleep";
            this.triggerSpeechBubble("Good morning! Ready to play! ☀️");
            this.setActionsDisabled(false);
            Sound.playPet();
        } else {
            this.isSleepingState = true;
            this.state = 'sleeping';
            this.dom.sleepBtnText.textContent = "Wake Up";
            this.triggerSpeechBubble("Yawwnn... going to sleep... zZZ 🌙");
            this.setActionsDisabled(true);
            Sound.playSleep();
        }
        this.checkStateRules();
        this.updateUI();
        this.saveGame();
    }

    pet() {
        if (this.isSleepingState) return;

        this.stats.happiness = Math.min(100, this.stats.happiness + 10);
        this.history.totalPets += 1;

        Sound.playPet();
        this.addXP(8);
        this.addCoins(3);
        this.addFriendshipXp(8);

        this.createFloatingParticle('💖');
        this.triggerSpeechBubble("Purrr... soft scratches behind the ears! 🥰");

        this.updateQuestProgress('pet5', 1);

        this.checkAchievementUnlocks();
        this.updateUI();
        this.saveGame();
    }

    setActionsDisabled(disabled) {
        UI.bindEvents(this); // Just to ensure bindings, but we disabled them here:
        document.getElementById('btn-feed').disabled = disabled;
        document.getElementById('btn-play').disabled = disabled;
        document.getElementById('btn-pet').disabled = disabled;
    }

    triggerActionAnimation(type) {
        this.actionActive = true;
        this.actionType = type;
        
        if (this.actionTimer) clearTimeout(this.actionTimer);
        
        this.actionTimer = setTimeout(() => {
            this.actionActive = false;
            this.actionType = '';
        }, 1200);
    }

    checkDailyReward() {
        const today = new Date().toDateString();
        const lastClaimed = localStorage.getItem('pixelpal_last_claim');
        const claimBtn = document.getElementById('claim-reward-btn');

        if (claimBtn) {
            if (lastClaimed === today) {
                claimBtn.disabled = true;
                claimBtn.textContent = "Claimed Today";
            } else {
                claimBtn.disabled = false;
                claimBtn.textContent = "Claim Reward";
            }
        }
    }

    claimDailyReward() {
        const today = new Date().toDateString();
        localStorage.setItem('pixelpal_last_claim', today);
        
        this.stats.hunger = 100;
        this.stats.happiness = 100;
        this.stats.energy = 100;
        
        Sound.playLevelUp();

        let dailyXp = 100;
        if (this.inventory.furniture.includes('windowPerch')) {
            dailyXp = 150;
        }

        this.addXP(dailyXp);
        this.addCoins(100);
        
        this.triggerSpeechBubble("🎁 Daily reward claimed! Full health & +100 Coins!");
        this.checkDailyReward();
        this.updateUI();
        this.saveGame();
    }

    checkAchievementUnlocks() {
        let unlockedAny = false;

        if (this.history.totalFeeds >= 1 && !this.achievements.firstMeal) {
            this.achievements.firstMeal = true;
            unlockedAny = true;
            this.notifyAchievementUnlock("First Meal", "Fed Pixel for the first time!");
        }
        if (this.history.totalPets >= 25 && !this.achievements.bestFriend) {
            this.achievements.bestFriend = true;
            unlockedAny = true;
            this.notifyAchievementUnlock("Best Friend", "Pet Pixel 25 times!");
        }
        if (this.stats.energy <= 5 && !this.achievements.nightOwl) {
            this.achievements.nightOwl = true;
            unlockedAny = true;
            this.notifyAchievementUnlock("Night Owl", "Let energy level drop below 5.");
        }
        if (this.stats.happiness >= 95 && !this.achievements.happyCat) {
            this.achievements.happyCat = true;
            unlockedAny = true;
            this.notifyAchievementUnlock("Happy Cat", "Reached over 95% Happiness!");
        }
        if (this.stats.level >= 10 && !this.achievements.level10) {
            this.achievements.level10 = true;
            unlockedAny = true;
            this.notifyAchievementUnlock("Level 10", "Pixel reached Level 10!");
        }

        if (unlockedAny) {
            this.renderAchievements();
        }
    }

    notifyAchievementUnlock(title, desc) {
        Sound.playAchievement();
        this.createFloatingParticle('🏆');
        this.triggerSpeechBubble(`🏆 UNLOCKED ACHIEVEMENT: "${title}" - ${desc}`);
        this.saveGame();
    }

    renderAchievements() {
        const container = document.getElementById('achievements-container');
        if (!container) return;
        container.innerHTML = '';

        const list = [
            { id: 'firstMeal', title: 'First Meal', desc: 'Feed Pixel for the first time', icon: '🐟' },
            { id: 'bestFriend', title: 'Best Friend', desc: 'Pet Pixel 25 times', icon: '🤝' },
            { id: 'happyCat', title: 'Happy Cat', desc: 'Reach over 95% happiness', icon: '😸' },
            { id: 'nightOwl', title: 'Night Owl', desc: 'Drop below 5% energy', icon: '🦉' },
            { id: 'level10', title: 'Level 10', desc: 'Reach level 10 companion status', icon: '👑' }
        ];

        list.forEach(item => {
            const isUnlocked = this.achievements[item.id];
            const card = document.createElement('div');
            card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            
            card.innerHTML = `
                <div class="ach-icon">${isUnlocked ? item.icon : '🔒'}</div>
                <div class="ach-details">
                    <div class="ach-name">${item.title}</div>
                    <div class="ach-desc">${item.desc}</div>
                </div>
                <div class="ach-badge">${isUnlocked ? 'Completed' : 'Locked'}</div>
            `;
            container.appendChild(card);
        });
    }

    renderCloset() {
        const container = document.getElementById('closet-container');
        if (!container) return;
        container.innerHTML = '';

        const list = [
            { id: 'none', title: 'Default', desc: 'No accessory equipped', icon: '🐱', req: 'Always Unlocked' },
            { id: 'bowTie', title: 'Bow Tie', desc: 'A cute cozy bow tie', icon: '🎀', req: 'Unlock/Buy in Shop' },
            { id: 'headset', title: 'Gamer Headset', icon: '🎧', req: 'Unlock/Buy in Shop' },
            { id: 'fedora', title: 'Fedora Hat', icon: '🎩', req: 'Unlock/Buy in Shop' },
            { id: 'wizardHat', title: 'Wizard Hat', icon: '🧙', req: 'Unlock/Buy in Shop' },
            { id: 'crown', title: 'Royal Crown', icon: '👑', req: 'Unlock/Buy in Shop' }
        ];

        list.forEach(item => {
            const isUnlocked = this.cosmetics.unlocked.includes(item.id);
            const isEquipped = this.cosmetics.equipped === item.id;
            
            const card = document.createElement('div');
            card.className = `closet-card ${isUnlocked ? 'unlocked' : 'locked'} ${isEquipped ? 'equipped' : ''}`;
            
            card.innerHTML = `
                <div class="closet-icon">${isUnlocked ? item.icon : '🔒'}</div>
                <div class="closet-details">
                    <div class="closet-name">${item.title}</div>
                    <div class="closet-desc">${isUnlocked ? 'Equip to look adorable' : `Unlock: ${item.req}`}</div>
                </div>
                <div>
                    ${isUnlocked 
                        ? `<button class="btn-equip ${isEquipped ? 'unequip-btn' : ''}" data-id="${item.id}">
                            ${isEquipped ? 'Unequip' : 'Equip'}
                           </button>`
                        : `<span class="closet-badge-req">Locked</span>`
                    }
                </div>
            `;
            
            if (isUnlocked) {
                card.querySelector('.btn-equip').addEventListener('click', () => {
                    if (isEquipped) {
                        this.cosmetics.equipped = 'none';
                    } else {
                        this.cosmetics.equipped = item.id;
                    }
                    this.saveGame();
                    this.renderCloset();
                });
            }
            
            container.appendChild(card);
        });
    }

    renderShop() {
        renderShop(this);
    }

    renderInventory() {
        renderInventory(this);
    }

    resetQuests() {
        resetQuests(this);
    }

    updateQuestProgress(id, amount) {
        updateQuestProgress(this, id, amount);
    }

    renderQuests() {
        renderQuests(this);
    }

    renderGames() {
        renderGames(this);
    }

    unlockCollectionItem(type, itemId) {
        if (!this.collection[type]) this.collection[type] = [];
        if (!this.collection[type].includes(itemId)) {
            this.collection[type].push(itemId);
            this.renderCollection();
            this.saveGame();
        }
    }

    renderCollection() {
        const container = document.getElementById('collection-items-container');
        if (!container) return;
        container.innerHTML = '';

        const activeTab = document.querySelector('.col-tab.active');
        const type = activeTab ? activeTab.getAttribute('data-col-type') : 'fish';

        const dataLists = {
            fish: [
                { id: 'fish', title: 'Crispy Fish', icon: '🐟', desc: 'Standard treats' },
                { id: 'premiumFish', title: 'Premium Goldfish', icon: '🐠', desc: 'Rich golden fish' },
                { id: 'tuna', title: 'Canned Tuna', icon: '🥫', desc: 'Favorite snack can' },
                { id: 'salmon', title: 'Royal Salmon', icon: '🥩', desc: 'Fresh pink fillet' }
            ],
            toys: [
                { id: 'yarnBall', title: 'Yarn Ball', icon: '🧶', desc: 'Classic yarn ball' },
                { id: 'laserPointer', title: 'Laser Pointer', icon: '🔴', desc: 'Red dot projector' },
                { id: 'catWand', title: 'Feather Wand', icon: '🪶', desc: 'Feather stick teaser' }
            ],
            accessories: [
                { id: 'bowTie', title: 'Bow Tie', icon: '🎀', desc: 'Pink neck ribbon' },
                { id: 'headset', title: 'Gamer Headset', icon: '🎧', desc: 'Neon gamer rig' },
                { id: 'fedora', title: 'Fedora Hat', icon: '🎩', desc: 'Sleek dark hat' },
                { id: 'wizardHat', title: 'Wizard Hat', icon: '🧙', desc: 'Magic stars cap' },
                { id: 'crown', title: 'Royal Crown', icon: '👑', desc: 'Jeweled golden crown' }
            ],
            furniture: [
                { id: 'betterBed', title: 'Better Bed', icon: '🛏️', desc: 'Fluffy sleeping pad' },
                { id: 'luxuryRug', title: 'Luxury Rug', icon: '🌟', desc: 'Decorative purple rug' },
                { id: 'scratchingTower', title: 'Cat Tower', icon: '🏰', desc: 'Multi-level scratching tower' },
                { id: 'windowPerch', title: 'Window Perch', icon: '🪟', desc: 'Sunbathing platform' }
            ]
        };

        const list = dataLists[type] || [];
        const unlockedItems = this.collection[type] || [];

        list.forEach(item => {
            const isUnlocked = unlockedItems.includes(item.id);
            const card = document.createElement('div');
            card.className = `collect-card ${isUnlocked ? 'unlocked' : 'locked'}`;

            card.innerHTML = `
                <div class="collect-icon">${isUnlocked ? item.icon : '❓'}</div>
                <div>
                    <div class="collect-name">${isUnlocked ? item.title : 'Undiscovered Item'}</div>
                    <div style="font-size:0.7rem; color:var(--text-muted);">${isUnlocked ? item.desc : 'Unlock in Shop or Events'}</div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    renderPrestige() {
        const reqText = document.getElementById('prestige-requirement-text');
        const claimBtn = document.getElementById('prestige-claim-btn');
        const currentLvlDisplay = document.getElementById('prestige-current-lvl');
        
        if (!reqText || !claimBtn) return;

        currentLvlDisplay.textContent = this.stats.level;
        const eligible = this.stats.level >= 30;

        if (eligible) {
            reqText.className = 'prestige-requirement ready';
            reqText.innerHTML = `🌟 Pixel is Ready for Rebirth! (Current Lvl: ${this.stats.level})`;
            claimBtn.disabled = false;
        } else {
            reqText.className = 'prestige-requirement';
            reqText.innerHTML = `Requires Level 30 to Rebirth. (Current Lvl: ${this.stats.level})`;
            claimBtn.disabled = true;
        }

        const titles = ['Companion', 'Adored Companion', 'Legendary Companion', 'Godlike Companion'];
        this.prestige.title = titles[Math.min(this.prestige.count, titles.length - 1)];
        
        const badge = document.querySelector('.version-badge');
        if (badge && this.prestige.count > 0) {
            badge.textContent = `Prestige ${this.prestige.count} (${this.prestige.title})`;
        }
    }

    prestigeRebirth() {
        if (this.stats.level < 30) return;

        if (confirm("Are you sure you want to Rebirth? Pixel's Level will reset back to 1, but you will receive permanent +20% Coin/XP multipliers, unique titles, and the prestige crown cosmetic!")) {
            this.prestige.count += 1;
            this.prestige.multiplier = 1.0 + (this.prestige.count * 0.2);
            
            this.stats.level = 1;
            this.stats.xp = 0;
            this.stats.xpNeeded = 80;
            this.stats.hunger = 100;
            this.stats.happiness = 100;
            this.stats.energy = 100;

            if (!this.cosmetics.unlocked.includes('crown')) {
                this.cosmetics.unlocked.push('crown');
            }

            this.triggerSpeechBubble(`✨ Rebirth Complete! Reborn count: ${this.prestige.count}! Permanent +${this.prestige.count * 20}% boosts applied! 🎉`);
            Sound.playLevelUp();
            this.saveGame();
            
            this.updateUI();
            this.renderPrestige();
            this.renderCloset();
        }
    }

    exportSave() {
        exportSave(this);
    }

    importSave(e) {
        importSave(this, e);
    }

    startTutorial() {
        UI.startTutorial(this);
    }

    nextTutorial() {
        UI.nextTutorial(this);
    }

    completeTutorial() {
        UI.completeTutorial(this);
    }

    toggleDevPanel() {
        UI.toggleDevPanel(this);
    }

    devAddCoins() {
        this.addCoins(500);
        UI.updateDevPanelData(this);
    }

    devAddXP() {
        this.addXP(100);
        UI.updateDevPanelData(this);
    }

    devAddFriendship() {
        this.addFriendshipXp(50);
        UI.updateDevPanelData(this);
    }

    devInstantLevelUp() {
        const needed = this.stats.xpNeeded - this.stats.xp;
        this.addXP(needed);
        UI.updateDevPanelData(this);
    }

    devSkipTime() {
        this.processOfflineProgression(43200); // 12 hours (43200 seconds)
        UI.updateDevPanelData(this);
        this.updateUI();
    }

    resetProgress() {
        if (confirm("Are you sure you want to reset all PixelPal progress? This cannot be undone.")) {
            localStorage.clear();
            this.stats = { hunger: 100, happiness: 100, energy: 100, level: 1, xp: 0, xpNeeded: 80, coins: 100, friendshipLevel: 1, friendshipXp: 0, friendshipXpNeeded: 100 };
            this.history = { totalFeeds: 0, totalPlays: 0, totalPets: 0, totalLevelups: 0, createdDate: Date.now(), lastLoginDate: Date.now() };
            this.achievements = { firstMeal: false, bestFriend: false, nightOwl: false, happyCat: false, level10: false };
            this.cosmetics = { unlocked: ['none'], equipped: 'none' };
            this.inventory = { food: { fish: 0, premiumFish: 0, tuna: 0, salmon: 0 }, toys: [], furniture: [] };
            this.prestige = { count: 0, multiplier: 1.0, title: 'Companion' };
            this.state = 'idle';
            this.isSleepingState = false;
            
            this.dom.sleepBtnText.textContent = "Sleep";
            this.setActionsDisabled(false);
            
            this.resetQuests();
            this.updateUI();
            this.renderAchievements();
            this.renderCloset();
            this.renderShop();
            this.renderInventory();
            this.renderCollection();
            this.renderPrestige();
            this.checkDailyReward();
            this.triggerSpeechBubble("Hi! Nice to meet you! Let's become best friends!");
            this.saveGame();
            Sound.playLevelUp();
        }
    }

    bindEvents() {
        UI.bindEvents(this);
    }

    updateUI() {
        UI.updateUI(this);
    }

    triggerSpeechBubble(text) {
        UI.triggerSpeechBubble(text);
    }

    createFloatingParticle(emoji) {
        UI.createFloatingParticle(emoji);
    }

    triggerRandomEvent() {
        UI.triggerRandomEvent(this);
    }
}

// Start Game
window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new PixelPal();
});
