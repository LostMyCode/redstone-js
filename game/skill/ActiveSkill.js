import WrappedAnim from "../../engine/WrappedAnim";
import { getRandomInt } from "../../utils/RedStoneRandom";
import { GetDirect } from "../ActionH";
import EffectDataManager from "../EffectDataManager";
import { ImageManager } from "../ImageData";
import RedStone from "../RedStone";
import SoundManager from "../SoundManager";
import Actor from "../actor/Actor";
import { getAnglePos, getAngleToTarget, getOvalAnglePos, getTargetPos } from "../../engine/Angle";
import { getOvalRange, random } from "../../engine/SFC";
import Pos from "../../engine/Pos";
import Skill2 from "../models/Skill2";
import Ability from "./Ability";
import HitInfo from "./HitInfo";
import { SKILL_FIRE_RESULT_FAILED, SKILL_FIRE_RESULT_OK, SKILL_TYPE_BIT_GLIDER, SKILL_TYPE_EXPLOSION_DEPEND_ON_IMAGE, SKILL_TYPE_MACHINE_MISSILE, SKILL_TYPE_SPECIAL_MISSILE, SKILL_TYPE_WATER_FALL, ST_CAST, ST_EXPLOSION } from "./SkillDefine";
import SkillManager from "./SkillManager";
import { SYNC_FPS } from "../GameH";

export default class ActiveSkill {
    constructor() {
        /**
         * @type {Ability}
         */
        this.ability = null;
        this.serial = 0;
        this.type = 0xffff;
        /**
         * @type {Skill2}
         */
        this.skill = null;
        /**
         * @type {Actor}
         */
        this.caster = null;
        /**
         * @type {Actor}
         */
        this.target = null;
        this.door = null;

        this.posTarget = new Pos();
        this.pos = new Pos();
        this.posBegin = new Pos();

        this.anm = 0;
        this.direct = 0;
        this.frame = 0;
        this.maxFrame = 0;
        this.frameCounter = 0;
        this.fps = 0;

        this.angle = 0;
        this.range = 0;

        this.activeField = 0;
        this.skillType = 0;
        this.hitInfo = new HitInfo();
        this.continuousHits = [];

        this.reset();
    }

    reset() {
        if (this.caster && this.skill) {
            if (this.caster.useSkill === this.serial) {
                this.caster.useSkill = 0xffff;
            }

            // 
        }

        if (this.target && this.skill.targetMarkImage !== 0xffff) {
            this.target.targetMark = 0xffff;
        }

        this.serial = 0xffff;
        this.caster = null;
        this.target = null;
        this.anm = 0;
        this.direct = 0;
        this.frame = 0;
        this.frameCounter = 0xffff;
        this.isGetdCP = false;
        this.angle = 1;

        this.height = 0;
        this.hitInfo.reset();
        this.continuousHits = [];
        this.values = [];
    }

    fire(isIndependenceCasterSkill) {
        if (this.type !== SKILL_TYPE_SPECIAL_MISSILE && this.caster.isDeath() && !isIndependenceCasterSkill) {
            return false;
        }

        let fireResult = SKILL_FIRE_RESULT_FAILED;

        switch (this.type) {
            case SKILL_TYPE_BIT_GLIDER: fireResult = this.fireBitGlider(); break;
            case SKILL_TYPE_SPECIAL_MISSILE: fireResult = this.fireSpecialMissile(); break;

            case SKILL_TYPE_EXPLOSION_DEPEND_ON_IMAGE: fireResult = this.fireExplosionTypeSkillDependOnImage(); break;
            case SKILL_TYPE_WATER_FALL: fireResult = this.fireWaterFall(); break;
        }

        if (fireResult !== SKILL_FIRE_RESULT_OK) {
            this.serial = 0xffff;
            return false;
        }

        if (isIndependenceCasterSkill) return true;

        if (this.type !== SKILL_TYPE_MACHINE_MISSILE && this.type !== SKILL_TYPE_SPECIAL_MISSILE) {
            this.operateSkillEffect();

            let range = 0;

            // if (this.caster && RedStone.hero)

            // if (range < )
            SoundManager.playCastingSound(this.skill);

            // this.caster.setExclusiveAction(this.skill.isExclusiveAction);
        }

        // if ...

        // if (this.skill.spentHPPercentage) ...

        // if (this.skill.spentHPPercentageBasedBloodWing && ...)

        return true;
    }

