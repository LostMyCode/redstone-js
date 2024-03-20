import BufferReader from "../utils/BufferReader";

export const getOvalRange = (x1, y1, x2, y2) => {
    x1 -= x2;
    y1 -= y2;
    y1 *= 2;

    if (x1 >= 0x7fff || x1 <= -0x7fff) return 0x7ffffff;
    if (y1 >= 0x7fff || y1 <= -0x7fff) return 0x7ffffff;

    return x1 * x1 + y1 * y1;
}

export class Index {
    /**
     * @param {BufferReader} reader 
     */
    constructor(reader) {
        this.value = reader ? reader.readInt32LE() : 0;
        this.index = reader ? reader.readInt32LE() : 0;
    }
}

export function random(range) {
    range = ~~(range);
    if (range === 0) {
        return 0;
    }
    if (range < 0) {
        return -Math.floor(Math.random() * Math.abs(range));
    }
    return Math.floor(Math.random() * range);
}