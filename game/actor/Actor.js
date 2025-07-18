import * as PIXI from "pixi.js";

import Pos from "../../engine/Pos";
import { loadTexture } from "../../utils";
import { getRandomInt } from "../../utils/RedStoneRandom";
import { ACT_CHANGE1, ACT_DEAD, ACT_READY, ACT_SITDOWN, GetDirect } from "../ActionH";
import Camera from "../Camera";
import EffectDataManager from "../EffectDataManager";
import HitEffectManager from "../HitEffectManager";
import { HeroBody, ImageManager } from "../ImageData";
import RedStone from "../RedStone";
import SoundManager from "../SoundManager";
import CommonUI from "../interface/CommonUI";
import { ActorImage, CType, MonsterType } from "../models/Actor";
import MonsterSource from "../models/MonsterSource";
import Ability from "../skill/Ability";
import HitInfo from "../skill/HitInfo";
import { HEOP_FOOT, HEOP_HIT_ZONE, HEOP_ON_THE_HEAD, HEOP_SHOULDER, JOB_MONSTER_START } from "../skill/SkillDefine";
import SkillManager from "../skill/SkillManager";
import { AK_MONSTER, AK_NPC, AK_PLAYER } from "./ActorH";
import ActorManager from "./ActorManager";

class Actor {
    constructor() {
        this.horizonScale = 100;
        this.verticalScale = 100;
        this.abilityUse = new Ability();
        this.pos = new Pos();

        this.frame = 0;
        this.sumDelta = 0;
        this.anm = 0;

        this.jumpHeight = 0;
        this.heightJumpRush = 0;
        this.heightEffectJump = 0;
        this.levitateHeight = 0;

        this.reset();
    }

    reset() {
        // ActorData.reset();

        this.hitEffects = [];

        this.auraImage = 0xffff;
        this.moveSpeed = 100;
        this.actionSpeed = 100;
        // this.miniPetType = 
        // this.miniPetType2 = 

        this.blockerAngle = 0xffff;
        this.isCastBlocker = false;
        this.machineSkill = 0xffff;
        this.machineAngle = 0xffff;
        this.intervalShooter = 0xffff;

        this.direct = 0;
        this.useSkill = 0xffff;

        this.hillSkill = 0xffff;
        this.lordActor = 0xffff;
        this.slaveActor = 0xffff;
        this.guildSerial = 0xffff;
        this.blockerShape = 0xffff;
        this.spearBlockerShape = 0xffff;

        this.abilityUse.reset();

        // destroy cached sprites
        this.guageSprite?.destroy();
        this.brightSprite?.destroy();
        this.headIconSprite?.destroy();
        this.guildIconSprite?.destroy();
        this.guageSprite = null;
        this.brightSprite = null;
        this.headIconSprite = null;
        this.guildIconSprite = null;

        //
    }

    remove() {
        // TODO: remove hit effects

        this.reset();
    }

    update(delta) {
        const body = this.getBody();
        const animData = body.anmData[this.anm];

        if (this.job === 6) {
            // console.log("frame", this.frame, "fps:", animData.fps, "fcount:", animData.frameCount, "direct:", this.direct);

        }

        if (this.sumDelta + delta > 1000 / animData.fps) {
            if (!this.lockFrame_tmp && !(this.frame === 0 && body.isOccasionallyRestAction)) {
                this.frame++;
            }

            if (this.frame >= animData.frameCount) {
                if (this.anm === ACT_DEAD) {
                    this.frame = animData.frameCount - 1;
                    this.lockFrame_tmp = true;
                } else {
                    this.frame = 0;
                }
            }
            this.sumDelta = 0;
        } else {
            this.sumDelta += delta;
        }

        this.updateFrame();

        this.updateEffect();

        return true;
    }

