import { logger } from "./RedStoneRandom";

const CANVAS_DEFAULT_WIDTH = 150;
const CANVAS_DEFAULT_HEIGHT = 150;

class CanvasManager {
    constructor() {
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");

        this.width = 0;
        this.height = 0;
        this.imageData = null;
        this.backgroundColor = [255, 255, 255, 0xff]; // rgba
        this.isErrorOccurred = false;
    }

    reset() {
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");

        this.width = 0;
        this.height = 0;
        this.imageData = null;

        this.isErrorOccurred = false;
    }

    initialize() {
        this.resize(CANVAS_DEFAULT_WIDTH, CANVAS_DEFAULT_HEIGHT);
    }

    getDataURL() {
        return this.canvas.toDataURL("image/png");
    }

    resize(width, height) {
        width = width === 0 ? 1 : width;
        height = height === 0 ? 1 : height;

        if (!width || !height || width > 0xffff || height > 0xffff) {
            return;
        }

        if (width === this.width && height === this.height) {
            return;
        }

        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.imageData = this.context.createImageData(this.width, this.height);
    }

    drawPixel(x, y, rgba) {
        if (x < 0 || this.width <= x || y < 0 || this.height <= y) {
            this.isErrorOccurred = true;
            return
        }

        const pixelData = this.imageData.data;
        const index = (x + y * this.width) * 4;

        pixelData[index + 0] = rgba[0];
        pixelData[index + 1] = rgba[1];
        pixelData[index + 2] = rgba[2];
        pixelData[index + 3] = rgba[3];
    }

    drawBlendPixel(x, y, rgba) {
        if (x < 0 || this.width <= x || y < 0 || this.height <= y) {
            this.isErrorOccurred = true;
            return
        }

        var pixelData = this.imageData.data;
        var index = (x + y * this.width) * 4;
        var oldR = pixelData[index + 0];
        var oldG = pixelData[index + 1];
        var oldB = pixelData[index + 2];
        var oldA = pixelData[index + 3];
        var opacity = rgba[3] / 255;

        pixelData[index + 0] = oldR * (1 - opacity) + (rgba[0] * opacity);
        pixelData[index + 1] = oldG * (1 - opacity) + (rgba[1] * opacity);
        pixelData[index + 2] = oldB * (1 - opacity) + (rgba[2] * opacity);
        pixelData[index + 3] = Math.min(0xff, oldA + rgba[3]);
    }

    update() {
        this.context.putImageData(this.imageData, 0, 0);

        if (this.isErrorOccurred) {
            logger.error("error_draw")
            this.isErrorOccurred = false;
        }
    }

    clear() {
        if (!this.imageData) return;
        var pixelData = this.imageData.data;
        var i = pixelData.length;

        while (i--) {
            pixelData[i] = 0;
        }
    }
}

export default CanvasManager;