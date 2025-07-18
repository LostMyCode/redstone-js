import * as PIXI from "pixi.js";

import BufferReader, { TYPE_DEF } from "../utils/BufferReader";
import { PUT_NORMAL, SPRITE_BPP16, SPRITE_BPP8 } from "./DrawH";
import { REGSDHEADER, SDHEADER } from "./ImageH";
import Rect from "./Rect";
import { getRGBA15bit } from "../utils/RedStoneRandom";

const SHADOW_PIXEL_DATA = [7, 7, 7, 128]; // Alpha changed to 0-255 scale
const OUTLINE_PIXEL_DATA = [1, 1, 1, 255];

export default class RS_Sprite {
    constructor() {
        this.height = 0;
        this.maxSpriteWidth = 0;
        this.maxSpriteHeight = 0;

        this.frameCache = {
            body: [],
            shadow: [],
        };
    }

    close() {
        /**
         * @type {BufferReader}
         */
        this._16Sprite = null;
        /**
         * @type {BufferReader}
         */
        this._8Sprite = null;
        /**
         * @type {BufferReader}
         */
        this.layer = null;
        /**
         * @type {BufferReader}
         */
        this.shadow = null;

        this.spriteOffset = null;
        this.layerOffset = null;
        this.shadowOffset = null;
        this.plt = null;
        // lpPlt = null;
        this.serial = null;
    }

    reset() {
        this.count = 0;
        this.bpp = SPRITE_BPP16;
        this.serial = -1;
        this.isLoadedPlt = false;
        this.height = 0;
    }

    _load(buffer, loadPalette) {
        const reader = new BufferReader(buffer);

        const header = new SDHEADER(reader);

        console.log(header);

        this.bpp = header.bpp;
        this.isShadow = header.bShadow;
        this.isLayer = header.bOutline;
        this.count = header.imageCount;

        if (this.bpp === 16) {
            this.bpp = SPRITE_BPP16;
        } else {
            this.bpp = SPRITE_BPP8;
        }

        const result = this.load(reader, loadPalette);

        if (header.reg === REGSDHEADER) {
            this.getMaxSize();

            //
        } else {
            this.maxSpriteWidth = header.maxSpriteWidth;
            this.maxSpriteHeight = header.maxSpriteHeight;
            this.maxShadowWidth = header.maxShadowWidth;
            this.maxShadowHeight = header.maxShadowHeight;
        }
    }

    /**
     * @param {BufferReader} br 
     * @param {boolean} loadPalette 
     */
    load(br, loadPalette) {
        if (!(br instanceof BufferReader)) {
            this._load(br, loadPalette);
            return;
        }

        this.close();

        this.isLoadedPlt = loadPalette;

        if (this.bpp === SPRITE_BPP8) {
            if (loadPalette) {
                //   
            } else {
                this.plt = br.readStructUInt8(512);
            }
        }

        this.spriteOffset = br.readArray(this.count + 1, TYPE_DEF.UINT32, { asTypedArray: true });

        if (this.bpp === SPRITE_BPP16) {
            this._16Sprite = new BufferReader(
                Buffer.from(br.readArray(this.spriteOffset[this.count] * 2, TYPE_DEF.UINT8, { asTypedArray: true }))
            );
        } else {
            this._8Sprite = new BufferReader(
                Buffer.from(br.readArray(this.spriteOffset[this.count], TYPE_DEF.UINT8, { asTypedArray: true }))
            );
        }

        if (this.isShadow) {
            this.shadowOffset = br.readStructUInt32LE((this.count + 1));

            if (this.shadowOffset[this.count] > 0) {
                this.shadow = new BufferReader(Buffer.from(br.readStructUInt8(this.shadowOffset[this.count])));
            }
        }

        if (this.isLayer) {
            this.layerOffset = br.readStructUInt32LE(this.count + 1);
            this.layer = new BufferReader(Buffer.from(br.readStructUInt8(this.layerOffset[this.count])));
        } else {
            br.offset += this.count * 4;
            br.offset += br.readUInt32LE();
        }

        if (this._16Sprite) {
            const br = this._16Sprite;

            br.offset = 0;

            const width = br.readUInt16LE();
            const height = br.readUInt16LE();
            const left = br.readInt16LE();
            const top = br.readInt16LE();

            this.width = width;
            this.height = height - top;
        }
        if (this._8Sprite) {
            const br = this._8Sprite;

            br.offset = 0;

            const width = br.readUInt16LE();
            const height = br.readUInt16LE();
            const left = br.readInt16LE();
            const top = br.readInt16LE();

            this.width = width;
            this.height = top;
        }

        return true;
    }

