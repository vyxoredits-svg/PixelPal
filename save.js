/**
 * save.js - Save game state, load state, verification/repair, and import/export backup functionality
 */

import { Sound } from './audio.js';

export function saveGame(game) {
    const saveStatusEl = document.getElementById('save-status');
    const statusDot = saveStatusEl.querySelector('.status-dot');
    const statusText = saveStatusEl.querySelector('.status-text');

    statusDot.className = 'status-dot saving';
    statusText.textContent = "Saving...";

    game.history.lastLoginDate = Date.now();

    localStorage.setItem('pixelpal_stats', JSON.stringify(game.stats));
    localStorage.setItem('pixelpal_history', JSON.stringify(game.history));
    localStorage.setItem('pixelpal_achievements', JSON.stringify(game.achievements));
    localStorage.setItem('pixelpal_is_sleeping', JSON.stringify(game.isSleepingState));
    localStorage.setItem('pixelpal_cosmetics', JSON.stringify(game.cosmetics));
    localStorage.setItem('pixelpal_inventory', JSON.stringify(game.inventory));
    localStorage.setItem('pixelpal_quests', JSON.stringify(game.quests));
    localStorage.setItem('pixelpal_collection', JSON.stringify(game.collection));
    localStorage.setItem('pixelpal_prestige', JSON.stringify(game.prestige));
    localStorage.setItem('pixelpal_sound_enabled', JSON.stringify(Sound.enabled));
    localStorage.setItem('pixelpal_volume', JSON.stringify(Sound.volume));

    setTimeout(() => {
        statusDot.className = 'status-dot green';
        statusText.textContent = "Progress Saved";
    }, 800);
}

export function loadGame(game) {
    const savedStats = localStorage.getItem('pixelpal_stats');
    const savedHistory = localStorage.getItem('pixelpal_history');
    const savedAchievements = localStorage.getItem('pixelpal_achievements');
    const savedSleep = localStorage.getItem('pixelpal_is_sleeping');
    const savedCosmetics = localStorage.getItem('pixelpal_cosmetics');
    const savedInventory = localStorage.getItem('pixelpal_inventory');
    const savedQuests = localStorage.getItem('pixelpal_quests');
    const savedCollection = localStorage.getItem('pixelpal_collection');
    const savedPrestige = localStorage.getItem('pixelpal_prestige');
    const savedSoundEnabled = localStorage.getItem('pixelpal_sound_enabled');
    const savedVolume = localStorage.getItem('pixelpal_volume');

    if (savedStats) game.stats = { ...game.stats, ...JSON.parse(savedStats) };
    if (savedHistory) game.history = { ...game.history, ...JSON.parse(savedHistory) };
    if (savedAchievements) game.achievements = { ...game.achievements, ...JSON.parse(savedAchievements) };
    if (savedSleep) game.isSleepingState = JSON.parse(savedSleep);
    if (savedCosmetics) game.cosmetics = { ...game.cosmetics, ...JSON.parse(savedCosmetics) };
    if (savedInventory) game.inventory = { ...game.inventory, ...JSON.parse(savedInventory) };
    if (savedQuests) game.quests = { ...game.quests, ...JSON.parse(savedQuests) };
    if (savedCollection) game.collection = { ...game.collection, ...JSON.parse(savedCollection) };
    if (savedPrestige) game.prestige = { ...game.prestige, ...JSON.parse(savedPrestige) };

    // Save Data Validation & Hardening
    validateAndRepairState(game);

    // Load Audio volume values
    if (savedSoundEnabled !== null) {
        Sound.enabled = JSON.parse(savedSoundEnabled);
        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) soundBtn.textContent = Sound.enabled ? "🔊 Sound On" : "🔇 Muted";
    }
    if (savedVolume !== null) {
        const vol = parseFloat(savedVolume);
        Sound.volume = vol;
        const volSlider = document.getElementById('volume-slider');
        if (volSlider) volSlider.value = Math.round(vol * 100);
    }

    const now = Date.now();
    const lastLogin = game.history.lastLoginDate || now;
    const elapsedSecs = Math.floor((now - lastLogin) / 1000);

    if (elapsedSecs > 10) {
        game.processOfflineProgression(elapsedSecs);
    }

    // Daily Quest check
    const lastDate = new Date(game.quests.lastAssigned).toDateString();
    const todayDate = new Date().toDateString();
    if (lastDate !== todayDate) {
        game.resetQuests();
    }

    if (game.isSleepingState) {
        game.state = 'sleeping';
        game.dom.sleepBtnText.textContent = "Wake Up";
        game.setActionsDisabled(true);
    } else {
        game.checkStateRules();
    }

    game.renderCloset();
    game.updateUI();
    game.renderAchievements();
    game.renderShop();
    game.renderInventory();
    game.renderQuests();
    game.renderGames();
    game.renderCollection();
    game.renderPrestige();
    game.history.lastLoginDate = now;
}

