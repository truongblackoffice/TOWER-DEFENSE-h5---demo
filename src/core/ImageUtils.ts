export class ImageUtils {
    /**
     * Removes a specific background color from an image by setting its alpha to 0.
     * @param img The source HTMLImageElement
     * @param r Red component (0-255)
     * @param g Green component (0-255)
     * @param b Blue component (0-255)
     * @param tolerance Tolerance for color matching
     */
    static removeBackground(img: HTMLImageElement, r: number = 255, g: number = 255, b: number = 255, tolerance: number = 30): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            if (!img.complete || img.naturalWidth === 0) {
                // return original if not ready (or handle async loading before calling this)
                resolve(img);
                return;
            }

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(img);
                return;
            }

            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const red = data[i];
                const green = data[i + 1];
                const blue = data[i + 2];
                // const alpha = data[i + 3];

                if (Math.abs(red - r) <= tolerance &&
                    Math.abs(green - g) <= tolerance &&
                    Math.abs(blue - b) <= tolerance) {
                    data[i + 3] = 0; // Set Alpha to 0
                }
            }

            ctx.putImageData(imageData, 0, 0);

            const newImg = new Image();
            newImg.src = canvas.toDataURL();
            newImg.onload = () => resolve(newImg);
            newImg.onerror = reject;
        });
    }
}