    put(container, x, y, index, xRate = 100, yRate = 100, effect = 7, alpha = 32, flip = 0) {
        if (effect < PUT_NORMAL) {
            alpha = effect;
        }

        if (!this._8Sprite && !this._16Sprite) return;

        const sprite = this.createPixiSprite(x, y, index, xRate = 100, yRate = 100, effect = 7, alpha = 32, flip = 0);

        container.addChild(sprite);

        // _PutSprite
        // this.putSprite(
        //     x, y,
        //     this.bpp,
        //     flip,
        //     this._16Sprite[this.spriteOffset[index]],
        //     this._8Sprite[this.spriteOffset[index]],
        //     this.plt,
        //     xRate, yRate,
        //     effect,
        //     alpha,
        //     this.maxSpriteWidth,
        //     this.maxSpriteHeight
        // );
    }

    createPixiSprite(x, y, index, xRate = 100, yRate = 100, effect = 7, alpha = 32, flip = 0) {
        if (effect < PUT_NORMAL) {
            alpha = effect;
        }

        if (!this._8Sprite && !this._16Sprite) return;

        const texture = this.getPixiTexture(index);
        const sprite = new PIXI.Sprite(texture);

        sprite.position.set(x, y);
        sprite.scale.set(xRate / 100, yRate / 100);

        return sprite;
    }

    updatePixiSprite(pixiSprite, x, y, index, xRate = 100, yRate = 100, effect = 7, alpha = 32, flip = 0) {
        if (effect < PUT_NORMAL) {
            alpha = effect;
        }

        if (!this._8Sprite && !this._16Sprite) return;

        const texture = this.getPixiTexture(index);
        const sprite = pixiSprite;

        sprite.texture = texture;
        sprite.position.set(x, y);
        sprite.scale.set(xRate / 100, yRate / 100);

        return sprite;
    }

    /**
     * @param {number} index int
     * @param {Rect} rect 
     * @param {number} scale int
     */
    getRect(index, rect, scale = 100) {
        if (index >= this.count) {
            rect.set(-100000, -100000, -90000, -90000);
            return false;
        }

        const br = this._16Sprite || this._8Sprite;

        br.offset = this.spriteOffset[index];

        const width = br.readUInt16LE();
        const height = br.readUInt16LE();
        const left = br.readInt16LE();
        const top = br.readInt16LE();

        rect.x1 = ~~(- left * scale / 100);
        rect.y1 = ~~(- top * scale / 100);
        rect.x2 = ~~(rect.x1 + width * scale / 100);
        rect.y2 = ~~(rect.y1 + height * scale / 100);

        return true;
    }

    get16(index) {
        if (!this._16Sprite) return null;
        if (index >= this.count) return null;

        const reader = new BufferReader(this._16Sprite.buffer);

        reader.offset = this.spriteOffset[index];

        return reader;
    }

    get8(index) {
        if (!this._8Sprite) return null;
        if (index >= this.count) return null;

        const reader = new BufferReader(this._8Sprite.buffer);

        reader.offset = this.spriteOffset[index];

        return reader;
    }

    getSpriteWidth(index) {
        const reader = this.get16(index) || this.get8(index);

        if (reader) return reader.readUInt16LE();

        return 0;
    }

    getSpriteHeight(index) {
        const reader = this.get16(index) || this.get8(index);

        if (reader) {
            reader.offset += 2;
            reader.readUInt16LE();
        }

        return 0;
    }

    getMaxSize() {
        this.maxSpriteWidth = 0;
        this.maxSpriteHeight = 0;

        this.maxShadowWidth = 0;
        this.maxShadowHeight = 0;


    }

    // getSpriteMaxSize(maxWidth, )

    getOffset(frame, type = "body") {
        const pixelDataLength = this.bpp === SPRITE_BPP16 ? 2 : 1;

        if (type === "body") {
            const offset = this.spriteOffset[frame] * pixelDataLength;
            const nextOffset = this.spriteOffset[frame + 1] * pixelDataLength;
            return { offset, nextOffset };
        }

        if (type === "shadow") {
            const offset = this.shadowOffset[frame];
            const nextOffset = this.shadowOffset[frame + 1];
            return { offset, nextOffset };
        }
    }

    getSpriteData(type = "body") {
        if (type === "shadow") {
            return this.shadow;
        }
        return this._16Sprite || this._8Sprite;
    }

    getFrame(frame, type = "body") {
        const { offset, nextOffset } = this.getOffset(frame, type);
        const br = this.getSpriteData(type);

        br.offset = offset;

        const width = br.readUInt16LE();
        const height = br.readUInt16LE();
        const left = br.readInt16LE();
        const top = br.readInt16LE();

        return { width, height, left, top, dataOffset: offset };
    }