    update() {
        switch (this.type) {
            case SKILL_TYPE_EXPLOSION_DEPEND_ON_IMAGE: return this.updateExplosionTypeSkillDependOnImage();
            case SKILL_TYPE_BIT_GLIDER: return this.updateBitGlider();
            case SKILL_TYPE_SPECIAL_MISSILE: return this.updateSpecialMissile();
            case SKILL_TYPE_WATER_FALL: return this.updateWaterFall();
        }
    }

    put() {
        switch (this.type) {
            case SKILL_TYPE_SPECIAL_MISSILE: this.putSpecialMissile(); break;

            case SKILL_TYPE_EXPLOSION_DEPEND_ON_IMAGE: this.putExplosionTypeSkillDependOnImage(); break;
        }
    }

    operateSkillEffect() {
        if (this.caster) {
            this.caster.operateSkillEffectForCaster(this.ability);
        }
        if (this.target) {
            this.target.operateSkillEffectForTarget(this.ability);
        }
    }

    fireSpecialMissile() {
        if (this.skill.shootImage === 0xffff) return SKILL_FIRE_RESULT_FAILED;

        if (this.caster && this.skill.isGroundMissile === false) {
            this.height = this.caster.getHeight() + this.caster.getBodyHeight(false) * 2 / 3;
            this.pos.x = this.caster.pos.x;
            this.pos.y = this.caster.pos.y;
            this.pos.y -= this.height;
        } else {
            this.height = 0;
        }

        if (this.target && !this.skill.isGroundMissile) {
            this.destHeight = this.target.getBodyHeight(false) * 2 / 3;
        } else {
            this.destHeight = 0;
        }

        this.posBegin.x = this.pos.x;
        this.posBegin.y = this.pos.y;

        this.frameCounter = 0;
        this.maxFrame = ImageManager.effects[this.skill.shootImage].getFrameCount(0);
        this.fps = ImageManager.effects[this.skill.shootImage].getFPS(0);

        const directCount = ImageManager.effects[this.skill.shootImage].getDirectCount(0);

        this.angle = getAngleToTarget(this.pos.x, this.pos.y, this.posTarget.x, this.posTarget.y, 2);
        this.direct = GetDirect(this.angle, directCount);

        this.setSpecialMissileUpkeepTime(this.skill.skillSpareValues[0]);
        this.setIsMagicMissile(this.skill.skillSpareValues[3]);

        const minSinHeight = this.skill.skillSpareValues[4];
        const maxSinHeight = Math.max(this.skill.skillSpareValues[5], minSinHeight);
        const rand = Math.random() * getRandomInt(minSinHeight, maxSinHeight);

        this.setMagicMissileMaxSinHeight(rand);
        this.setMagicMissileAcceleration(this.skill.skillSpareValues[6]);
        this.resetSpecialMissileCurrentUpkeepTime();

        this.castSpecialMissile();

        return SKILL_FIRE_RESULT_OK;
    }

