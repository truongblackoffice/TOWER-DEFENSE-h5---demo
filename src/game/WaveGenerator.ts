import { WaveConfig } from '../data/Config';

export class WaveGenerator {
    static generateWaves(level: number, difficulty: 'easy' | 'normal' | 'hard'): WaveConfig[] {
        const waves: WaveConfig[] = [];
        const baseWaveCount = 30; // 30 waves per level

        let difficultyMult = 1;
        if (difficulty === 'easy') difficultyMult = 0.8;
        if (difficulty === 'hard') difficultyMult = 1.5;

        // Level scaling
        const levelMult = 1 + (level - 1) * 0.2; // Increase 20% per level

        for (let i = 1; i <= baseWaveCount; i++) {
            const isBoss = i % 10 === 0;
            const segments = [];

            const power = i * difficultyMult * levelMult;

            // Boss Wave
            if (isBoss) {
                // Boss logic
                const bossType = i >= 30 ? 'boss_mech' : 'heavy_tank'; // Uber boss at 30

                segments.push({
                    enemyId: bossType,
                    count: Math.max(1, Math.floor(i / 10)),
                    interval: 3.0
                });
                // Minions
                segments.push({
                    enemyId: 'soldier',
                    count: 10 + i,
                    interval: 0.5
                });
            }
            // Normal Wave
            else {
                // Mix logic
                const spawnCount = Math.floor(5 + power * 1.5);

                if (i < 5) {
                    segments.push({ enemyId: 'soldier', count: spawnCount, interval: 1.5 - (i * 0.05) });
                } else if (i < 10) {
                    segments.push({ enemyId: 'soldier', count: Math.floor(spawnCount * 0.7), interval: 1.0 });
                    segments.push({ enemyId: 'scout', count: Math.floor(spawnCount * 0.3), interval: 1.2 });
                } else if (i < 20) {
                    segments.push({ enemyId: 'tank', count: Math.floor(spawnCount * 0.2), interval: 2.0 });
                    segments.push({ enemyId: 'scout', count: Math.floor(spawnCount * 0.4), interval: 0.8 });
                    segments.push({ enemyId: 'soldier', count: Math.floor(spawnCount * 0.4), interval: 0.8 });
                } else {
                    // Hard waves
                    segments.push({ enemyId: 'heavy_tank', count: Math.floor(spawnCount * 0.15), interval: 2.5 });
                    segments.push({ enemyId: 'tank', count: Math.floor(spawnCount * 0.25), interval: 1.8 });
                    segments.push({ enemyId: 'scout', count: Math.floor(spawnCount * 0.6), interval: 0.4 }); // Swarm
                }
            }

            waves.push({
                id: i,
                delayBefore: isBoss ? 10 : 5,
                segments: segments
            });
        }

        return waves;
    }
}