    getBody() {

        let body = null;

        // for (let i = 2; i;) {
        //     --i;

        //     //

        //     body = 
        // }

        // temp
        if (this.job  < 19 && !this._isMonster_tmp) {
            const bodyName = HeroBody[this.job * 3];
            body = RedStone.anims[bodyName];
            return body;
        }
        const monsterSource = MonsterSource.allMonsters[this.job];
        const actorTextureName = this._isMonster_tmp ? MonsterType[monsterSource.textureId] : ActorImage[this.job];
        body = RedStone.anims[actorTextureName];

        return body;
    }

    getHillHeight() {
        if (this.hillSkill === 0xffff) return 0;

        const skill = SkillManager.get(this.hillSkill);

        if (!skill) return 0;

        return skill.height * this.verticalScale / 100;
    }

    getHeight(isIncludeLevitateHeight) {
        let height = this.getHillHeight() + (this.jumpHeight + this.heightJumpRush + this.heightEffectJump) * this.verticalScale / 100;

        if (isIncludeLevitateHeight) {
            height += this.levitateHeight * this.verticalScale / 100;
        }

        return height;
    }

    getBodyHeight(isWantApplyScale) {
        if (isWantApplyScale) {
            return this.getBody().sprite.height * this.verticalScale / 100;
        }
        return this.getBody().sprite.height;
    }

    action(x, y, action, angle) {
        // if (this.isStunedStatus()) return;

        // if 

        if (action === 0xffff) return;

        this.setAnm(action);
    }

    /**
     * @param {number} anm 
     * @param {boolean} isForeced 
     */
    setAnm(anm, isForeced) {
        const body = this.getBody();

        if (!body || anm >= body.anmCount) return;

        //

        this.fps = this.getFPS(anm);

        //

        let isMoveAction = false;

        if (anm <= 1 && this.anm <= 1) {
            isMoveAction = true;
        }

        //

        if (anm === this.anm) {
            if (isMoveAction) {
                this.directCount = this.getDirectCount(this.anm);
                this.direct = GetDirect(this.angle, this.directCount);
            }

            this.frameCount = this.getFrameCount(this.anm);

            return;
        }

        this.frame = 0;

        this.anm = anm;
        this.directCount = this.getDirectCount(this.anm);
        this.frameCount = this.getFrameCount(this.anm);
    }

    attackToActorByContinuousAttack(packet) {
        const target = packet.target;
        const ability = new Ability();
        let skill;

        ability.set(packet.skill, packet.level);

        skill = ability.getSkill();

        this.useSkill = SkillManager.castContinuousAttackSkill(this, target, ability, packet.attackCount, packet.fps);

        return true;
    }

    updateFrame() {
        //

        this.isDamageFrame = this.getBody().isDamage(this.anm, this.frame);
        this.isTriggerFrame = this.getBody().isTrigger(this.anm, this.frame);

        if (this.getBody().isOccasionallyRestAction) {
            if (this.frame === 0 && this.anm === ACT_READY) {
                const rand = getRandomInt(0, 1000);

                if (rand === 0) {
                    this.frame++;
                }
            }
        } else {
            this.frameCounter += this.fps;
        }

        return true;
    }

    strike(target, ability, hitInfo, direct, isGetCP = true, isPlayHitSound = true) {
        target.hit(this, ability, hitInfo, direct, isPlayHitSound);

        // if (isGetCP && hitInfo.isHit() && this.isHero()) {
        //     hero.increaseCP
        // }

        // operateGGG
    }

