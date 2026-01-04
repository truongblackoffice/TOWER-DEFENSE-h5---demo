# Tower Defense H5 - Demo

A feature-rich 2D Tower Defense game built with TypeScript and HTML5 Canvas.

![Game Screenshot](https://via.placeholder.com/800x450?text=Tower+Defense+Demo)

## 🎮 Features

*   **Classic Tower Defense Gameplay**: Build towers to stop waves of enemies from reaching your base.
*   **Multiple Tower Types**:
    *   🏰 **Archer**: Basic fast-firing tower.
    *   💣 **Cannon**: Splash damage for groups.
    *   ❄️ **Ice**: Slows down enemies.
    *   ⚡ **Minigun**: High speed, low damage.
    *   🚀 **Rocket**: Long-range explosive damage.
    *   🎯 **Sniper**: High damage, slow fire rate.
*   **Dynamic Level System**:
    *   Multiple maps that cycle as you progress.
    *   **Dynamic Map Themes**: Maps change visual themes (Grass, Desert, Toxic) automatically.
    *   Progressive difficulty scaling.
*   **Advanced Enemies**:
    *   Soldiers, Scouts, Tanks, Heavy Tanks, and the massive **Boss Mech**.
*   **Game Controls**:
    *   ⏩ **Speed Control**: Toggle between x1, x2, and x4 speed.
    *   🔄 **Auto Wave**: Option to automatically start the next wave.
    *   💾 **Save/Load System**: Automatically saves your progress (Unlocked Levels).
*   **Tech Stack**:
    *   TypeSript
    *   Vite
    *   HTML5 Canvas (No external game engine, custom ECS architecture).

## 🚀 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/truongblackoffice/TOWER-DEFENSE-h5---demo.git
    cd TOWER-DEFENSE-h5---demo
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open your browser at `http://localhost:3000` (or the port shown in terminal).

4.  **Build for Production:**
    ```bash
    npm run build
    ```

## 🕹️ Controls

*   **Left Click**: Select Tower / Place Tower on Map.
*   **Game Speed**: Use the buttons (x1, x2, x4) in the top right.
*   **Start Wave**: Click "Start Wave" to begin the assault.

## 🛠️ Project Structure

*   `src/core`: Core engine systems (Game Loop, Input, EventBus, Entity-Component-System).
*   `src/game`: Game specific logic (Map, Wave Generator).
*   `src/game/states`: Game State Machine (Menu, Play, Game Over).
*   `src/game/systems`: ECS Systems (Render, Physics, Logic).
*   `src/data`: Game configuration (Towers, Enemies, Levels).

---

Developed by [Truong Black Office]
