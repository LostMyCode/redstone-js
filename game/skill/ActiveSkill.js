import WrappedAnim from "../../engine/WrappedAnim";
import { getRandomInt } from "../../utils/RedStoneRandom";
import { GetDirect } from "../ActionH";
import EffectDataManager from "../EffectDataManager";
import { ImageManager } from "../ImageData";
import RedStone from "../RedStone";
import SoundManager from "../SoundManager";
import Actor from "../actor/Actor";
import { getAnglePos, getAngleToTarget, getTargetPos } from "../../engine/Angle";
import { getOvalRange } from "../../engine/SFC";
import Pos from "../../engine/Pos";
import Skill2 from "../models/Skill2";
import Ability from "./Ability";
import HitInfo from "./HitInfo";
import { SKILL_FIRE_RESULT_FAILED, SKILL_FIRE_RESULT_OK, SKILL_TYPE_BIT_GLIDER, SKILL_TYPE_MACHINE_MISSILE, SKILL_TYPE_SPECIAL_MISSILE } from "./SkillDefine";
import SkillManager from "./SkillManager";

export default class ActiveSkill {
    constructor() {
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
            case SKILL_TYPE_BIT_GLIDER: return this.updateBitGlider();
            case SKILL_TYPE_SPECIAL_MISSILE: return this.updateSpecialMissile();
        }
    }

    put() {
        switch (this.type) {
            case SKILL_TYPE_SPECIAL_MISSILE: this.putSpecialMissile(); break;
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

        const missile = EffectDataManager.aInfo[this.skill.shootImage];
        /**
         * @type {WrappedAnim}
         */
        const missileAnim = RedStone.player.shootDagger; // temp
        // console.log("check missile", missile, missileAnim);

        if (this.getIsMagicMissile()) {
            //
        } else {
            const x = this.pos.x; // getScaledXPos(pos.x)
            const y = this.pos.y; // getScaledYPos(pos.y)
            // missileAnim.putReg(x, y, this.anm, this.direct, this.frame,)
            missileAnim.putPixiSprite(RedStone.gameMap.foremostContainer,
                "body",
                x, y, this.anm, this.direct, this.frame
            )
            // console.log(x, y, this.anm, this.direct, this.frame);
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
}