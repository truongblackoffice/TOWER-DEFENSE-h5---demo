import { World } from '../../ecs/World';
import { ComponentType, Transform, Projectile, Stats } from '../../ecs/Components';
import { GameState } from '../GameState';
import { Entity } from '../../ecs/Entity';
import { events } from '../../core/EventBus';

export class ProjectileSystem {
    update(world: World, dt: number) {
        const projectiles = world.getEntitiesWith([ComponentType.Transform, ComponentType.Projectile]);
        const enemies = world.getEntitiesWith([ComponentType.Transform, ComponentType.Stats]);

        projectiles.forEach(pEntity => {
            const transform = pEntity.getComponent<Transform>(ComponentType.Transform)!;
            const proj = pEntity.getComponent<Projectile>(ComponentType.Projectile)!;

            let target = null;
            if (proj.targetId !== null) {
                target = enemies.find(e => e.id === proj.targetId);
            }

            // Move towards target if exists, else move linearly or destroy (for now destroy if no target logic is simple)
            // Ideally projectile should have a Velecity or Direction if target is lost, but homing is easier.

            if (!target || !target.active) {
                // For simplicity, if target lost, projectile fizzles OUT. 
                // Alternatively, could move to last known pos.
                pEntity.active = false;
                world.removeEntity(pEntity.id);
                return;
            }

            const targetPos = target.getComponent<Transform>(ComponentType.Transform)!.position;
            const dir = targetPos.sub(transform.position);
            const dist = dir.length();
            const moveStep = proj.speed * dt;

            if (dist <= moveStep || dist < proj.hitRadius) {
                // Hit!
                transform.position = targetPos.clone();

                if (proj.splashRadius > 0) {
                    this.applySplashDamage(world, enemies, transform.position, proj.damage, proj.splashRadius);
                } else {
                    this.applyDamage(world, target, proj.damage);
                }

                pEntity.active = false;
                world.removeEntity(pEntity.id);
            } else {
                // Move
                transform.position = transform.position.add(dir.normalize().scale(moveStep));
            }
        });
    }

    private applyDamage(world: World, target: Entity, damage: number) {
        const stats = target.getComponent<Stats>(ComponentType.Stats);
        if (stats) {
            stats.hp -= damage;

            // Emit damage event (or direct call if we had reference, but EventBus is cleaner)
            // For now, let's use a global custom event or just console?
            // User wants to SEE it.
            // Problem: ProjectileSystem doesn't have reference to RenderSystem.
            // Solution: Use EventBus.
            events.emit('SHOW_DAMAGE', {
                x: target.getComponent<Transform>(ComponentType.Transform)!.position.x,
                y: target.getComponent<Transform>(ComponentType.Transform)!.position.y,
                amount: damage
            });

            if (stats.hp <= 0) {
                target.active = false;
                world.removeEntity(target.id);
                GameState.addGold(stats.goldValue);
            }
        }
    }

    private applySplashDamage(world: World, enemies: Entity[], impactPos: any, damage: number, radius: number) {
        enemies.forEach(e => {
            const t = e.getComponent<Transform>(ComponentType.Transform);
            if (t && t.position.distance(impactPos) <= radius) {
                this.applyDamage(world, e, damage);
            }
        });
    }
}
