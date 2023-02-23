import * as PIXI from "pixi.js";

import CommonUI from "./interface/CommonUI";
import RedStone from "./RedStone";

/* 
    cSPRITE::Put(
        cSPRITE *this, 
        int x, 
        int y, 
        int index, 
        int xRate, 
        int yRate, 
        int effect(rgba data?), 
        int alpha(rgba data?), 
        int flip
    )
*/

class HitEffect {

    static ATTACK_DIGIT_START = 0;
    static CRITICAL_DIGIT_START = 10;
    static HEAL_DIGIT_START = 20;
    static MAGIC_DIGIT_START = 30;
    static MISS_RED_INDEX = 40;
    static MISS_WHITE_INDEX = 41;

    constructor() {
        this.ushort_this_3 = -1;
        this.ulong_this_10 = 0xFFFF;
        this.ushort_this_10 = -1;
        this.ushort_this_24 = 0;
        this.char_this_50 = ""; // hit damage digit str

        /**
         * @type {PIXI.Sprite[]}
         */
        this.sprites = [];
        this.alpha = 2;
        this.zoom = 260;
        this.isCompleted = false;

        this.updater = setInterval(() => {
            if (!this.sprites.length) return;

            const result = this.update();
            if (!result) {
                clearInterval(this.updater);
                this.isCompleted = true;
                this.destroy();
            }
        }, 50);
    }

    /**
     * @param {Number} param1_maybe_posX 
     * @param {Number} param2_maybe_posY 
     */
    put(param1_maybe_posX, param2_maybe_posY) {

        let x = param1_maybe_posX, y = param2_maybe_posY;
        let randLimit = 60; // idk

        x = x + Math.floor(Math.random() * randLimit);
        y = y + Math.floor(Math.random() * randLimit);

        let v9_hitEffectIdx = 0; // ulong this + 11
        let v17_frameOffset = (Math.random() >= 0.8 ? HitEffect.CRITICAL_DIGIT_START : HitEffect.ATTACK_DIGIT_START);
        let v18 = y; // idk
        // let v19_posY = v18 + v9_hitEffectIdx - 122;
        let v19_posY = v18 + v9_hitEffectIdx - 50;

        // putShadow
        // putWhichUsePalette

        const isAnnotation = false; // v8 > 30

        if (isAnnotation) {
            // if (ushort16 this + 18) v11(unknown) = v8 + 46;
            // cSPRITE.Put(g_sprHitText, v4 (x), v19 (y), v11 (unk), v10 (xRate), v10 (yRate), 10, v9, 0);
        } else {
            const damageDigitStr = `${Math.floor(Math.random() * 4000033) + 123000}`;
            const v4_posX = x;
            const v10_hitTextZoom = 100; // v10
            const v12_len = String(damageDigitStr).length; // v12
            let v13_posX = (8 * v10_hitTextZoom / 100 * v12_len) / -2 + v4_posX;

            if (v12_len > 0) {
                for (let i = 0; i < v12_len; i++) {
                    const digit = parseInt(damageDigitStr[i]);
                    // let v15_unk = digit + v17 - 48; // 48 = char code of 0
                    let v15_unk = digit + v17_frameOffset;
                    if (digit === "+") { // *14 == 43 | 43 == "+" ...? additional damage??
                        v13_posX -= 6;
                        v17_frameOffset = 30;
                        v19_posY += 8;
                    } else {
                        if (false /* ushort16 this + 18 */) {
                            v15_unk += 46;
                        }
                        /* 
                        cSPRITE.Put(
                            g_sprHitText,
                            v13_posX, v19_posY,
                            v15_unk,
                            v10_hitTextZoom, v10_hitTextZoom,
                            10,
                            ulong this + 11,
                            0
                        );
                         */
                        const frameIndex = v15_unk;
                        const sprite = new PIXI.Sprite(CommonUI.hitText.getPixiTexture(frameIndex));
                        sprite.position.set(v13_posX, v19_posY);
                        // sprite.scale.set(v10_hitTextZoom / 100, v10_hitTextZoom / 100);
                        sprite.anchor.set(0.5, 0);
                        sprite.scale.set(this.zoom / 100, this.zoom / 100);
                        this.sprites.push(sprite);
                        RedStone.mainCanvas.mainContainer.addChild(sprite);

                        v13_posX += 8 * v10_hitTextZoom / 100;
                    }
                }
            }
        }
    }

    destroy() {
        if (this.sprites.length) {
            RedStone.mainCanvas.mainContainer.removeChild(...this.sprites);
            this.sprites.forEach(s => s.destroy());
            this.sprites = [];
        }
    }

    update() {
        const sprites = this.sprites;

        let alpha = this.alpha - 0.1;

        if (alpha <= 0) {
            return false;
        }

        if (this.zoom > 100) {
            this.zoom = Math.max(100, this.zoom - 40);
        }

        sprites.forEach(sprite => {
            sprite.anchor.set(0.5, 0);
            sprite.scale.set(this.zoom / 100, this.zoom / 100);
            sprite.position.set(sprite.x, sprite.y - 2);
            sprite.alpha = Math.min(1, alpha);
        });

        this.alpha = alpha;

        return true;
    }

    _update_DC() {
        let v1 = 0; // int16
        let v2 = 0; // unsigned int16
        let v3 = 0; // unsigned int16
        let v4 = 0; // int

        v1 = this.ushort_this_6;

        if (v1 !== -1) {
            v2 = this.ushort_this_8;
            if (v2 >= 0x40) {
                this.ushort_this_8 = v2 - 64;
                this.ushort_this_6 = v1 + 1;
            }
            v3 = this.ushort_this_6;
            this.ushort_this_8 += this.ushort_this_9;
            if (v3 >= this.ushort_this_7) {
                this.ushort_this_6 = -1;
            }
        }
        v4 = this.ulong_this_11 - 1; // opacity maybe?
        this.ulong_this_11 = v4;
        if (v4 <= 0) {
            this.ulong_this_10 = 0xFFFF;
        }
        return this.ushort_this_6 !== 0xFFFF || this.ulong_this_10 !== 0xFFFF;
    }
}

export default HitEffect;