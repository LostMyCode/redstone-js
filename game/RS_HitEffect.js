import * as PIXI from "pixi.js";

import Pos from "../engine/Pos";
import { getRandomInt } from "../utils/RedStoneRandom";
import { ImageManager } from "./ImageData";
import RedStone from "./RedStone";
import CommonUI from "./interface/CommonUI";

export const MAX_HIT_EFFECT = 256;
export const MAX_BLOOD_EFFECT = 256;

export const HIT_INFO_WHITE_NUMBER = 0;
export const HIT_INFO_RED_NUMBER = 10;
export const HIT_INFO_GREEN_NUMBER = 20;
export const HIT_INFO_MAGIC_NUMBER = 30;

export const HIT_INFO_RED_MISS = 40;
export const HIT_INFO_WHITE_MISS = 41;
export const HIT_INFO_BLOCK = 42;
export const HIT_INFO_DODGE = 43;
export const HIT_INFO_SLIGHT_DAMAGE = 44;
export const HIT_INFO_NO_DAMAGE = 45;

export const HIT_BY_MONSTER_BORDER = 46;

export const HIT_INFO_TIME = 82;



const HitTextZoom = [
    100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
    100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
    100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
    100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
    100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
    100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
    100, 100, 100, 100, 100, 110, 120, 130, 140, 150,
    160, 170, 180, 190, 200, 210, 220, 230, 240, 250,
    260, 270, 280
];

const CriticalHitTextZoom = [
    100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
    100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
    100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
    100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
    100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
    100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
    100, 100, 100, 100, 100, 120, 140, 160, 180, 200,
    220, 240, 260, 280, 300, 320, 340, 360, 380, 400,
    420, 440, 460
];

export default class HitEffect {
    effect = 0;
    anm = 0;
    direct = 0;
    frame = 0;
    maxFrame = 0;
    frameCounter = 0;
    fps = 0;
    paletteIndex = 0;
    outputEffect = 0;
    pos = new Pos();
    xScale = 0;
    yScale = 0;
    isHitByMonster = false;

    hitInfoTime = 0;

    constructor() {
        this.effect = 0xffff;
        this.hitInfoKind = 0xffff;
        this.paletteIndex = 0xffff;
        this.shakeValue = 0;
        this.strHitInfo = "";
    }

    getRemainFrame() {
        return this.hitInfoTime;
    }

    sumDelta = 0;

    update() {
        if (this.frame !== 0xffff) {
            //
            // temp
            // this.frameCounter
            const delta = RedStone.mainCanvas.currentDelta;
            if (this.sumDelta + delta > 1000 / this.fps) {
                this.frame++;
                this.sumDelta = 0;
            } else {
                this.sumDelta += delta;
            }
        }

        this.frameCounter += this.fps;

        if (this.frame >= this.maxFrame) {
            this.frame = 0xffff;
        }

        this.hitInfoTime--;

        if (this.hitInfoTime <= 0) {
            this.hitInfoKind = 0xffff;
        }

        if (this.frame === 0xffff && this.hitInfoKind === 0xffff) {
            return false;
        }

        return true;
    }

    put(x, y) {
        x = x + this.pos.x;
        y = y + this.pos.y;

        let scaleValue = 1;

        if (this.frame !== 0xffff) {
            const pos = new Pos();

            pos.set(x, y);

            if (this.shakeValue) {
                pos.x = pos.x + getRandomInt(this.shakeValue, this.shakeValue * 2);
                pos.y = pos.y + getRandomInt(this.shakeValue, this.shakeValue * 2);
            }

            // ImageManager.putShadow(this.effect, pos.x, pos.y, this.anm, this.direct, this.frame, this.xScale / scaleValue, this.yScale / scaleValue);
            // console.log(this.anm);
            ImageManager.putWhichUsePalette(this.effect, pos.x, pos.y, this.paletteIndex, this.anm, this.direct, this.frame, this.xScale / scaleValue, this.yScale / scaleValue, this.outputEffect);
        }

        if (this.hitInfoKind !== 0xffff) {
            let width, zoom;

            zoom = HitTextZoom[this.hitInfoTime];
            width = 8 * zoom / 100;
            y -= (40 + (HIT_INFO_TIME - this.hitInfoTime));

            let hitInfoKind = this.hitInfoKind;

            if (this.hitInfoKind <= HIT_INFO_MAGIC_NUMBER) {
                x -= this.strHitInfo.length * width / 2;
                for (let i = 0; i < this.strHitInfo.length; i++) {
                    let index = parseInt(this.strHitInfo[i]) + hitInfoKind;

                    if (this.strHitInfo[i] === "+") {
                        hitInfoKind = HIT_INFO_MAGIC_NUMBER;
                        x -= 6;
                        y += 8;
                        continue;
                    }

                    if (this.isHitByMonster) {
                        index += HIT_BY_MONSTER_BORDER;
                    }

                    // sprHitText.put()
                    const sprite = new PIXI.Sprite(CommonUI.hitText.getPixiTexture(index));
                    sprite.position.set(x, y);
                    sprite.scale.set(zoom / 100, zoom / 100);
                    sprite.alpha = this.hitInfoTime / 32;
                    RedStone.gameMap.foremostContainer.addChild(sprite);

                    x += width;
                }
            } else {
                if (this.isHitByMonster) {
                    hitInfoKind += HIT_BY_MONSTER_BORDER;
                }

                // sprHitText.put()
            }
        }
    }
}