    /**
     * @param {Actor} attacker 
     * @param {Ability} ability 
     * @param {HitInfo} hitInfo 
     * @param {number} direct 
     * @param {boolean} isPlaySound 
     * @param {boolean} isMirrorTower 
     */
    hit(attacker, ability, hitInfo, direct, isPlaySound = true, isMirrorTower = false) {
        // if ((attacker && attacker.isHero()) || this.isHero()) {
        //     hero.nonBattleTime = 0;
        // }

        if (attacker && !isMirrorTower) {
            // if ...
        }

        // const isAttackToShakle = 
        const isHideDamageNumber = false;

        if (this.isBoss) {
            //
        }

        const skill = ability.getSkill();
        const posHit = new Pos();
        const posAttacker = new Pos();

        if (attacker) {
            posAttacker.x = attacker.pos.x;
            posAttacker.y = attacker.pos.y;
        } else {
            posAttacker.x = this.x;
            posAttacker.y = this.y;
        }

        this.getHitPointCorrectPos(skill.hitImageOutputPart, posHit);

        const { x, y } = posHit;
        let physicalDamage = hitInfo.physicalDamage;
        let magicDamage = hitInfo.magicDamage;
        const damage = hitInfo.getDamage();
        // const attackClass = 
        const isOwnTeam = false; //this.isOwnTeam();

        // if 

        // if (hitInfo.isHitTheOtherSelf())

        // if (hitInfo.isImmune()) {
        //     this.addHitEffect(0, - this.getBody().sprite.height + 10, im.criticalHitEffect, 0, 7, 1)
        // }

        //

        if (physicalDamage) {
            physicalDamage = Math.max(~~(physicalDamage / 100), 1);
        }
        if (magicDamage) {
            magicDamage = Math.max(~~(magicDamage / 100), 1);
        }

        if (this.hillSkill === 0xffff || (this.hillSkill !== 0xffff && !ability.isCloseRangeDamageAttack())) {
            let hitInfoType = 0;

            //

            const HIT_INFO_WHITE_NUMBER = 0;
            hitInfoType = HIT_INFO_WHITE_NUMBER;

            if (skill.damageAttribute === 0 && !isMirrorTower) {
                //
            } else {
                if (isHideDamageNumber) {
                    physicalDamage = 0;
                    magicDamage = 0;
                }

                let hitImage = skill.hitImage;
                // if (hitInfo.isHitFire()) {
                //     hitImage = 521;
                // }

                // console.log("check phys dama", x, y, hitImage, hitInfoType, physicalDamage, magicDamage, direct, isOwnTeam);
                const iHitEffect = HitEffectManager.addEffectAndInfo(x, y, hitImage, hitInfoType, physicalDamage, magicDamage, direct, isOwnTeam);
                this.hitEffects.push(iHitEffect);
            }

            //
        } else {
            // const hillSkill = SkillManager.get(this.hillSkill);

            //
        }

        if (isPlaySound) {
            SoundManager.playHitSound(skill);
        }

        // temp
        if (!this.killed_tmp) {
            this.kill();
        }
        this.killed_tmp = true;
        if (attacker.isHero() && !attacker.lvupAttatched_tmp) {
            const rand = getRandomInt(0, 0);
            rand === 0 && Array(3).fill(0).forEach(() => attacker.attatchLevelUpEffect());
            attacker.lvupAttatched_tmp = true;
        }

        //
    }

    updateEffect() {
        // 

        this.hitEffects.forEach((hitEffect, idx) => {
            if (hitEffect === 0xffff) return;

            if (!HitEffectManager.update(hitEffect)) {
                if (idx === this.shutInMagicBoxImage) {
                    this.shutInMagicBoxImage = 0xffff;
                }

                HitEffectManager.remove(hitEffect);
                this.hitEffects[idx] = 0xffff;
            }
        });

        //
    }

    put() {

        // temp

        let x, y;
        x = this.pos.x;
        y = this.pos.y;

        this.putHitEffect(x, y);

        //

        this.putFrontAdditionalEffect(x, y);
    }

    putHitEffect(x, y) {
        this.hitEffects.forEach(hitEffect => {
            if (hitEffect === 0xffff) return;

            HitEffectManager.put(hitEffect, x, y);
        });
    }

