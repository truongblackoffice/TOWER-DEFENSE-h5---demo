export class Time {
    public static deltaTime: number = 0;
    public static lastTime: number = 0;
    public static now: number = 0;
    public static accumulatedTime: number = 0;
    public static readonly FIXED_TIMESTEP: number = 1 / 60; // 60 updates per second
    public static timeScale: number = 1.0;

    static update(currentTime: number): void {
        this.now = currentTime;
        const dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap max delta time to avoid spiral of death on lag spikes
        this.deltaTime = Math.min(dt, 0.25);
        this.accumulatedTime += this.deltaTime * this.timeScale;
    }
}