    castSpecialMissile() {
        this.frameCounter = 0;

        if (this.skill.shootImage === 0xffff) return;

        const directCount = ImageManager.effects[this.skill.shootImage].getDirectCount(0);

        if (this.target) {
            this.posTarget.x = this.target.pos.x;

            if (this.skill.isGroundMissile) {
                this.posTarget.y = this.target.pos.y;
            } else {
                this.posTarget.y = this.target.pos.y - this.destHeight - this.target.getHeight(false);
            }
        }

        const angle = getAngleToTarget(this.posTarget.x, this.posTarget.y, this.pos.x, this.pos.y);

        this.maxFrame = ImageManager.effects[this.skill.shootImage].getFrameCount(0);
        this.fps = ImageManager.effects[this.skill.shootImage].getFPS(0);
        this.frame = 0;

        this.angle = getAngleToTarget(this.pos.x, this.pos.y, this.posTarget.x, this.posTarget.y, 1);
        this.direct = GetDirect(this.angle, directCount);

        if (this.skill.imageRadius) {
            getTargetPos(this.pos, this.posTarget.x, this.posTarget.y, this.skill.imageRadius);
        }

        if (this.getIsMagicMissile()) {
            // const range = Math.sqrt();
            //
            throw new Error("Magic missile is not supported yet");
        }

        this.lastDistance = 0x7fffffff;
    }

    putSpecialMissile() {
        if (this.skill.shootImage === 0xffff) return;
        // console.log("put special missile");

        /**
         * @type {WrappedAnim}
         */
        const missileAnim = ImageManager.effects[this.skill.shootImage];

        if (this.getIsMagicMissile()) {
            //
        } else {
            const x = this.pos.x; // getScaledXPos(pos.x)
            const y = this.pos.y; // getScaledYPos(pos.y)
            missileAnim.putPixiSprite(RedStone.gameMap.foremostContainer,
                "body",
                x, y, this.anm, this.direct, this.frame
            )
        }

        switch (this.skill.afterImageType) {
            //
        }
    }

    sumDelta = 0;

    updateSpecialMissile() {
        if (this.getIsMagicMissile()) {
            // return this.updateMagicMissile();
            return;
        }

        // if (this.frameCounter >= )
        const delta = RedStone.mainCanvas.currentDelta;
        if (this.sumDelta + delta > 1000 / this.fps) {
            this.frame++;
            this.sumDelta = 0;
        } else {
            this.sumDelta += delta;
        }

        this.frameCounter += this.fps;

        const pos = this.pos;

        if (this.target) {
            this.posTarget.x = this.target.pos.x;

            if (this.skill.isGroundMissile) {
                this.posTarget.y = this.target.pos.y;
            } else {
                this.posTarget.y = this.target.pos.y - this.destHeight - this.target.getHeight();
            }
        }

        getTargetPos(pos, this.posTarget.x, this.posTarget.y, this.skill.speed);

        const currentRange = getOvalRange(pos.x, pos.y, this.posTarget.x, this.posTarget.y);

        if (currentRange >= this.lastDistance) {
            if (this.getSpecialMissileCurrentUpkeepTime() === 0) {
                if (this.caster && this.target) {
                    this.caster.strike(this.target, this.ability, this.hitInfo, this.direct, false);
                }

                if (!this.caster && this.target) {
                    this.target.strike(this.target, this.ability, this.hitInfo, this.direct, false);
                }
            }

            this.increaseSpecialMissileCurrentUpkeepTime();

            if (this.getSpecialMissileCurrentUpkeepTime() >= this.getSpecialMissileUpkeepTime()) {
                return true;
            }

            return false;
        }

        if (this.skill.missileFollowImage !== 0xffff) {
            const posFollow = this.pos;

            if (this.skill.missileDustRange) {
                getTargetPos(posFollow, this.posBegin.x, this.posBegin.y, this.skill.missileDustRange);
            }

            // float effect add
        }

        this.lastDistance = currentRange;
        this.pos = pos;

        return false;
    }

    fireBitGlider() {
        this.caster.action(this.posTarget.x, this.posTarget.y, this.skill.action);

        return SKILL_FIRE_RESULT_OK;
    }

