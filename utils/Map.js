import BufferReader from "./BufferReader";
import { decodeScenarioBuffer, sjisByteToString } from "./RedStoneRandom";

// from Basic.cs model
const MagicStructSize = 12; // last is short Dark

const LoadingTarget = {
    Unknown: 0,
    NpcLength: 1,
    NpcGroupInfo: 2,
    NpcSingleInfo: 3,
    AreaInfo: 4,
    ShopInfo: 5,
}

export const MapType = {
    Dungeon: 1,
    Village: 2,
    Shop: 3
}

class Map {
    constructor(br) {
        this.br = br;
        this.readData(br);
    }

    /**
     * 
     * @param {BufferReader} br 
     */
    readData(br) {
        const size = br.readUInt32LE();
        console.log("size:", size);

        const portalAreaOffset = br.readInt32LE();
        const scenarioInfo = br.readString(0x38);
        console.log("scenarioInfo:", scenarioInfo);

        const fieldAreaOffset = br.readInt32LE();
        // const mapHeader = br.readStructUInt8(4 + 0x40 + 4 + 1 + 1 + 4 + 4 + 0x3A + 4 + MagicStructSize + MagicStructSize + 0x1C);
        const headerSize = { width: br.readUInt32LE(), height: br.readUInt32LE() };
        this.headerSize = headerSize;
        const name = br.readString(0x40, "sjis");
        br.readUInt32LE();
        this.typeAndFlags = br.readUInt8();
        br.readUInt8();
        br.readUInt32LE();
        br.readUInt32LE();
        const all255 = br.readStructUInt8(0x3A);
        const mapHeader = br.readStructUInt8(4 + MagicStructSize + MagicStructSize + 0x1C);
        const version = Number(scenarioInfo.substring(24, 24 + 4));
        console.log("check rest of mapHeader ", mapHeader);
        console.log("check all 255", all255);
        console.log("version:", version, headerSize, name);

        if (version <= 6.0 && version > 5.7) {
            br.setDataEncodeTable(-1);
        }
        else if (version > 6.0) {
            const rawKey = br.readInt32LE();
            br.setDataEncodeTable(rawKey);
            console.log("RawKey:", rawKey);
            console.log("DecodeKey", br.decodeKey);
        }

        const realobjdata = br.readUInt32LE();
        console.log("realobjdata:", realobjdata);

        // const tileInfo = br.readStructFloatLE(headerSize.width * headerSize.height);
        const tileInfo = br.readStructUInt8(headerSize.width * headerSize.height * 6);
        const tileReader = new BufferReader(Buffer.from(tileInfo));
        const tileData1 = tileReader.readStructUInt16LE(headerSize.width * headerSize.height);
        const tileData2 = tileReader.readStructUInt16LE(headerSize.width * headerSize.height);
        const tileData3 = (new Array(headerSize.width * headerSize.height)).fill(null).map(() => [tileReader.readUInt8(), tileReader.readUInt8()]);
        console.log("tileData1", tileData1);
        console.log("tileData2", tileData2);
        console.log("tileData3", tileData3);
        this.tileData1 = tileData1;
        this.tileData2 = tileData2;
        this.tileData3 = tileData3;

        // console.log("tileInfo", tileInfo);

        const doorListLen = br.readInt32LE();

        const doorList = [];
        for (let i = 0; i < doorListLen; i++) {
            doorList.push(br.readUInt64LE());
        }
        console.log("check dorrlist", doorList);

        const blocks = br.readStructUInt8(headerSize.width * headerSize.height);
        for (let i = 0; i < headerSize.height; i++) {
            let row = [];
            for (let j = 0; j < headerSize.width; j++) {
                row.push(blocks[headerSize.width * i + j]);
            }
            // console.log(JSON.stringify(row));
        }
        // saveTileData("blocks", blocks);

        let charIndexes;
        Object.values(LoadingTarget).forEach(target => {
            let nextOffset = br.readInt32LE();
            console.log("nextoffset", nextOffset);
            // br.offset -= 4;
            // let nextOffsetUint8 = br.readStructUInt8(4);
            switch (target) {
                case LoadingTarget.Unknown:
                    console.log("unknown");
                    br.offset = nextOffset;
                    break;

                case LoadingTarget.NpcLength:
                    console.log("npclength");
                    const encryptedBytes = Buffer.from([0, 0, 0, 0]);
                    encryptedBytes.writeInt32LE(nextOffset, 0);
                    const decrypted = decodeScenarioBuffer(encryptedBytes, br.decodeKey);
                    const readCount = decrypted.readUInt32LE(0);

                    const encryptedBytes2 = Buffer.from(br.readStructUInt8(readCount * 2)); // 2 = ushort size
                    const decryptedBuf = decodeScenarioBuffer(encryptedBytes2, br.decodeKey);
                    const de = new BufferReader(decryptedBuf);
                    charIndexes = de.readStructUInt16LE(readCount);

                    console.log("check char indexes", charIndexes.length, charIndexes);
                    // br.readStructUInt8(2);
                    // br.offset = nextOffset;
                    break;

                case LoadingTarget.NpcGroupInfo:
                    console.log("npcgroupinfo");
                    const npcGroupInfoLength = version > 5.4 ? br.readInt32LE() : 0x2C;
                    /**
                     * @type {MapActorGroup[]}
                     */
                    this.npcGroups = [];
                    for (let i = 0; i < charIndexes.length; i++) {
                        const npcGroupInfo = new MapActorGroup(br, npcGroupInfoLength, charIndexes[i]);
                        this.npcGroups.push(npcGroupInfo);
                        // console.log(npcGroupInfo, "idx", i);
                    }
                    break;

                case LoadingTarget.NpcSingleInfo:
                    console.log("npcsingleinfo");
                    const npcSingleInfoLen = decodeScenarioBuffer(br.readStructUInt8(4), br.decodeKey).readUInt32LE(0);
                    /**
                     * @type {MapActorSingle[]}
                     */
                    this.npcSingles = new Array(npcSingleInfoLen);
                    // console.log("npc single info len", npcSingleInfoLen);

                    for (let i = 0; i < npcSingleInfoLen; i++) {
                        this.npcSingles[i] = new MapActorSingle(br);
                    }
                    break;

                case LoadingTarget.AreaInfo: {
                    console.log("areainfo");
                    const encryptedBytes = Buffer.from([0, 0, 0, 0]);
                    encryptedBytes.writeInt32LE(nextOffset, 0);
                    const decrypted = decodeScenarioBuffer(encryptedBytes, br.decodeKey);
                    const areaInfoCount = decrypted.readUInt32LE(0);
                    /**
                     * @type {AreaInfo[]}
                     */
                    this.areaInfos = new Array(areaInfoCount);
                    console.log("area info count", areaInfoCount);
                    for (let i = 0; i < this.areaInfos.length; i++) {
                        this.areaInfos[i] = new AreaInfo(br, portalAreaOffset, version);
                    }
                    break;
                }

                case LoadingTarget.ShopInfo:
                    console.log("shopinfo");
                    break;
            }
        });
    }
}