export function validateAndRepairState(game) {
    // Safe boundaries checks
    const checkNumber = (val, def) => (typeof val === 'number' && !isNaN(val)) ? val : def;
    
    game.stats.hunger = Math.max(0, Math.min(100, checkNumber(game.stats.hunger, 100)));
    game.stats.happiness = Math.max(0, Math.min(100, checkNumber(game.stats.happiness, 100)));
    game.stats.energy = Math.max(0, Math.min(100, checkNumber(game.stats.energy, 100)));
    game.stats.level = Math.max(1, checkNumber(game.stats.level, 1));
    game.stats.xp = Math.max(0, checkNumber(game.stats.xp, 0));
    game.stats.xpNeeded = game.stats.level * 80;
    game.stats.coins = Math.max(0, checkNumber(game.stats.coins, 100));
    game.stats.friendshipLevel = Math.max(1, checkNumber(game.stats.friendshipLevel, 1));
    game.stats.friendshipXp = Math.max(0, checkNumber(game.stats.friendshipXp, 0));
    game.stats.friendshipXpNeeded = game.stats.friendshipLevel * 100;

    // Check array/object definitions
    if (!Array.isArray(game.cosmetics.unlocked)) game.cosmetics.unlocked = ['none'];
    if (typeof game.cosmetics.equipped !== 'string') game.cosmetics.equipped = 'none';

    if (!game.inventory.food || typeof game.inventory.food !== 'object') {
        game.inventory.food = { fish: 0, premiumFish: 0, tuna: 0, salmon: 0 };
    }
    if (!Array.isArray(game.inventory.toys)) game.inventory.toys = [];
    if (!Array.isArray(game.inventory.furniture)) game.inventory.furniture = [];

    if (!game.prestige || typeof game.prestige !== 'object') {
        game.prestige = { count: 0, multiplier: 1.0, title: 'Companion' };
    }
    game.prestige.count = Math.max(0, checkNumber(game.prestige.count, 0));
    game.prestige.multiplier = Math.max(1.0, checkNumber(game.prestige.multiplier, 1.0));
    if (typeof game.prestige.title !== 'string') game.prestige.title = 'Companion';
}

export function exportSave(game) {
    try {
        const saveData = {
            stats: game.stats,
            history: game.history,
            achievements: game.achievements,
            isSleepingState: game.isSleepingState,
            cosmetics: game.cosmetics,
            inventory: game.inventory,
            quests: game.quests,
            collection: game.collection,
            prestige: game.prestige,
            version: '2.0-polished'
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(saveData));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `pixelpal_save_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        
        game.triggerSpeechBubble("Save file exported successfully! Check your downloads folder. 📤");
    } catch (e) {
        console.error("Save export error:", e);
        alert("Could not export save. Please try again.");
    }
}

export function importSave(game, event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Verification and validation checks
            if (!importedData.stats || typeof importedData.stats.level !== 'number') {
                throw new Error("Invalid save file structure.");
            }

            // Restore
            if (importedData.stats) game.stats = importedData.stats;
            if (importedData.history) game.history = importedData.history;
            if (importedData.achievements) game.achievements = importedData.achievements;
            if (importedData.isSleepingState !== undefined) game.isSleepingState = importedData.isSleepingState;
            if (importedData.cosmetics) game.cosmetics = importedData.cosmetics;
            if (importedData.inventory) game.inventory = importedData.inventory;
            if (importedData.quests) game.quests = importedData.quests;
            if (importedData.collection) game.collection = importedData.collection;
            if (importedData.prestige) game.prestige = importedData.prestige;

            validateAndRepairState(game);
            game.saveGame();
            game.loadGame();

            game.triggerSpeechBubble("Save file imported successfully! Progress restored. 📥");
            Sound.playLevelUp();
        } catch (err) {
            console.error("Import error:", err);
            alert("Import failed. The file is either corrupted or invalid.");
        }
    };
    reader.readAsText(file);
}