    castBitGlider() {
        const arrowGab = 20;

        let hitInfo;

        let pos = new Pos();
        let damage = 0;
        let shotCount = this.getContinuousAttackShotCount();
        let distance = arrowGab / 2;
        let hitIndex = 0;

        if (!this.caster || !this.target) return;

        const casterArrowHeight = this.caster.getHeight() + this.caster.getBodyHeight() * 2 / 3;
        this.posTarget = this.target.pos;
        const angle = getAngleToTarget(this.pos.x, this.pos.y, this.posTarget.x, this.posTarget.y, 1);
        const gliderAngle1 = (angle + 90) % 360;
        const gliderAngle2 = (angle + 360 - 90) % 360;

        SoundManager.playActionSound(this.skill);

        if (shotCount % 2 === 1) {
            shotCount--;
            // this.caster.attackInfo.aInfo[hitIndex++];
            // damage += hitInfo.getDamage();
            hitInfo = new HitInfo();
            // temp
            hitInfo.physicalDamage = 100000 + Math.floor(Math.random() * 1000000);

            SkillManager.castSpecialMissile(null, this.target, this.pos.x, this.pos.y - casterArrowHeight, hitInfo, this.ability);

            distance = arrowGab;
        }

        for (let i = 0; i < shotCount / 2; i++) {
            // pos = this.pos;
            pos.x = this.pos.x;
            pos.y = this.pos.y;
            getAnglePos(pos, gliderAngle1, distance);

            if (!this.caster || !this.target) return;

            // hitInfo = this.caster.attackInfo.aInfo[hitIndex++];
            // damage += hitInfo.getDamage();
            hitInfo = new HitInfo();
            // temp
            hitInfo.physicalDamage = 100000 + Math.floor(Math.random() * 1000000);

            if (SkillManager.castSpecialMissile(this.caster, this.target, pos.x, pos.y - casterArrowHeight, hitInfo, this.ability) === 0xffff) {
                break;
            }

            pos = this.pos;
            getAnglePos(pos, gliderAngle2, distance);
            // hitInfo = this.caster.attackInfo.aInfo[hitIndex++];

            hitInfo = new HitInfo();
            // temp
            hitInfo.physicalDamage = 100000 + Math.floor(Math.random() * 1000000);

            if (SkillManager.castSpecialMissile(null, this.target, pos.x, pos.y - casterArrowHeight, hitInfo, this.ability) === 0xffff) {
                break;
            }

            distance += arrowGab;
        }

        if (!this.caster || !this.target) return;

        if (damage && this.caster.isHero()) {
            // g_hero.increaseCP(m_ability.getGetCP());
        }
    }

    updateBitGlider() {
        if (this.caster.isTriggerFrame) {
            this.castBitGlider();
            return true;
        }

        return false;
    }

    fireExplosionTypeSkillDependOnImage() {
        if (this.skill.type === SKILL_TYPE_EXPLOSION_DEPEND_ON_IMAGE) {
            this.caster.action(this.posTarget.x, this.posTarget.y, this.skill.action);
        } else {
            this.castExplosionTypeSkillDependOnImage();
        }

        this.setExplosionWhichDependOnImageSkillScale(20);
        this.setExplosionWhichDependOnImageSkillZoommingStart();
        this.setExplosionWhichDependOnImageSkillFrameStart();

        if (this.skill.isRefitImageSizeByHitRange) {
            const hitRange = this.ability.getHitRange(null);
            const scale = ~~(hitRange * 100 / this.skill.imageRadius);

            this.setExplosionWhichDependOnImageSkillScale(scale);
        }

        if (this.skill.skillSpareValues[0]) {
            this.height = this.caster.getBodyHeight();
        } else {
            this.height = 0;
        }

        return SKILL_FIRE_RESULT_OK;
    }