class MapActorGroup {
    constructor(br, structLength, job2Index) {
        this.br = br;
        this.structLength = structLength;
        this.Job = job2Index;
        this.readData(br);
    }

    /**
     * @param {BufferReader} br 
     */
    readData(br) {
        let encryptedBuf = Buffer.from(br.readStructUInt8(this.structLength));
        let decryptedBuf = decodeScenarioBuffer(encryptedBuf, br.decodeKey);

        const baseReader = new BufferReader(decryptedBuf);
        this.internalID = baseReader.readUInt16LE();
        this.unknown_1 = baseReader.readUInt16LE();
        this.minLevel = baseReader.readUInt16LE();
        this.name = baseReader.readString(0x14, "sjis");
        this.imageSumCandidate = baseReader.readStructUInt16LE(0x03);
        this.unknown_4 = baseReader.readUInt16LE();
        [this.sizeWidth, this.sizeHeight] = baseReader.readStructUInt16LE(2);
        this.maxLevel = baseReader.readUInt16LE();
        // this.unknown_3 = baseReader

        const enemyKarmaInfoLen = br.readInt32LE();
        this.enemyKarmaInfos = [];
        for (let i = 0; i < enemyKarmaInfoLen; i++) {
            const enemyKarmaInfo = {
                timing: br.readInt32LE(),
                karmas: new Array(br.readUInt16LE()), // new Karma[len]
                comment: (() => {
                    let commentString = "";
                    const count = br.readInt16LE();
                    const encryptedBytes = br.readStructUInt8(count); // EUC-KR
                    return commentString;
                })()
            };
            this.enemyKarmaInfos.push(enemyKarmaInfo);
            for (let j = 0; j < enemyKarmaInfo.karmas.length; j++) {
                enemyKarmaInfo.karmas[j] = new Karma(br);
            }
        }
    }
}

class Karma {
    constructor(br) {
        this.br = br;
        this.readData(br);
    }

