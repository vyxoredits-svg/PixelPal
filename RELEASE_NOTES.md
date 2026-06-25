# Release Notes - PixelPal

Detailed highlights of milestone versions throughout the development of PixelPal.

## 🚀 Version 2.2 - The PWA Release
Our most advanced update yet! Turns PixelPal into a modern, installable app for desktop and mobile.

### Highlights
* **Progressive Web App**: Linked `manifest.json` for full mobile and desktop installation.
* **Offline Caching**: Built a custom service worker (`sw.js`) to cache game layout, styling, icons, fonts, and modular JS scripts.
* **Branding Expansion**: Created professional custom launcher icons.

---

## ⚡ Version 2.1 - Modular Codebase Refactoring
Improved performance, readability, and maintainability by splitting the massive monolithic file.

### Highlights
* **Modular JavaScript**: Refactored the single `script.js` into cohesive modules (`game.js`, `audio.js`, `pet.js`, `shop.js`, `inventory.js`, `quests.js`, `minigames.js`, `save.js`, `ui.js`).
* **ES Modules**: Leveraged native browser ES Imports/Exports.
* **Aesthetic Polish**: Standardized responsive viewports.

---

## 🎨 Version 2.0 - Visual & Gameplay Overhaul
Transformed the game with rich programmatic pixel-art rendering and long-term retention features.

### Highlights
* **Advanced Pixel Art**: Introduced the `PixelCatRenderer` to render complex animations (jumping, wagging tail, sleeping curl) programmatically on a 32x32 layout.
* **Economy & Shop**: Introduced Coins, a Pet Shop, Inventory systems, and wearable Accessories.
* **Mini Games**: Added 3 interactive mini games (Catch The Fish, Chase Yarn, Memory Match).
* **Quests & Progression**: Introduced daily/weekly quest boards, friendship systems, and Prestige Rebirths.
* **Save Hardening**: Safeguarded progress with state validation/repair and JSON save import/export tools.