    castExplosionTypeSkillDependOnImage() {
        if (this.skill.type !== SKILL_TYPE_WATER_FALL) {
            SoundManager.playActionSound(this.skill);
        }

        if (this.skill.explosionImage === 0xffff) {
            return false;
        }

        const castingTime = ~~(this.skill.castingTime * SYNC_FPS / 1000);

        this.setDependOnImageExplosionSkillCastingTime(castingTime);
        this.setDependOnImageExplosionSkillHitCount();

        let directCount = 0;

        this.maxFrame = ImageManager.effects[this.skill.explosionImage].getFrameCount(0);
        this.fps = ImageManager.effects[this.skill.explosionImage].getFPS(0);
        this.frameCounter = 0;
        this.anm = 0;

        if (this.skill.type === SKILL_TYPE_WATER_FALL) {
            this.anm = getRandomInt(0, ImageManager.effects[this.skill.explosionImage].anmCount - 1);
        }

        this.fps = ~~(this.fps * this.skill.correctFPS / 100);

        this.direct = this.caster.direct;
        directCount = ImageManager.effects[this.skill.explosionImage].getDirectCount(0);

        this.direct = Math.min(directCount - 1, this.direct);

        if (this.skill.shakeTiming === ST_CAST) {
            if (this.skill.shakeIntensity) {
                //
            }
        }

        return true;
    }

    updateExplosionTypeSkillDependOnImage() {
        if (!this.caster) return true;

        if (!this.skill) return true;

        if (this.frameCounter === 0xffff) {
            if (this.caster.isTriggerFrame) {
                if (!this.castExplosionTypeSkillDependOnImage()) {
                    return true;
                }
            }

            return false;
        }

        if (this.decreaseDependOnImageExplosionSkillCastingTime()) {
            return false;
        }

        if (this.skill.isZoomInEffectSkill && this.isExplosionWhichDependOnImageSkillZoomming()) {
            // 
        }

        while (this.frameCounter >= SYNC_FPS) {
            this.frameCounter -= SYNC_FPS;
            this.frame++;

            if (this.frame >= this.maxFrame) {
                if (this.skill.isZoomInEffectSkill) {
                    this.setExplosionWhichDependOnImageSkillDeclineScale();
                } else {
                    return true;
                }
            }

            if (!this.skill || !ImageManager.effects[this.skill.explosionImage]) {
                return true;
            }

            if (ImageManager.effects[this.skill.explosionImage].isDamage(0, this.frame)) {
                if (this.skill.shakeTiming === ST_EXPLOSION) {
                    if (this.skill.shakeIntensity) {
                        //
                    }
                }

                if (this.getDependOnImageExplosionSkillHitCount() === 0) {
                    if (this.skill.type === SKILL_TYPE_EXPLOSION_DEPEND_ON_IMAGE) {
                        SoundManager.playExplosionSound(this.skill);
                    }
                }

                this.increaseDependOnImageExplosionSkillHitCount();
            }
        }

        this.frameCounter += this.fps;

        if (this.skill.isZoomInEffectSkill && this.isExplosionWhichDependOnImageSkillDeclineScale()) {
            let scale = this.getExplosionWhichDependOnImageSkillScale();

            scale -= ~~(scale / 4);
            scale = Math.max(scale, 10);

            this.setExplosionWhichDependOnImageSkillScale(scale);

            if (scale <= 10) {
                return true;
            }
        }

        return false;
    }

