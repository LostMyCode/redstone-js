import { fetchBinaryFile } from "../../utils";
import BufferReader from "../../utils/BufferReader";
import { decodeScenarioBuffer } from "../../utils/RedStoneRandom";
import { DATA_DIR } from "../Config";

class IntelligenceSkill {
    constructor(intDmgInit1, intDmgInit2, intDmgMlp1, intDmgMlp2) {
        this._intDmgInit1 = intDmgInit1 / 100.0;
        this._intDmgInit2 = intDmgInit2 / 100.0;
        this._intDmgMlp1 = intDmgMlp1 / 100.0;
        this._intDmgMlp2 = intDmgMlp2 / 100.0;

        this._minDmg1 = intDmgInit1 - intDmgInit2;
        this._maxDmg1 = intDmgInit1 + intDmgInit2;
        this._minDmg2 = intDmgMlp1 - intDmgMlp2;
        this._maxDmg2 = intDmgMlp1 + intDmgMlp2;
    }

    minDmg(slv) {
        return this._minDmg1 + slv * this._minDmg2;
    }

    maxDmg(slv) {
        return this._maxDmg1 + slv * this._maxDmg2;
    }

    get hasDmg() {
        return this._maxDmg1 !== 0 || this._maxDmg2 !== 0;
    }
}

class Skill2 {
    /**
     * @type {Skill2[]}
     */
    static allSkills = [];

    index1 = 0;
    index2 = 0;
    skillName = "";
    skillName2 = "";
    difficulty = 0;
    maxEnableRange = 0;
    minEnableRange = 0;
    effectRange = 0;

    _lostCp1 = 0;
    _lostCp2 = 0;
    _getCp1 = 0;
    _getCp2 = 0;
    _atkSpeed1 = 0;
    _atkSpeed2 = 0;
    _deadProb1 = 0;
    _deadProb2 = 0;

    /**
     * @type {IntelligenceSkill[]}
     */
    intelligenceSkills = [];

    /**
     * @type {{[skillIndex: Number]: Number}}
     */
    requiredSkills = {};

