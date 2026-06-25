/**
 * audio.js - Sound Manager for PixelPal
 */

export class SoundManager {
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
export const Sound = new SoundManager();
