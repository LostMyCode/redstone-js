import * as PIXI from "pixi.js";

import Texture from "../game/models/Texture";
import BufferReader from "../utils/BufferReader";
import { getRGBA15bit } from "../utils/RedStoneRandom";
import Anim from "./Anim";

const SHADOW_PIXEL_DATA = [7, 7, 7, 128];
const OUTLINE_PIXEL_DATA = [1, 1, 1, 255];

export default class WrappedAnim extends Anim {
    constructor() {
        super();
        this.frameCache = {
            body: {},
            shadow: {}
        };
    }

    getOffset(frame, type = "body") {
        if (type === "body") {
            const offset = this.sprite.spriteOffset[frame];
            const nextOffset = this.sprite.spriteOffset[frame + 1];
            return { offset, nextOffset };
        }

        if (type === "shadow") {
            const offset = this.sprite.shadowOffset[frame];
            const nextOffset = this.sprite.shadowOffset[frame + 1];
            return { offset, nextOffset };
        }
    }

    getSpriteData(type = "body") {
        if (type === "shadow") {
            return this.sprite.shadow;
        }
        return this.sprite._16Sprite || this.sprite._8Sprite;
    }

    getFrame(frame, type = "body") {
        const { offset, nextOffset } = this.getOffset(frame, type);
        const br = this.getSpriteData(type);

        br.offset = offset;

        const width = br.readUInt16LE();
        const height = br.readUInt16LE();
        const left = br.readInt16LE();
        const top = br.readInt16LE();

        if (this.frameCache[type][frame]?.info) {
            this.frameCache[type][frame].info = { width, height, left, top };
        } else {
            this.frameCache[type][frame] = {
                info: { width, height, left, top }
            };
        }

        return { width, height, left, top, dataOffset: offset };
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
            for (h = 0; h < height; h++) {
                unityCount = reader.readUInt8();
                w = 0;

                while (unityCount--) {
                    w += reader.readUInt8();
                    unityWidth = reader.readUInt8();

                    while (unityWidth--) {
                        colorReference = reader.readUInt8();
                        colorData1 = this.sprite.plt[colorReference * 2 + 1];
                        colorData2 = this.sprite.plt[colorReference * 2];

                        drawPixel(w, h, getRGBA15bit(colorData1, colorData2, isUseOpacity));

                        w++;
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

    getPixiTexture(frame, type = "body") {
        if (this.frameCache[type][frame]?.texture) return this.frameCache[type][frame].texture;

        const { pixelDataBuffer, width, height } = this.createFramePixelData(frame, type);
        const texture = PIXI.Texture.fromBuffer(pixelDataBuffer, width, height);

        if (this.frameCache[type][frame]) {
            this.frameCache[type][frame].texture = texture;
        } else {
            this.frameCache[type][frame] = { texture };
        }

        return texture;
    }

    putPixiSprite(container, type = "body", x, y, anm, direct, frame, xRate = 100, yRate = 100) {
        const animData = this.anmData[anm];
        const targetFrame = animData.getSprite(direct, frame, this.isFlip);

        const texture = this.getPixiTexture(targetFrame, type);
        const sprite = new PIXI.Sprite(texture);

        y -= this.posRefit.y;
        x -= this.posRefit.x;

        sprite.scale.set(xRate / 100, yRate / 100);
        sprite.position.set(
            x - this.frameCache[type][targetFrame].info.left * (xRate / 100),
            y - this.frameCache[type][targetFrame].info.top * (yRate / 100)
        );

        container.addChild(sprite);
    }

    createPixiSprite(type = "body", x, y, anm, direct, frame, xRate = 100, yRate = 100) {
        const animData = this.anmData[anm];
        const targetFrame = animData.getSprite(direct, frame, this.isFlip);
        const texture = this.getPixiTexture(targetFrame, type);
        const sprite = new PIXI.Sprite(texture);

        y -= this.posRefit.y;
        x -= this.posRefit.x;

        sprite.scale.set(xRate / 100, yRate / 100);
        sprite.position.set(
            x - this.frameCache[type][targetFrame].info.left * (xRate / 100),
            y - this.frameCache[type][targetFrame].info.top * (yRate / 100)
        );

        return sprite;
    }

    updatePixiSprite(sprite, type = "body", x, y, anm, direct, frame, xRate = 100, yRate = 100) {
        const animData = this.anmData[anm];
        const targetFrame = animData.getSprite(direct, frame, this.isFlip);
        const texture = this.getPixiTexture(targetFrame, type);

        y -= this.posRefit.y;
        x -= this.posRefit.x;

        sprite.texture = texture;
        sprite.scale.set(xRate / 100, yRate / 100);
        sprite.position.set(
            x - this.frameCache[type][targetFrame].info.left * (xRate / 100),
            y - this.frameCache[type][targetFrame].info.top * (yRate / 100)
        );

        return sprite;
    }
}