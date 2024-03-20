import { DoorObjectSimpleInfo } from "../common/DoorDefine";
import { GetMapDataVersion, VUI_20_ADD_KARMA_OCCUR_CHANCE, VUI_26_ADD_DUNGEON_VALUE_AND_KARMA_VALUE, VUI_28_EXPAND_AREA_DATA, VUI_29_ADD_DOOR_LIST, VUI_30_ADD_CORECT_MONSTER_RESISTANCE, VVI_43_ADD_SEASON_VARIABLE, VVI_45_ADD_MORE_CHARACTER_DATA, VVI_48_ENCRYT, VVI_49_ENCRYT_MORE, VVI_51_ENCRYT2 } from "../common/FieldCommon";
import Pos from "../engine/Pos";
import Rect from "../engine/Rect";
import BitFlagReader from "../utils/BitFlagReader";
import BufferReader, { TYPE_DEF } from "../utils/BufferReader";
import { decodeScenarioBuffer, decodeScenarioBuffer_V2 } from "../utils/RedStoneRandom";
import { KarmaBasicInfo, KarmaContainerBasicElement, KarmaItemBasicInfo } from "./object/karma/Karma";
import RedStone from "./RedStone";
import { TILE_XSIZE_SHIFT, TILE_YSIZE_SHIFT } from "./Tile";
import { JobManager } from "./job/Job";
import Area, { AREA_SAVE_DATA, MAX_AREA } from "./object/area/Area";
import RS_MapObject from "./object/Object";
import { MapActorGroup } from "./models/Actor";

const MAP_NAME_LENGTH = 64;
const MAX_BGM_COUNT_IN_MAP = 30;
const MAX_LINK_MONSTER_COUNT = 46;

const MaxFieldActorCount = 2048;


const TS_GRASSLAND = 0;
const TS_MOUNTAINS = 1;
const TS_DESERT = 2;
const TS_SAVANA = 3;
const TS_CAVE = 4;
const TS_DUNGEON = 5;
const TS_TOWER = 6;
const TS_MINE = 7;
const TS_HELL = 8;
const TS_HEAVEN = 9;
const TS_BRUNENSTIG = 10;
const TS_BIGAEPLE = 11;
const TS_AUGUSTA = 12;
const TS_BRIDGEHEAD = 13;
const TS_MOUNTAINS_VILLAGE = 14;
const TS_ARIAN = 15;
const TS_RUINED_CITY = 16;
const TS_FARMHOUSE = 17;
const TS_GYPSY = 18;
const TS_ROOM = 19;
const TS_GUILD_HALL = 20;
const TS_COUNT = 21;


class BASE_NPC_INFO {
    /**
     * @param {BufferReader} br 
     */
    constructor(br) {
        this.serial = br.readInt32LE();
        this.character = br.readUInt16LE();
        this.actorKind = br.readUInt16LE();

        this.direct = br.readUInt16LE();
        this.isChangeDirect = br.readUInt16LE();
        this.regenerationCycle = br.readInt32LE();

        this.moveArea = br.readUInt16LE();
        this.patrolRoute = br.readUInt16LE();
        this.wanderCycle = br.readUInt16LE();
        this.battleInclination = br.readUInt16LE();

        let flags = new BitFlagReader(br.readUInt16LE());

        this.isLeader = flags.readBool();
        this.isGuildCrest = flags.readBool();
        this.isGuildObject = flags.readBool();

        this.ward = br.readUInt16LE();
        this.linkMonsterCount = br.readUInt16LE();
        this.linkType = br.readUInt16LE();
        this.linkMonsters = br.readArray(MAX_LINK_MONSTER_COUNT, TYPE_DEF.UINT16);
        this.generateAroundPosX1 = br.readUInt16LE();
        this.generateAroundPosY1 = br.readUInt16LE();
        this.generateAroundPosX2 = br.readUInt16LE();
        this.generateAroundPosY2 = br.readUInt16LE();
        this.generateMethod = br.readUInt16LE();

        br.offset += 2; // skip padding

        this.pos = new Pos(br.readInt32LE(), br.readInt32LE());
        this.name = br.readString(30, "sjis");
        this.isBlockToAutoRegen = br.readUInt16LE();
    }

