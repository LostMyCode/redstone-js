import { VUI_20_ADD_KARMA_OCCUR_CHANCE, VUI_26_ADD_DUNGEON_VALUE_AND_KARMA_VALUE } from "../../../common/FieldCommon";
import BitFlagReader from "../../../utils/BitFlagReader";
import BufferReader, { TYPE_DEF } from "../../../utils/BufferReader";

export class KarmaContainerBasicElement {
    constructor() {
        this.serial = 0;
        this.titleLength = 0;
        this.karmaCount = 0;
    }
}

export class KarmaItemBasicInfo {
    /**
     * @param {BufferReader} reader 
     */
    constructor(reader) {
        this.item = reader.readUInt16LE();

        reader.offset += 2; // skip padding
        
        this.values = reader.readArray(6, TYPE_DEF.INT32);

        const flags = new BitFlagReader(reader.readUInt16LE(), 16);

        this.stringSize = flags.readBits(15);
        this.isAbsolute = flags.readBool();

        reader.offset += 2; // skip padding
    }
}

export class KarmaBasicInfo {
    /**
     * @param {BufferReader} reader 
     */
    constructor(reader, fileVersion) {
        this.serial = reader.readUInt16LE();

        const flags = new BitFlagReader(reader.readUInt16LE(), 16);

        this.isWantAndCondition = flags.readBool();
        this.isWantNotComplete = flags.readBool();
        this.isDisable = flags.readBool();
        this.isForEnterFieldPlayer = flags.readBool();

        this.reactionCount = reader.readUInt16LE();
        this.triggerCount = reader.readUInt16LE();
        this.titleLength = reader.readUInt16LE();

        if (fileVersion < VUI_20_ADD_KARMA_OCCUR_CHANCE) return;

        this.activateChance = reader.readUInt16LE();

        if (fileVersion < VUI_26_ADD_DUNGEON_VALUE_AND_KARMA_VALUE) return;

        this.activeCount = reader.readUInt16LE();
        this.activePeriod = reader.readUInt16LE();
    }
}