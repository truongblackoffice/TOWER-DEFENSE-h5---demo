import { Component, ComponentType } from './Components';

let nextId = 0;

export class Entity {
    public id: number;
    public active: boolean = true;
    public components: Map<ComponentType, Component> = new Map();

    constructor() {
        this.id = nextId++;
    }

    addComponent(component: Component): Entity {
        this.components.set(component.type, component);
        return this;
    }

    getComponent<T extends Component>(type: ComponentType): T | undefined {
        return this.components.get(type) as T;
    }

    hasComponent(type: ComponentType): boolean {
        return this.components.has(type);
    }
}
