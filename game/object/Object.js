import Pos from "../../engine/Pos";
import { Index } from "../../engine/SFC";
import WrappedAnim from "../../engine/WrappedAnim";
import BitFlagReader from "../../utils/BitFlagReader";
import BufferReader, { TYPE_DEF } from "../../utils/BufferReader";

export const MAX_TINY_OBJECT_COUNT = 10000;
export const MAX_FIXED_OBJECT_COUNT = 10000;
export const OBJECT_IMAGE_COUNT = 1024;

export const OBJECT_STATIC = 0;
export const OBJECT_FREE = 1;
export const OBJECT_BUILDING = 2;

export const MAX_ADD_ON_OBJECT_COUNT = 8;

class TinyObjectInfo {
    /**
     * @param {BufferReader} reader 
     */
    constructor(reader) {
        this.pos = new Pos(reader.readInt32LE(), reader.readInt32LE());
        this.object = reader.readUInt16LE();

        reader.offset += 2; // skip padding
    }
}

class AddonObject {
    /**
     * @param {BufferReader} reader 
     */
    constructor(reader) {
        this.object = reader.readUInt16LE();
        this.dx = reader.readInt16LE();
        this.dy = reader.readInt16LE();
    }
}

class SaveFixedObjectInfo {  // struct size: 64
    /**
     * @param {BufferReader} reader 
     */
    constructor(reader) {
        this.serial = reader.readUInt16LE();

        reader.offset += 2;

        this.pos = new Pos(reader.readInt32LE(), reader.readInt32LE());
        this.object = reader.readUInt16LE();
        this.addonObjects = Array(MAX_ADD_ON_OBJECT_COUNT).fill().map(() => new AddonObject(reader));
        this.isPutShadow = reader.readUInt16LE();
    }
}

export const OIS_NORMAL = 0;
export const OIS_SHINING = 1;
export const OIS_SHAKE = 2;
export const OIS_TRAP = 3;
export const OIS_HIDE = 4;

class FixedObjectInfo {
    /**
     * @param {SaveFixedObjectInfo} saveObject 
     */
    constructor(saveObject) {
        this.object = saveObject.object;
        this.addonObjects = saveObject.addonObjects;
        this.isPutShadow = saveObject.isPutShadow;

        this.isDoor = false;
        this.isActive = false;
        this.isOpened = false;
        this.isDisarmed = true;
        this.isUnlocked = false;
        this.isHide = true;
        this.isDetectedDoor = false;
        this.isDetectedTrap = false;
        this.isFocused = false;
        this.isLinkSecretDungeon = false;

        this.imageStatus = OIS_NORMAL;
        this.upkeepTime = 0;

        this.x = saveObject.pos.x;
        this.y = saveObject.pos.y;
    }
}

export const MAX_ADDON_IMAGE_COUNT = 20;
export const MAX_ADDON_OBJECT_COUNT_ON_BUILDING = 4;
export const MAX_BUILDING_COUNT_IN_MAP = 255;

class SaveBuildingInfo {  // struct size: 84
    /**
     * @param {BufferReader} reader 
     */
    constructor(reader) {
        this.serial = reader.readUInt16LE();

        reader.offset += 2;

        this.pos = new Pos(reader.readInt32LE(), reader.readInt32LE());
        this.building = reader.readUInt16LE();
        this.isPutShadow = reader.readUInt16LE();
        this.addonBlockCount = reader.readUInt16LE();
        this.addonObjectCount = reader.readUInt16LE();
        this.addonBlocks = reader.readArray(20, TYPE_DEF.UINT16);
        this.addonObjects = Array(MAX_ADDON_OBJECT_COUNT_ON_BUILDING).fill().map(() => new AddonObject(reader));
    }
}

class BuildingInfo {  // struct size: 72
    /**
     * @param {SaveBuildingInfo} saveBuilding 
     */
    constructor(saveBuilding) {
        this.building = saveBuilding.building;
        this.isPutShadow = saveBuilding.isPutShadow;
        this.addonBlockCount = saveBuilding.addonBlockCount;
        this.addonObjectCount = saveBuilding.addonObjectCount;
        this.addonBlocks = saveBuilding.addonBlocks;
        this.addonObjects = saveBuilding.addonObjects;
    }
}

