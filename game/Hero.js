import { fetchBinaryFile } from "../utils";
import BufferReader from "../utils/BufferReader";
import { DATA_DIR } from "./Config";
import RedStone from "./RedStone";
import Ability from "./skill/Ability";

const dJOB_ROGUE = 6;

class Hero {

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
        /**
         * @type {Ability[]}
         */
        this.ability = new Array(52);
        this.serial = 123123;
        this.init();
    }

    init() {
        if (!Hero.jobDataBufferReader) return;

        const br = Hero.jobDataBufferReader;
        br.offset += dJOB_ROGUE * 3876;
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
        const target = RedStone.player.focusingActor;

        if (target.actor.isMonster) {
            this.useSkillToLockedTarget();
        }
    }

    useSkillToLockedTarget() {
        const target = RedStone.player.focusingActor;
        const lockedAbility = this.getLockedAbility();
        const skill = lockedAbility.getSkill();
        // const transAbility = null;

        const range = this.getAttackRange(lockedAbility);
        const minRange = lockedAbility.getMinimumAttackRange();


    }
}

export default Hero;