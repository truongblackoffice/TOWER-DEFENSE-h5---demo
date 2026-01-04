import { GameState } from '../GameState';
import { Time } from '../../core/Time';

export class UISystem {
    private elHp: HTMLElement;
    private elGold: HTMLElement;
    private elWave: HTMLElement;
    private elFps: HTMLElement;
    private elGameOver: HTMLElement;
    private elVictory: HTMLElement;

    constructor() {
        this.elHp = document.getElementById('val-hp')!;
        this.elGold = document.getElementById('val-gold')!;
        this.elWave = document.getElementById('val-wave')!;
        this.elFps = document.getElementById('val-fps')!;
        this.elGameOver = document.getElementById('game-over-screen')!;
        this.elVictory = document.getElementById('victory-screen')!;
    }

    update() {
        this.elHp.innerText = GameState.lives.toString();
        this.elGold.innerText = GameState.gold.toString();
        this.elWave.innerText = GameState.wave.toString();
        this.elFps.innerText = (1 / Time.deltaTime).toFixed(0);

        if (GameState.isGameOver) {
            this.elGameOver.classList.remove('hidden');
        } else {
            this.elGameOver.classList.add('hidden');
        }

        if (GameState.isVictory) {
            this.elVictory.classList.remove('hidden');
        } else {
            this.elVictory.classList.add('hidden');
        }
    }
}
