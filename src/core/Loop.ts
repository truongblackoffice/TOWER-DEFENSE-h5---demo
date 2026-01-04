import { Time } from './Time';
import { Input } from './Input';

type UpdateCallback = () => void;
type RenderCallback = (alpha: number) => void;

export class Loop {
    private running: boolean = false;
    private lastFrameTime: number = 0;
    private animationFrameId: number = 0;

    constructor(
        private updateFn: UpdateCallback,
        private renderFn: RenderCallback
    ) { }

    start(): void {
        if (this.running) return;
        this.running = true;
        this.lastFrameTime = performance.now();
        Time.lastTime = this.lastFrameTime;

        this.frame(this.lastFrameTime);
    }

    stop(): void {
        this.running = false;
        cancelAnimationFrame(this.animationFrameId);
    }

    private frame = (currentTime: number): void => {
        if (!this.running) return;

        Time.update(currentTime);

        // Fixed Update Loop
        // If the game lags significantly, we might spiral. 
        // Safety bail-out in Time.ts prevents huge dt, but here we loop until caught up.
        while (Time.accumulatedTime >= Time.FIXED_TIMESTEP) {
            this.updateFn();
            Input.update(); // Reset input flags like "Pressed"
            Time.accumulatedTime -= Time.FIXED_TIMESTEP;
        }

        // Render with interpolation factor (alpha)
        const alpha = Time.accumulatedTime / Time.FIXED_TIMESTEP;
        this.renderFn(alpha);

        this.animationFrameId = requestAnimationFrame(this.frame);
    }
}
