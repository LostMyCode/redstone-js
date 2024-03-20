import { VUI_28_EXPAND_AREA_DATA, VVI_43_ADD_SEASON_VARIABLE } from "../../../common/FieldCommon";
import Pos from "../../../engine/Pos";
import BitFlagReader from "../../../utils/BitFlagReader";
import BufferReader from "../../../utils/BufferReader";
import { AREA_DOOR, AREA_EVENT_AREA, AREA_GUILD_BATTLE, AREA_NAMED_AREA, AREA_PORTAL, AREA_TRAP, PAS_LEAVE_GUILD_HALL } from "./AreaDefine";

export const MAX_AREA = 256 * 2;

export const T_AREA_ARCA = 100;
export const T_AREA_GUILD_STRUCTURE = 101;

export const PORTAL_COUNT = 18;

export const SIZEOF_AREA_NAME = 32;

export class AREA_SAVE_DATA {
    /**
     * @param {BufferReader} reader 
     */
    constructor(reader, fileVersion) {
        this.serial = reader.readUInt16LE();

        this.x1 = reader.readInt32LE();
        this.y1 = reader.readInt32LE();
        this.x2 = reader.readInt32LE();
        this.y2 = reader.readInt32LE();
        this.kind = reader.readUInt16LE();
        this.value = reader.readUInt16LE();
        this.gate = reader.readUInt8();

        let flags = new BitFlagReader(reader.readUInt8(), 8);

        this.gateDirect = flags.readBits(3);
        this.gateShape = flags.readBits(5);

        this.moveGate = reader.readUInt16LE();
        this.name = reader.readString(SIZEOF_AREA_NAME, "kr");

        flags = new BitFlagReader(reader.readUInt16LE(), 16);

        this.linkObject = flags.readBits(15);
        this.isTestPortal = flags.readBool();

        // kr or sjis
        this.gateName = reader.readString(fileVersion >= VUI_28_EXPAND_AREA_DATA ? 100 : SIZEOF_AREA_NAME, "kr");

        if (fileVersion < VVI_43_ADD_SEASON_VARIABLE) return;

        this.seasonVariable = reader.readUInt16LE();
    }
}

class AreaInfo {
    constructor() {
        this.buffer = new Uint8Array(100);

        this.reset();
    }

    /**
     * @param {AREA_SAVE_DATA} saveData 
     */
    static fromAreaSaveData(saveData) {
        const areaInfo = new AreaInfo();

        Object.keys(saveData).forEach(key => {
            areaInfo[key] = saveData[key];
        });

        return areaInfo;
    }

    reset() {
        this.serial = 0xffff;
        this.string = null;
    }

    getCenter(pos) { pos.x = (this.x2 - this.x1) / 2 + this.x1, pos.y = (this.y2 - this.y1) / 2 + this.y1; }
    getCenterPos() {
        const pos = new Pos();

        this.getCenter(pos);

        return pos;
    }
}

export default class Area {
    constructor() {
        /**
         * @type {AreaInfo[]}
         */
        this.areas = [];
    }

    reset() {
        this.count = 0;
        this.normalAreaCount = 0;
        this.visibleAreaCount = 0;
        this.touchableAreaCount = 0;
        this.moveArea = 0xffff;
        this.focusedArea = 0xffff;

        this.namedAreaCount = 0;
        this.frameCounter = 0;
        this.trapAreaCount = 0;
        this.instanceFieldGate = 0xffff;

        this.areas.forEach(area => {
            area.reset();
        })
    }

    /**
     * @param {number} index int
     * @param {AREA_SAVE_DATA} area 
     * @param {boolean} isGuildBattleLobby 
     * @param {string} text 
     */
    insert(index, area, isGuildBattleLobby, text) {
        this.areas[index] = AreaInfo.fromAreaSaveData(area);

        if (text) {
            this.areas[index].string = text;
        }

        if (area.kind === AREA_PORTAL) {
            if (area.gateShape === PAS_LEAVE_GUILD_HALL) {
                this.addTouchableArea(index, true);
            }
            else if (area.moveGate !== 0xffff) {
                if (area.gateShape !== 2) {
                    this.addTouchableArea(index, true);
                }
            }
        }

        if (area.kind === AREA_DOOR) {
            this.addTouchableArea(index, false);
        }

        if (area.kind === AREA_EVENT_AREA || area.kind === T_AREA_ARCA || area.kind === T_AREA_GUILD_STRUCTURE) {
            this.addTouchableArea(index, false);
        }

        //

        if (isGuildBattleLobby && area.kind === AREA_GUILD_BATTLE) {
            this.addVisibleArea(index);
        }

        if (area.kind === AREA_NAMED_AREA) {
            this.addNamedArea(index);
        }

        if (area.kind === AREA_TRAP) {
            //
        }

        this.areas[index].serial = index;
    }

    addTouchableArea(index, isVisible = false) {

    }

    addVisibleArea(index) {

    }

    addNamedArea(index) {

    }
}