export default class RS_MapObject {
    tileSet = 0; // object and building sets

    existTinyObject = new Uint8Array(OBJECT_IMAGE_COUNT);
    existFixedObject = new Uint8Array(OBJECT_IMAGE_COUNT);

    /**
     * @type {WrappedAnim[]}
     */
    tinyObjectImage = [];
    /**
     * @type {WrappedAnim[]}
     */
    fixedObjectImage = [];
    /**
     * @type {WrappedAnim[]}
     */
    buildingImage = [];

    /**
     * @type {FixedObjectInfo[]}
     */
    fixedObjectList = [];
    /**
     * @type {TinyObjectInfo[]}
     */
    tinyObjectList = [];
    /**
     * @type {BuildingInfo[]}
     */
    buildingList = [];

    constructor() {
        this.reset();
    }

    reset() {
        this.tinyObjectImageCount = 0;
        this.fixedObjectImageCount = 0;
        this.buildingImageCount = 0;

        this.tileSet = 0xffff;

        //
    }

    close() {

    }

    /**
     * @param {BufferReader} reader 
     * @param {boolean} isBuildExistObjectList 
     */
    readObjectListInMap(reader, isBuildExistObjectList) {
        isBuildExistObjectList = true;

        this.existTinyObject.fill(0xff);
        this.existFixedObject.fill(0xff);

        // --- tiny objects ---
        this.tinyObjectCount = reader.readInt32LE();

        // object alignment information
        this.rapes = Array(100).fill().map(() => new Index(reader));
        this.stands = Array(100).fill().map(() => new Index(reader));
        this.floats = Array(100).fill().map(() => new Index(reader));

        this.tinyObjectList = Array(this.tinyObjectCount).fill().map(() => new TinyObjectInfo(reader));

        // --- fixed objects ---
        this.fixedObjectCount = reader.readInt32LE();

        for (let i = 0; i < this.fixedObjectCount; i++) {
            const saveObject = new SaveFixedObjectInfo(reader);

            this.fixedObjectList[saveObject.serial] = new FixedObjectInfo(saveObject);
        }

        if (isBuildExistObjectList) {
            let count = 0;

            for (let i = 0; i < this.tinyObjectCount; i++) {
                this.existTinyObject[this.tinyObjectList[i].object] = true;
            }

            for (let i = 0; count < this.fixedObjectCount && i < MAX_FIXED_OBJECT_COUNT; i++) {
                if (!this.fixedObjectList[i] || this.fixedObjectList[i]?.object === 0xffff) {
                    continue;
                }

                count++;

                for (let j = 0; j < MAX_ADD_ON_OBJECT_COUNT; j++) {
                    const tinyObject = this.fixedObjectList[i].addonObjects[j].object;

                    if (tinyObject !== 0xffff) {
                        this.existTinyObject[tinyObject] = true;
                    }
                }

                this.existFixedObject[this.fixedObjectList[i].object] = true;
            }
        }

        this.buildingCount = reader.readInt32LE();

        for (let i = 0; i < this.buildingCount; i++) {
            const saveBuilding = new SaveBuildingInfo(reader);

            this.buildingList[saveBuilding.serial] = new BuildingInfo(saveBuilding);

            if (isBuildExistObjectList) {
                for (let j = 0; j < MAX_ADDON_OBJECT_COUNT_ON_BUILDING; j++) {
                    const tinyObject = this.buildingList[saveBuilding.serial].addonObjects[j].object;

                    if (tinyObject !== 0xffff) {
                        this.existTinyObject[tinyObject] = true;
                    }
                }
            }
        }

        return true;
    }

    loadImageData(tileSet, scale, isLoadOnlyExistObject) {
        //
        isLoadOnlyExistObject = true;

        //

        this.close();

        
    }

    putBuilding(index, x, y) {
        const building = this.buildingList[index];

        if (building.isPutShadow) {

        }


    }
}