    static async loadAllSkill2() {
        const buffer = await fetchBinaryFile(`${DATA_DIR}/skill2_decrypted.dat`);
        const br = new BufferReader(buffer);

        // br.readUInt32LE();
        // br.readUInt32LE();

        const allSkillByteLen = (buffer.byteLength - 0x10 - 0x4);
        const skillCount = allSkillByteLen / 0x82C;

        // let skillSize = br.readUInt32LE();
        // const keySeed = br.readUInt32LE();

        // br.setDataEncodeTable(keySeed);

        br.offset = 0x10;
        const skillData = br.readStructUInt8(allSkillByteLen);
        // let unkSize = br.readUInt32LE();
        // unkSize = (unkSize * 11) << 0x2;
        // const unkBytes = br.readStructUInt8(unkSize);

        // skillSize = Buffer.from(decodeScenarioBuffer(skillSize, br.decodeKey)).readUInt32LE();

        const skillRawData_br = new BufferReader(Buffer.from(skillData));

        for (let i = 0; i < skillCount; i++) {
            if (i === 690) break; // skills after #690 may not be used??
            // const skillData = decodeScenarioBuffer(skillRawData_br.readStructUInt8(0x82C), br.decodeKey);
            const skillData = skillRawData_br.readStructUInt8(0x82C);
            const skillReader = new BufferReader(Buffer.from(skillData));
            const skill = new Skill2();

            skill.index1 = skillReader.readUInt16LE();
            skill.index2 = skillReader.readUInt16LE();

            skillReader.readUInt16LE();
            skillReader.readUInt16LE();
            skillReader.readStructUInt8(0x0C);
            skillReader.readUInt16LE();

            skill.skillName = skillReader.readString(0x20, "sjis");
            skill.difficulty = skillReader.readUInt16LE();

            skillReader.readStructUInt8(0x10);

            // ???
            // skill.skillPassiveType = skillReader.readUInt16LE();
            // skill.skillDamageFlag = skillReader.readUInt16LE();
            // skill.skillTargetRace = skillReader.readUInt16LE();
            // skill.skillUsageFlag = skillReader.readUInt16LE();
            // skillReader.offset += 8;

            skill._lostCp1 = skillReader.readUInt16LE();
            skill._lostCp2 = skillReader.readUInt16LE();
            skill._getCp1 = skillReader.readUInt16LE();
            skill._getCp2 = skillReader.readUInt16LE();

            skillReader.readStructUInt8(0x86);

            skill._range1 = skillReader.readUInt16LE();
            skill._range2 = skillReader.readUInt16LE();
            skill._rangeDec1 = skillReader.readUInt16LE();
            skill._rangeDec2 = skillReader.readUInt16LE();
            skill._dmgMax = skillReader.readUInt16LE();
            skill._dmgMin = skillReader.readUInt16LE();

            skillReader.readStructUInt8(0x54);

            skill._dmg1 = skillReader.readUInt16LE();
            skill._dmg2 = skillReader.readUInt16LE();

            skillReader.readUInt32LE();
            skillReader.readUInt32LE();

            for (let j = 0; j < 6; j++) {
                const int_dmg_init1 = skillReader.readUInt16LE();
                const int_dmg_mlp1 = skillReader.readUInt16LE();
                const int_dmg_init2 = skillReader.readUInt16LE();
                const int_dmg_mlp2 = skillReader.readUInt16LE();
                skillReader.readUInt32LE();
                skillReader.readUInt16LE();
                skill.intelligenceSkills[j] = new IntelligenceSkill(int_dmg_init1, int_dmg_init2, int_dmg_mlp1, int_dmg_mlp2);
            }

            skillReader.readStructUInt8(0x290);

            skill._castSpeed1 = skillReader.readUInt16LE();
            skill._castSpeed2 = skillReader.readUInt16LE();
            skill.minEnableRange = skillReader.readUInt16LE() / 100.0;
            skill.maxEnableRange = skillReader.readUInt16LE() / 100.0;

            const unk0_1 = skillReader.readUInt16LE();
            const unk0_2 = skillReader.readUInt16LE();
            const unk1 = skillReader.readUInt16LE();
            const unk2 = skillReader.readUInt16LE();
            const unk3 = skillReader.readUInt16LE();
            const unk4 = skillReader.readUInt16LE();
            const unk5 = skillReader.readUInt16LE();
            const unk6 = skillReader.readUInt16LE();

            skill._hitProb1 = skillReader.readInt16LE();
            skill._hitProb2 = skillReader.readInt16LE();

            const unk7 = skillReader.readUInt16LE();
            const unk8 = skillReader.readUInt16LE();
            const unk9 = skillReader.readUInt16LE();
            const unk10 = skillReader.readUInt16LE();

            skill._deadProb1 = skillReader.readUInt16LE();
            skill._deadProb2 = skillReader.readUInt16LE();

            const unk11 = skillReader.readUInt16LE();
            const unk12 = skillReader.readUInt16LE();
            const unk13 = skillReader.readUInt16LE();
            const unk14 = skillReader.readUInt16LE();
            const unk15 = skillReader.readUInt16LE();
            const unk16 = skillReader.readUInt16LE();

            //0x460
            skillReader.readStructUInt8(0x6A);
            skill._hitNum1 = skillReader.readUInt16LE();
            skill._hitNum2 = skillReader.readUInt16LE();


            skillReader.readStructUInt8(0x4E);
            for (let j = 0; j < 5; j++) {
                const r_skillIndex = skillReader.readUInt16LE();
                const r_skillSlv = skillReader.readUInt16LE();
                if (r_skillIndex == 0xFFFF) continue;
                skill.requiredSkills[r_skillIndex] = r_skillSlv;
            }

            skillReader.offset = 1328;
            skill.castSound = skillReader.readString(32);
            skill.actSound = skillReader.readString(32);
            skill.hitSound = skillReader.readString(32);

            skillReader.offset = 0x6EC;
            skill.skillDesc = skillReader.readString(skillReader.buffer.byteLength - 0x6EC, "sjis");

            Skill2.allSkills.push(skill);
        }

        console.log("Skill2.dat loaded.", this.allSkills);
        return this.allSkills;
    }
}

export default Skill2;