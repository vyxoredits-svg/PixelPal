/**
 * PixelPal - Virtual Cat Companion (v2.1 - Release Edition)
 */

// Custom 8-bit Synthesizer Sound Manager with Volume Control
class SoundManager {
    constructor() {
        this.enabled = true;
        this.ctx = null;
        this.volume = 0.8; // default 80% volume
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.init();
        this.enabled = !this.enabled;
        return this.enabled;
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
    }

    playTone(frequency, type, duration, delay = 0) {
        if (!this.enabled) return;
        this.init();
        
        setTimeout(() => {
            try {
                const osc = this.ctx.createOscillator();
                const gainNode = this.ctx.createGain();
                
                osc.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
                osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
                
                // Base gain factored by user volume slider (max base 0.08)
                const targetGain = 0.08 * this.volume;
                gainNode.gain.setValueAtTime(targetGain, this.ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
                
                osc.connect(gainNode);
                gainNode.connect(this.ctx.destination);
                
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch (e) {
                console.warn("AudioContext playback blocked:", e);
            }
        }, delay * 1000);
    }

    playFeed() {
        this.playTone(300, 'triangle', 0.15, 0);
        this.playTone(450, 'triangle', 0.15, 0.08);
    }

    playPlay() {
        this.playTone(440, 'square', 0.1, 0);
        this.playTone(554, 'square', 0.1, 0.06);
        this.playTone(659, 'square', 0.15, 0.12);
    }

    playPet() {
        this.playTone(523, 'sine', 0.2, 0);
        this.playTone(659, 'sine', 0.2, 0.08);
    }

    playSleep() {
        this.playTone(261, 'sine', 0.4, 0);
        this.playTone(196, 'sine', 0.4, 0.2);
    }

    playLevelUp() {
        const notes = [523, 587, 659, 698, 784, 880, 987, 1046];
        notes.forEach((freq, index) => {
            this.playTone(freq, 'square', 0.15, index * 0.06);
        });
    }

    playAchievement() {
        this.playTone(587, 'square', 0.1, 0);
        this.playTone(880, 'square', 0.1, 0.08);
        this.playTone(1174, 'square', 0.25, 0.16);
    }
}

// Global Sound Instance
const Sound = new SoundManager();

// Color Palette definitions
const COLORS = {
    outline: '#22152b',   
    bodyPurple: '#d8b4fe', 
    patternPurple: '#a78bfa', 
    bellyCream: '#fef08a',  
    pink: '#fca5a5',      
    eye: '#22152b',       
    eyeClosed: '#a78bfa', 
    collar: '#ec4899',    
    bell: '#fbbf24',      
    toy: '#3b82f6',       
    food: '#f97316',      
    shadow: 'rgba(0, 0, 0, 0.35)',
    glowCyan: '#22d3ee',  
    glowPink: '#f472b6'   
};

// 32x32 Pixel Renderer for Advanced Art Styles
class PixelCatRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.pixelSize = 6; 
        this.offsetX = 32;
        this.offsetY = 32;
        this.tick = 0;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawPixel(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            this.offsetX + x * this.pixelSize,
            this.offsetY + y * this.pixelSize,
            this.pixelSize,
            this.pixelSize
        );
    }

    render(state, isActionActive = false, actionType = '', level = 1, equippedCosmetic = 'none', ownedFurniture = []) {
        this.clear();
        this.tick++;

        // Draw Background and Custom Furniture
        this.drawBackground(state, level, ownedFurniture);

        // Frame calculations
        const isBlinking = this.tick % 180 < 10; 
        const breathingOffset = Math.sin(this.tick * 0.05) > 0 ? 1 : 0;
        const tailWag = Math.sin(this.tick * (state === 'happy' ? 0.15 : 0.05)) > 0 ? 1 : -1;

        // Draw shadow under the cat
        this.drawShadow(state, breathingOffset);

        // Calculate growth stage: 0=Kitten (1-4), 1=Older Kitten (5-9), 2=Adult (10-19), 3=Evolved (20+)
        let stage = 0;
        if (level >= 5 && level < 10) stage = 1;
        else if (level >= 10 && level < 20) stage = 2;
        else if (level >= 20) stage = 3;

        // Draw detailed cat parts programmatically
        this.drawDetailedCat(stage, state, this.tick, breathingOffset, tailWag, isBlinking, isActionActive, actionType, equippedCosmetic);

        // State particles
        if (state === 'sleeping') {
            this.drawSleepParticles();
        } else if (state === 'hungry') {
            this.drawHungryBubble();
        } else if (state === 'happy') {
            this.drawHearts();
        }

        // Draw temporary action animations
        if (isActionActive) {
            if (actionType === 'feed') {
                this.drawFeedingAnimation();
            } else if (actionType === 'play') {
                this.drawPlayingAnimation();
            }
        }
    }

    drawBackground(state, level, ownedFurniture) {
        const hours = new Date().getHours();
        const isNight = hours < 6 || hours >= 18;

        const weatherIndex = Math.floor(Date.now() / 180000) % 3;
        const weathers = ['sunny', 'rainy', 'snowy'];
        const weather = weathers[weatherIndex];

        // Sky Background
        this.ctx.fillStyle = isNight ? '#0b071e' : '#bae6fd'; 
        this.ctx.fillRect(180, 20, 50, 60);

        if (isNight) {
            this.ctx.fillStyle = '#fef08a';
            this.ctx.beginPath();
            this.ctx.arc(215, 38, 7, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(190, 30, 2, 2);
            this.ctx.fillRect(195, 55, 1, 1);
            this.ctx.fillRect(205, 65, 2, 2);
        } else {
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.beginPath();
            this.ctx.arc(205, 40, 9, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(185, 48, 15, 5);
            this.ctx.fillRect(192, 44, 10, 7);
        }

        // Window Weather
        if (weather === 'rainy') {
            this.ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
            for (let i = 0; i < 4; i++) {
                const rx = 180 + ((Date.now() / 40 + i * 15) % 45);
                const ry = 20 + ((Date.now() / 25 + i * 20) % 55);
                this.ctx.fillRect(rx, ry, 1, 4);
            }
        } else if (weather === 'snowy') {
            this.ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 4; i++) {
                const sx = 180 + ((Date.now() / 80 + i * 12) % 48);
                const sy = 20 + ((Date.now() / 50 + i * 15) % 55);
                this.ctx.fillRect(sx, sy, 2, 2);
            }
        }

        // Window Frame
        this.ctx.strokeStyle = '#5b21b6';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(180, 20, 50, 60);
        this.ctx.beginPath();
        this.ctx.moveTo(205, 20);
        this.ctx.lineTo(205, 80);
        this.ctx.moveTo(180, 50);
        this.ctx.lineTo(230, 50);
        this.ctx.stroke();

        // Wallpaper details if level >= 10
        if (level >= 10) {
            this.ctx.fillStyle = 'rgba(139, 92, 246, 0.05)';
            for (let x = 20; x < this.canvas.width; x += 30) {
                for (let y = 15; y < 180; y += 30) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y);
                    this.ctx.lineTo(x + 8, y + 8);
                    this.ctx.lineTo(x, y + 16);
                    this.ctx.lineTo(x - 8, y + 8);
                    this.ctx.closePath();
                    this.ctx.fill();
                }
            }
        }

        // Window Perch
        if (ownedFurniture.includes('windowPerch')) {
            this.ctx.fillStyle = '#b45309'; 
            this.ctx.fillRect(170, 75, 70, 6);
            this.ctx.fillStyle = '#a78bfa'; 
            this.ctx.fillRect(175, 71, 60, 4);
        }

