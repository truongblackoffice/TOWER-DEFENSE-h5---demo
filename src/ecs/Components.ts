import { Vec2 } from '../core/Math';

export enum ComponentType {
    Transform = 'transform',
    Sprite = 'sprite',
    PathFollower = 'pathFollower',
    Stats = 'stats',
    Tower = 'tower',
    Projectile = 'projectile',
    Targeting = 'targeting' // Added targeting
}

export interface Component {
    type: ComponentType;
}

export class Transform implements Component {
    readonly type = ComponentType.Transform;
    constructor(
        public position: Vec2 = new Vec2(0, 0),
        public rotation: number = 0,
        public scale: number = 1
    ) { }
}

export class Sprite implements Component {
    readonly type = ComponentType.Sprite;
    constructor(
        public color: string = 'red',
        public size: number = 20,
        public texture?: string // Added texture field
    ) { }
}

export class PathFollower implements Component {
    readonly type = ComponentType.PathFollower;
    public currentWaypointIndex: number = 0;
    public reachedEnd: boolean = false;
    constructor(
        public speed: number = 50
    ) { }
}

export class Stats implements Component {
    readonly type = ComponentType.Stats;
    constructor(
        public hp: number = 10,
        public maxHp: number = 10,
        public goldValue: number = 5
    ) { }
}

export class Tower implements Component {
    readonly type = ComponentType.Tower;
    public cooldownTimer: number = 0;
    constructor(
        public range: number = 100,
        public damage: number = 10,
        public fireRate: number = 1, // shots per second
        public projectileSpeed: number = 300,
        public splashRadius: number = 0 // Added splashRadius
    ) { }
}

export class Targeting implements Component {
    readonly type = ComponentType.Targeting;
    public targetId: number | null = null;
    constructor(
        public strategy: 'nearest' | 'first' | 'last' = 'nearest'
    ) { }
}

export class Projectile implements Component {
    readonly type = ComponentType.Projectile;
    constructor(
        public damage: number = 10,
        public targetId: number | null = null,
        public speed: number = 300,
        public hitRadius: number = 10,
        public splashRadius: number = 0 // Added splashRadius
    ) { }
}
