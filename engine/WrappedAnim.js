import * as PIXI from "pixi.js";

import Texture from "../game/models/Texture";
import BufferReader from "../utils/BufferReader";
import CanvasManager from "../utils/CanvasManager";
import { getRGBA15bit } from "../utils/RedStoneRandom";
import Anim from "./Anim";

const SHADOW_PIXEL_DATA = [7, 7, 7, 0x80];
const OUTLINE_PIXEL_DATA = [1, 1, 1, 0xff];

export default class WrappedAnim extends Anim {
    constructor() {
        super();
        this.canvasManager = new CanvasManager;
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

    getCanvas(frame, type = "body") {
        if (this.frameCache[type][frame]?.canvas) return this.frameCache[type][frame].canvas;

        const canvas = this.drawCanvas(frame, type);

        return canvas;
    }

    drawCanvas(frame, type = "body") {
        const { dataOffset, width, height } = this.getFrame(frame, type);
        const reader = this.getSpriteData(type);
        const _drawPixel = this.canvasManager.drawPixel;
        const _getRGB = getRGBA15bit;
        const isUseOpacity = false; // tmp;
        let unityCount, unityWidth, w, h, colorReference, colorData1, colorData2;

        reader.offset = dataOffset + 8;

        this.canvasManager.resize(width, height);

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

                        _drawPixel.call(
                            this.canvasManager,
                            w,
                            h,
                            _getRGB.call(this, colorData1, colorData2, isUseOpacity)
                        )

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
                        this.canvasManager.drawBlendPixel(w, h, pixelData);

                        w++;
                    }
                }
            }
        }

        this.canvasManager.update();

        const canvas = this.canvasManager.canvas;

        this.canvasManager.reset();

        if (this.frameCache[type][frame]) {
            this.frameCache[type][frame].canvas = canvas;
        } else {
            this.frameCache[type][frame] = { canvas };
        }

        return canvas;
    }

    getPixiTexture(frame, type = "body") {
        if (this.frameCache[type][frame]?.texture) return this.frameCache[type][frame].texture;

        const canvas = this.getCanvas(frame, type);
        const texture = PIXI.Texture.from(canvas);

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
            x - this.frameCache[type][targetFrame].info.left,
            y - this.frameCache[type][targetFrame].info.top
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
            x - this.frameCache[type][targetFrame].info.left,
            y - this.frameCache[type][targetFrame].info.top
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
            x - this.frameCache[type][targetFrame].info.left,
            y - this.frameCache[type][targetFrame].info.top
        );

        return sprite;
    }
}