import { State, StateMachine } from '../../core/StateMachine';
import type { Game } from '../../core/Game';
import { PlayState } from './PlayState';

export class MenuState implements State {
    private app: Game;
    private menuScreen = document.getElementById('menu-screen')!;
    private levelScreen = document.getElementById('level-select-screen')!;
    private mainLayout = document.getElementById('main-layout')!;

    constructor(app: Game) {
        this.app = app;
    }

    enter(): void {
        this.menuScreen.classList.remove('hidden');
        this.mainLayout.classList.add('hidden');
        this.levelScreen.classList.add('hidden');

        this.bindEvents();
    }

    exit(): void {
        this.menuScreen.classList.add('hidden');
        this.levelScreen.classList.add('hidden');
    }

    update(dt: number): void { }
    render(ctx: CanvasRenderingContext2D, alpha: number): void {
        // Optional: Render cool background animation behind menu
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 800, 600);
    }

    private bindEvents() {
        const btnNew = document.getElementById('btn-new-game');
        const btnLoad = document.getElementById('btn-load-game');
        const btnBack = document.getElementById('btn-back-levels');

        if (btnNew) {
            btnNew.onclick = () => {
                this.showLevelSelect();
            };
        }

        if (btnBack) {
            btnBack.onclick = () => {
                this.levelScreen.classList.add('hidden');
                this.menuScreen.classList.remove('hidden');
            };
        }

        // Mock Load for now
        if (btnLoad) {
            // We use unlocked level or save level.
            const saved = localStorage.getItem('td_save_level') || localStorage.getItem('td_unlocked_level');
            if (saved) {
                btnLoad.removeAttribute('disabled');
                btnLoad.onclick = () => {
                    this.startLevel(parseInt(saved), 'normal');
                };
            }
        }
    }

    private showLevelSelect() {
        this.menuScreen.classList.add('hidden');
        this.levelScreen.classList.remove('hidden');

        const grid = document.getElementById('level-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const maxLevel = 30;
        const unlocked = parseInt(localStorage.getItem('td_unlocked_level') || '1');
        const difficulty = (document.getElementById('select-difficulty') as HTMLSelectElement).value;

        for (let i = 1; i <= maxLevel; i++) {
            const btn = document.createElement('button');
            btn.className = 'level-btn';
            btn.innerText = i.toString();

            if (i > unlocked) {
                btn.classList.add('locked');
            } else {
                btn.onclick = () => {
                    console.log(`Clicked Level ${i}`);
                    this.startLevel(i, difficulty);
                };
            }
            grid.appendChild(btn);
        }
    }

    private startLevel(level: number, difficulty: string) {
        console.log(`Starting Level ${level} with difficulty ${difficulty}`);
        // Transition to PlayState with params
        try {
            this.app.stateMachine.changeState(new PlayState(level, difficulty as any));
        } catch (e: any) {
            console.error("Failed to start level:", e);
            alert("Error starting level: " + e.message + "\n\nCheck console for details.");
        }
    }
}
