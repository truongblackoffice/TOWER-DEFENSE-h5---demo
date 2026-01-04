import { World } from '../../ecs/World';
import { ComponentType, Transform, Sprite, Tower, Stats } from '../../ecs/Components';
import { GameMap } from '../Map';
import { Assets } from '../../core/Assets';
import { events } from '../../core/EventBus';

export class RenderSystem {
    private grassPattern: CanvasPattern | null = null;
    private pathPattern: CanvasPattern | null = null;

    // Simple hashed decoration map to avoid storing entities for props
    // Key: "x,y", Value: "tree" | "rock" | null
    private decorations: Map<string, string> = new Map();

    constructor(private ctx: CanvasRenderingContext2D, private map: GameMap, private mapTheme: string = 'normal') {
        this.initDecorations();

        // Listen for damage events
        events.on('SHOW_DAMAGE', (data: any) => {
            this.addFloatingText(data.x, data.y, `-${data.amount}`, '#ffcc00');
        });
    }

    private initDecorations() {
        // Deterministic seeding or just random
        for (let x = 0; x < this.map.cols; x++) {
            for (let y = 0; y < this.map.rows; y++) {
                if (this.map.isBuildable(x, y)) {
                    // Randomly place props on grass
                    if (Math.random() < 0.15) {
                        this.decorations.set(`${x},${y}`, Math.random() < 0.7 ? 'prop_tree' : 'prop_rock');
                    }
                }
            }
        }
    }

    update(dt: number) {
        this.updateFloatingTexts(dt);
    }

