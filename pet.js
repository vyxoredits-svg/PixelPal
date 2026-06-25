/**
 * pet.js - PixelCatRenderer and COLORS config
 */

export const COLORS = {
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

export class PixelCatRenderer {
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
