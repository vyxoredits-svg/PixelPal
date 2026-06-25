/**
 * quests.js - Daily and Weekly quests lists, progression, and rewards
 */

import { Sound } from './audio.js';

export function resetQuests(game) {
    game.quests.daily = [
        { id: 'feed3', desc: 'Feed Pixel 3 times', count: 0, target: 3, rewarded: false, type: 'coins', amt: 50 },
        { id: 'pet5', desc: 'Pet Pixel 5 times', count: 0, target: 5, rewarded: false, type: 'coins', amt: 50 },
        { id: 'play2', desc: 'Play with Pixel 2 times', count: 0, target: 2, rewarded: false, type: 'coins', amt: 50 }
    ];
    if (Date.now() - game.quests.lastAssigned > 604800000) {
        game.quests.weekly = [
            { id: 'happy100', desc: 'Reach 100 Happiness', count: 0, target: 100, rewarded: false, type: 'xp', amt: 150 },
            { id: 'earn500', desc: 'Earn 500 Coins', count: 0, target: 500, rewarded: false, type: 'coins', amt: 200 },
            { id: 'gainLvl', desc: 'Gain a level', count: 0, target: 1, rewarded: false, type: 'cosmetic', val: 'headset' }
        ];
    }
    game.quests.lastAssigned = Date.now();
    renderQuests(game);
}

export function updateQuestProgress(game, id, amount) {
    let updated = false;

    game.quests.daily.forEach(q => {
        if (q.id === id && !q.rewarded) {
            q.count = Math.min(q.target, q.count + amount);
            updated = true;
            if (q.count >= q.target) {
                claimQuestReward(game, q);
            }
        }
    });

    game.quests.weekly.forEach(q => {
        if (q.id === id && !q.rewarded) {
            if (id === 'happy100') {
                q.count = amount; 
            } else {
                q.count = Math.min(q.target, q.count + amount);
            }
            updated = true;
            if (q.count >= q.target) {
                claimQuestReward(game, q);
            }
        }
    });

    if (updated) {
        renderQuests(game);
    }
}

function claimQuestReward(game, quest) {
    quest.rewarded = true;
    Sound.playAchievement();
    game.createFloatingParticle('🏆');

    if (quest.type === 'coins') {
        game.addCoins(quest.amt);
        game.triggerSpeechBubble(`🏆 Amazing! Completed a daily quest: +${quest.amt} Coins!`);
    } else if (quest.type === 'xp') {
        game.addXP(quest.amt);
        game.triggerSpeechBubble(`🏆 Milestone reached! Weekly quest complete: +${quest.amt} XP!`);
    } else if (quest.type === 'cosmetic') {
        if (!game.cosmetics.unlocked.includes(quest.val)) {
            game.cosmetics.unlocked.push(quest.val);
            game.unlockCollectionItem('accessories', quest.val);
        }
        game.triggerSpeechBubble(`🏆 Look what you unlocked! New Hat: ${quest.val}!`);
        game.renderCloset();
    }
    game.saveGame();
}

export function renderQuests(game) {
    const dailyContainer = document.getElementById('daily-quests-container');
    const weeklyContainer = document.getElementById('weekly-quests-container');
    if (!dailyContainer || !weeklyContainer) return;

    dailyContainer.innerHTML = '';
    weeklyContainer.innerHTML = '';

    game.quests.daily.forEach(q => {
        const pct = (q.count / q.target) * 100;
        const card = document.createElement('div');
        card.className = `quest-card ${q.rewarded ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="quest-header">
                <span>${q.desc}</span>
                <span class="quest-reward">${q.rewarded ? 'Claimed 🎉' : `+🪙${q.amt}`}</span>
            </div>
            <div class="quest-progress-wrapper">
                <div class="progress-bar-bg quest-bar">
                    <div class="progress-bar-fill quest-fill" style="width: ${pct}%"></div>
                </div>
                <span>${q.count}/${q.target}</span>
            </div>
        `;
        dailyContainer.appendChild(card);
    });

    game.quests.weekly.forEach(q => {
        const pct = (q.count / q.target) * 100;
        const rewardLabel = q.type === 'coins' ? `+🪙${q.amt}` : q.type === 'xp' ? `+✨${q.amt}` : `🎁 Unlocks Hat`;
        const card = document.createElement('div');
        card.className = `quest-card ${q.rewarded ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="quest-header">
                <span>${q.desc}</span>
                <span class="quest-reward">${q.rewarded ? 'Claimed 🎉' : rewardLabel}</span>
            </div>
            <div class="quest-progress-wrapper">
                <div class="progress-bar-bg quest-bar">
                    <div class="progress-bar-fill quest-fill" style="width: ${pct}%"></div>
                </div>
                <span>${q.count}/${q.target}</span>
            </div>
        `;
        weeklyContainer.appendChild(card);
    });
}