    /**
     * @param {number} part int
     * @param {Pos} pos 
     */
    getHitPointCorrectPos(part, pos) {
        switch (part) {
            case HEOP_HIT_ZONE:
                // TODO: fix random
                pos.x = this.getBody().rectCrash.x1 * this.horizonScale / 100 + getRandomInt(0, this.getBody().rectCrash.getWidth() * this.horizonScale / 100);
                pos.y = this.getBody().rectCrash.y1 * this.verticalScale / 100 + getRandomInt(0, this.getBody().rectCrash.getHeight() * this.verticalScale / 100);
                break;

            case HEOP_FOOT:
                pos.x = 0;
                pos.y = 0;
                break;

            case HEOP_SHOULDER:
                pos.x = 0;
                pos.y = - this.getBodyHeight() * 4 / 5;
                break;

            case HEOP_ON_THE_HEAD:
                pos.x = 0;
                pos.y = - this.getBodyHeight();
                break;
        }
    }

    /**
     * @param {Ability} ability 
     */
    operateSkillEffectForCaster(ability) {
        const skill = ability.getSkill();

        this.overlapAnm = skill.overlapAction;
        this.overlapAnm2 = skill.overlapAction2;

        if (skill.characterAfterImageType !== 0) {
            // afterImageOn()
        }

        // this.abilityUse.copy(ability)

        if (skill.casterHitImage !== 0xffff) {
            this.addEffect(skill.casterHitImageOutputPart, skill.casterHitImage);
        }
    }

    operateSkillEffectForTarget(ability) {
        //
    }

    getFreeHitIndex() {
        // temp
        return this.hitEffects.length;
    }

    addEffect(effectOutputPos, image, anm, xScale, yScale) {
        // temp
        const pos = new Pos();

        this.getHitPointCorrectPos(effectOutputPos, pos);

        this.hitEffects.push(HitEffectManager.addEffect(pos.x, pos.y, image, direct, anm, 0, xScale, yScale));
    }

    addHitEffect(dx, dy, effect, direct = 0, anm = 65535, shakeValue = 0, isHalfFaram = false) {
        const hitIndex = this.getFreeHitIndex();

        this.hitEffects[hitIndex] = HitEffectManager.addEffect(dx, dy, effect, direct, anm, shakeValue, 100, 100, isHalfFaram);
    }

    kill(isCorpse, isReleaseSummon) {

        //

        this.petWaitCommand = false;

        // attackInfo.reset();

        if (this.isDeath()) return;

        // 

        if (this.isNpc()) {
            this.corpseTime = 64 * 2; // temp
            return;
        }

        this.setAnm(ACT_DEAD);

        if (isCorpse) {
            this.frame = this.frameCount - 1;
        }

        if (this.isMonster() && this.body >= JOB_MONSTER_START && this.body <= 250) { // 250: tmp JOB_MONSTER_WHITE_SHADOW 
            if (Camera.isInView(this.pos.x, this.pos.y)) {
                SoundManager.playMonsterDeathSound(this.body - JOB_MONSTER_START);
            }
        }

        if (this.hillSkill !== 0xffff) {
            SkillManager.remove(this.hillSkill);
            this.hillSkill = 0xffff;
        }

        this.corpseTime = 0xffff;
        this.isReleaseSummonBeast = isReleaseSummon;

        this.blockerShape = 0xffff;
        this.spearBlockerShape = 0xffff;
    }

    attatchLevelUpEffect() {
        this.addHitEffect(0, 0, EffectDataManager.imageIndexData.m_wImageLevelUp);

        if (Camera.isInView(this.pos.x, this.pos.y)) {
            SoundManager.play("level_up.wav");
        }
    }

