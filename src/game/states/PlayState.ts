import { State } from '../../core/StateMachine';
import { Time } from '../../core/Time';
import { World } from '../../ecs/World';
import { RenderSystem } from '../systems/RenderSystem';
import { EnemySystem } from '../systems/EnemySystem';
import { TowerSystem } from '../systems/TowerSystem';
import { ProjectileSystem } from '../systems/ProjectileSystem';
import { UISystem } from '../systems/UISystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { GameMap } from '../Map';
import levelsData from '../../data/levels.json';
import { GameState } from '../GameState';
import { Assets } from '../../core/Assets';
import { ImageUtils } from '../../core/ImageUtils';
import { WaveGenerator } from '../WaveGenerator';

export class PlayState implements State {
    private world: World;
    private map: GameMap;

    // Systems
    private renderSystem!: RenderSystem;
    private enemySystem!: EnemySystem;
    private towerSystem!: TowerSystem;
    private projectileSystem!: ProjectileSystem;
    private uiSystem!: UISystem;
    private interactionSystem!: InteractionSystem;

    constructor(private levelIndex: number = 1, private difficulty: 'easy' | 'normal' | 'hard' = 'normal') {
        this.world = new World();

        let allLevels = levelsData as any;
        if (allLevels.default) allLevels = allLevels.default;

        // Ensure array
        if (!Array.isArray(allLevels)) {
            // Fallback if it's still a single object (shouldn't happen after my edit, but for safety)
            allLevels = [allLevels];
        }

        // Loop levels: (levelIndex - 1) % length
        const safeIndex = (this.levelIndex - 1) % allLevels.length;
        const mapConfig = allLevels[safeIndex];

        console.log(`Loading Level ${this.levelIndex} (Map Index: ${safeIndex})`);

        if (!mapConfig || !mapConfig.tileSize) {
            throw new Error("Invalid Level Data! Check levels.json");
        }

        this.map = new GameMap(mapConfig);
    }

    enter(): void {
        console.log(`Entering PlayState Level ${this.levelIndex} ${this.difficulty}`);

        // Show Game Layout
        document.getElementById('main-layout')!.classList.remove('hidden');
        const lvlEl = document.getElementById('val-level');
        if (lvlEl) lvlEl.innerText = this.levelIndex.toString();

        // Preload Assets
        Assets.loadImage('tower_blue', '/images/tower_blue.png');
        Assets.loadImage('tower_red', '/images/tower_red.png');
        Assets.loadImage('tower_purple', '/images/tower_purple.png');
        Assets.loadImage('tower_minigun', '/images/tower_minigun.png');
        Assets.loadImage('tower_rocket', '/images/tower_rocket.png');
        Assets.loadImage('enemy_soldier', '/images/enemy_soldier.png');
        Assets.loadImage('tile_grass', '/images/tile_grass.png');
        Assets.loadImage('tile_path', '/images/tile_path.png');
        Assets.loadImage('prop_tree', '/images/prop_tree.png');
        Assets.loadImage('prop_rock', '/images/prop_rock.png');
        Assets.loadImage('base_castle', '/images/base_castle.png');
        Assets.loadImage('spawn_portal', '/images/spawn_portal.png');

        const processTransparency = async () => {
            await Assets.processImage('prop_tree', img => ImageUtils.removeBackground(img));
            await Assets.processImage('prop_rock', img => ImageUtils.removeBackground(img));
            await Assets.processImage('base_castle', img => ImageUtils.removeBackground(img));
            await Assets.processImage('tower_blue', img => ImageUtils.removeBackground(img));
            await Assets.processImage('tower_red', img => ImageUtils.removeBackground(img));
            await Assets.processImage('tower_purple', img => ImageUtils.removeBackground(img));
            await Assets.processImage('tower_minigun', img => ImageUtils.removeBackground(img));
            await Assets.processImage('tower_rocket', img => ImageUtils.removeBackground(img));
            await Assets.processImage('enemy_soldier', img => ImageUtils.removeBackground(img));
        };
        processTransparency();

        // Init Systems
        const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;

        // Determine theme based on level index (0-based math for easier mod)
        const themes = ['normal', 'desert', 'toxic'];
        const themeIndex = (this.levelIndex - 1) % themes.length;
        const theme = themes[themeIndex];
        console.log(`Applying Theme: ${theme}`);

        this.renderSystem = new RenderSystem(ctx, this.map, theme);
        this.enemySystem = new EnemySystem(this.map);

        // Generate Waves from Code
        const waves = WaveGenerator.generateWaves(this.levelIndex, this.difficulty);
        this.enemySystem.setWaves(waves);

        this.towerSystem = new TowerSystem();
        this.projectileSystem = new ProjectileSystem();
        this.uiSystem = new UISystem();
        this.interactionSystem = new InteractionSystem(this.map, this.world);

        // Bind Start Wave Button
        const btnStart = document.getElementById('btn-start-wave');
        if (btnStart) {
            // Clone to strip old listeners
            const newBtn = btnStart.cloneNode(true);
            btnStart.parentNode?.replaceChild(newBtn, btnStart);
            (newBtn as HTMLElement).onclick = () => {
                this.enemySystem.startNextWave();
            };
        }

        // Auto Wave Toggle
        const chkAuto = document.getElementById('chk-auto-wave') as HTMLInputElement;
        if (chkAuto) {
            chkAuto.checked = false; // Reset on load
            chkAuto.onchange = () => {
                this.enemySystem.setAutoStart(chkAuto.checked);
            };
        }

        // Speed Controls
        const speedBtns = document.querySelectorAll('.speed-btn');
        speedBtns.forEach(btn => {
            (btn as HTMLElement).onclick = () => {
                // Reset active class
                speedBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Set Scale
                const speed = parseFloat((btn as HTMLElement).dataset.speed || '1');
                Time.timeScale = speed;
            };
        });

        // Quit
        const btnQuit = document.getElementById('btn-back-menu');
        if (btnQuit) {
            btnQuit.onclick = () => {
                window.location.reload();
            };
        }

        // Victory/Game Over
        const btnNext = document.getElementById('btn-next-level');
        if (btnNext) {
            btnNext.onclick = () => {
                const currentUnlocked = parseInt(localStorage.getItem('td_unlocked_level') || '1');
                const nextLevel = this.levelIndex + 1;

                // Unlock next level if not already unlocked
                if (nextLevel > currentUnlocked) {
                    localStorage.setItem('td_unlocked_level', nextLevel.toString());
                }

                // For "database" feel, we save the last played level too
                localStorage.setItem('td_save_level', nextLevel.toString());

                window.location.reload();
            };
        }

        const btnRestart = document.getElementById('btn-restart');
        if (btnRestart) btnRestart.onclick = () => window.location.reload();

        const btnVictoryMenu = document.getElementById('btn-menu-victory');
        if (btnVictoryMenu) btnVictoryMenu.onclick = () => window.location.reload();
    }

    exit(): void {
        this.world.clear();
        document.getElementById('main-layout')!.classList.add('hidden');
    }

    update(dt: number): void {
        if (GameState.isGameOver) {
            this.uiSystem.update();
            return;
        }

        this.interactionSystem.update(dt);
        this.enemySystem.update(this.world, dt);
        this.towerSystem.update(this.world, dt);
        this.projectileSystem.update(this.world, dt);
        this.uiSystem.update();
        this.renderSystem.update(dt); // Update visual logic (floating text)

        this.world.update();
    }

    render(_ctx: CanvasRenderingContext2D, alpha: number): void {
        this.renderSystem.draw(this.world, alpha);
    }
}
