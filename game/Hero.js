import * as PIXI from "pixi.js";
import { fetchBinaryFile, loadAnimation } from "../utils";
import BufferReader from "../utils/BufferReader";
import { DATA_DIR, SAVE_PLAYER_LOCATION } from "./Config";
import RedStone from "./RedStone";
import SaveData from "./SaveData";
import SettingsManager from "./SettingsManager";
import { JOB_ROGUE } from "./job/JobDefineH";
import Ability from "./skill/Ability";
import Listener from "./Listener";
import Camera from "./Camera";
import ActorManager from "./actor/ActorManager";
import { getAngle, getDirection, getDirectionString, getDistance } from "../utils/RedStoneRandom";
import { ACT_RUN, ACT_READY } from "./ActionH";
import Skill2 from "./models/Skill2";
import HitInfo from "./skill/HitInfo";
import { TILE_WIDTH, TILE_HEIGHT } from "./Config";

import Actor from "./actor/Actor";

class Hero extends Actor {

    /**
     * @type {BufferReader}
     */
    static jobDataBufferReader = null;

    static async loadDefaultJob() {
        const buffer = await fetchBinaryFile(`${DATA_DIR}/defaultJob.dat`);
        const br = new BufferReader(buffer);
        this.jobDataBufferReader = br;
    }

    constructor() {
        super();

        /**
         * @type {Ability[]}
         */
        this.ability = new Array(52);
        this.serial = 123123;

        this.job = SaveData.saveData?.job ?? JOB_ROGUE;

        // temp
        this.quickSkillsEachJob = SaveData.saveData?.quickSkillsEachJob || {};

        this.currentQuickSkillSlot = 0;
        this.quickSkills = Array(10).fill().map(a => Array(10).fill().map(b => Array(2).fill(0xffff)));

        window.addEventListener("jobChange", (e) => {
            const job = e.detail;
            this.job = job;
            this.init();
            SaveData.save();
        });

        this.init();
    }