    putExplosionTypeSkillDependOnImage() {
        if (this.frameCounter === 0xffff) return;
        if (this.skill.explosionImage === 0xffff) return;
        if (this.skill.isRapeExplosionImage) return;
        if (this.frame >= this.maxFrame) return;
        if (this.skill.isZoomInEffectSkill && this.isExplosionWhichDependOnImageSkillZoomming()) {
            return;
        }

        let scale = this.skill.imageScale;

        if (this.skill.isZoomInEffectSkill || this.skill.isRefitImageSizeByHitRange) {
            scale = this.getExplosionWhichDependOnImageSkillScale();
        }

        // temp
        const gameScale = 100;

        // scale = ~~(scale * gameScale / 100);

        let x = this.posTarget.x; // getScaledXPos(posTarget.x)
        let y = this.posTarget.y - this.height; // getScaledYPos()

        if (this.skill.isRefitImageSizeByHitRange && scale >= 100) {
            const frameCount = ImageManager.effects[this.skill.explosionImage].getFrameCount(0);

            let width = 0;
            let height = 0;

            for (let i = 0; i < frameCount; ++i) {
                width = Math.max(width, ImageManager.effects[this.skill.explosionImage].getSpriteWidth(0, 0, i));
                height = Math.max(height, ImageManager.effects[this.skill.explosionImage].getSpriteHeight(0, 0, i));
            }

            const scaleWidth = ~~(width * scale / 100);
            const scaleHeight = ~~(height * scale / 100);
            x -= ~~(scaleWidth - width) / 2;
            y -= ~~(scaleHeight - height) / 2;
        }

        ImageManager.putWhichUsePalette(this.skill.explosionImage, x, y, this.skill.paletteIndex, this.anm, this.direct, this.frame, scale, scale, this.skill.outputEffect);
    }

    fireWaterFall() {
        this.caster.action(this.caster.pos.x, this.caster.pos.y, this.skill.action);

        this.frameCounter = 0xffff;
        this.resetWaterFallUpkeepTime();
        this.resetWaterFallStrikePeriod();
        this.resetWaterFallCasting();
        this.resetWaterFallStrikeTime();

        return SKILL_FIRE_RESULT_OK;
    }

    castWaterFall() {
        this.frameCounter = 0;

        if (this.skill.shakeIntensity) {
            //
        }

        this.setWaterFallUpkeepTime(this.ability.getUpkeepTime() * SYNC_FPS);
        this.setWaterFallCasting();

        let iHitRange = this.ability.getHitRange(null);
        let iHitCount = 6;

        if (this.skill.skillSpareValues[1])
            iHitCount = this.skill.skillSpareValues[1];

        for (let i = 0; i < iHitCount; i++)
            this.strikeWaterFall(360 / iHitCount * i + random(20), iHitRange / 2 + random(iHitRange / 2));

        SoundManager.playActionSound(this.skill);
    }

    strikeWaterFall(_iAngle, _iDistance) {
        const pos = new Pos(this.posTarget.x, this.posTarget.y);

        getOvalAnglePos(pos, _iAngle, _iDistance);

        const pos2 = new Pos(this.posTarget.x, this.posTarget.y);

        let range = getOvalRange(pos2.x, pos2.y, pos.x, pos.y);

        range = ~~Math.sqrt(range);

        SkillManager.castExplosion(this.caster, pos.x, pos.y, this.ability);
    }

    updateWaterFall() {
        if (!this.isWaterFallCasting()) {
            if (this.frameCounter != 0xffff) {
                if (this.decreaseWaterFallCastingTime())
                    return false;

                this.castWaterFall();
            }
            else
                if (this.caster.isTriggerFrame) {
                    if (this.skill.isInstanceWaterFall)
                        this.castWaterFall();
                    else {
                        const pos = new Pos;

                        this.caster.getReleasePos(pos);

                        SkillManager.castCustomMissile(pos.x, pos.y, pos.x, pos.y - 400, this.ability);

                        const castingTime = this.skill.castingTime * SYNC_FPS / 1000;

                        this.setWaterFallCastingTime(castingTime);

                        this.frameCounter = 0;
                    }
                }

            return false;
        }

        if (this.decreaseWaterFallUpkeepTime())
            return true;

        const hitRange = this.ability.getHitRange(null);
        let hitPeriod = 3;

        if (this.skill.skillSpareValues[2])
            hitPeriod = this.skill.skillSpareValues[2];

        if (random(0, hitPeriod) == 0)
            this.strikeWaterFall(random(360), random(hitRange));

        return false;
    }

