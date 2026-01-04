import { Vec2 } from './Math';

export class Input {
    public static mousePos: Vec2 = new Vec2(0, 0);
    public static isMouseDown: boolean = false;
    public static isMousePressed: boolean = false; // True only on the frame it was pressed

    private static _canvas: HTMLCanvasElement;

    static init(canvas: HTMLCanvasElement): void {
        this._canvas = canvas;

        window.addEventListener('mousemove', (e) => {
            const rect = this._canvas.getBoundingClientRect();
            this.mousePos.x = e.clientX - rect.left;
            this.mousePos.y = e.clientY - rect.top;
        });

        window.addEventListener('mousedown', () => {
            this.isMouseDown = true;
            this.isMousePressed = true;
        });

        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });
    }

    static update(): void {
        // Reset "Pressed" state at the end of the frame or beginning
        // For this simple engine, we might call this at end of Loop
        this.isMousePressed = false;
    }
}
