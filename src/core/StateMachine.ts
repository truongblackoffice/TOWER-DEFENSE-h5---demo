export interface State {
    enter(): void;
    exit(): void;
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D, alpha: number): void;
}

export class StateMachine {
    private currentState: State | null = null;

    changeState(newState: State): void {
        if (this.currentState) {
            this.currentState.exit();
        }
        this.currentState = newState;
        if (this.currentState) {
            this.currentState.enter();
        }
    }

    update(dt: number): void {
        this.currentState?.update(dt);
    }

    render(ctx: CanvasRenderingContext2D, alpha: number): void {
        this.currentState?.render(ctx, alpha);
    }
}
