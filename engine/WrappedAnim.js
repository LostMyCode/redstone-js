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

    getFrame(frame, type = "body") {
        const { offset, nextOffset } = this.getOffset(frame, type);
        const spriteData = (() => {
            if (type === "shadow") return this.sprite.shadow;
            return this.sprite._8Sprite;
        })();
        const br = new BufferReader(Buffer.from(spriteData.slice(offset, nextOffset)));
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

        return { reader: br, width, height, left, top };
    }

    getCanvas(frame, type = "body") {
        if (this.frameCache[type][frame]?.canvas) return this.frameCache[type][frame].canvas;

        const { reader, width, height } = this.getFrame(frame, type);
        const _drawPixel = this.canvasManager.drawPixel;
        const _getRGB = getRGBA15bit;
        const isUseOpacity = false; // tmp;
        let unityCount, unityWidth, w, h, colorReference, colorData1, colorData2;

        this.canvasManager.resize(width, height);

        for (h = 0; h < height; h++) {
            unityCount = reader.readUInt8();
            w = 0;

            while (unityCount--) {
                w += reader.readUInt8();
                unityWidth = reader.readUInt8();

                while (unityWidth--) {
                    if (type === "body") {
                        colorReference = reader.readUInt8();
                        colorData1 = this.sprite.plt[colorReference * 2 + 1];
                        colorData2 = this.sprite.plt[colorReference * 2];

                        _drawPixel.call(
                            this.canvasManager,
                            w,
                            h,
                            _getRGB.call(this, colorData1, colorData2, isUseOpacity)
                        )
                    } else {
                        this.canvasManager.drawBlendPixel(
                            w,
                            h,
                            type === "shadow" ? SHADOW_PIXEL_DATA : OUTLINE_PIXEL_DATA
                        )
                    }

                    w++;
                }
            }
        }

        this.canvasManager.update();

        const canvas = this.canvasManager.cloneCanvas();

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