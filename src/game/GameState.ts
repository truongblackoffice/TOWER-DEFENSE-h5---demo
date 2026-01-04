
import { events } from '../core/EventBus';

class GameStateManager {
    public gold: number = 100;
    public lives: number = 20;
    public wave: number = 1;
    public isPaused: boolean = false;
    public isGameOver: boolean = false;
    public isVictory: boolean = false;

    constructor() {
        this.reset();
    }

    reset() {
        this.gold = 100; // Initial gold
        this.lives = 20;
        this.wave = 1;
        this.isGameOver = false;
        this.isPaused = false;
        this.isVictory = false;
        events.emit('STATE_UPDATED', this);
    }

    addGold(amount: number) {
        this.gold += amount;
        events.emit('STATE_UPDATED', this);
    }

    spendGold(amount: number): boolean {
        if (this.gold >= amount) {
            this.gold -= amount;
            events.emit('STATE_UPDATED', this);
            return true;
        }
        return false;
    }

    takeDamage(amount: number) {
        this.lives -= amount;
        if (this.lives <= 0) {
            this.lives = 0;
            this.isGameOver = true;
            events.emit('GAME_OVER');
        }
        events.emit('STATE_UPDATED', this);
    }

    nextWave() {
        this.wave++;
        events.emit('STATE_UPDATED', this);
    }
}

export const GameState = new GameStateManager();