    isNotMoveNpc = () => this.moveArea == MAX_AREA;

    reset() {    // by LMC
        Object.keys().forEach(key => {
            if (typeof this[key] === "number") {
                this[key] = 0;
            }

            this.pos.set(0, 0);
            this.name = "";
        })
    }
};



class MapBaseInfo___ {
    /**
     * @param {BufferReader} br 
     */
    load(br) {
        this.width = br.readInt32LE();
        this.height = br.readInt32LE();
        this.name = br.readString(MAP_NAME_LENGTH, "sjis");
        this.tileSet = br.readInt32LE();

        let bf = new BitFlagReader(br.readUInt32LE(), 32);

        this.fieldType = bf.readBits(4);
        this.isPremiumZone = bf.readBool();
        this.isGuildBattleZone = bf.readBool();
        this.isGuildBattleLobby = bf.readBool();
        this.isLocked = bf.readBool();
        this.isEventField = bf.readBool();
        this.isOXQuizGateVillage = bf.readBool();
        this.isHiddenPortal = bf.readBool(); // Hide only the portal shape.
        this.minimapDisplayLevel = bf.readBits(4); // Minimap display level
        this.isCanNotMemoryZone = bf.readBool(); // Place can't be memorized
        this.isHalfSize = bf.readBool(); // Minimap display level
        this.isWordQuizField = bf.readBool(); // Minimap display level
        this.isWordQuizVillage = bf.readBool();
        this.isBlockToWarpField = bf.readBool();
        this.isBossZone = bf.readBool();
        this.isGuildHall = bf.readBool();
        this.is1LevelGuildHall = bf.readBool();
        this.is1GuildPointBattleField = bf.readBool();
        this.isSiegeWarfareField = bf.readBool();
        this.isCanNotCallCarpetField = bf.readBool();
        this.isCanNotUseCallingSkill = bf.readBool();
        this.isUseFindWay = bf.readBool(); // Whether or not to use the Find Way feature. 
        this.isSetBossMap = bf.readBool();
        this.isGuildDungeonMap = bf.readBool(); // Guild Dungeon Map
        this.isNotUseSkillBeforeTrans = bf.readBool(); // Do not use skill before monster transformation.
        this.isNotOpenPitchManShop = bf.readBool(); // No street vendors allowed.

        this.serial = br.readInt32LE();
        this.bgmList = br.readArray(MAX_BGM_COUNT_IN_MAP, TYPE_DEF.UINT16);
        this.linkSecretDungeon = br.readUInt16LE();

        bf = new BitFlagReader(br.readUInt16LE(), 16);

        this.isExistSecretDungeonGate = bf.readBool();
        this.weatherType = bf.readBits(3);
        this.isNight = bf.readBool();

        this.correctFireResistance = br.readInt16LE();
        this.correctWaterResistance = br.readInt16LE();
        this.correctWindResistance = br.readInt16LE();
        this.correctEarthResistance = br.readInt16LE();
        this.correctLightResistance = br.readInt16LE();
        this.correctDarkResistance = br.readInt16LE();
    }
}

class MAP_INFO extends MapBaseInfo___ {
    constructor() {
        super();
    }

