import { Loop } from './Loop';
import { Input } from './Input';
import { StateMachine } from './StateMachine';
import { MenuState } from '../game/states/MenuState';

export class Game {
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public loop: Loop;
    public stateMachine: StateMachine;

    constructor() {
        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        Input.init(this.canvas);

        this.stateMachine = new StateMachine();

        this.loop = new Loop(
            this.update.bind(this),
            this.render.bind(this)
        );
    }

    start(): void {
        console.log('Game starting...');
        // Start with Menu
        this.stateMachine.changeState(new MenuState(this));
        this.loop.start();
    }

    private update(): void {
        const dt = 1 / 60; // Fixed timestep logic handled in Loop
        this.stateMachine.update(dt);
    }

    private render(alpha: number): void {
        this.stateMachine.render(this.ctx, alpha);
    }

    private resize(): void {
        this.canvas.width = 800;
        this.canvas.height = 600;
    }
}