        // Hanging Plant (Visual perk of Window Perch/Level)
        if (level >= 10 || ownedFurniture.includes('windowPerch')) {
            this.ctx.fillStyle = '#10b981';
            this.ctx.beginPath();
            this.ctx.arc(35, 40, 10, 0, 2*Math.PI);
            this.ctx.arc(28, 48, 8, 0, 2*Math.PI);
            this.ctx.arc(42, 48, 8, 0, 2*Math.PI);
            this.ctx.fill();
            this.ctx.fillStyle = '#d97706';
            this.ctx.fillRect(30, 52, 10, 8);
        }

        // Scratching Tower
        if (ownedFurniture.includes('scratchingTower')) {
            this.ctx.fillStyle = '#4c1d95'; 
            this.ctx.fillRect(15, 100, 25, 50);
            this.ctx.fillStyle = '#6d28d9';
            this.ctx.fillRect(10, 95, 35, 6);
            this.ctx.fillStyle = '#a78bfa';
            this.ctx.fillRect(20, 75, 15, 20);
            this.ctx.fillStyle = '#34d399'; 
            this.ctx.fillRect(17, 70, 21, 5);
        } else if (level >= 5) {
            this.ctx.fillStyle = '#78350f'; 
            this.ctx.fillRect(15, 140, 22, 6);
            this.ctx.fillStyle = '#b45309'; 
            this.ctx.fillRect(23, 110, 6, 30);
        }