    init() {
        if (!Hero.jobDataBufferReader) return;

        this.quickSkills =
            this.quickSkillsEachJob[this.job] ||
            Array(10).fill().map(a => Array(10).fill().map(b => Array(2).fill(0xffff)));

        this.ability = new Array(52);

        // Load saved location
        if (typeof SAVE_PLAYER_LOCATION !== 'undefined' && SAVE_PLAYER_LOCATION) {
            if (RedStone.lastLocation?.position) {
                const { x, y } = RedStone.lastLocation.position;
                this.pos.set(x, y);
                Camera.setPosition(x, y);
            }
        }
        Camera.setPosition(this.pos.x, this.pos.y);

        this.reset();

        const console = { log: () => { } } //window.console

        const br = Hero.jobDataBufferReader;
        br.offset = this.job * 3876;
        let a;
        a = br.readUInt32LE();
        console.log("level", a);
        a = br.readUInt32LE();
        console.log("exp", a);
        a = br.readUInt32LE();
        console.log("skill exp", a);
        a = br.readUInt32LE();
        console.log(" hp", a);
        a = br.readUInt32LE();
        console.log("max hp", a);

        a = br.readUInt32LE();
        console.log(" cp", a);
        a = br.readUInt32LE();
        console.log("max cp", a);

        a = br.readUInt16LE();
        console.log("m_wCorrectMaxHPFactor", a);
        a = br.readUInt16LE();
        console.log("m_wCorrectMaxHPConstitutionFactor", a);

        a = br.readInt16LE();
        console.log("m_sStrength", a);
        a = br.readInt16LE();
        console.log("m_sAgility", a);
        a = br.readInt16LE();
        console.log("m_sConstitution", a);
        a = br.readInt16LE();
        console.log("m_sWisdom", a);
        a = br.readInt16LE();
        console.log("m_sIntelligence", a);
        a = br.readInt16LE();
        console.log("m_sCharisma", a);
        a = br.readInt16LE();
        console.log("m_sLuck", a);
        a = br.readInt16LE();
        console.log("m_sSight", a);

        a = br.readInt16LE();
        console.log("m_sMinDamage", a);
        a = br.readInt16LE();
        console.log("m_sMaxDamage", a);
        a = br.readInt16LE();
        console.log("m_sDefensivePower", a);

        a = br.readInt16LE();
        console.log("m_sAllignment", a);

        a = br.readInt16LE();
        console.log("m_sFireResistance", a);
        a = br.readInt16LE();
        console.log("m_sWaterResistance", a);
        a = br.readInt16LE();
        console.log("m_sWindResistance", a);
        a = br.readInt16LE();
        console.log("m_sEarthResistance", a);
        a = br.readInt16LE();
        console.log("m_sLightResistance", a);
        a = br.readInt16LE();
        console.log("m_sDarkResistance", a);

        a = br.readInt16LE();
        console.log("m_sBlindResistance", a);
        a = br.readInt16LE();
        console.log("m_sPoisonResistance", a);
        a = br.readInt16LE();
        console.log("m_sSleepResistance", a);
        a = br.readInt16LE();
        console.log("m_sColdResistance", a);
        a = br.readInt16LE();
        console.log("m_sFreezeResistance", a);
        a = br.readInt16LE();
        console.log("m_sStunResistance", a);
        a = br.readInt16LE();
        console.log("m_sStoneResistance", a);
        a = br.readInt16LE();
        console.log("m_sConfuseResistance", a);
        a = br.readInt16LE();
        console.log("m_sCharmingResistance", a);

        a = br.readInt16LE();
        console.log("m_sBadStatusResistance", a);
        a = br.readInt16LE();
        console.log("m_sDeclinePowerResistance", a);
        a = br.readInt16LE();
        console.log("m_sCurseResistance", a);

        // --- CJobBasicDataDefine END

        br.offset += 1690; // skip CPlayerEquipment

        // --- CPlayerSaveData START

        a = br.readString(20);
        console.log("m_strId", a);

        a = br.readString(18);
        console.log("m_strName", a);

        a = br.readUInt16LE();
        console.log("m_wJob", a);
        a = br.readInt32LE();
        console.log("m_iGold", a);
        a = br.readUInt16LE();
        console.log("m_wLevelPoint", a);

        a = br.readUInt16LE();
        console.log("m_wCurrentField", a);

        a = br.readInt32LE();
        console.log("m_iXPos", a);
        a = br.readInt32LE();
        console.log("m_iYPos", a);

        a = br.readUInt16LE();
        console.log("m_wLastVillage", a);

        a = br.readUInt16LE();
        console.log("m_wGuildSerial", a);
        a = br.readUInt16LE();
        console.log("m_wGuildRank", a);
        a = br.readUInt16LE();
        console.log("m_wBonusSkillPoint", a);

        a = br.readUInt16LE();
        a = br.readUInt16LE();
        console.log("bit flags", a);

        // cAbility[]
        for (let i = 0; i < 52; i++) {
            const skill = br.readUInt16LE();
            const level = br.readUInt16LE();

            const ability = new Ability();
            ability.set(skill, level);
            // console.log(ability.getSkill()?.name);
            this.ability[i] = ability;
        }

        // CPlayerTitleInfo[]
        for (let i = 0; i < 50; i++) {
            a = br.readUInt8();
            // console.log("m_bTitle", a);

            a = br.readUInt8();
            // console.log("m_bLevel", a);
        }

        // tsProcessQuestField[]
        for (let i = 0; i < 6; i++) {
            // flags
            a = br.readUInt32LE();
        }

        // tsProcessQuestField[]
        for (let i = 0; i < 10; i++) {
            // flags
            a = br.readUInt32LE();
        }
    }

    get x() { return this.pos.x; }
    set x(v) { this.pos.x = v; }
    get y() { return this.pos.y; }
    set y(v) { this.pos.y = v; }

