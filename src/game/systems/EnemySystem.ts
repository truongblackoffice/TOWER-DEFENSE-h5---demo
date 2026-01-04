import { World } from '../../ecs/World';
import { ComponentType, Transform, PathFollower, Sprite, Stats } from '../../ecs/Components';
import { GameMap } from '../Map';
import { WaveConfig } from '../../data/Config';
import { GameState } from '../GameState';
import enemiesData from '../../data/enemies.json';

export class EnemySystem {
    private currentWaveIndex: number = -1;
    private currentWave?: WaveConfig;
    private segmentIndex: number = 0;
    private spawnedInSegment: number = 0;
    private segmentTimer: number = 0;

    private isWaveActive: boolean = false;
    private allWaves: WaveConfig[] = [];

    constructor(private map: GameMap) { }

    setWaves(waves: WaveConfig[]) {
        this.allWaves = waves;
    }

    startNextWave() {
        if (this.isWaveActive) return; // Prevent double start

        if (this.currentWaveIndex + 1 < this.allWaves.length) {
            this.currentWaveIndex++;
            this.currentWave = this.allWaves[this.currentWaveIndex];
            this.segmentIndex = 0;
            this.spawnedInSegment = 0;
            this.segmentTimer = 0;
            this.isWaveActive = true;

            GameState.nextWave();
            console.log(`Wave ${GameState.wave} Started!`);
        } else {
            console.log("All waves complete!");
            // Victory Check could go here
        }
    }

    update(world: World, dt: number) {
        if (this.isWaveActive) {
            this.handleSpawning(world, dt);
            this.checkWaveCompletion(world);
        }
        this.handleMovement(world, dt);
    }

    private handleSpawning(world: World, dt: number) {
        if (!this.currentWave) return;

        if (this.segmentIndex >= this.currentWave.segments.length) {
            this.currentWave = undefined; // Spawning Finished
            return;
        }

        const segment = this.currentWave.segments[this.segmentIndex];
        this.segmentTimer += dt;

        if (this.segmentTimer >= segment.interval) {
            this.segmentTimer = 0;
            this.spawnEnemy(world, segment.enemyId);
            this.spawnedInSegment++;

            if (this.spawnedInSegment >= segment.count) {
                this.segmentIndex++;
                this.spawnedInSegment = 0;
                this.segmentTimer = 0;
            }
        }
    }

    private checkWaveCompletion(world: World) {
        // If spawning is finished (currentWave is undefined)
        if (!this.currentWave) {
            const enemies = world.getEntitiesWith([ComponentType.Stats, ComponentType.PathFollower]);
            if (enemies.length === 0) {
                this.onWaveComplete();
            }
        }
    }

    private autoStart: boolean = false;

    setAutoStart(enabled: boolean) {
        this.autoStart = enabled;
        // If we enable auto-start while between waves, we should probably start immediately?
        // Or just let the user click start. For safety, let's just update flag.
    }

    private onWaveComplete() {
        this.isWaveActive = false;
        console.log("Wave Complete!");

        // Reward Logic
        const baseReward = 100;
        const interest = Math.floor(GameState.gold * 0.1);
        const total = baseReward + interest;

        GameState.addGold(total);

        // Check Victory
        if (this.currentWaveIndex >= this.allWaves.length - 1) {
            console.log("VICTORY - All waves complete");
            GameState.isVictory = true;
            return;
        }

        // Auto Start Logic
        if (this.autoStart) {
            console.log("Auto-starting next wave in 3s...");
            setTimeout(() => {
                // Ensure we haven't started manually or game over or victory
                if (!this.isWaveActive && !GameState.isGameOver && !GameState.isVictory) {
                    this.startNextWave();
                }
            }, 3000);
        }
    }

    private spawnEnemy(world: World, enemyId: string) {
        const config = enemiesData.find(e => e.id === enemyId);
        if (!config || this.map.path.length === 0) return;

        const startPos = this.map.path[0].clone();

        const entity = world.createEntity();
        entity.addComponent(new Transform(startPos))
            .addComponent(new Sprite(config.color, config.radius * 2, config.texture))
            .addComponent(new PathFollower(config.speed))
            .addComponent(new Stats(config.hp, config.hp, config.reward));
    }

    private handleMovement(world: World, dt: number) {
        const enemies = world.getEntitiesWith([ComponentType.Transform, ComponentType.PathFollower]);

        enemies.forEach(entity => {
            const transform = entity.getComponent<Transform>(ComponentType.Transform)!;
            const follower = entity.getComponent<PathFollower>(ComponentType.PathFollower)!;

            if (follower.reachedEnd) return;

            const target = this.map.path[follower.currentWaypointIndex + 1];
            if (!target) {
                follower.reachedEnd = true;
                entity.active = false;
                world.removeEntity(entity.id);
                GameState.takeDamage(1);
                return;
            }

            const dir = target.sub(transform.position);
            const dist = dir.length();
            const moveStep = follower.speed * dt;

            if (dist <= moveStep) {
                transform.position = target.clone();
                follower.currentWaypointIndex++;
                if (follower.currentWaypointIndex >= this.map.path.length - 1) {
                    follower.reachedEnd = true;
                    entity.active = false;
                    world.removeEntity(entity.id);
                    GameState.takeDamage(1);
                }
            } else {
                transform.position = transform.position.add(dir.normalize().scale(moveStep));
            }
        });
    }
}
