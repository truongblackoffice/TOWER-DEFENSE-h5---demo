export interface TowerConfig {
    id: string;
    name: string;
    description: string;
    cost: number;
    range: number;
    damage: number;
    fireRate: number; // shots per second
    projectileSpeed: number;
    color: string;
    width: number;
    height: number;
}

export interface EnemyConfig {
    id: string;
    name: string;
    speed: number;
    hp: number;
    reward: number;
    color: string;
    radius: number;
}

export interface WaveSegment {
    enemyId: string;
    count: number;
    interval: number; // seconds between spawns
}

export interface WaveConfig {
    id: number;
    segments: WaveSegment[];
    delayBefore: number; // delay before this wave starts (or break)
}

export interface Point {
    x: number;
    y: number;
}

export interface LevelConfig {
    id: number;
    tileSize: number;
    cols: number;
    rows: number;
    path: Point[]; // Waypoints for enemies
    buildable: number[]; // 0 for no, 1 for yes. If empty, all non-path are buildable.
}