    setContinuousAttackShotCount = shotCount => this.values[0] = shotCount;
    getContinuousAttackShotCount = () => this.values[0];
    setContinuousAttackActionFPS = fps => this.values[1] = fps;
    getContinuousAttackActionFPS = () => this.values[1];

    setSpecialMissileUpkeepTime = frame => this.values[1] = frame;
    getSpecialMissileUpkeepTime = () => this.values[1];
    resetSpecialMissileCurrentUpkeepTime = () => this.values[2] = 0;
    increaseSpecialMissileCurrentUpkeepTime = () => this.values[2]++;
    getSpecialMissileCurrentUpkeepTime = () => this.values[2];
    setIsMagicMissile = isMagicMissile => this.values[3] = isMagicMissile;
    getIsMagicMissile = () => this.values[3];
    setMagicMissileMaxSinHeight = height => this.values[4] = height;
    getMagicMissileMaxSinHeight = () => this.values[4];

    setMagicMissileAcceleration = acceleration => this.values[8] = acceleration;
    getMagicMissileAcceleration = () => this.values[8];

    setExplosionWhichDependOnImageSkillScale(_iValue) { this.values[0] = _iValue; }
    getExplosionWhichDependOnImageSkillScale() { return this.values[0]; }

    setExplosionWhichDependOnImageSkillZoommingStart() { this.values[1] = 0; }
    isExplosionWhichDependOnImageSkillZoomming() { if (this.values[1] == 0) return true; return false; }
    setExplosionWhichDependOnImageSkillZoommingComplete() { this.values[1] = 1; }
    setExplosionWhichDependOnImageSkillDeclineScale() { this.values[1] = 2; }
    isExplosionWhichDependOnImageSkillDeclineScale() { if (this.values[1] == 2) return true; return false; }
    setExplosionWhichDependOnImageSkillDeclineScaleFinish() { this.values[1] = 3; }

    setExplosionWhichDependOnImageSkillFrameStart() { this.values[2] = 0; }
    setExplosionWhichDependOnImageSkillFrameFinish() { this.values[2] = 1; }
    isExplosionWhichDependOnImageSkillFrameFinish() { if (this.values[2] == 1) return true; return false; }

    setDependOnImageExplosionSkillCastingTime(_iTime) { this.values[3] = _iTime; }
    decreaseDependOnImageExplosionSkillCastingTime() {
        if (this.values[3] == 0) return false;
        this.values[3]--;

        return true;
    }

    getDependOnImageExplosionSkillHitCount() { return this.values[4]; }
    setDependOnImageExplosionSkillHitCount(time = 0) { this.values[4] = 0; }
    increaseDependOnImageExplosionSkillHitCount() { this.values[4]++; }

    resetWaterFallUpkeepTime() { this.values[0] = 0; }
    setWaterFallUpkeepTime(_iUpkeepTime) { this.values[0] = _iUpkeepTime; }
    decreaseWaterFallUpkeepTime() {
        if (this.values[0] == 0) return true;

        this.values[0]--;

        return false;
    }

    resetWaterFallStrikePeriod() { this.values[1] = 0; }
    setWaterFallStrikePeriod(_iPeriod) { this.values[1] = _iPeriod; }
    getWaterFallStrikePeriod() { return this.values[1]; }

    resetWaterFallCasting() { this.values[2] = false; }
    isWaterFallCasting() { return this.values[2]; }
    setWaterFallCasting() { this.values[2] = true; }

    resetWaterFallStrikeTime() { this.values[3] = 0; }
    increaseWaterFallStrikeTime() { this.values[3]++; }
    getWaterFallStrikeTime() { return this.values[3]; }

    setWaterFallCastingTime(_iTime) { this.values[5] = _iTime; }
    decreaseWaterFallCastingTime() {
        if (this.values[5] == 0) return false;

        this.values[5]--;

        return true;
    }
}