    /**
     * @param {BufferReader} br 
     */
    load(br) {
        super.load(br);

        if (this.fileVersion < VUI_30_ADD_CORECT_MONSTER_RESISTANCE) return;

        this.correctMonsterFireResistance = br.readInt16LE();
        this.correctMonsterWaterResistance = br.readInt16LE()
        this.correctMonsterWindResistance = br.readInt16LE();
        this.correctMonsterEarthResistance = br.readInt16LE();
        this.correctMonsterLightResistance = br.readInt16LE();
        this.correctMonsterDarkResistance = br.readInt16LE();

        this.correctMonsterBlindResistance = br.readInt16LE();
        this.correctMonsterPoisonResistance = br.readInt16LE();
        this.correctMonsterSleepResistance = br.readInt16LE();
        this.correctMonsterColdResistance = br.readInt16LE();
        this.correctMonsterFreezeResistance = br.readInt16LE();
        this.correctMonsterStunResistance = br.readInt16LE();
        this.correctMonsterStoneResistance = br.readInt16LE();
        this.correctMonsterConfuseResistance = br.readInt16LE();
        this.correctMonsterCharmingResistance = br.readInt16LE();
        this.correctMonsterCriticalResistance = br.readInt16LE();
        this.correctMonsterCrushResistance = br.readInt16LE();

        this.correctMonsterBadStatusResistance = br.readInt16LE();
        this.correctMonsterDeclinePowerResistance = br.readInt16LE();
        this.correctMonsterCurseResistance = br.readInt16LE();
    }
};

class DoorObjectInfo extends DoorObjectSimpleInfo {
    constructor(reader) {
        super(reader);
        this.posValue = 0;
        this.reset();
    }

    reset() {
        this.isActive = false;
        this.isOpened = false;
        this.isDisarmed = false;
        this.isUnlocked = false;
        this.isHide = false;
        this.isDetectDoor = false;
        this.isDetectTrap = false;
    }
}

class DoorManager {
    constructor() {
        this.doorList = [];
        this.reset();
    }

    reset() {
        this.doorCount = 0;
        this.doorList = [];
    }

    /**
     * @param {Rect} rect_
     */
    isFocusedDoor(_rect) {
        const rect = new Rect();

        rect.x1 = _rect.x1 >> TILE_XSIZE_SHIFT;
        rect.y1 = _rect.y1 >> TILE_YSIZE_SHIFT;
        rect.x2 = _rect.x2 >> TILE_XSIZE_SHIFT;
        rect.y2 = _rect.y2 >> TILE_YSIZE_SHIFT;

        const isFocused = this.doorList.some(door => {
            return rect.isIn(door.x, door.y);
        });

        return isFocused;
    }
}

class ConversationBasicInfo {
    /**
     * @param {BufferReader} reader 
     */
    constructor(reader) {
        this.serial = reader.readUInt16LE();
        this.speechLength = reader.readUInt16LE();
        this.contentsCount = reader.readUInt16LE();
        this.triggerCount = reader.readUInt16LE();

        const flags = new BitFlagReader(reader.readUInt16LE(), 16);

        this.isWantAndCondition = flags.readBool();
        this.isWantNotComplete = flags.readBool();
        this.spareValue = flags.readBits(14);

        this.isNoSpeech = reader.readUInt16LE();
    }
}

export default class RS_Map extends MAP_INFO {
    constructor() {
        super();

        this.textDataLocate = 0;
        this.fileVersion = 0;

        this.object = new RS_MapObject();
        this.doors = new DoorManager();
        this.area = new Area();

        /**
         * @type {BASE_NPC_INFO[]}
         */
        this.saveActors = [];
    }

