/**
 * inventory.js - Inventory UI rendering and food consumption logic
 */

import { Sound } from './audio.js';

export function renderInventory(game) {
    const container = document.getElementById('inventory-container');
    if (!container) return;
    container.innerHTML = '';

    const foods = [
        { id: 'fish', title: 'Fish', desc: 'Restores +20 Satiety, +10 Friendship', icon: '🐟', satiety: 20, friend: 10 },
        { id: 'premiumFish', title: 'Premium Fish', desc: 'Restores +40 Satiety, +20 Friendship', icon: '🐠', satiety: 40, friend: 20 },
        { id: 'tuna', title: 'Tuna Can', desc: 'Restores +60 Satiety, +35 Friendship', icon: '🥫', satiety: 60, friend: 35 },
        { id: 'salmon', title: 'Fresh Salmon', desc: 'Restores +80 Satiety, +50 Friendship', icon: '🥩', satiety: 80, friend: 50 }
    ];

    let hasItems = false;

    foods.forEach(food => {
        const count = game.inventory.food[food.id] || 0;
        if (count > 0) {
            hasItems = true;
            const card = document.createElement('div');
            card.className = 'inventory-card';
            card.innerHTML = `
                <div class="inventory-icon">${food.icon}</div>
                <div class="inventory-details">
                    <div class="inventory-name">${food.title} <span class="inventory-count">x${count}</span></div>
                    <div class="inventory-desc">${food.desc}</div>
                </div>
                <div>
                    <button class="btn-use" data-id="${food.id}">Consume</button>
                </div>
            `;

            card.querySelector('.btn-use').addEventListener('click', () => {
                consumeFood(game, food);
            });

            container.appendChild(card);
        }
    });

    game.inventory.toys.forEach(toyId => {
        hasItems = true;
        const toyNames = { yarnBall: 'Yarn Ball 🧶', laserPointer: 'Laser Pointer 🔴', catWand: 'Feather Wand 🪶' };
        const card = document.createElement('div');
        card.className = 'inventory-card';
        card.innerHTML = `
            <div class="inventory-icon">🎾</div>
            <div class="inventory-details">
                <div class="inventory-name">${toyNames[toyId] || toyId}</div>
                <div class="inventory-desc">Toy active. Boosts happiness & friendship.</div>
            </div>
            <div><span class="inventory-count">Active</span></div>
        `;
        container.appendChild(card);
    });

    game.inventory.furniture.forEach(furnId => {
        hasItems = true;
        const furnNames = { betterBed: 'Better Bed 🛏️', luxuryRug: 'Luxury Rug 🌟', scratchingTower: 'Scratching Tower 🏰', windowPerch: 'Window Perch 🪟' };
        const card = document.createElement('div');
        card.className = 'inventory-card';
        card.innerHTML = `
            <div class="inventory-icon">🛋️</div>
            <div class="inventory-details">
                <div class="inventory-name">${furnNames[furnId] || furnId}</div>
                <div class="inventory-desc">Room upgrade active. Passive boost applied.</div>
            </div>
            <div><span class="inventory-count">Equipped</span></div>
        `;
        container.appendChild(card);
    });

    if (!hasItems) {
        container.innerHTML = `<div style="text-align:center; padding: 25px; color:var(--text-muted); font-size: 0.85rem;">Your Inventory is empty. Go buy items from the Pet Shop!</div>`;
    }
}

function consumeFood(game, food) {
    if (game.isSleepingState) return;
    if (game.stats.hunger >= 100) {
        game.triggerSpeechBubble("Pixel is full! Save this delicious snack.");
        return;
    }

    game.inventory.food[food.id] -= 1;
    game.stats.hunger = Math.min(100, game.stats.hunger + food.satiety);
    game.history.totalFeeds += 1;

    Sound.playFeed();
    game.addXP(15);
    game.addFriendshipXp(food.friend);
    game.triggerActionAnimation('feed');
    game.triggerSpeechBubble(`Yum! Consumed ${food.title}! (+${food.satiety} Satiety) 😋`);
    game.createFloatingParticle(food.icon);

    game.updateQuestProgress('feed3', 1);

    renderInventory(game);
    game.updateUI();
    game.saveGame();
}
