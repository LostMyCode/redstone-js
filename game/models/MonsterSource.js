import { fetchBinaryFile } from "../../utils";
import BufferReader from "../../utils/BufferReader";
import { DATA_DIR } from "../Config";

class MonsterSource {

    static allMonsters = [];

    static async loadAllMonsters() {
        const buffer = await fetchBinaryFile(`${DATA_DIR}/job2.dat`);
        const br = new BufferReader(buffer);
        const monsterNum = br.readUInt32LE();

        for (let i = 0; i < monsterNum; i++) {
            const monster = new MonsterSource();
            monster.index = br.readUInt32LE();
            monster.name = br.readString(0x20, "sjis");

            const effect1 = br.readUInt32LE();
            br.readUInt16LE();
            const unk = br.readUInt32LE();
            const unk2 = br.readUInt16LE();
            const unk3 = br.readUInt16LE();

            monster.race = br.readUInt16LE();
            monster.statusFactor = br.readUInt16LE();
            monster.atkMinValueBonus = br.readUInt16LE();
            monster.atkMaxValueBonus = br.readUInt16LE();
            monster.defenceValueBonus = br.readUInt16LE();
            monster.movSpeed = br.readUInt16LE();
            monster.atkSpeed = br.readUInt16LE();

            br.readUInt16LE();
            br.readUInt32LE();
            br.readUInt32LE();
            br.readUInt16LE();
            br.readUInt16LE();

            monster.lineage = br.readUInt16LE();
            monster.resistances[12] = br.readUInt16LE();
            monster.resistances[13] = br.readUInt16LE();
            monster.defaultExp = br.readUInt32LE();

            br.readUInt16LE();
            br.readUInt16LE();
            br.readUInt16LE();

            // DROPアイテム
            for (let j = 0; j < 10; j++) {
                const itemIndex = br.readUInt16LE();
                const item_unknown = br.readUInt16LE();
                const dropProb = br.readUInt32LE();
                if (itemIndex !== 0xFFFF) {
                    monster.dropItems.push(new DropItem(itemIndex, item_unknown, dropProb));
                }
            }

            // Skill
            for (let j = 0; j < 10; j++) {
                const skillIndex = br.readUInt16LE();
                const skillUnknown = br.readUInt16LE();
                if (skillIndex !== 0xFFFF) {
                    monster.skills.push(new MonsterSkill(skillIndex, skillUnknown));
                }
            }

            br.readUInt16LE();

            for (let j = 0; j < 9; j++) {
                br.readUInt16LE();
            }

            br.readUInt16LE();
            br.readUInt16LE();

            for (let j = 0; j < 5; j++) {
                br.readUInt16LE();
            }

            monster.defaultHP = br.readUInt32LE();
            monster.defaultHP = br.readUInt32LE(); // ??? why 2 times???

            br.readUInt32LE();
            br.readUInt32LE();

            monster.levelUpBonus = br.readUInt16LE();
            monster.conditionUpBonus = br.readUInt16LE();
            monster.STR = br.readUInt16LE();
            monster.AGI = br.readUInt16LE();
            monster.CON = br.readUInt16LE();
            monster.WIS = br.readUInt16LE();
            monster.INT = br.readUInt16LE();
            monster.CHS = br.readUInt16LE();
            monster.LUC = br.readUInt16LE();
            monster.activeRange = br.readUInt16LE();
            monster.atkMinValue = br.readUInt16LE();
            monster.atkMaxValue = br.readUInt16LE();
            monster.defenceValue = br.readUInt16LE();

            br.readUInt16LE();

            monster.fireResistance = br.readUInt16LE();
            monster.waterResistance = br.readUInt16LE();
            monster.earthResistance = br.readUInt16LE();
            monster.windResistance = br.readUInt16LE();
            monster.lightResistance = br.readUInt16LE();
            monster.darkResistance = br.readUInt16LE();

            for (let j = 0; j < 12; j++) {
                monster.resistances[j] = br.readUInt16LE();
            }

            monster.effectId = (effect1 << 0x10) | monster.lineage;
            monster.textureId = effect1;

            this.allMonsters.push(monster);
        }

        console.log("Monster sources loaded.", this.allMonsters);

        return this.allMonsters;
    }

    constructor() {
        /**
         * @type {String}
         */
        this.name = "";
        /**
         * @type {DropItem[]}
         */
        this.dropItems = [];
        /**
         * @type {MonsterSkill[]}
         */
        this.skills = [];
        /**
         * @type {Number}
         */
        this.resistances = [];
    }


}

class DropItem {
    constructor(index, unknown, dropProb) {
        this.index = index;
        this.unknown = unknown;
        this.dropProb = dropProb;
    }
}

class MonsterSkill {
    constructor(index, unknown) {
        this.index = index;
        this.unknown = unknown;
    }
}

export default MonsterSource;