    lockOn(target, ability, isLockedByLeft) {
        this.lockedTarget = target;
        this.lockedAbility = ability;
    }

    lockOff() {
        this.lockedTarget = 0xffff;
        this.lockedAbility = 0xffff;
    }

    getAbility(abilityIndex) {
        return this.ability[abilityIndex];
    }

    getLockedAbility() {
        return this.getAbility(this.lockedAbility);
    }

    getAttackRange(ability) {
        if (!ability) return;


    }

    actionToLockedTarget() {
        const target = ActorManager.focusActor_tmp;

        if (target.actor.isMonster) {
            this.useSkillToLockedTarget();
        }
    }

    useSkillToLockedTarget() {
        const target = ActorManager.focusActor_tmp;
        const lockedAbility = this.getLockedAbility();
        const skill = lockedAbility.getSkill();
        // const transAbility = null;

        const range = this.getAttackRange(lockedAbility);
        const minRange = lockedAbility.getMinimumAttackRange();


    }

    // HeroInfo

    getAbility(_iAbility) {
        const ABILITY_COUNT = 52; // temp

        if (_iAbility >= ABILITY_COUNT || _iAbility < 0) return null;


        return this.ability[_iAbility];
    }

    // HeroInterface

    getQuickSkill(_iSlot) { return this.getAbility(this.quickSkills[this.currentQuickSkillSlot][_iSlot][(this.job) % 2]); }

    reset() {
        super.reset();

        this.anm = 2; // ACT_READY
        this.direct = 0;
        this.name = "MyHero (200)";
        this._isMonster_tmp = false;
        this.isMoving = false;

        if (RedStone.anims["Rogue01"]) {
            const body = this.getBody();
            if (body) {
                // Ensure coordinates are initialized if they aren't
                if (this.pos.x === 0 && this.pos.y === 0) {
                    this.pos.set(4745, 2640); // Default or config
                    Camera.setPosition(4745, 2640);
                }

                this.pixiSprite = body.createPixiSprite("body", this.pos.x, this.pos.y, this.anm, this.direct, this.frame);
                this.pixiSprite.shadowSprite = body.createPixiSprite("shadow", this.pos.x, this.pos.y, this.anm, this.direct, this.frame);
            }
        }
    }

    update(delta) {
        if (!RedStone.gameMap.initialized) return;
        if (this.isDeath()) return;

        // Target Selection
        let interactingWithTarget = false;
        if (ActorManager.lockedTarget_tmp) {
            this.battleTarget = ActorManager.lockedTarget_tmp;
            ActorManager.lockedTarget_tmp = null;
            interactingWithTarget = true;
        }

        // Auto-Attack Logic
        if (this.battleTarget) {
            if (this.battleTarget.isDeath()) {
                this.battleTarget = null;
                this.usingSkill = null;
                this.setAnm(ACT_READY);
            } else {
                this.useSkillToTarget(null, this.battleTarget);
            }
        }

        // Keyboard Handling
        const speed = 0.75 * delta;
        let moveX = 0;
        let moveY = 0;

        if (Listener.pressingKeys.has("ArrowUp")) moveY -= speed;
        if (Listener.pressingKeys.has("ArrowDown")) moveY += speed;
        if (Listener.pressingKeys.has("ArrowLeft")) moveX -= speed;
        if (Listener.pressingKeys.has("ArrowRight")) moveX += speed;

        if (Listener.pressingKeys.size > 0) {
            this.battleTarget = null; // Cancel target on manual input
            this.usingSkill = null;
        }

        if (Listener.isMouseDown) {
            const isClickingUI = Listener.target !== RedStone.mainCanvas.canvas || RedStone.interactingWithBottomInterface;

            if (!isClickingUI) {
                const targetX = Listener.mouseX - innerWidth / 2 + Camera.x;
                const targetY = Listener.mouseY - innerHeight / 2 + Camera.y;

                // If we are clicking/interacting with the target, don't move manually
                if (interactingWithTarget || (this.battleTarget && ActorManager.focusActor_tmp === this.battleTarget)) {
                    // Do nothing, allow auto-attack to control movement
                } else {
                    this.battleTarget = null;
                    this.usingSkill = null;
                    this.moveTo(targetX, targetY);
                }
            }
        } else if (moveX !== 0 || moveY !== 0) {
            this.moveTo(this.pos.x + moveX, this.pos.y + moveY);
        }

        super.update(delta);

        // Update Camera
        Camera.x = this.pos.x;
        Camera.y = this.pos.y;
        window.dispatchEvent(new CustomEvent("displayLogUpdate", { detail: { key: "player-pos", value: `Player Position: (${Math.round(this.pos.x / TILE_WIDTH)}, ${Math.round(this.pos.y / TILE_HEIGHT)})` } }));
    }