        // Cat Bed
        if (ownedFurniture.includes('betterBed')) {
            this.ctx.fillStyle = '#a855f7'; 
            this.ctx.beginPath();
            this.ctx.ellipse(40, 160, 24, 10, 0, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.fillStyle = '#fef08a'; 
            this.ctx.beginPath();
            this.ctx.ellipse(40, 160, 18, 6, 0, 0, 2 * Math.PI);
            this.ctx.fill();
        }

        // Rug Upgrades
        let rugColor1 = 'rgba(139, 92, 246, 0.15)';
        let rugColor2 = 'rgba(139, 92, 246, 0.3)';

        if (ownedFurniture.includes('luxuryRug')) {
            rugColor1 = 'rgba(217, 70, 239, 0.25)';
            rugColor2 = 'rgba(251, 191, 36, 0.45)';
        } else if (level >= 10) {
            rugColor1 = 'rgba(59, 130, 246, 0.22)';
            rugColor2 = 'rgba(59, 130, 246, 0.4)';
        } else if (level >= 5) {
            rugColor1 = 'rgba(236, 72, 153, 0.18)';
            rugColor2 = 'rgba(236, 72, 153, 0.35)';
        }

        this.ctx.fillStyle = rugColor1;
        this.ctx.beginPath();
        this.ctx.ellipse(this.canvas.width / 2, this.offsetY + 115, 70, 16, 0, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.strokeStyle = rugColor2;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawShadow(state, breathingOffset) {
        this.ctx.fillStyle = COLORS.shadow;
        this.ctx.beginPath();
        const baseW = state === 'sleeping' ? 45 : 35;
        const breathW = (state !== 'sleeping') ? breathingOffset * 2 : 0;
        this.ctx.ellipse(
            this.canvas.width / 2, 
            this.offsetY + 115, 
            baseW + breathW, 
            7, 
            0, 0, 2 * Math.PI
        );
        this.ctx.fill();
    }

    drawDetailedCat(stage, state, tick, breathingOffset, tailWag, isBlinking, isActionActive, actionType, equippedCosmetic) {
        let bodyX = 9;
        let bodyY = 12;
        let headX = 10;
        let headY = 4;

        const headW = stage === 0 ? 10 : stage === 1 ? 11 : 12;
        const headH = stage === 0 ? 8 : stage === 1 ? 9 : 9;
        const bodyW = stage === 0 ? 11 : stage === 1 ? 13 : 15;
        const bodyH = stage === 0 ? 8 : stage === 1 ? 9 : 10;

        if (state === 'sleeping') {
            this.drawCurledSleepingCat(stage, tick, breathingOffset);
            return;
        }

        if (state === 'playing' || (isActionActive && actionType === 'play')) {
            this.drawPlayingCrouchingCat(stage, tick);
            return;
        }

        let headYShift = breathingOffset;
        let bodyYShift = 0;

        if (state === 'hungry') {
            headYShift += 1;
        } else if (state === 'sleepy') {
            headYShift += 1;
        } else if (state === 'happy') {
            headYShift += Math.sin(tick * 0.06) > 0 ? 1 : 0;
            bodyYShift += Math.sin(tick * 0.06 - 0.5) > 0 ? 1 : 0;
        }

        let jumpOffset = 0;
        if (state === 'levelUp' || (isActionActive && actionType === 'levelUp')) {
            jumpOffset = -5 + Math.floor(Math.sin(tick * 0.06) * 3);
        } else if (state === 'happy' && tick % 120 < 20) {
            const jumpProgress = (tick % 120) / 20;
            jumpOffset = Math.floor(Math.sin(jumpProgress * Math.PI) * -5);
        }

        headY += headYShift + jumpOffset;
        bodyY += bodyYShift + jumpOffset;

        this.drawCatTail(stage, state, tick, tailWag, bodyX, bodyY, bodyW, bodyH);

        if (stage === 3) {
            this.drawEvolvedWings(tick, bodyX, bodyY, bodyW, bodyH);
        }

        this.drawCatBodyShape(stage, state, bodyX, bodyY, bodyW, bodyH);
        this.drawCatHeadShape(stage, state, headX, headY, headW, headH, isBlinking, tick, headYShift);

        if (stage >= 2) {
            this.drawCatWhiskers(stage, state, headX, headY, headW, headH, tick);
        }

        this.drawCosmetics(stage, state, headX, headY, headW, headH, equippedCosmetic, headYShift);
    }

    drawCatBodyShape(stage, state, bx, by, bw, bh) {
        for (let y = 0; y < bh; y++) {
            for (let x = 0; x < bw; x++) {
                const isBorder = (x === 0 || x === bw - 1 || y === 0 || y === bh - 1);
                if ((x === 0 || x === bw - 1) && (y === 0 || y === bh - 1)) continue;

                if (isBorder) {
                    this.drawPixel(bx + x, by + y, COLORS.outline);
                } else {
                    const isBelly = (y >= Math.floor(bh * 0.4) && x >= Math.floor(bw * 0.3) && x <= Math.floor(bw * 0.65));
                    const isStripe = (x === 2 || x === bw - 3) && (y === 2 || y === 5);
                    const mainColor = stage === 3 ? COLORS.glowCyan : COLORS.bodyPurple;
                    const stripeColor = stage === 3 ? COLORS.glowPink : COLORS.patternPurple;

                    if (isBelly) {
                        this.drawPixel(bx + x, by + y, COLORS.bellyCream);
                    } else if (isStripe) {
                        this.drawPixel(bx + x, by + y, stripeColor);
                    } else {
                        this.drawPixel(bx + x, by + y, mainColor);
                    }
                }
            }
        }

        const footY = by + bh - 1;
        this.drawPixel(bx + 2, footY, COLORS.outline);
        this.drawPixel(bx + 3, footY, COLORS.outline);
        this.drawPixel(bx + bw - 4, footY, COLORS.outline);
        this.drawPixel(bx + bw - 3, footY, COLORS.outline);
        
        this.drawPixel(bx + 2, footY + 1, COLORS.outline);
        this.drawPixel(bx + 3, footY + 1, COLORS.outline);
        this.drawPixel(bx + bw - 4, footY + 1, COLORS.outline);
        this.drawPixel(bx + bw - 3, footY + 1, COLORS.outline);
    }

    drawCatHeadShape(stage, state, hx, hy, hw, hh, isBlinking, tick, headYShift) {
        this.drawPixel(hx + 1, hy - 2, COLORS.outline);
        this.drawPixel(hx + 2, hy - 2, COLORS.outline);
        this.drawPixel(hx, hy - 1, COLORS.outline);
        this.drawPixel(hx + 1, hy - 1, COLORS.pink);
        this.drawPixel(hx + 2, hy - 1, stage === 3 ? COLORS.glowCyan : COLORS.bodyPurple);
        this.drawPixel(hx + 3, hy - 1, COLORS.outline);
        
        this.drawPixel(hx + hw - 3, hy - 2, COLORS.outline);
        this.drawPixel(hx + hw - 2, hy - 2, COLORS.outline);
        this.drawPixel(hx + hw - 4, hy - 1, COLORS.outline);
        this.drawPixel(hx + hw - 3, hy - 1, stage === 3 ? COLORS.glowCyan : COLORS.bodyPurple);
        this.drawPixel(hx + hw - 2, hy - 1, COLORS.pink);
        this.drawPixel(hx + hw - 1, hy - 1, COLORS.outline);

        for (let y = 0; y < hh; y++) {
            for (let x = 0; x < hw; x++) {
                const isBorder = (x === 0 || x === hw - 1 || y === 0 || y === hh - 1);
                if ((x === 0 || x === hw - 1) && (y === 0 || y === hh - 1)) continue;

                if (isBorder) {
                    this.drawPixel(hx + x, hy + y, COLORS.outline);
                } else {
                    const isCheekStripe = (y === 4 || y === 5) && (x === 1 || x === hw - 2);
                    const mainColor = stage === 3 ? COLORS.glowCyan : COLORS.bodyPurple;
                    const stripeColor = stage === 3 ? COLORS.glowPink : COLORS.patternPurple;

                    if (isCheekStripe) {
                        this.drawPixel(hx + x, hy + y, stripeColor);
                    } else {
                        this.drawPixel(hx + x, hy + y, mainColor);
                    }
                }
            }
        }

        const eyeY = hy + Math.floor(hh * 0.45);
        const cheekY = eyeY + 1;
        const eyeX1 = hx + 2;
        const eyeX2 = hx + hw - 4;

        this.drawPixel(hx + 1, cheekY, COLORS.pink);
        this.drawPixel(hx + hw - 2, cheekY, COLORS.pink);

        const noseX = hx + Math.floor(hw / 2);
        this.drawPixel(noseX, eyeY + 1, COLORS.pink);

        if (state === 'happy') {
            this.drawPixel(eyeX1, eyeY, COLORS.outline);
            this.drawPixel(eyeX1 + 1, eyeY - 1, COLORS.outline);
            this.drawPixel(eyeX1 + 2, eyeY, COLORS.outline);
            
            this.drawPixel(eyeX2, eyeY, COLORS.outline);
            this.drawPixel(eyeX2 + 1, eyeY - 1, COLORS.outline);
            this.drawPixel(eyeX2 + 2, eyeY, COLORS.outline);

            this.drawPixel(noseX - 1, eyeY + 2, COLORS.outline);
            this.drawPixel(noseX, eyeY + 3, COLORS.pink);
            this.drawPixel(noseX + 1, eyeY + 2, COLORS.outline);
        } else if (state === 'hungry' || state === 'sleepy') {
            this.drawPixel(eyeX1, eyeY, COLORS.outline);
            this.drawPixel(eyeX1 + 1, eyeY, COLORS.outline);
            this.drawPixel(eyeX2 + 1, eyeY, COLORS.outline);
            this.drawPixel(eyeX2 + 2, eyeY, COLORS.outline);
            this.drawPixel(noseX, eyeY + 2, COLORS.outline);
        } else {
            if (isBlinking) {
                this.drawPixel(eyeX1, eyeY, COLORS.eyeClosed);
                this.drawPixel(eyeX1 + 1, eyeY, COLORS.eyeClosed);
                this.drawPixel(eyeX2 + 1, eyeY, COLORS.eyeClosed);
                this.drawPixel(eyeX2 + 2, eyeY, COLORS.eyeClosed);
            } else {
                this.drawPixel(eyeX1, eyeY, COLORS.eye);
                this.drawPixel(eyeX1, eyeY - 1, COLORS.eye);
                this.drawPixel(eyeX1 + 1, eyeY, COLORS.eye);
                
                this.drawPixel(eyeX2 + 1, eyeY, COLORS.eye);
                this.drawPixel(eyeX2 + 2, eyeY, COLORS.eye);
                this.drawPixel(eyeX2 + 2, eyeY - 1, COLORS.eye);
            }
            this.drawPixel(noseX - 1, eyeY + 2, COLORS.outline);
            this.drawPixel(noseX, eyeY + 2, COLORS.outline);
            this.drawPixel(noseX + 1, eyeY + 2, COLORS.outline);
        }
    }

    drawCatTail(stage, state, tick, tailWag, bx, by, bw, bh) {
        let wagOffset = (state === 'happy') ? tailWag * 2 : tailWag;
        const tx = bx;
        const ty = by + bh - 4;

        const segments = [
            { dx: -1, dy: 1 },
            { dx: -2, dy: 0 },
            { dx: -3, dy: -1 },
            { dx: -3, dy: -2 },
            { dx: -4, dy: -3 }
        ];

        segments.forEach((seg, idx) => {
            const actualX = tx + seg.dx + (idx > 2 ? wagOffset : 0);
            const actualY = ty + seg.dy;
            this.drawPixel(actualX, actualY, COLORS.outline);
            this.drawPixel(actualX + 1, actualY, stage === 3 ? COLORS.glowCyan : COLORS.bodyPurple);
        });
    }

    drawEvolvedWings(tick, bx, by, bw, bh) {
        const w1x = bx - 2;
        const w1y = by + 2 + Math.floor(Math.sin(tick * 0.03) * 1.5);

        this.drawPixel(w1x, w1y, COLORS.outline);
        this.drawPixel(w1x - 1, w1y - 1, COLORS.glowPink);
        this.drawPixel(w1x - 2, w1y - 1, COLORS.glowPink);
        this.drawPixel(w1x - 1, w1y, COLORS.glowPink);
        this.drawPixel(w1x - 2, w1y + 1, COLORS.outline);

        const w2x = bx + bw + 1;
        const w2y = by + 2 + Math.floor(Math.sin(tick * 0.03) * 1.5);
        this.drawPixel(w2x, w2y, COLORS.outline);
        this.drawPixel(w2x + 1, w2y - 1, COLORS.glowPink);
        this.drawPixel(w2x + 2, w2y - 1, COLORS.glowPink);
        this.drawPixel(w2x + 1, w2y, COLORS.glowPink);
        this.drawPixel(w2x + 2, w2y + 1, COLORS.outline);
    }

    drawCatWhiskers(stage, state, hx, hy, hw, hh, tick) {
        const whiskerY = hy + 5;
        const twitch = (state === 'happy') ? Math.sin(tick * 0.06) > 0 ? 1 : 0 : 0;

        this.drawPixel(hx - 1, whiskerY, COLORS.outline);
        this.drawPixel(hx - 2, whiskerY - 1 + twitch, COLORS.outline);
        this.drawPixel(hx - 1, whiskerY + 2, COLORS.outline);
        this.drawPixel(hx - 2, whiskerY + 2 + twitch, COLORS.outline);

        this.drawPixel(hx + hw, whiskerY, COLORS.outline);
        this.drawPixel(hx + hw + 1, whiskerY - 1 + twitch, COLORS.outline);
        this.drawPixel(hx + hw, whiskerY + 2, COLORS.outline);
        this.drawPixel(hx + hw + 1, whiskerY + 2 + twitch, COLORS.outline);
    }

    drawCurledSleepingCat(stage, tick, breathingOffset) {
        const bx = 10;
        const by = 13 + breathingOffset;
        const bodyW = stage === 0 ? 12 : stage === 1 ? 14 : 16;
        const bodyH = stage === 0 ? 7 : stage === 1 ? 8 : 9;

        for (let y = 0; y < bodyH; y++) {
            for (let x = 0; x < bodyW; x++) {
                const isBorder = (x === 0 || x === bodyW - 1 || y === 0 || y === bodyH - 1);
                if ((x === 0 || x === bodyW - 1) && (y === 0 || y === bodyH - 1)) continue;

                if (isBorder) {
                    this.drawPixel(bx + x, by + y, COLORS.outline);
                } else {
                    const mainColor = stage === 3 ? COLORS.glowCyan : COLORS.bodyPurple;
                    this.drawPixel(bx + x, by + y, mainColor);
                }
            }
        }

        const eyeY = by + 2;
        this.drawPixel(bx + 4, eyeY, COLORS.eyeClosed);
        this.drawPixel(bx + 5, eyeY, COLORS.eyeClosed);
        this.drawPixel(bx + 8, eyeY, COLORS.eyeClosed);
        this.drawPixel(bx + 9, eyeY, COLORS.eyeClosed);

        this.drawPixel(bx + 2, by - 1, COLORS.outline);
        this.drawPixel(bx + 2, by, COLORS.pink);
        this.drawPixel(bx + bodyW - 3, by - 1, COLORS.outline);
        this.drawPixel(bx + bodyW - 3, by, COLORS.pink);
        
        for (let x = 0; x < 6; x++) {
            this.drawPixel(bx + 3 + x, by + bodyH, COLORS.outline);
        }
    }

    drawPlayingCrouchingCat(stage, tick) {
        const bx = 8;
        const by = 14;
        const bw = stage === 0 ? 13 : stage === 1 ? 15 : 17;
        const bh = stage === 0 ? 6 : stage === 1 ? 7 : 8;

        for (let y = 0; y < bh; y++) {
            for (let x = 0; x < bw; x++) {
                const isBorder = (x === 0 || x === bw - 1 || y === 0 || y === bh - 1);
                if ((x === 0 || x === bw - 1) && (y === 0 || y === bh - 1)) continue;

                if (isBorder) {
                    this.drawPixel(bx + x, by + y, COLORS.outline);
                } else {
                    const mainColor = stage === 3 ? COLORS.glowCyan : COLORS.bodyPurple;
                    this.drawPixel(bx + x, by + y, mainColor);
                }
            }
        }

        const eyeY = by + 2;
        this.drawPixel(bx + 3, eyeY, COLORS.outline);
        this.drawPixel(bx + 8, eyeY, COLORS.outline);
        this.drawPixel(bx + 5, eyeY + 1, COLORS.pink); 

        const tx = bx;
        const ty = by + 2;
        this.drawPixel(tx - 1, ty, COLORS.outline);
        this.drawPixel(tx - 2, ty - 1, COLORS.outline);
        this.drawPixel(tx - 2, ty - 2, COLORS.outline);
        this.drawPixel(tx - 1, ty - 3, COLORS.outline);
    }

    drawSleepParticles() {
        const offset = Math.floor(this.tick / 18) % 3;
        const sx = 22;
        const sy = 8;
        this.ctx.fillStyle = COLORS.patternPurple;
        this.ctx.font = '12px "Press Start 2P", monospace';
        this.ctx.fillText('Z', sx + offset * 8, sy - offset * 6);
    }

    drawHungryBubble() {
        const bx = 22;
        const by = 8;
        
        this.drawPixel(bx, by, COLORS.outline);
        this.drawPixel(bx + 1, by - 1, COLORS.outline);
        this.drawPixel(bx + 2, by - 1, COLORS.outline);
        this.drawPixel(bx + 3, by, COLORS.outline);
        this.drawPixel(bx + 2, by + 1, COLORS.outline);
        this.drawPixel(bx + 1, by + 1, COLORS.outline);

        this.drawPixel(bx + 1, by, COLORS.food);
        this.drawPixel(bx + 2, by, COLORS.food);
    }

    drawHearts() {
        const offset = Math.floor(this.tick / 20) % 4;
        const h1x = 4 + offset * 2;
        const h1y = 6 - offset * 3;
        const h2x = 26 - offset * 2;
        const h2y = 6 - offset * 3;
        
        this.drawPixel(h1x, h1y, COLORS.collar);
        this.drawPixel(h1x - 1, h1y - 1, COLORS.collar);
        this.drawPixel(h1x + 1, h1y - 1, COLORS.collar);
        
        this.drawPixel(h2x, h2y, COLORS.collar);
        this.drawPixel(h2x - 1, h2y - 1, COLORS.collar);
        this.drawPixel(h2x + 1, h2y - 1, COLORS.collar);
    }

    drawFeedingAnimation() {
        const duration = 36; // half updates because of 30fps throttle
        const t = Math.min(1, (this.actionTick || 0) / duration);
        const fx = Math.round(25 - t * 11);
        const fy = 11;
        
        if (t < 0.8) {
            this.drawPixel(fx, fy, COLORS.food);
            this.drawPixel(fx + 1, fy, COLORS.food);
            this.drawPixel(fx + 2, fy - 1, COLORS.food);
            this.drawPixel(fx + 2, fy + 1, COLORS.food);
            this.drawPixel(fx + 3, fy, COLORS.outline); 
        } else if (t < 1.0) {
            this.drawPixel(14, 11, COLORS.food);
            this.drawPixel(13, 12, COLORS.food);
        }
    }

    drawPlayingAnimation() {
        const duration = 36;
        const t = Math.min(1, (this.actionTick || 0) / duration);
        const bx = Math.round(22 + Math.sin(t * Math.PI * 4) * 4);
        const by = 16;
        
        this.drawPixel(bx, by, COLORS.toy);
        this.drawPixel(bx + 1, by, COLORS.toy);
        this.drawPixel(bx, by + 1, COLORS.toy);
        this.drawPixel(bx + 1, by + 1, COLORS.toy);
        
        this.drawPixel(bx - 1, by, COLORS.outline);
        this.drawPixel(bx + 2, by + 1, COLORS.outline);
    }

    drawCosmetics(stage, state, headX, headY, headW, headH, equippedCosmetic, breathingOffset) {
        if (equippedCosmetic === 'none') return;

        const hatX = headX + Math.floor(headW / 2);
        const hatY = headY;

        if (equippedCosmetic === 'bowTie') {
            const neckX = headX + Math.floor(headW / 2);
            const neckY = headY + headH;
            
            this.drawPixel(neckX - 2, neckY, '#ec4899');
            this.drawPixel(neckX - 1, neckY, '#f472b6');
            this.drawPixel(neckX, neckY, '#ffffff'); 
            this.drawPixel(neckX + 1, neckY, '#f472b6');
            this.drawPixel(neckX + 2, neckY, '#ec4899');
            
            this.drawPixel(neckX - 3, neckY, '#22152b');
            this.drawPixel(neckX + 3, neckY, '#22152b');
        }

        if (equippedCosmetic === 'wizardHat') {
            const startY = hatY - 1;
            for (let i = 0; i < 5; i++) {
                const w = 5 - i;
                const hY = startY - i;
                const hX = hatX - Math.floor(w / 2);
                for (let x = 0; x < w; x++) {
                    this.drawPixel(hX + x, hY, i === 0 ? '#1e3a8a' : '#3b82f6');
                }
                this.drawPixel(hX - 1, hY, '#22152b');
                this.drawPixel(hX + w, hY, '#22152b');
            }
            this.drawPixel(hatX, startY - 5, '#fbbf24'); 
        }

        if (equippedCosmetic === 'fedora') {
            const startY = hatY - 1;
            for (let x = -3; x <= 3; x++) {
                this.drawPixel(hatX + x, startY, '#374151');
            }
            this.drawPixel(hatX - 4, startY, '#22152b');
            this.drawPixel(hatX + 4, startY, '#22152b');

            for (let y = 1; y <= 2; y++) {
                const w = 5;
                const hX = hatX - 2;
                for (let x = 0; x < w; x++) {
                    this.drawPixel(hX + x, startY - y, y === 1 ? '#ef4444' : '#1f2937'); 
                }
                this.drawPixel(hX - 1, startY - y, '#22152b');
                this.drawPixel(hX + w, startY - y, '#22152b');
            }
            for (let x = -2; x <= 2; x++) {
                this.drawPixel(hatX + x, startY - 3, '#22152b');
            }
        }

        if (equippedCosmetic === 'crown') {
            const startY = hatY - 1;
            for (let x = -2; x <= 2; x++) {
                this.drawPixel(hatX + x, startY, '#d97706');
                this.drawPixel(hatX + x, startY - 1, '#f59e0b');
            }
            this.drawPixel(hatX - 3, startY, '#22152b');
            this.drawPixel(hatX + 3, startY, '#22152b');

            this.drawPixel(hatX - 2, startY - 2, '#ef4444'); 
            this.drawPixel(hatX, startY - 2, '#3b82f6'); 
            this.drawPixel(hatX + 2, startY - 2, '#ef4444');
            
            this.drawPixel(hatX - 2, startY - 3, '#22152b');
            this.drawPixel(hatX, startY - 3, '#22152b');
            this.drawPixel(hatX + 2, startY - 3, '#22152b');
        }

        if (equippedCosmetic === 'headset') {
            this.drawPixel(headX - 1, headY + 3, '#06b6d4');
            this.drawPixel(headX - 1, headY + 4, '#06b6d4');
            this.drawPixel(headX - 2, headY + 3, '#22152b');
            this.drawPixel(headX - 2, headY + 4, '#22152b');

            this.drawPixel(headX + headW, headY + 3, '#06b6d4');
            this.drawPixel(headX + headW, headY + 4, '#06b6d4');
            this.drawPixel(headX + headW + 1, headY + 3, '#22152b');
            this.drawPixel(headX + headW + 1, headY + 4, '#22152b');

            for (let x = 0; x < headW; x++) {
                this.drawPixel(headX + x, headY - 1, '#22152b');
            }
        }
    }
}

// ----------------------------------------------------
// Game Logic and Offline State Manager
// ----------------------------------------------------

class PixelPal {
    constructor() {
        this.stats = {
            hunger: 100,
            happiness: 100,
            energy: 100,
            level: 1,
            xp: 0,
            xpNeeded: 80, // Balanced starting XP
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

        // Developer panel badge tracker
        this.badgeClicks = 0;

        // Onboarding Tutorial steps
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

        if (savedStats) this.stats = { ...this.stats, ...JSON.parse(savedStats) };
        if (savedHistory) this.history = { ...this.history, ...JSON.parse(savedHistory) };
        if (savedAchievements) this.achievements = { ...this.achievements, ...JSON.parse(savedAchievements) };
        if (savedSleep) this.isSleepingState = JSON.parse(savedSleep);
        if (savedCosmetics) this.cosmetics = { ...this.cosmetics, ...JSON.parse(savedCosmetics) };
        if (savedInventory) this.inventory = { ...this.inventory, ...JSON.parse(savedInventory) };
        if (savedQuests) this.quests = { ...this.quests, ...JSON.parse(savedQuests) };
        if (savedCollection) this.collection = { ...this.collection, ...JSON.parse(savedCollection) };
        if (savedPrestige) this.prestige = { ...this.prestige, ...JSON.parse(savedPrestige) };

        // Save Data Validation & Hardening
        this.validateAndRepairState();

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
        const lastLogin = this.history.lastLoginDate || now;
        const elapsedSecs = Math.floor((now - lastLogin) / 1000);

        if (elapsedSecs > 10) {
            this.processOfflineProgression(elapsedSecs);
        }

        // Daily Quest check
        const lastDate = new Date(this.quests.lastAssigned).toDateString();
        const todayDate = new Date().toDateString();
        if (lastDate !== todayDate) {
            this.resetQuests();
        }

        if (this.isSleepingState) {
            this.state = 'sleeping';
            this.dom.sleepBtnText.textContent = "Wake Up";
            this.setActionsDisabled(true);
        } else {
            this.checkStateRules();
        }

        this.renderCloset();
        this.updateUI();
        this.renderAchievements();
        this.renderShop();
        this.renderInventory();
        this.renderQuests();
        this.renderGames();
        this.renderCollection();
        this.renderPrestige();
        this.history.lastLoginDate = now;
    }

    validateAndRepairState() {
        // Safe boundaries checks
        const checkNumber = (val, def) => (typeof val === 'number' && !isNaN(val)) ? val : def;
        
        this.stats.hunger = Math.max(0, Math.min(100, checkNumber(this.stats.hunger, 100)));
        this.stats.happiness = Math.max(0, Math.min(100, checkNumber(this.stats.happiness, 100)));
        this.stats.energy = Math.max(0, Math.min(100, checkNumber(this.stats.energy, 100)));
        this.stats.level = Math.max(1, checkNumber(this.stats.level, 1));
        this.stats.xp = Math.max(0, checkNumber(this.stats.xp, 0));
        this.stats.xpNeeded = this.stats.level * 80;
        this.stats.coins = Math.max(0, checkNumber(this.stats.coins, 100));
        this.stats.friendshipLevel = Math.max(1, checkNumber(this.stats.friendshipLevel, 1));
        this.stats.friendshipXp = Math.max(0, checkNumber(this.stats.friendshipXp, 0));
        this.stats.friendshipXpNeeded = this.stats.friendshipLevel * 100;

        // Check array/object definitions
        if (!Array.isArray(this.cosmetics.unlocked)) this.cosmetics.unlocked = ['none'];
        if (typeof this.cosmetics.equipped !== 'string') this.cosmetics.equipped = 'none';

        if (!this.inventory.food || typeof this.inventory.food !== 'object') {
            this.inventory.food = { fish: 0, premiumFish: 0, tuna: 0, salmon: 0 };
        }
        if (!Array.isArray(this.inventory.toys)) this.inventory.toys = [];
        if (!Array.isArray(this.inventory.furniture)) this.inventory.furniture = [];

        if (!this.prestige || typeof this.prestige !== 'object') {
            this.prestige = { count: 0, multiplier: 1.0, title: 'Companion' };
        }
        this.prestige.count = Math.max(0, checkNumber(this.prestige.count, 0));
        this.prestige.multiplier = Math.max(1.0, checkNumber(this.prestige.multiplier, 1.0));
        if (typeof this.prestige.title !== 'string') this.prestige.title = 'Companion';
    }

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

    saveGame() {
        const saveStatusEl = document.getElementById('save-status');
        const statusDot = saveStatusEl.querySelector('.status-dot');
        const statusText = saveStatusEl.querySelector('.status-text');

        statusDot.className = 'status-dot saving';
        statusText.textContent = "Saving...";

        this.history.lastLoginDate = Date.now();

        localStorage.setItem('pixelpal_stats', JSON.stringify(this.stats));
        localStorage.setItem('pixelpal_history', JSON.stringify(this.history));
        localStorage.setItem('pixelpal_achievements', JSON.stringify(this.achievements));
        localStorage.setItem('pixelpal_is_sleeping', JSON.stringify(this.isSleepingState));
        localStorage.setItem('pixelpal_cosmetics', JSON.stringify(this.cosmetics));
        localStorage.setItem('pixelpal_inventory', JSON.stringify(this.inventory));
        localStorage.setItem('pixelpal_quests', JSON.stringify(this.quests));
        localStorage.setItem('pixelpal_collection', JSON.stringify(this.collection));
        localStorage.setItem('pixelpal_prestige', JSON.stringify(this.prestige));
        localStorage.setItem('pixelpal_sound_enabled', JSON.stringify(Sound.enabled));
        localStorage.setItem('pixelpal_volume', JSON.stringify(Sound.volume));

        setTimeout(() => {
            statusDot.className = 'status-dot green';
            statusText.textContent = "Progress Saved";
        }, 800);
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

    // Optimized 30FPS Throttle Loop for Rendering
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
            this.triggerSpeechBubble(`✨ LEVEL UP! Pixel is now level ${this.stats.level}! (+${levelCoins} coins) 🎉`);
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
            this.triggerSpeechBubble(`🤝 Friend Rank Up! Friendship Level is now ${this.stats.friendshipLevel}! ❤️`);
            this.createFloatingParticle('💖');
            
            if (this.stats.friendshipLevel === 5) {
                this.messages.push("Mew! You are my absolute best friend in the universe!");
                this.notifyAchievementUnlock("Best Friend Milestones", "Unlocked special messages.");
            }
        }
        this.updateUI();
    }

    // Quick Actions
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
        this.addFriendshipXp(10); // Balanced friendship
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
        const container = document.getElementById('shop-container');
        if (!container) return;
        container.innerHTML = '';

        const shopItems = [
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

        shopItems.forEach(item => {
            const isOwnedPersistent = (item.type === 'toy' && this.inventory.toys.includes(item.id)) ||
                                     (item.type === 'furniture' && this.inventory.furniture.includes(item.id)) ||
                                     (item.type === 'accessory' && this.cosmetics.unlocked.includes(item.id));

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
                    if (this.stats.coins >= item.cost) {
                        this.stats.coins -= item.cost;
                        this.purchaseItem(item);
                        this.renderShop();
                        this.renderInventory();
                        this.saveGame();
                        this.updateUI();
                    } else {
                        this.triggerSpeechBubble("Mew! You don't have enough coins! 🪙");
                    }
                });
            }

            container.appendChild(card);
        });
    }

    purchaseItem(item) {
        Sound.playTone(600, 'sine', 0.1);
        Sound.playTone(800, 'sine', 0.15, 0.05);
        this.createFloatingParticle('🛍️');

        if (item.type === 'food') {
            this.inventory.food[item.id] = (this.inventory.food[item.id] || 0) + 1;
            this.triggerSpeechBubble(`Bought ${item.title}! Check your Inventory.`);
            this.unlockCollectionItem('fish', item.id);
        } else if (item.type === 'toy') {
            this.inventory.toys.push(item.id);
            this.triggerSpeechBubble(`Bought ${item.title}! Permanent fun active.`);
            this.unlockCollectionItem('toys', item.id);
        } else if (item.type === 'accessory') {
            this.cosmetics.unlocked.push(item.id);
            this.triggerSpeechBubble(`Bought ${item.title}! Equip it in Closet.`);
            this.renderCloset();
            this.unlockCollectionItem('accessories', item.id);
        } else if (item.type === 'furniture') {
            this.inventory.furniture.push(item.id);
            this.triggerSpeechBubble(`Bought ${item.title}! Room decoration upgraded.`);
            this.unlockCollectionItem('furniture', item.id);
        }
    }

    renderInventory() {
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
            const count = this.inventory.food[food.id] || 0;
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
                    this.consumeFood(food);
                });

                container.appendChild(card);
            }
        });

        this.inventory.toys.forEach(toyId => {
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

        this.inventory.furniture.forEach(furnId => {
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

    consumeFood(food) {
        if (this.isSleepingState) return;
        if (this.stats.hunger >= 100) {
            this.triggerSpeechBubble("Pixel is full! Save this delicious snack.");
            return;
        }

        this.inventory.food[food.id] -= 1;
        this.stats.hunger = Math.min(100, this.stats.hunger + food.satiety);
        this.history.totalFeeds += 1;

        Sound.playFeed();
        this.addXP(15);
        this.addFriendshipXp(food.friend);
        this.triggerActionAnimation('feed');
        this.triggerSpeechBubble(`Yum! Consumed ${food.title}! (+${food.satiety} Satiety) 😋`);
        this.createFloatingParticle(food.icon);

        this.updateQuestProgress('feed3', 1);

        this.renderInventory();
        this.updateUI();
        this.saveGame();
    }

    resetQuests() {
        this.quests.daily = [
            { id: 'feed3', desc: 'Feed Pixel 3 times', count: 0, target: 3, rewarded: false, type: 'coins', amt: 50 },
            { id: 'pet5', desc: 'Pet Pixel 5 times', count: 0, target: 5, rewarded: false, type: 'coins', amt: 50 },
            { id: 'play2', desc: 'Play with Pixel 2 times', count: 0, target: 2, rewarded: false, type: 'coins', amt: 50 }
        ];
        if (Date.now() - this.quests.lastAssigned > 604800000) {
            this.quests.weekly = [
                { id: 'happy100', desc: 'Reach 100 Happiness', count: 0, target: 100, rewarded: false, type: 'xp', amt: 150 },
                { id: 'earn500', desc: 'Earn 500 Coins', count: 0, target: 500, rewarded: false, type: 'coins', amt: 200 },
                { id: 'gainLvl', desc: 'Gain a level', count: 0, target: 1, rewarded: false, type: 'cosmetic', val: 'headset' }
            ];
        }
        this.quests.lastAssigned = Date.now();
        this.renderQuests();
    }

    updateQuestProgress(id, amount) {
        let updated = false;

        this.quests.daily.forEach(q => {
            if (q.id === id && !q.rewarded) {
                q.count = Math.min(q.target, q.count + amount);
                updated = true;
                if (q.count >= q.target) {
                    this.claimQuestReward(q);
                }
            }
        });

        this.quests.weekly.forEach(q => {
            if (q.id === id && !q.rewarded) {
                if (id === 'happy100') {
                    q.count = amount; 
                } else {
                    q.count = Math.min(q.target, q.count + amount);
                }
                updated = true;
                if (q.count >= q.target) {
                    this.claimQuestReward(q);
                }
            }
        });

        if (updated) {
            this.renderQuests();
        }
    }

    claimQuestReward(quest) {
        quest.rewarded = true;
        Sound.playAchievement();
        this.createFloatingParticle('🏆');

        if (quest.type === 'coins') {
            this.addCoins(quest.amt);
            this.triggerSpeechBubble(`🏆 Daily Quest completed! Recieved +${quest.amt} Coins!`);
        } else if (quest.type === 'xp') {
            this.addXP(quest.amt);
            this.triggerSpeechBubble(`🏆 Weekly Quest completed! Recieved +${quest.amt} XP!`);
        } else if (quest.type === 'cosmetic') {
            if (!this.cosmetics.unlocked.includes(quest.val)) {
                this.cosmetics.unlocked.push(quest.val);
            }
            this.triggerSpeechBubble(`🏆 Weekly Quest completed! Unlocked Hat: ${quest.val}!`);
            this.renderCloset();
        }
        this.saveGame();
    }

    renderQuests() {
        const dailyContainer = document.getElementById('daily-quests-container');
        const weeklyContainer = document.getElementById('weekly-quests-container');
        if (!dailyContainer || !weeklyContainer) return;

        dailyContainer.innerHTML = '';
        weeklyContainer.innerHTML = '';

        this.quests.daily.forEach(q => {
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

        this.quests.weekly.forEach(q => {
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

    renderGames() {
        const container = document.getElementById('games-selection-container');
        if (!container) return;
        container.innerHTML = '';

        const games = [
            { id: 'catchFish', title: 'Catch The Fish', desc: 'Test your timing skills!', icon: '🎣' },
            { id: 'chaseYarn', title: 'Chase The Yarn', desc: 'Click the moving yarn ball!', icon: '🧶' },
            { id: 'memoryMatch', title: 'Memory Match', desc: 'Test your memory patterns!', icon: '🃏' }
        ];

        games.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.innerHTML = `
                <div class="game-icon">${game.icon}</div>
                <div class="game-details">
                    <div class="game-title">${game.title}</div>
                    <div class="game-desc">${game.desc}</div>
                </div>
                <button class="btn-play-game" data-id="${game.id}">Play</button>
            `;

            card.querySelector('.btn-play-game').addEventListener('click', () => {
                this.startMiniGame(game.id);
            });

            container.appendChild(card);
        });
    }

    startMiniGame(id) {
        if (this.isSleepingState) return;
        this.activeGameId = id;
        
        document.getElementById('games-selection-container').style.display = 'none';
        const stage = document.getElementById('mini-game-stage');
        stage.style.display = 'flex';
        stage.innerHTML = ''; 

        if (id === 'catchFish') {
            this.initCatchFishGame(stage);
        } else if (id === 'chaseYarn') {
            this.initChaseYarnGame(stage);
        } else if (id === 'memoryMatch') {
            this.initMemoryMatchGame(stage);
        }
    }

    closeMiniGame() {
        if (this.activeGameTimer) {
            clearInterval(this.activeGameTimer);
            this.activeGameTimer = null;
        }
        this.activeGameId = null;
        document.getElementById('mini-game-stage').style.display = 'none';
        document.getElementById('games-selection-container').style.display = 'flex';
        this.renderGames();
    }

    initCatchFishGame(stage) {
        stage.innerHTML = `
            <div class="game-header-bar">
                <span>🎣 Catch the Fish</span>
                <span id="game-score">Score: 0/5</span>
            </div>
            <canvas id="game-canvas" class="game-canvas-element" width="200" height="80"></canvas>
            <p style="font-size:0.75rem; text-align:center;">Click when the slider matches the Orange fish zone!</p>
            <button class="btn-close-game" id="btn-quit-game">Quit Game</button>
        `;

        document.getElementById('btn-quit-game').addEventListener('click', () => this.closeMiniGame());

        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        
        let sliderX = 0;
        let sliderSpeed = 4;
        const fishZoneX = 90;
        const fishZoneW = 20;
        let score = 0;

        const loop = () => {
            if (this.activeGameId !== 'catchFish') return;

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
                this.createFloatingParticle('🐟');

                sliderSpeed = sliderSpeed * 1.15; 
                
                if (score >= 5) {
                    this.addCoins(30);
                    this.addXP(20);
                    this.triggerSpeechBubble("Wow! You caught all the fish! +30 Coins (+20 XP)");
                    this.closeMiniGame();
                }
            } else {
                Sound.playSleep(); 
                this.triggerSpeechBubble("Missed! Try again.");
            }
        });
    }

    initChaseYarnGame(stage) {
        stage.innerHTML = `
            <div class="game-header-bar">
                <span>🧶 Chase Yarn</span>
                <span id="game-score">Hits: 0/6</span>
            </div>
            <canvas id="game-canvas" class="game-canvas-element" width="200" height="150"></canvas>
            <p style="font-size:0.75rem; text-align:center;">Click the rolling yarn ball before time runs out!</p>
            <button class="btn-close-game" id="btn-quit-game">Quit Game</button>
        `;

        document.getElementById('btn-quit-game').addEventListener('click', () => this.closeMiniGame());

        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        
        let ballX = 100;
        let ballY = 75;
        let dx = 3;
        let dy = 2.5;
        const radius = 12;
        let hits = 0;

        const loop = () => {
            if (this.activeGameId !== 'chaseYarn') return;

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
                this.createFloatingParticle('🧶');

                dx = (dx > 0 ? 1 : -1) * (Math.abs(dx) + 0.6) * (Math.random() > 0.5 ? 1 : -1);
                dy = (dy > 0 ? 1 : -1) * (Math.abs(dy) + 0.6) * (Math.random() > 0.5 ? 1 : -1);

                if (hits >= 6) {
                    this.addCoins(40);
                    this.addXP(25);
                    this.triggerSpeechBubble("Awesome chasing skills! +40 Coins (+25 XP)");
                    this.closeMiniGame();
                }
            }
        });
    }

    initMemoryMatchGame(stage) {
        stage.innerHTML = `
            <div class="game-header-bar">
                <span>🃏 Memory Match</span>
                <span id="game-turns">Pairs: 0/4</span>
            </div>
            <div class="memory-grid" id="mem-grid"></div>
            <button class="btn-close-game" id="btn-quit-game">Quit Game</button>
        `;

        document.getElementById('btn-quit-game').addEventListener('click', () => this.closeMiniGame());

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
                                this.addCoins(50);
                                this.addXP(30);
                                this.triggerSpeechBubble("Brilliant memory! Match completed: +50 Coins (+30 XP)");
                                this.closeMiniGame();
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

    triggerRandomEvent() {
        const events = [
            {
                title: '🪙 Coin Found!',
                desc: 'Pixel discovered a lost shiny coin buried in the cozy rug!',
                choices: [
                    { text: 'Claim Coin (+30 Coins)', action: () => { this.addCoins(30); this.triggerSpeechBubble("Wonderful! Added +30 coins."); } }
                ]
            },
            {
                title: '🎁 Mystery Gift!',
                desc: 'Pixel brought you a gift from the backyard cabinet!',
                choices: [
                    { text: 'Unwrap Gift (Receive Fish)', action: () => { 
                        this.inventory.food.fish = (this.inventory.food.fish || 0) + 1;
                        this.renderInventory();
                        this.triggerSpeechBubble("Sweet! Added 1 Fish to Inventory."); 
                    } }
                ]
            },
            {
                title: '🧹 Sticky Mess!',
                desc: 'Oh no! Pixel knocked over the flower pot in the living room!',
                choices: [
                    { text: 'Clean Mess Up (-10 Coins)', action: () => { this.stats.coins = Math.max(0, this.stats.coins - 10); this.updateUI(); this.triggerSpeechBubble("Cleaned up! Mess is gone."); } },
                    { text: 'Ignore Mess (-15 Happiness)', action: () => { this.stats.happiness = Math.max(0, this.stats.happiness - 15); this.updateUI(); this.triggerSpeechBubble("Ignored. Pixel feels bad about the mess."); } }
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
                this.saveGame();
            });
        });
    }

    // ----------------------------------------------------
    // Save Hardening: Export & Import
    // ----------------------------------------------------

    exportSave() {
        try {
            const saveData = {
                stats: this.stats,
                history: this.history,
                achievements: this.achievements,
                isSleepingState: this.isSleepingState,
                cosmetics: this.cosmetics,
                inventory: this.inventory,
                quests: this.quests,
                collection: this.collection,
                prestige: this.prestige,
                version: '2.0-polished'
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(saveData));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `pixelpal_save_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            
            this.triggerSpeechBubble("Save file exported successfully! Check your downloads folder. 📤");
        } catch (e) {
            console.error("Save export error:", e);
            alert("Could not export save. Please try again.");
        }
    }

    importSave(event) {
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
                if (importedData.stats) this.stats = importedData.stats;
                if (importedData.history) this.history = importedData.history;
                if (importedData.achievements) this.achievements = importedData.achievements;
                if (importedData.isSleepingState !== undefined) this.isSleepingState = importedData.isSleepingState;
                if (importedData.cosmetics) this.cosmetics = importedData.cosmetics;
                if (importedData.inventory) this.inventory = importedData.inventory;
                if (importedData.quests) this.quests = importedData.quests;
                if (importedData.collection) this.collection = importedData.collection;
                if (importedData.prestige) this.prestige = importedData.prestige;

                this.validateAndRepairState();
                this.saveGame();
                this.loadGame();

                this.triggerSpeechBubble("Save file imported successfully! Progress restored. 📥");
                Sound.playLevelUp();
            } catch (err) {
                console.error("Import error:", err);
                alert("Import failed. The file is either corrupted or invalid.");
            }
        };
        reader.readAsText(file);
    }

    // ----------------------------------------------------
    // Onboarding Tutorial System
    // ----------------------------------------------------

    startTutorial() {
        this.tutorialStep = 0;
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            this.showTutorialStep();
        }
    }

    showTutorialStep() {
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

        const step = steps[this.tutorialStep];
        if (titleEl && textEl) {
            titleEl.textContent = step.title;
            textEl.textContent = step.text;
        }

        const highlightEl = document.getElementById(step.highlightId);
        if (highlightEl) {
            highlightEl.classList.add('spotlight-active');
        }
    }

    nextTutorial() {
        this.tutorialStep++;
        if (this.tutorialStep < 3) {
            this.showTutorialStep();
        } else {
            this.completeTutorial();
        }
    }

    completeTutorial() {
        document.getElementById('tutorial-overlay').style.display = 'none';
        document.querySelectorAll('.spotlight-active').forEach(el => el.classList.remove('spotlight-active'));
        localStorage.setItem('pixelpal_tutorial_completed', 'true');
        this.triggerSpeechBubble("Tutorial complete! Let's become best friends! 😸");
    }

    // ----------------------------------------------------
    // Hidden Developer Dashboard Panel
    // ----------------------------------------------------

    toggleDevPanel() {
        const panel = document.getElementById('dev-panel-overlay');
        if (!panel) return;

        if (panel.style.display === 'none') {
            panel.style.display = 'flex';
            this.updateDevPanelData();
        } else {
            panel.style.display = 'none';
        }
    }

    updateDevPanelData() {
        document.getElementById('dev-lvl-val').textContent = this.stats.level;
        document.getElementById('dev-xp-val').textContent = `${this.stats.xp} / ${this.stats.xpNeeded}`;
        document.getElementById('dev-coins-val').textContent = this.stats.coins;
        document.getElementById('dev-friend-val').textContent = `${this.stats.friendshipLevel} (XP: ${this.stats.friendshipXp})`;
        document.getElementById('dev-prestige-val').textContent = this.prestige.count;
    }

    devAddCoins() {
        this.addCoins(500);
        this.updateDevPanelData();
    }

    devAddXP() {
        this.addXP(100);
        this.updateDevPanelData();
    }

    devAddFriendship() {
        this.addFriendshipXp(50);
        this.updateDevPanelData();
    }

    devInstantLevelUp() {
        const needed = this.stats.xpNeeded - this.stats.xp;
        this.addXP(needed);
        this.updateDevPanelData();
    }

    devSkipTime() {
        this.processOfflineProgression(43200); // 12 hours (43200 seconds)
        this.updateDevPanelData();
        this.updateUI();
    }

    // ----------------------------------------------------
    // UI & Bindings
    // ----------------------------------------------------

    updateUI() {
        const h = Math.round(this.stats.hunger);
        const ha = Math.round(this.stats.happiness);
        const e = Math.round(this.stats.energy);
        const coins = this.stats.coins;
        const friendLvl = this.stats.friendshipLevel;
        const friendXp = this.stats.friendshipXp;
        const friendNeeded = this.stats.friendshipXpNeeded;

        // Populate cached dom variables
        this.dom.hungerVal.textContent = `${h}/100`;
        this.dom.happinessVal.textContent = `${ha}/100`;
        this.dom.energyVal.textContent = `${e}/100`;

        this.dom.hungerFill.style.width = `${h}%`;
        this.dom.happinessFill.style.width = `${ha}%`;
        this.dom.energyFill.style.width = `${e}%`;

        this.dom.lvlVal.textContent = this.stats.level;
        this.dom.xpText.textContent = `${this.stats.xp} / ${this.stats.xpNeeded}`;
        this.dom.xpFill.style.width = `${(this.stats.xp / this.stats.xpNeeded) * 100}%`;

        this.dom.coinVal.textContent = coins;
        this.dom.friendLvl.textContent = friendLvl;
        this.dom.friendXpText.textContent = `${friendXp} / ${friendNeeded}`;
        this.dom.friendFill.style.width = `${(friendXp / friendNeeded) * 100}%`;

        const diffMs = Date.now() - this.history.createdDate;
        const daysAlive = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        this.dom.daysAlive.textContent = daysAlive;

        this.dom.statFeeds.textContent = this.history.totalFeeds;
        this.dom.statPlays.textContent = this.history.totalPlays;
        this.dom.statPets.textContent = this.history.totalPets;
        this.dom.statLevelups.textContent = this.history.totalLevelups;
    }

    triggerSpeechBubble(text) {
        const bubble = document.getElementById('thought-text');
        if (bubble) bubble.textContent = text;
    }

    createFloatingParticle(emoji) {
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
        document.getElementById('btn-feed').addEventListener('click', () => this.feed());
        document.getElementById('btn-play').addEventListener('click', () => this.play());
        document.getElementById('btn-sleep').addEventListener('click', () => this.toggleSleep());
        document.getElementById('btn-pet').addEventListener('click', () => this.pet());

        document.getElementById('claim-reward-btn').addEventListener('click', () => this.claimDailyReward());
        document.getElementById('btn-reset').addEventListener('click', () => this.resetProgress());

        // Save Hardening: Export & Import events
        document.getElementById('btn-export-save').addEventListener('click', () => this.exportSave());
        document.getElementById('btn-import-save').addEventListener('click', () => {
            document.getElementById('save-file-input').click();
        });
        document.getElementById('save-file-input').addEventListener('change', (e) => this.importSave(e));

        // Volume control range slider bindings
        const volSlider = document.getElementById('volume-slider');
        volSlider.addEventListener('input', (e) => {
            const vol = parseInt(e.target.value) / 100;
            Sound.setVolume(vol);
            localStorage.setItem('pixelpal_volume', vol);
        });

        // Version badge Dev panel clicks trigger
        document.getElementById('version-badge').addEventListener('click', () => {
            this.badgeClicks++;
            if (this.badgeClicks >= 5) {
                this.badgeClicks = 0;
                this.toggleDevPanel();
            }
        });

        // Dev panel actions bindings
        document.getElementById('btn-dev-close').addEventListener('click', () => this.toggleDevPanel());
        document.getElementById('btn-dev-add-coins').addEventListener('click', () => this.devAddCoins());
        document.getElementById('btn-dev-add-xp').addEventListener('click', () => this.devAddXP());
        document.getElementById('btn-dev-add-friend').addEventListener('click', () => this.devAddFriendship());
        document.getElementById('btn-dev-lvl-up').addEventListener('click', () => this.devInstantLevelUp());
        document.getElementById('btn-dev-skip-time').addEventListener('click', () => this.devSkipTime());

        // Onboarding Tutorial buttons bindings
        document.getElementById('btn-tutorial-skip').addEventListener('click', () => this.completeTutorial());
        document.getElementById('btn-tutorial-next').addEventListener('click', () => this.nextTutorial());

        document.getElementById('prestige-claim-btn').addEventListener('click', () => this.prestigeRebirth());

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

                if (targetTab === 'tab-shop') this.renderShop();
                if (targetTab === 'tab-inventory') this.renderInventory();
                if (targetTab === 'tab-quests') this.renderQuests();
                if (targetTab === 'tab-collection') this.renderCollection();
                if (targetTab === 'tab-prestige') this.renderPrestige();
            });
        });

        document.querySelectorAll('.col-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.col-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderCollection();
            });
        });
    }
}

// Start Game
window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new PixelPal();
});
