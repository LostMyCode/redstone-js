import BufferReader from "../../utils/BufferReader";
import { decodeScenarioBuffer, getKeyByValue, sjisByteToString } from "../../utils/RedStoneRandom";
import { MapActorGroup, MapActorSingle } from "./Actor";
import Event from "./Event";

// from Basic.cs model
const MagicStructSize = 12; // last is short Dark

export const MapType = {
    Dungeon: 1,
    Village: 2,
    Shop: 3
}

export const Mapset = {
    Grassland: 0,
    Mountains: 1,
    Cave: 4,
    Dungeon: 5,
    Brunenstig: 10,
    Room: 19,
}

class Map {
    constructor(br) {
        this.br = br;

        this.size = {
            width: 0,
            height: 0
        }
        this.name = "";

        /**
         * @type {Number[]}
         */
        this.actorIndexes = [];

        /**
         * @type {{[key: number]: MapActorGroup}}
         */
        this.actorGroups = {};

        /**
         * @type {MapActorSingle[]}
         */
        this.actorSingles = [];

        /**
         * @type {{[key: number]: ObjectInfo}}
         */
        this.objectInfos = {};

        /**
         * @type {{[key: number]: BuildingInfo}}
         */
        this.buildingInfos = {};

        this.readData(br);
    }

    /**
     * 
     * @param {BufferReader} br 
     */
    readData(br) {
        this.fileSize = br.readUInt32LE();

        const portalAreaOffset = br.readInt32LE();
        const scenarioInfo = br.readString(0x38, "sjis");
        console.log("File:", scenarioInfo);

        const fieldAreaOffset = br.readInt32LE();
        // const mapHeader = br.readStructUInt8(4 + 0x40 + 4 + 1 + 1 + 4 + 4 + 0x3A + 4 + MagicStructSize + MagicStructSize + 0x1C);
        this.size.width = br.readUInt32LE();
        this.size.height = br.readUInt32LE();

        this.name = br.readString(0x40, "sjis");;
        this.mapsetId = br.readUInt32LE();
        console.log("Mapset ID", this.mapsetId);
        this.typeAndFlags = br.readUInt8();
        br.readUInt8();
        br.readUInt32LE();
        br.readUInt32LE();
        const all255 = br.readStructUInt8(0x3A);
        const mapHeader = br.readStructUInt8(4 + MagicStructSize + MagicStructSize + 0x1C);
        this.scenarioVersion = Number(scenarioInfo.substring(24, 24 + 4));
        // console.log("check rest of mapHeader ", mapHeader);
        // console.log("check all 255", all255);
        console.log("Map Name:", this.name);
        console.log("Map Size:", this.size);

        if (this.scenarioVersion <= 6.0 && this.scenarioVersion > 5.7) {
            br.setDataEncodeTable(-1);
        }
        else if (this.scenarioVersion > 6.0) {
            const rawKey = br.readInt32LE();
            br.setDataEncodeTable(rawKey);
            console.log("RawKey:", rawKey);
            console.log("DecodeKey", br.decodeKey);
        }

        const realobjdata = br.readUInt32LE();
        // console.log("realobjdata:", realobjdata);

        const tileInfo = br.readStructUInt8(this.size.width * this.size.height * 6);
        const tileReader = new BufferReader(Buffer.from(tileInfo));
        const tileData1 = tileReader.readStructUInt16LE(this.size.width * this.size.height);
        const tileData2 = tileReader.readStructUInt16LE(this.size.width * this.size.height);
        const tileData3 = tileReader.readStructUInt16LE(this.size.width * this.size.height);
        // const tileData3 = (new Array(this.size.width * this.size.height)).fill(null).map(() => [tileReader.readUInt8(), tileReader.readUInt8()]);
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

        const blocks = br.readStructUInt8(this.size.width * this.size.height);
        for (let i = 0; i < this.size.height; i++) {
            let row = [];
            for (let j = 0; j < this.size.width; j++) {
                row.push(blocks[this.size.width * i + j]);
            }
        }

        // skip unknown
        let nextOffset = br.readInt32LE();
        br.offset = nextOffset;

        // actor indexes length
        let encryptedBytes = br.readStructUInt8(4);
        let decryptedBuffer = decodeScenarioBuffer(encryptedBytes, br.decodeKey);
        const actorIndexesLength = decryptedBuffer.readUInt32LE(0);

        encryptedBytes = br.readStructUInt8(actorIndexesLength * 2);
        decryptedBuffer = decodeScenarioBuffer(encryptedBytes, br.decodeKey);
        this.actorIndexes = (new BufferReader(decryptedBuffer)).readStructUInt16LE(actorIndexesLength);

        nextOffset = br.readInt32LE();

        // actor group info
        const actorGroupInfoStructSize = this.scenarioVersion > 5.4 ? br.readInt32LE() : 0x2C;
        for (let i = 0; i < this.actorIndexes.length; i++) {
            const actorGroupInfo = new MapActorGroup(br, actorGroupInfoStructSize, this.actorIndexes[i]);
            this.actorGroups[actorGroupInfo.internalID] = actorGroupInfo;
        }

        nextOffset = br.readInt32LE();

        // actor single info
        const actorSingleInfoLength = decodeScenarioBuffer(br.readStructUInt8(4), br.decodeKey).readUInt32LE(0);
        this.actorSingles = new Array(actorSingleInfoLength);
        for (let i = 0; i < actorSingleInfoLength; i++) {
            this.actorSingles[i] = new MapActorSingle(br);
        }

        // area info
        encryptedBytes = br.readStructUInt8(4);
        decryptedBuffer = decodeScenarioBuffer(encryptedBytes, br.decodeKey);
        const areaInfoLength = decryptedBuffer.readUInt32LE(0);
        this.areaInfos = new Array(areaInfoLength);
        for (let i = 0; i < areaInfoLength; i++) {
            this.areaInfos[i] = new AreaInfo(br, portalAreaOffset, this.scenarioVersion);
        }

        nextOffset = br.readInt32LE();

        // shop info
        br.offset = nextOffset; // skip

        const positionSpecifiedObjectCount = br.readInt32LE();
        console.log("Num of objects with absolute position specified:", positionSpecifiedObjectCount);

        br.readStructUInt8(2400); // ???

        this.positionSpecifiedObjects = new Array(positionSpecifiedObjectCount);
        for (let i = 0; i < positionSpecifiedObjectCount; i++) {
            const x = br.readUInt32LE();
            const y = br.readUInt32LE();
            const textureId = br.readUInt16LE();
            const unk_0 = br.readUInt16LE();
            this.positionSpecifiedObjects[i] = {
                point: { x, y },
                textureId
            };
        }

        const objectInfoCount = br.readUInt32LE();
        const unk_1 = br.readStructUInt8(12);
        console.log("object info count", objectInfoCount);

        for (let i = 0; i < objectInfoCount; i++) {
            const objectInfo = new ObjectInfo(br);
            if (this.objectInfos[objectInfo.index]) {
                console.log("An object with the same id already exists", objectInfo, this.objectInfos[objectInfo.index]);
                // throw new Error("[Error] An object with the same id already exists");
            }
            this.objectInfos[objectInfo.index] = objectInfo;
        }

        const buildingCount = br.readUInt32LE();
        console.log("building count?", buildingCount);

        for (let i = 0; i < (buildingCount ? 105 : 0); i++) {
            const buildingInfo = new BuildingInfo(br);
            this.buildingInfos[buildingInfo.index] = buildingInfo;
        }
    }