    getPixiTexture(frame, type = "body") {
        return this.frameCache[type][frame] || this.createFrameTexture(frame, type);
    }

    createFrameTexture(frame, type = "body") {
        const { pixelDataBuffer, width, height } = this.createFramePixelData(frame, type);
        const texture = PIXI.Texture.fromBuffer(pixelDataBuffer, width, height);

        this.frameCache[type][frame] = texture;

        return texture;
    }

    createFramePixelData(frame, type = "body") {
        const { dataOffset, width, height } = this.getFrame(frame, type);
        const reader = this.getSpriteData(type);
        const isUseOpacity = false; // tmp;
        let unityCount, unityWidth, w, h, colorReference, colorData1, colorData2;

        reader.offset = dataOffset + 8;

        const pixelDataBuffer = new Uint8ClampedArray(width * height * 4);

        const drawPixel = (x, y, rgba) => {
            if (x < 0 || x >= width || y < 0 || y >= height) return;
            const idx = (y * width + x) * 4;
            pixelDataBuffer[idx] = rgba[0];
            pixelDataBuffer[idx + 1] = rgba[1];
            pixelDataBuffer[idx + 2] = rgba[2];
            pixelDataBuffer[idx + 3] = rgba[3];
        };

        const drawBlendPixel = (x, y, rgba) => {
            if (x < 0 || x >= width || y < 0 || y >= height) return;
            const idx = (y * width + x) * 4;
            const src_r = rgba[0];
            const src_g = rgba[1];
            const src_b = rgba[2];
            const src_a = rgba[3] / 255;

            if (src_a === 1) {
                drawPixel(x, y, rgba);
                return;
            }

            const dst_r = pixelDataBuffer[idx];
            const dst_g = pixelDataBuffer[idx + 1];
            const dst_b = pixelDataBuffer[idx + 2];
            const dst_a = pixelDataBuffer[idx + 3] / 255;

            const out_a = src_a + dst_a * (1 - src_a);
            if (out_a === 0) {
                pixelDataBuffer[idx] = 0;
                pixelDataBuffer[idx + 1] = 0;
                pixelDataBuffer[idx + 2] = 0;
                pixelDataBuffer[idx + 3] = 0;
                return;
            }

            const out_r = (src_r * src_a + dst_r * dst_a * (1 - src_a)) / out_a;
            const out_g = (src_g * src_a + dst_g * dst_a * (1 - src_a)) / out_a;
            const out_b = (src_b * src_a + dst_b * dst_a * (1 - src_a)) / out_a;

            pixelDataBuffer[idx] = out_r;
            pixelDataBuffer[idx + 1] = out_g;
            pixelDataBuffer[idx + 2] = out_b;
            pixelDataBuffer[idx + 3] = out_a * 255;
        };

        if (type === "body") {
            if (this.bpp === SPRITE_BPP16) {
                for (h = 0; h < height; h++) {
                    unityCount = reader.readUInt16LE();
                    w = 0;

                    while (unityCount--) {
                        w += reader.readUInt16LE();
                        unityWidth = reader.readUInt16LE();

                        while (unityWidth--) {
                            colorData2 = reader.readUInt8();
                            colorData1 = reader.readUInt8();

                            drawPixel(w, h, getRGBA15bit(colorData1, colorData2, isUseOpacity));

                            w++;
                        }
                    }
                }
            } else {
                for (h = 0; h < height; h++) {
                    unityCount = reader.readUInt8();
                    w = 0;

                    while (unityCount--) {
                        w += reader.readUInt8();
                        unityWidth = reader.readUInt8();

                        while (unityWidth--) {
                            colorReference = reader.readUInt8();
                            colorData1 = this.plt[colorReference * 2 + 1];
                            colorData2 = this.plt[colorReference * 2];

                            drawPixel(w, h, getRGBA15bit(colorData1, colorData2, isUseOpacity));

                            w++;
                        }
                    }
                }
            }

        } else {
            const pixelData = type === "shadow" ? SHADOW_PIXEL_DATA : OUTLINE_PIXEL_DATA;

            for (h = 0; h < height; h++) {
                unityCount = reader.readUInt8();
                w = 0;

                while (unityCount--) {
                    w += reader.readUInt8();
                    unityWidth = reader.readUInt8();

                    while (unityWidth--) {
                        drawBlendPixel(w, h, pixelData);
                        w++;
                    }
                }
            }
        }

        return { pixelDataBuffer, width, height };
    }
}