import BufferReader from "../utils/BufferReader";

export const MAX_DOOR_IN_MAP = 64;
export const MAX_DOOR_OBJECT_IN_MAP = MAX_DOOR_IN_MAP * 2;
export const LINK_WITH_AREA_DOOR_COUNT = 4;

export const DS_CLOSE = 0;
export const DS_OPEN = 1;
export const DOOR_STATUS_COUNT = 2;

export class DoorObjectSimpleInfo {
    /**
     * @param {BufferReader} reader 
     */
    constructor(reader) {
        this.x = reader.readUInt16LE();
        this.y = reader.readUInt16LE();
        this.objectIndex = reader.readUInt16LE();
        this.objectImage = reader.readUInt16LE();
    }
}