    getMapsetName() {
        return getKeyByValue(Mapset, this.mapsetId);
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

export const portalTextureInfo = {
    door: {},
    doorGrow: {},
    topGate: {},
    topRightGate: {},
    rightGate: {},
    bottomRightGate: {},
    bottomGate: {},
    bottomLeftGate: {},
    leftGate: {},
    topLeftGate: {},
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

class ObjectInfo {
    constructor(br) {
        this.br = br;
        this.subObjectInfos = [];

        this.readData(br);
    }

    /**
     * @param {BufferReader} br 
     */
    readData(br) {
        this.textureId = br.readUInt16LE();
        this.readSubObjects();

        // rest 14
        this.isDrawShadow = br.readUInt16LE() === 1;
        this.index = br.readUInt16LE();
        const unk2 = br.readUInt8();
        const unk3 = br.readUInt8();
        const unk4 = br.readUInt32LE();
        const unk5 = br.readUInt32LE();

        // if (this.index === 7) console.log("check unknown values", this.isDrawShadow, this.index, unk2, unk3, unk4, unk5);
    }

    readSubObjects() {
        const subObjectBytes = this.br.readStructUInt8(48);
        const subObjectReader = new BufferReader(Buffer.from(subObjectBytes));

        // const subObjects = br.readStructUInt8(48);
        // sub object 
        /* 
            uint16: texture id
            uint8: offset x
            uint8: 0x00(offset x from block center?), 0xff(offset x from map bounding box left?)
            uint8: offset y
            uint8: 0x00(offset y from block center?), 0xff(offset y from map bounding box top?)
         */

        for (let i = 0; i < 8; i++) {
            const textureId = subObjectReader.readUInt16LE();

            if (textureId === 0xffff) break;

            this.subObjectInfos.push({
                textureId,
                offsetX: subObjectReader.readUInt8(),
                xAnchorFlag: subObjectReader.readUInt8(),
                offsetY: subObjectReader.readUInt8(),
                yAnchorFlag: subObjectReader.readUInt8()
            });
        }

        if (this.textureId === 88) {
            // console.log("check sub objects of countertable", this.subObjectInfos);
        }
    }
}

class BuildingInfo {
    constructor(br) {
        this.br = br;
        this.readData(br);
    }

    /**
     * @param {BufferReader} br 
     */
    readData(br) {
        this.textureId = br.readUInt16LE();
        br.readUInt16LE();
        br.readUInt16LE();
        br.readUInt16LE();
        this.unk0 = br.readStructUInt8(64);
        this.index = br.readUInt16LE();
        this.unk1 = br.readStructUInt8(10);
    }
}

export default Map;