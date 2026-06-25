/**
 * shop.js - Pet Shop items config and interactions
 */

import { Sound } from './audio.js';

export const SHOP_ITEMS = [
    // FOODS
    { id: 'fish', title: 'Fish', desc: 'Delicious small snack (+20 Satiety, +10 Friendship)', type: 'food', cost: 15, icon: '🐟' },
    { id: 'premiumFish', title: 'Premium Fish', desc: 'High quality fish (+40 Satiety, +20 Friendship)', type: 'food', cost: 30, icon: '🐠' },
    { id: 'tuna', title: 'Tuna Can', desc: 'Canned tuna treat (+60 Satiety, +35 Friendship)', type: 'food', cost: 50, icon: '🥫' },
    { id: 'salmon', title: 'Fresh Salmon', desc: 'Fresh pink salmon fillet (+80 Satiety, +50 Friendship)', type: 'food', cost: 75, icon: '🥩' },

    // TOYS
    { id: 'yarnBall', title: 'Yarn Ball', desc: 'Cozy blue yarn (+25 Happiness, +20 Friendship)', type: 'toy', cost: 80, icon: '🧶' },
    { id: 'laserPointer', title: 'Laser Pointer', desc: 'Red dot projector (+45 Happiness, +35 Friendship)', type: 'toy', cost: 160, icon: '🔴' },
    { id: 'catWand', title: 'Feather Wand', desc: 'Teaser stick (+70 Happiness, +55 Friendship)', type: 'toy', cost: 240, icon: '🪶' },

    // ACCESSORIES
    { id: 'bowTie', title: 'Bow Tie', desc: 'Cute accessory for your collar', type: 'accessory', cost: 100, icon: '🎀' },
    { id: 'headset', title: 'Gamer Headset', desc: 'Cyan glowing headphones', type: 'accessory', cost: 200, icon: '🎧' },
    { id: 'fedora', title: 'Fedora Hat', desc: 'Classy old school hat', type: 'accessory', cost: 300, icon: '🎩' },
    { id: 'wizardHat', title: 'Wizard Hat', desc: 'Purple star cap', type: 'accessory', cost: 450, icon: '🧙' },
    { id: 'crown', title: 'Royal Crown', desc: 'Shiny golden crown', type: 'accessory', cost: 800, icon: '👑' },

    // FURNITURE
    { id: 'betterBed', title: 'Better Bed', desc: 'Fluffy cushions (+20% energy sleep speed)', type: 'furniture', cost: 200, icon: '🛏️' },
    { id: 'luxuryRug', title: 'Luxury Rug', desc: 'Decreases happiness decay by 33%', type: 'furniture', cost: 350, icon: '🌟' },
    { id: 'scratchingTower', title: 'Scratching Tower', desc: 'Multi-level cat pole (+25% Play Session XP)', type: 'furniture', cost: 500, icon: '🏰' },
    { id: 'windowPerch', title: 'Window Perch', desc: 'Sunbathing platform (+50% Daily Claim XP)', type: 'furniture', cost: 700, icon: '🪟' }
];

export function renderShop(game) {
    const container = document.getElementById('shop-container');
    if (!container) return;
    container.innerHTML = '';

    SHOP_ITEMS.forEach(item => {
        const isOwnedPersistent = (item.type === 'toy' && game.inventory.toys.includes(item.id)) ||
                                 (item.type === 'furniture' && game.inventory.furniture.includes(item.id)) ||
                                 (item.type === 'accessory' && game.cosmetics.unlocked.includes(item.id));

        const card = document.createElement('div');
        card.className = 'shop-card';

        card.innerHTML = `
            <div class="shop-icon">${item.icon}</div>
            <div class="shop-details">
                <div class="shop-name">${item.title}</div>
                <div class="shop-desc">${item.desc}</div>
            </div>
            <div class="shop-price">🪙 ${item.cost}</div>
            <div>
                <button class="btn-buy" ${isOwnedPersistent ? 'disabled' : ''} data-id="${item.id}">
                    ${isOwnedPersistent ? 'Owned' : 'Buy'}
                </button>
            </div>
        `;

        if (!isOwnedPersistent) {
            card.querySelector('.btn-buy').addEventListener('click', () => {
                if (game.stats.coins >= item.cost) {
                    game.stats.coins -= item.cost;
                    purchaseItem(game, item);
                    renderShop(game);
                    game.renderInventory();
                    game.saveGame();
                    game.updateUI();
                } else {
                    game.triggerSpeechBubble("Mew! You don't have enough coins! 🪙");
                }
            });
        }

        container.appendChild(card);
    });
}

function purchaseItem(game, item) {
    Sound.playTone(600, 'sine', 0.1);
    Sound.playTone(800, 'sine', 0.15, 0.05);
    game.createFloatingParticle('🛍️');

    if (item.type === 'food') {
        game.inventory.food[item.id] = (game.inventory.food[item.id] || 0) + 1;
        game.triggerSpeechBubble(`Bought ${item.title}! Check your Inventory.`);
        game.unlockCollectionItem('fish', item.id);
    } else if (item.type === 'toy') {
        game.inventory.toys.push(item.id);
        game.triggerSpeechBubble(`Bought ${item.title}! Permanent fun active.`);
        game.unlockCollectionItem('toys', item.id);
    } else if (item.type === 'accessory') {
        game.cosmetics.unlocked.push(item.id);
        game.triggerSpeechBubble(`Bought ${item.title}! Equip it in Closet.`);
        game.renderCloset();
        game.unlockCollectionItem('accessories', item.id);
    } else if (item.type === 'furniture') {
        game.inventory.furniture.push(item.id);
        game.triggerSpeechBubble(`Bought ${item.title}! Room decoration upgraded.`);
        game.unlockCollectionItem('furniture', item.id);
    }
}
