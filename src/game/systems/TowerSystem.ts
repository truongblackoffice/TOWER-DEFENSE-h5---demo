import { World } from '../../ecs/World';
import { ComponentType, Transform, Tower, Targeting, Projectile, Sprite } from '../../ecs/Components';
import { Vec2 } from '../../core/Math';

export class TowerSystem {
    update(world: World, dt: number) {
        const towers = world.getEntitiesWith([ComponentType.Transform, ComponentType.Tower, ComponentType.Targeting]);
        const enemies = world.getEntitiesWith([ComponentType.Transform, ComponentType.Stats]); // Candidates

        towers.forEach(towerEntity => {
            const transform = towerEntity.getComponent<Transform>(ComponentType.Transform)!;
            const tower = towerEntity.getComponent<Tower>(ComponentType.Tower)!;
            const targeting = towerEntity.getComponent<Targeting>(ComponentType.Targeting)!;

            // Cooldown
            if (tower.cooldownTimer > 0) {
                tower.cooldownTimer -= dt;
            }

            // Find Target logic (Simplified: Recalculate every frame or check current target validity)
            // Ideally we stick to a target until it dies or leaves range

            let target = null;

            // Validity check of current
            if (targeting.targetId !== null) {
                // This is O(N) lookup. Ideally World has getEntityById map.
                // For < 100 entities, linear search is fine.
                const current = enemies.find(e => e.id === targeting.targetId);
                if (current && current.active) {
                    const tPos = current.getComponent<Transform>(ComponentType.Transform)!.position;
                    if (transform.position.distance(tPos) <= tower.range) {
                        target = current;
                    } else {
                        targeting.targetId = null;
                    }
                } else {
                    targeting.targetId = null;
                }
            }

            // Acquire new target if needed
            if (target === null) {
                let bestDist = Infinity;
                let bestCandidate = null;

                // Simple 'Nearest' strategy
                for (const enemy of enemies) {
                    const ePos = enemy.getComponent<Transform>(ComponentType.Transform)!.position;
                    const dist = transform.position.distance(ePos);
                    if (dist <= tower.range) {
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestCandidate = enemy;
                        }
                    }
                }

                if (bestCandidate) {
                    targeting.targetId = bestCandidate.id;
                    target = bestCandidate;
                }
            }

            // Fire
            if (target && tower.cooldownTimer <= 0) {
                // Check if tower (from JSON) has custom properties like splashRadius.
                // Currently Tower component stores basics. We might need to store extra Data or extend Component.
                // For now, let's assume Tower component has splashRadius if we add it to Component definition.
                // Wait, Tower component definition in Components.ts DOES NOT have splashRadius.
                // I need to add it there too? Or just pass it if I had the config.
                // BUT, TowerSystem iterates Entities. 
                // Simplest fix: Add splashRadius to Tower Component.
                this.fireProjectile(world, transform.position, target.id, tower);
                tower.cooldownTimer = 1 / tower.fireRate;
            }
        });
    }

    private fireProjectile(world: World, spawnPos: Vec2, targetId: number, tower: Tower) {
        const p = world.createEntity();
        p.addComponent(new Transform(spawnPos.clone()))
            .addComponent(new Sprite('yellow', 5))
            .addComponent(new Projectile(tower.damage, targetId, tower.projectileSpeed, 10, tower.splashRadius));
    }
}