    putName(x, y, isOnlyGuage = false) {
        if ((!this.isNpc() && !this.isHero() && ActorManager.focusActor_tmp !== this) || this.isDeath()) return;

        const body = this.getBody();

        if (!body || this.anm >= body.anmCount) return;

        if (this.isHideName) return;

        //

        if (this.isRideTamer) return;

        if (this.talkTime && !this.isWarningMessage) return;

        if (!this.name) {
            // addToAskInfoActorList();
            return;
        }

        if (this.isPutName) return;

        //

        let name, baseName = this.name;

        if (this.isEventMob) {

        }


        const guageTexture = CommonUI.getGuage(this.isHero() ? "myPlayer" : (!this.isMonster() ? "npc" : "enemy"), this.name);
        const guageSprite = this.guageSprite || new PIXI.Sprite(guageTexture);

        guageSprite.position.set(x - guageSprite.width / 2, y - this.getBodyHeight(true) - 20);

        CommonUI.guageSprites.push(guageSprite);
        RedStone.gameMap.foremostContainer.addChild(guageSprite);
        this.guageSprite = guageSprite;

        const headIconTexture = CommonUI.getActorHeadIcon(this);

        if (headIconTexture) {
            const brightSprite = this.brightSprite || new PIXI.Sprite(CommonUI.shopIconBrightTexture);
            const sprite = this.headIconSprite || new PIXI.Sprite(headIconTexture);

            sprite.anchor.set(0.5, 0.5);
            sprite.position.set(x, y - this.getBodyHeight(true) - 60);

            brightSprite.anchor.set(0.5, 0.5);
            brightSprite.blendMode = PIXI.BLEND_MODES.ADD;
            brightSprite.position.set(x, y - this.getBodyHeight(true) - 60);

            RedStone.gameMap.foremostContainer.addChild(brightSprite, sprite);
            this.brightSprite = brightSprite;
            this.headIconSprite = sprite;
        }

        if (this.isHero()) {
            const sprite = this.guildIconSprite || new PIXI.Sprite(RedStone.player.guildIconTexture);
            sprite.width = 32;
            sprite.height = 32;
            sprite.position.set(guageSprite.x - 32, guageSprite.y - (32 - guageSprite.height) / 2);
            RedStone.gameMap.foremostContainer.addChild(sprite);
            this.guildIconSprite = sprite;
        }
    }

    putActorSimpleInfo(x, y) {
        //

        this.putName(x, y);
    }

    putFrontAdditionalEffect(x, y) {
        //

        this.putActorSimpleInfo(x, y);

        //
    }

    /**
     * @param {number} x int
     * @param {number} y int
     * @param {Ability} ability 
     * @param {number} range int
     */
    actionToGround(x, y, ability, range) {
        const skill = ability.getSkill();

        // this.stop();

        this.useSkill = SkillManager.castAtGround(this, x, y, ability, range);

        this.abilityUse.copy(ability);

        // TODO: decrease bullet

        return true;
    }

    getReleasePos(pos, anm = -1, direct = -1) {
        console.log(pos, anm, direct)
        if (anm == -1)
            anm = anm;

        if (direct == -1)
            direct = direct;

        if (!this.getBody().anmData[anm]?.isRelease) {
            pos.x = this.pos.x;
            pos.y = this.pos.y;

            return;
        }

        const gameScale = 100; // temp
        pos.x = this.pos.x + this.getBody().anmData[anm].releasePos[direct].x * this.horizonScale / gameScale;
        pos.y = this.pos.y + this.getBody().anmData[anm].releasePos[direct].y * this.verticalScale / gameScale;
    }

    setExclusiveAction(_isSetting) { this.isExclusiveAction = _isSetting; }
    isExclusiveAction() { return this.isExclusiveAction; }

    isDeath = () => !!this.corpseTime;
    isCorpse = () => {
        if (this.corpseTime === 0) return false;
        if (this.frame >= this.frameCount - 1) return true;
        return false;
    }
    isOurForce = team => this.team === team;
    isSitdown = () => this.anm === ACT_SITDOWN;
    isOwnTeam = () => this.team === RedStone.hero.team;
    isMonster = () => this.actorKind === AK_MONSTER;
    isPlayer = () => this.actorKind === AK_PLAYER;
    isHero = () => this.serial === RedStone.hero.serial;
    isSlave = () => this.lordActor === RedStone.hero.serial;
    isNpc = () => this.actorKind === AK_NPC || this.actorKind > AK_MONSTER;

    getFrameCount = anm => this.getBody().getFrameCount(anm);
    getDirectCount = anm => this.getBody().getDirectCount(anm);
    getFPS = anm => this.getBody().getFPS(anm);
}

export default Actor;