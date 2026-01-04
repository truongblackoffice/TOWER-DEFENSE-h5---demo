import { Entity } from './Entity';
import { ComponentType } from './Components';

export class World {
    private entities: Entity[] = [];
    private entitiesToAdd: Entity[] = [];
    private entitiesToRemove: number[] = []; // IDs

    createEntity(): Entity {
        const entity = new Entity();
        this.entitiesToAdd.push(entity);
        return entity;
    }

    removeEntity(id: number): void {
        this.entitiesToRemove.push(id);
    }

    update(): void {
        // Add new entities
        if (this.entitiesToAdd.length > 0) {
            this.entities.push(...this.entitiesToAdd);
            this.entitiesToAdd = [];
        }

        // Remove marked entities
        if (this.entitiesToRemove.length > 0) {
            this.entities = this.entities.filter(e => {
                const shouldRemove = this.entitiesToRemove.includes(e.id);
                if (shouldRemove) {
                    e.active = false;
                }
                return !shouldRemove;
            });
            this.entitiesToRemove = [];
        }
    }

    // Simple linear query (optimize later with archetypes if needed for 1000s of entities)
    getEntitiesWith(types: ComponentType[]): Entity[] {
        return this.entities.filter(e =>
            e.active && types.every(t => e.hasComponent(t))
        );
    }

    getAllEntities(): Entity[] {
        return this.entities;
    }

    clear(): void {
        this.entities = [];
        this.entitiesToAdd = [];
        this.entitiesToRemove = [];
    }
}
