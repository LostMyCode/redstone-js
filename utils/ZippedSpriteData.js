import * as PIXI from "pixi.js";
import { loadZip } from ".";

class ZippedSpriteData {
    pixiTextures = new Map();

    async load(path) {
        this.unzip = await loadZip(path);
        this.fileNames = this.unzip.getFilenames();

        for (let fileName of this.fileNames) {
            if (/\.png$/.test(fileName)) {
                await this.convertPngToPixiTexture(fileName);
            }
        }
    }

    async convertPngToPixiTexture(fileName) {
        const data = this.unzip.decompress(fileName);
        const blob = new Blob([data], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        const texture = await PIXI.Texture.fromURL(url);

        this.pixiTextures.set(fileName, texture);

        return true;
    }

    getPixiTexture(fileName) {
        return this.pixiTextures.get(fileName);
    }

    getBuffer(fileName) {
        const data = this.unzip.decompress(fileName);

        return Buffer.from(data);
    }
}

export default ZippedSpriteData;