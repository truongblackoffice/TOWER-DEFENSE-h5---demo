import { LevelConfig, Point } from '../data/Config';
import { Vec2 } from '../core/Math';

export class GameMap {
    public tileSize: number;
    public cols: number;
    public rows: number;
    public path: Vec2[];
    public grid: number[][]; // 0: Buildable, 1: Path/Obstacle

    constructor(config: LevelConfig) {
        this.tileSize = config.tileSize;
        this.cols = config.cols;
        this.rows = config.rows;

        // Initialize grid
        this.grid = Array(this.cols).fill(0).map(() => Array(this.rows).fill(0));

        // Convert path points to Vec2 and mark on grid
        this.path = config.path.map(p => new Vec2(p.x * this.tileSize + this.tileSize / 2, p.y * this.tileSize + this.tileSize / 2));

        // Mark path tiles as non-buildable (1)
        // Simple line drawing to mark path segments would be better, but for grid movement, 
        // we can just iterate segments and mark cells. 
        // For simplicity in this constrained task, we'll assume the path is strictly Manhattan or we allow "cutting" visual corners 
        // but players can't build exactly ON the waypoints.
        // Better: Mark all cells along the path line segments.
        this.markPathOnGrid(config.path);
    }

    private markPathOnGrid(pathPoints: Point[]): void {
        if (pathPoints.length < 2) return;

        for (let i = 0; i < pathPoints.length - 1; i++) {
            const start = pathPoints[i];
            const end = pathPoints[i + 1];

            // Mark start
            this.setCell(start.x, start.y, 1);

            // Interpolate
            const dx = Math.sign(end.x - start.x);
            const dy = Math.sign(end.y - start.y);

            let currX = start.x;
            let currY = start.y;

            while (currX !== end.x || currY !== end.y) {
                this.setCell(currX, currY, 1);
                currX += dx;
                currY += dy;
            }
            this.setCell(end.x, end.y, 1);
        }
    }

    private setCell(x: number, y: number, val: number) {
        if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
            this.grid[x][y] = val;
        }
    }

    public isBuildable(x: number, y: number): boolean {
        // Convert screen/world pos to grid coords if needed, but this takes grid coords
        return x >= 0 && x < this.cols && y >= 0 && y < this.rows && this.grid[x][y] === 0;
    }

    public worldToGrid(pos: Vec2): Vec2 {
        return new Vec2(
            Math.floor(pos.x / this.tileSize),
            Math.floor(pos.y / this.tileSize)
        );
    }

    public getCenter(gridPos: Vec2): Vec2 {
        return new Vec2(
            gridPos.x * this.tileSize + this.tileSize / 2,
            gridPos.y * this.tileSize + this.tileSize / 2
        );
    }
}
