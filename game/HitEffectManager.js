import { getRandomInt } from "../utils/RedStoneRandom";
import EffectDataManager from "./EffectDataManager";
import { ImageManager } from "./ImageData";
import HitEffect, { HIT_INFO_NO_DAMAGE, HIT_INFO_RED_MISS, HIT_INFO_TIME } from "./RS_HitEffect";

export default new class HitEffectManager {
    constructor() {
        /**
         * @type {HitEffect[]}
         */
        this.hitEffects = [];

        this.reset();
    }

    reset() {
        this.hitCount = 0;
        this.rookie = 0;

        this.hitEffects.forEach((hitEffect) => {
            hitEffect.effect = 0xffff;
        });
        this.hitEffects = [];
    }

    update(index) {
        return this.hitEffects[index].update();
    }

    get(index) {
        this.hitEffects[index];
    }

    put(index, x, y) {
        this.hitEffects[index].put(x, y);
    }

    remove(index) {
        this.hitEffects[index].effect = 0xffff;

        if (index < this.rookie) {
            this.rookie = index;
        }

        this.hitCount--;

        return true;
    }

    // Add a Strike Effect
    addEffect(x, y, effect, direct, argAnm = 65535, shakeValue = 0, xScale = 100, yScale = 100, isHalfFaram = false) {
        if (effect === 0xffff) {
            return 0xffff;
        }

        const hitEffect = this.hitEffects[this.rookie] || (this.hitEffects[this.rookie] = new HitEffect());

        let anm = getRandomInt(0, ImageManager.effects[effect].anmCount - 1);
        const directCount = ImageManager.effects[effect].anmData[anm].directCount;

        if (ImageManager.effects[effect].isFlip) {
            anm = 0;
        }
        if (argAnm !== 0xffff) {
            anm = argAnm;
        }

        direct = Math.min(direct, directCount - 1);

        hitEffect.effect = effect;
        hitEffect.pos.x = x;
        hitEffect.pos.y = y;

        hitEffect.frame = 0;
        hitEffect.frameCounter = 0;
        hitEffect.paletteIndex = 0xffff;
        hitEffect.anm = anm;
        hitEffect.direct = direct;
        if (isHalfFaram) {
            hitEffect.fps = ImageManager.effects[effect].getFPS(anm) / 2;
        } else {
            hitEffect.fps = ImageManager.effects[effect].getFPS(anm);
        }
        hitEffect.maxFrame = ImageManager.effects[effect].getFrameCount(anm);
        hitEffect.hitInfoKind = 0xffff;
        hitEffect.hitInfoTime = HIT_INFO_TIME;
        hitEffect.shakeValue = shakeValue;
        hitEffect.xScale = xScale;
        hitEffect.yScale = yScale;
        hitEffect.outputEffect = 0xffff;

        this.hitCount++;

        effect = this.rookie;

        const emptySlotIndex = this.hitEffects.findIndex(hitEffect => hitEffect.effect === 0xffff);
        this.rookie = emptySlotIndex === -1 ? this.hitEffects.length : emptySlotIndex;

        return effect;
    }

    /**
     * Shows both hit effects and hit information
     * @param {number} x int
     * @param {number} y int
     * @param {number} effect int
     * @param {number} hitInfo int
     * @param {number} physicalDamage int
     * @param {number} magicDamage int
     * @param {number} direct int
     * @param {boolean} isOwnTeam 
     * @param {number} anm int
     */
    addEffectAndInfo(x, y, effect, hitInfo, physicalDamage, magicDamage, direct, isOwnTeam, anm = 0xffff) {

        if (effect === 0xffff) {
            // addInfo
        }

        const hitEffect = this.hitEffects[this.rookie] || (this.hitEffects[this.rookie] = new HitEffect());

        hitEffect.isHitByMonster = isOwnTeam;

        if (magicDamage) {
            // 
        } else {
            if (physicalDamage) {
                hitEffect.strHitInfo = physicalDamage.toString();
            } else {
                if (hitInfo < HIT_INFO_RED_MISS) {
                    hitEffect.hitInfoKind = HIT_INFO_NO_DAMAGE;
                    hitEffect.strHitInfo = "";
                }
            }
        }

        effect = this.addEffect(x, y, effect, direct, anm);

        hitEffect.hitInfoKind = hitInfo;

        return effect;
    }
}