    useSkillToTarget(skill, target) {
        if (!skill) {
            skill = Skill2.allSkills.find(s => s.name === "ダブルスローイング") // skill 152
        }

        if (target?.isDeath()) return;

        const dist = getDistance(this.pos, target.pos);
        const range = 300; // default range

        if (dist > range) {
            this.moveTo(target.pos.x, target.pos.y);
            return;
        }

        // In range, stop and attack
        this.isMoving = false;

        // Face the target
        const ang = getAngle(this.pos, target.pos);
        const dir = getDirection(ang);
        const dirStr = getDirectionString(dir);
        const directionFrameOrder = ["up", "up-right", "right", "down-right", "down", "down-left", "left", "up-left"];
        const newDirect = directionFrameOrder.indexOf(dirStr);
        if (newDirect !== -1) {
            this.direct = newDirect;
        }

        if (this.usingSkill) return; // Already attacking

        this.usingSkill = skill;

        if (skill.serial === 152) {
            this.attackToActorByContinuousAttack({
                skill: this.usingSkill.serial,
                level: 0,
                target: target,
                attackCount: 7,
                fps: 10,
            });

        }
        else if ([54, 222].includes(skill.serial)) {
            const ability = new Ability();
            ability.set(skill.serial, 100);

            this.actionToGround(target.pos.x, target.pos.y, ability, 500);

            setTimeout(() => {
                RedStone.actors.forEach(actor => {
                    if (actor.isHero() || actor.isDeath()) return;
                    if (Math.hypot(target.pos.x - actor.pos.x, target.pos.y - actor.pos.y) < 500) {
                        const hitInfo = new HitInfo();
                        hitInfo.physicalDamage = 100000 + Math.floor(Math.random() * 1000000);
                        this.strike(actor, ability, hitInfo, actor.direct, false);
                    }
                });
                this.usingSkill = null;
            }, 1100);
        } else {
            // Fallback single attack
            const ability = new Ability();
            ability.set(skill.serial, 0);
            const hitInfo = new HitInfo();
            hitInfo.physicalDamage = 100;

            if (skill.action) {
                this.setAnm(skill.action);
            }

            this.strike(target, ability, hitInfo, this.direct, true);
            setTimeout(() => { this.usingSkill = null; }, 500);
        }

        if (this.isMoving) {
            this.isMoving = false;
        }
    }

    async load() {
        const heroAnimBuf = await fetchBinaryFile(`${DATA_DIR}/Heros/Rogue01.sad`);
        RedStone.anims.Rogue01 = loadAnimation(heroAnimBuf);
        RedStone.anims.Archer01 = loadAnimation(await fetchBinaryFile(`${DATA_DIR}/Heros/Archer01.sad`));
        RedStone.anims.Wizard01 = loadAnimation(await fetchBinaryFile(`${DATA_DIR}/Heros/Wizard01.sad`));

        // custom
        this.guildIconTexture = await PIXI.Texture.fromURL(`${DATA_DIR}/custom/rs_guild_icon.png`);
    }
}

export default Hero;