import { World } from '../../ecs/World';
import { GameMap } from '../Map';
import { GameState } from '../GameState';
import { Input } from '../../core/Input';
import { ComponentType, Transform, Sprite, Tower, Targeting } from '../../ecs/Components';
import towersData from '../../data/towers.json';

export class InteractionSystem {
    private selectedTowerId: string | null = null;

    constructor(private map: GameMap, private world: World) {
        this.createBuildUI();
    }

    private createBuildUI() {
        const menu = document.getElementById('build-menu');
        if (!menu) return;
        menu.innerHTML = '';

        towersData.forEach(t => {
            const btn = document.createElement('button');
            btn.className = 'tower-build-btn'; // Add class for easy styling

            // Icon
            const icon = document.createElement('img');
            icon.src = `/images/${t.texture}.png`;
            icon.alt = t.name;

            // Label
            const label = document.createElement('span');
            label.innerText = `${t.name} ($${t.cost})`;

            btn.appendChild(icon);
            btn.appendChild(label);

            btn.style.borderColor = t.color; // Color border based on rarity/type

            btn.onclick = () => {
                this.selectedTowerId = t.id;
                console.log(`Selected ${t.name}`);
            };
            menu.appendChild(btn);
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.selectedTowerId = null;
        });
    }

    update(_dt: number) {
        if (Input.isMousePressed && this.selectedTowerId) {
            this.tryBuild();
        }
    }

    private tryBuild() {
        const gridPos = this.map.worldToGrid(Input.mousePos);

        if (!this.map.isBuildable(gridPos.x, gridPos.y)) {
            console.log("Cannot build here!");
            return;
        }

        const entities = this.world.getEntitiesWith([ComponentType.Transform, ComponentType.Tower]);
        const occupied = entities.some(e => {
            const t = e.getComponent<Transform>(ComponentType.Transform)!;
            const gp = this.map.worldToGrid(t.position);
            return gp.x === gridPos.x && gp.y === gridPos.y;
        });

        if (occupied) {
            console.log("Tile occupied!");
            return;
        }

        const config = towersData.find(t => t.id === this.selectedTowerId);
        if (!config) return;

        if (GameState.spendGold(config.cost)) {
            const worldPos = this.map.getCenter(gridPos);

            const e = this.world.createEntity();
            e.addComponent(new Transform(worldPos))
                .addComponent(new Sprite(config.color, 40, config.texture)) // Larger size 40, pass texture
                .addComponent(new Tower(config.range, config.damage, config.fireRate, config.projectileSpeed, (config as any).splashRadius || 0))
                .addComponent(new Targeting());

            console.log("Tower built!");
        } else {
            console.log("Not enough gold!");
        }
    }
}