    /**
     * @param {BufferReader} br 
     */
    readData(br) {
        let encryptedBuf = Buffer.from(br.readStructUInt8(0x10));
        let decryptedBuf = decodeScenarioBuffer(encryptedBuf, br.decodeKey);

        const baseReader = new BufferReader(decryptedBuf);
        this.unknown_1 = baseReader.readUInt16LE();
        this.conditionRelation = baseReader.readUInt16LE();
        this.commands = new Array(baseReader.readUInt16LE()); // KarmaItemCommand Array
        this.conditions = new Array(baseReader.readUInt16LE()); // KarmaItemCondition Array;

        const messageLength = baseReader.readUInt16LE();

        this.probabirity = baseReader.readUInt16LE();

        this.unknown_2 = baseReader.readUInt16LE();
        this.unknown_3 = baseReader.readUInt16LE();

        this.comment = br.readStructUInt8(messageLength); // EUC-KR;

        for (let i = 0; i < this.conditions.length; i++) {
            // this.conditions[i] = new KarmaItemCondition(br);
            this.conditions[i] = new KarmaItem(br);
        }

        for (let i = 0; i < this.commands.length; i++) {
            // this.commands[i] = new KarmaItemCommand(br);
            this.commands[i] = new KarmaItem(br);
        }
    }
}

class KarmaItem {
    constructor(br) {
        this.br = br;
        this.readData(br);
    }

    /**
     * @param {BufferReader} br 
     */
    readData(br) {
        let encryptedBuf = Buffer.from(br.readStructUInt8(0x20));
        let decryptedBuf = decodeScenarioBuffer(encryptedBuf, br.decodeKey);

        const baseReader = new BufferReader(decryptedBuf);
        this._karmaItem = baseReader.readUInt32LE();
        this.value = baseReader.readStructUInt32LE(4);
        this.unknown_0 = baseReader.readUInt32LE();
        this.unknown_1 = baseReader.readUInt32LE();

        let messageFlags = baseReader.readUInt16LE();
        let messageLength = messageFlags & 0x7FFF;

        this.unknown_2 = ((messageFlags >> 15) & 1) == 1;
        if (this.unknown_2) {
            console.log("whats");
        }

        if (!this.unknown_2 && messageLength > 0) {
            this.message = decodeScenarioBuffer(br.readStructUInt8(messageLength), br.decodeKey);
        } else {
            this.message = null;
        }
    }
}

class MapActorSingle {
    constructor(br) {
        this.br = br;
        this.readData(br);
    }

    /**
     * @param {BufferReader} br 
     */
    readData(br) {
        const decryptedBuf = decodeScenarioBuffer(br.readStructUInt8(0xB0), br.decodeKey);
        const baseReader = new BufferReader(decryptedBuf);

        this.index = baseReader.readUInt32LE();
        this.internalID = baseReader.readUInt16LE();
        this.charType = baseReader.readUInt16LE(); // charactor type
        this.direct = baseReader.readInt16LE(); // ActorDirect
        this.unknown_0 = baseReader.readUInt16LE();
        this.popSpeed = baseReader.readUInt32LE();
        this.unknown_1 = baseReader.readStructUInt8(0x78);
        this.point = { x: baseReader.readUInt32LE(), y: baseReader.readUInt32LE() };
        this.name = baseReader.readString(0x10, "sjis");
        this.unknown_2 = baseReader.readStructUInt8(0x10);

        this.events = new Array(br.readInt16LE()) // Event array
        if (this.events.length > 0) {
            const speechType = br.readUInt16LE();
            const unknown = br.readUInt16LE();
            for (let i = 0; i < this.events.length; i++) {
                this.events[i] = new Event(br, speechType);
            }
        }
    }
}

/**
 * Karmas/Event.cs
 */
class Event {
    constructor(br, speechType) {
        this.br = br;
        this.speechType = speechType;
        this.readData(br);
    }

    /**
     * @param {BufferReader} br 
     */
    readData(br) {
        const decryptedBuf = decodeScenarioBuffer(br.readStructUInt8(0x0C), br.decodeKey);
        const baseReader = new BufferReader(decryptedBuf);

        this.unknown_0 = baseReader.readUInt16LE();
        this.message = decodeScenarioBuffer(br.readStructUInt8(baseReader.readInt16LE()), br.decodeKey);
        this.selections = new Array(baseReader.readUInt16LE());
        this.occurrenceCondition = new Array(baseReader.readUInt16LE()); // KarmaItemCondition array

        for (let i = 0; i < this.occurrenceCondition.length; i++) {
            this.occurrenceCondition[i] = new KarmaItem(br); // new KarmaItemCondition
        }

        this.occurrenceReletion = baseReader.readUInt16LE(); // Karma.ConditionFlag
        this.autoStart = !!baseReader.readUInt16LE(); // boolean

        for (let i = 0; i < this.selections.length; i++) {
            this.selections[i] = new Selection(br);
        }
    }
}