    /**
     * @param {BufferReader} reader 
     */
    load(reader) {
        const fileSize = reader.readInt32LE();
        this.textDataLocate = reader.readInt32LE();
        const strHeader = reader.readString(60);

        this.getMapDataVersion(strHeader);

        let isDecodeKarmaData = false;

        if (this.fileVersion >= VVI_49_ENCRYT_MORE) {
            isDecodeKarmaData = true;
        }

        this.reset();

        super.load(reader);

        if (this.fileVersion >= VVI_51_ENCRYT2) {
            const nation = reader.readInt32LE();
            reader.setDataEncodeTable(nation);
        } else {
            reader.setDataEncodeTable(-1);
        }

        reader.offset += 4;

        // this.serial = 
        this.isRoom = false;

        if (this.tileSet === TS_ROOM || this.tileSet === TS_GUILD_HALL) {
            this.isRoom = true;
        }

        this.pixelWidth = this.width << TILE_XSIZE_SHIFT;
        this.pixelHeight = this.height << TILE_YSIZE_SHIFT;

        this.map = reader.readArray(this.width * this.height, TYPE_DEF.UINT16, { asTypedArray: true }); // tile information

        reader.offset += this.width * this.height * 2; // height information (only used by the tool)

        this.info = reader.readArray(this.width * this.height, TYPE_DEF.UINT16, { asTypedArray: true }); // building, object, block information

        if (this.fileVersion >= VUI_29_ADD_DOOR_LIST) {
            this.doors.doorCount = reader.readInt32LE();

            for (let i = 0; i < this.doors.doorCount; i++) {
                const door = new DoorObjectInfo(reader);

                door.posValue = door.x + door.y * this.width;
                door.reset();
            }
        }

        this.blockInfo = reader.readArray(this.width * this.height, TYPE_DEF.UINT8, { asTypedArray: true }); // Map data written by the server

        // skip custom items
        reader.offset = reader.readUInt32LE();

        // Character Data
        if (this.fileVersion >= VVI_48_ENCRYT) {
            JobManager.characterDataCount = decodeScenarioBuffer_V2(reader, 4).readInt32LE();
            JobManager.jobList = decodeScenarioBuffer_V2(reader, 2 * JobManager.characterDataCount).readStructUInt16LE(JobManager.characterDataCount);
        } else {
            JobManager.characterDataCount = reader.readInt32LE();
            JobManager.jobList = reader.readStructUInt16LE(JobManager.characterDataCount);
        }

        reader.readUInt32LE();

        let characterStructSize = 44;
        
        if (this.fileVersion >= VVI_45_ADD_MORE_CHARACTER_DATA) {
            characterStructSize = reader.readInt32LE();
        }

        // temp

        this.characters = [];
        
        for (let i = 0; i < JobManager.characterDataCount; i++) {
            const actorGroupInfo = new MapActorGroup(reader, characterStructSize, JobManager.jobList[i], this.fileVersion);
            this.characters[actorGroupInfo.internalID] = actorGroupInfo;
        }

        reader.readUInt32LE(); // nextOffset

        if (this.fileVersion >= VVI_48_ENCRYT) {
            this.savedActorCount = decodeScenarioBuffer_V2(reader, 4).readUInt32LE();
        } else {
            this.savedActorCount = reader.readUInt32LE();
        }

        for (let i = 0; i < this.savedActorCount; i++) {
            const existActor = new BASE_NPC_INFO(
                this.fileVersion >= VVI_48_ENCRYT ? decodeScenarioBuffer_V2(reader, 176/* struct size */) : reader
            );
            const speechCount = reader.readUInt16LE();

            this.saveActors[existActor.serial] = existActor;

            if (speechCount > 0) {
                this.skipCC(reader, speechCount, isDecodeKarmaData);
            }
        }

        this.area.reset();

        if (this.fileVersion >= VVI_48_ENCRYT) {
            this.area.count = decodeScenarioBuffer_V2(reader, 4).readUInt32LE();
        } else {
            this.area.count = reader.readUInt32LE();
        }

        for (let i = 0; i < this.area.count; i++) {
            let saveArea;
            let locate, text;

            if (this.fileVersion >= VUI_28_EXPAND_AREA_DATA) {
                if (this.fileVersion >= VVI_43_ADD_SEASON_VARIABLE) {
                    saveArea = new AREA_SAVE_DATA(
                        this.fileVersion >= VVI_48_ENCRYT ? decodeScenarioBuffer_V2(reader, 162) : reader,
                        this.fileVersion
                    )
                } else {
                    saveArea = new AREA_SAVE_DATA(
                        this.fileVersion >= VVI_48_ENCRYT ? decodeScenarioBuffer_V2(reader, 162 - 2) : reader,
                        this.fileVersion
                    )
                    saveArea.seasonVariable = 0;
                }

                locate = reader.readInt32LE();
                reader.offset = locate;
            } else {
                saveArea = new AREA_SAVE_DATA(reader, this.fileVersion);
                saveArea.seasonVariable = 0;
            }

            locate = reader.readInt32LE();

            if (locate !== 0xffffffff) {
                locate += this.textDataLocate;

                let textSize;
                let curLocate = reader.offset;

                reader.offset = locate;
                textSize = reader.readInt32LE();

                text = reader.readString(textSize);
                reader.offset = curLocate;
            }

            // if (RedStone.seasonVariable >= saveArea.seasonVariable) {
            this.area.insert(saveArea.serial, saveArea, this.isGuildBattleLobby, text);
            // }
        }

        // skip shop info
        reader.offset = reader.readUInt32LE();

        this.object.readObjectListInMap(reader, this.isRoom);

        this.object.isGuildHall = this.isGuildHall;

        return true;
    }

