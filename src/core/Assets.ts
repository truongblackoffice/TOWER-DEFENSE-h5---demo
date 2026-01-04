export class Assets {
    private static images: { [key: string]: HTMLImageElement } = {};
    private static toLoad: number = 0;
    private static loaded: number = 0;

    static loadImage(name: string, src: string): void {
        if (this.images[name]) return; // Already loaded

        this.toLoad++;
        const img = new Image();
        img.src = src;
        img.onload = () => {
            this.loaded++;
            // console.log(`Loaded asset: ${name}`);
        };
        img.onerror = () => {
            console.error(`Failed to load asset: ${name} at ${src}`);
            this.loaded++; // Count as loaded to avoid blocking
        };
        this.images[name] = img;
    }

    static getImage(name: string): HTMLImageElement | undefined {
        return this.images[name];
    }

    static async processImage(name: string, processor: (img: HTMLImageElement) => Promise<HTMLImageElement>) {
        const img = this.images[name];
        if (!img) return;

        // Wait for it to load if it hasn't
        if (!img.complete) {
            await new Promise((resolve) => {
                img.onload = () => resolve(true);
            });
        }

        const newImg = await processor(img);
        this.images[name] = newImg;
    }

    static isReady(): boolean {
        return this.toLoad === this.loaded;
    }
}