    draw(world: World, _alpha: number) {
        // Prepare Patterns if loaded
        if (!this.grassPattern) {
            const img = Assets.getImage('tile_grass');
            if (img && img.complete) this.grassPattern = this.ctx.createPattern(img, 'repeat');
        }
        if (!this.pathPattern) {
            const img = Assets.getImage('tile_path');
            if (img && img.complete) this.pathPattern = this.ctx.createPattern(img, 'repeat');
        }

        // Clear
        this.ctx.clearRect(0, 0, 800, 600);

        // Draw Map and Props
        this.drawMap();

        // Draw Vignette
        this.ctx.globalCompositeOperation = 'multiply';
        const grad = this.ctx.createRadialGradient(400, 300, 300, 400, 300, 500);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.5)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, 800, 600);
        this.ctx.globalCompositeOperation = 'source-over';

        // Draw Entities (Sprites)
        const entities = world.getEntitiesWith([ComponentType.Transform, ComponentType.Sprite]);

        // Sort by Y for simple depth
        entities.sort((a, b) => {
            const ta = a.getComponent<Transform>(ComponentType.Transform)!;
            const tb = b.getComponent<Transform>(ComponentType.Transform)!;
            return ta.position.y - tb.position.y;
        });

        entities.forEach(entity => {
            if (!entity.active) return;

            const transform = entity.getComponent<Transform>(ComponentType.Transform)!;
            const sprite = entity.getComponent<Sprite>(ComponentType.Sprite)!;

            this.ctx.save();
            this.ctx.translate(transform.position.x, transform.position.y);
            this.ctx.rotate(transform.rotation);

            const textureName = sprite.texture;
            const img = textureName ? Assets.getImage(textureName) : undefined;

            if (img && img.complete && img.naturalWidth > 0) {
                this.ctx.drawImage(img, -sprite.size / 2, -sprite.size / 2, sprite.size, sprite.size);
            } else {
                this.ctx.fillStyle = sprite.color;
                if (entity.hasComponent(ComponentType.Tower)) {
                    this.ctx.fillRect(-sprite.size / 2, -sprite.size / 2, sprite.size, sprite.size);
                } else {
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, sprite.size, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }

            this.ctx.restore();
        });

        // Draw Health Bars
        entities.forEach(entity => {
            if (!entity.active || !entity.hasComponent(ComponentType.Stats)) return;
            const stats = entity.getComponent<Stats>(ComponentType.Stats)!;
            const t = entity.getComponent<Transform>(ComponentType.Transform)!;

            if (stats.hp < stats.maxHp) {
                const barWidth = 30;
                const barHeight = 4;
                const pct = stats.hp / stats.maxHp;

                this.ctx.fillStyle = '#cc0000';
                this.ctx.fillRect(t.position.x - barWidth / 2, t.position.y - 25, barWidth, barHeight);
                this.ctx.fillStyle = '#00cc00';
                this.ctx.fillRect(t.position.x - barWidth / 2, t.position.y - 25, barWidth * pct, barHeight);
            }
        });

        // Draw Floating Texts (Just draw, don't update)
        this.drawFloatingTexts();
    }

    private drawMap() {
        const ts = this.map.tileSize;

        // Draw background (Grass)
        if (this.grassPattern) {
            this.ctx.fillStyle = this.grassPattern;
            this.ctx.fillRect(0, 0, this.map.cols * ts, this.map.rows * ts);
        } else {
            this.ctx.fillStyle = '#228822';
            this.ctx.fillRect(0, 0, this.map.cols * ts, this.map.rows * ts);
        }

        // Apply Theme Tint
        if (this.mapTheme !== 'normal') {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'multiply';
            if (this.mapTheme === 'desert') {
                this.ctx.fillStyle = 'rgba(255, 165, 0, 0.4)'; // Orange tint
            } else if (this.mapTheme === 'snow') {
                this.ctx.fillStyle = 'rgba(200, 200, 255, 0.4)'; // Blue tint
            } else if (this.mapTheme === 'toxic') {
                this.ctx.fillStyle = 'rgba(100, 0, 100, 0.4)'; // Purple tint
            }
            this.ctx.fillRect(0, 0, this.map.cols * ts, this.map.rows * ts);
            this.ctx.restore();
        }

        // Draw Props on Buildable (Grass)
        for (let x = 0; x < this.map.cols; x++) {
            for (let y = 0; y < this.map.rows; y++) {
                if (this.map.isBuildable(x, y)) {
                    const prop = this.decorations.get(`${x},${y}`);
                    if (prop) {
                        const img = Assets.getImage(prop);
                        if (img && img.complete) {
                            this.ctx.drawImage(img, x * ts, y * ts, ts, ts);
                        }
                    }
                }
            }
        }

        // Draw Grid Overlay
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        // Vertical lines
        for (let x = 0; x <= this.map.cols; x++) {
            this.ctx.moveTo(x * ts, 0);
            this.ctx.lineTo(x * ts, this.map.rows * ts);
        }

        // Horizontal lines
        for (let y = 0; y <= this.map.rows; y++) {
            this.ctx.moveTo(0, y * ts);
            this.ctx.lineTo(this.map.cols * ts, y * ts);
        }
        this.ctx.stroke();

        // Draw Smooth Path
        if (this.map.path.length > 1) {
            this.ctx.lineWidth = ts - 4; // Slightly smaller to show edge or exact size? Let's go almost full.
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            if (this.pathPattern) {
                this.ctx.strokeStyle = this.pathPattern;
            } else {
                this.ctx.strokeStyle = '#C2B280';
            }

            this.ctx.beginPath();
            const start = this.map.path[0];
            this.ctx.moveTo(start.x, start.y);

            // This assumes map.path are World Coordinates (Center of tiles) which Map.ts constructor converts to.
            for (let i = 1; i < this.map.path.length; i++) {
                const p = this.map.path[i];
                this.ctx.lineTo(p.x, p.y);
            }
            this.ctx.stroke();

            // Optional: Draw a border/edge for the path to make it pop?
            this.ctx.globalCompositeOperation = 'destination-over'; // Draw behind? No, we want on top of grass.
            // A simple dark outline might look nice
            this.ctx.lineWidth = ts;
            this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            this.ctx.stroke();
            this.ctx.globalCompositeOperation = 'source-over';
        }

        // Draw Start and End Markers
        if (this.map.path.length > 0) {
            const start = this.map.path[0];
            const end = this.map.path[this.map.path.length - 1];

            const imgPortal = Assets.getImage('spawn_portal');
            if (imgPortal && imgPortal.complete) {
                this.ctx.drawImage(imgPortal, start.x - 20, start.y - 20, 40, 40);
            }

            const imgCastle = Assets.getImage('base_castle');
            if (imgCastle && imgCastle.complete) {
                this.ctx.drawImage(imgCastle, end.x - 24, end.y - 24, 48, 48);
            }
        }
    }

    // --- Floating Text System ---
    private floatingTexts: { x: number, y: number, text: string, life: number, color: string }[] = [];

    public addFloatingText(x: number, y: number, text: string, color: string = '#fff') {
        // Add random offset to prevent overlap
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        this.floatingTexts.push({ x: x + offsetX, y: y + offsetY, text, life: 0.6, color });
    }

    private updateFloatingTexts(dt: number) {
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.life -= dt;
            ft.y -= 50 * dt; // Float up

            if (ft.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    private drawFloatingTexts() {
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';

        for (const ft of this.floatingTexts) {
            this.ctx.globalAlpha = Math.min(1.0, ft.life * 2);
            this.ctx.fillStyle = ft.color;
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 3;
            this.ctx.strokeText(ft.text, ft.x, ft.y);
            this.ctx.fillText(ft.text, ft.x, ft.y);
        }
        this.ctx.globalAlpha = 1.0;
    }
}