    reset() {
        this.doors.reset();
        this.area.reset();

        this.saveActors.forEach(actor => {
            actor.reset();
            actor.serial = -1;
        });

        this.savedActorCount = 0;
    }

    getMapDataVersion(strHeader) {
        this.fileVersion = GetMapDataVersion(strHeader);

        return this.fileVersion;
    }

    /**
     * Reading an NPC's conversation data
     * @param {BufferReader} reader
     */
    skipCC(reader, speechCount, isDecodeKarmaData) {
        reader.offset += 4 // Box size and dimensions

        for (let i = 0; i < speechCount; i++) {
            const speech = new ConversationBasicInfo(isDecodeKarmaData ? decodeScenarioBuffer_V2(reader, 12) : reader);

            reader.offset += speech.speechLength;

            for (let trigger = 0; trigger < speech.triggerCount; trigger++) {
                this.skipKarmaItem(reader, isDecodeKarmaData);
            }

            const kc = new KarmaContainerBasicElement();

            for (let content = 0; content < speech.contentsCount; content++) {
                kc.karmaCount = reader.readUInt16LE();
                kc.titleLength = reader.readUInt16LE();

                reader.offset += kc.titleLength;

                for (let karma = 0; karma < kc.karmaCount; karma++) {
                    this.skipKarma(reader, isDecodeKarmaData);
                }
            }
        }
    }

    /**
     * @param {BufferReader} reader 
     * @param {boolean} isDecodeKarmaData 
     */
    skipKarmaItem(reader, isDecodeKarmaData) {
        const karmaItem = new KarmaItemBasicInfo(
            isDecodeKarmaData ? decodeScenarioBuffer_V2(reader, 32) : reader
        );

        if (karmaItem.stringSize > 0) {
            reader.offset += karmaItem.stringSize;
        }
    }

    /**
     * @param {BufferReader} reader 
     * @param {boolean} isDecodeKarmaData 
     */
    skipKarma(reader, isDecodeKarmaData) {
        let karma;

        if (this.fileVersion >= VUI_26_ADD_DUNGEON_VALUE_AND_KARMA_VALUE) {
            karma = new KarmaBasicInfo(
                isDecodeKarmaData ? decodeScenarioBuffer_V2(reader, 16) : reader,
                this.fileVersion
            )
        }
        else if (this.fileVersion >= VUI_20_ADD_KARMA_OCCUR_CHANCE) {
            karma = new KarmaBasicInfo(
                isDecodeKarmaData ? decodeScenarioBuffer_V2(reader, 16 - 4) : reader,
                this.fileVersion
            )
        } else {
            karma = new KarmaBasicInfo(
                isDecodeKarmaData ? decodeScenarioBuffer_V2(reader, 16 - 2 - 4) : reader,
                this.fileVersion
            )
        }

        if (karma.titleLength > 0) {
            reader.offset += karma.titleLength;
        }

        for (let i = 0; i < karma.triggerCount; i++) {
            this.skipKarmaItem(reader, isDecodeKarmaData);
        }

        for (let i = 0; i < karma.reactionCount; i++) {
            this.skipKarmaItem(reader, isDecodeKarmaData);
        }
    }
}