class Selection {
    constructor(br) {
        this.br = br;
        this.readData(br);
    }

    /**
     * @param {BufferReader} br 
     */
    readData(br) {
        /**
         * @type {Karma[]}
         */
        this.karmas = new Array(br.readUInt16LE());

        this.message = sjisByteToString(decodeScenarioBuffer(br.readStructUInt8(br.readUInt16LE()), br.decodeKey));
        // console.log("selection message", this.message);

        for (let i = 0; i < this.karmas.length; i++) {
            this.karmas[i] = new Karma(br);
        }
    }
}

export const ObjectType = {
    System: 0, //システム
    Unk1: 1, //
    Door: 2, //扉
    WarpPortal: 3, //ワープポータル
    SystemArea: 4, //システム領域
    SystemMovePosition: 5, //システム転送位置
    Area: 6, //エリア
    PvPMovePosition: 7, //PvP転送位置
    OXArea_O: 8, //○×クイズ領域(○)
    OXArea_X: 9, //○×クイズ領域(×)
    Unk2: 10, // 
    TrapFloor: 11, // トラップ床
    EventObject: 12, // イベントオブジェクト
    Chest: 13, // 宝箱
    Unk3: 14, // 
    Unk4: 15, // 
    Unk5: 16, // 
    HuntingArea: 17, // 冒険家協会推奨狩場
    SystemArea2: 18, // システムエリア
    Unk6: 19, // 
    Unk7: 20, //
}

class AreaInfo {
    constructor(br, portalAreaOffset, scenarioVersion) {
        this.br = br;
        this.portalAreaOffset = portalAreaOffset;
        this.scenarioVersion = scenarioVersion;
        this.readData(br);
    }

    get centerPos() {
        return {
            x: (this.rightDownPos.x + this.leftUpPos.x) / 2,
            y: (this.rightDownPos.y + this.leftUpPos.y) / 2
        }
    }

    /**
     * @param {BufferReader} br 
     */
    readData(br) {
        const decryptedBuf = decodeScenarioBuffer(br.readStructUInt8(0xA2), br.decodeKey);
        const baseReader = new BufferReader(decryptedBuf);

        this.index = baseReader.readUInt16LE();
        this.leftUpPos = { x: baseReader.readUInt32LE(), y: baseReader.readUInt32LE() };
        this.rightDownPos = { x: baseReader.readUInt32LE(), y: baseReader.readUInt32LE() };
        this.objectInfo = baseReader.readUInt16LE(); // ObjectType
        this.subObjectInfo = baseReader.readUInt16LE();
        this.unknown_0 = baseReader.readUInt16LE();
        this.unknown_1 = baseReader.readUInt16LE();
        // console.log("check area pos", this.leftUpPos, this.rightDownPos);
        // console.log("areainfo object", this.objectInfo, this.subObjectInfo);

        const EVENT_OBJECT = 12;
        const code = this.objectInfo === EVENT_OBJECT ? "sjis" : "EUC-KR";

        this.comment1 = baseReader.readString(0x21, code);
        this.comment2 = baseReader.readString(0x67, code);
        // console.log("check areainfo comments", this.comment1, this.comment2);

        const skipPos = this.scenarioVersion > 4.4 ? br.readInt32LE() : br.readInt16LE() + 2;

        this.areaEvents = new Array(skipPos > 1 ? br.readInt16LE() : 0);
        if (this.areaEvents.length !== 0) {
            const unk = br.readUInt32LE();
            for (let i = 0; i < this.areaEvents.length; i++) {
                this.areaEvents[i] = new Event(br, 0);
            }
        }

        const myPortalStringOffset = br.readInt32LE();
        if (myPortalStringOffset === -1) {
            this.moveToFileName = null;
        } else {
            const returnPosition = br.offset;
            br.offset = myPortalStringOffset + this.portalAreaOffset; // seek from origin
            let readCount = br.readInt32LE() + 1;
            if (readCount + br.offset > br.buffer.byteLength - 1) readCount = br.buffer.byteLength - br.offset;
            this.moveToFileName = br.readString(readCount);
            console.log("movetoFileName", this.moveToFileName, this.subObjectInfo);
            br.offset = returnPosition;
        }
    }
}

export default Map;