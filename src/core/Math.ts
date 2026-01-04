export class Vec2 {
    constructor(public x: number = 0, public y: number = 0) { }

    add(v: Vec2): Vec2 {
        return new Vec2(this.x + v.x, this.y + v.y);
    }

    sub(v: Vec2): Vec2 {
        return new Vec2(this.x - v.x, this.y - v.y);
    }

    scale(s: number): Vec2 {
        return new Vec2(this.x * s, this.y * s);
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize(): Vec2 {
        const len = this.length();
        if (len === 0) return new Vec2(0, 0);
        return new Vec2(this.x / len, this.y / len);
    }

    distance(v: Vec2): number {
        return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
    }

    distanceSq(v: Vec2): number {
        return Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2);
    }

    clone(): Vec2 {
        return new Vec2(this.x, this.y);
    }

    equals(v: Vec2): boolean {
        return this.x === v.x && this.y === v.y;
    }
}

export function clamp(val: number, min: number, max: number): number {
    return Math.min(Math.max(val, min), max);
}

export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

export function checkCircleCollision(c1: Vec2, r1: number, c2: Vec2, r2: number): boolean {
    const distSq = c1.distanceSq(c2);
    const radiusSum = r1 + r2;
    return distSq <= radiusSum * radiusSum;
}
