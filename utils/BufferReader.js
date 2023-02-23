// const Encoding = require('encoding-japanese');
import Encoding from "encoding-japanese";

class BufferReader {
    /**
     * @param {Buffer} buffer 
     */
    constructor(buffer) {
        this.buffer = buffer;
        this.offset = 0;
    }

    readUInt8() {
        return this.buffer.readUInt8(this.offset++);
    }

    readInt16LE() {
        const value = this.buffer.readInt16LE(this.offset);
        this.offset += 2;
        return value;
    }

    readUInt16LE() {
        const value = this.buffer.readUInt16LE(this.offset);
        this.offset += 2;
        return value;
    }

    readInt32LE() {
        const value = this.buffer.readInt32LE(this.offset);
        this.offset += 4;
        return value;
    }

    readUInt32LE() {
        const value = this.buffer.readUInt32LE(this.offset);
        this.offset += 4;
        return value;
    }

    readFloatLE() {
        const value = this.buffer.readFloatLE(this.offset);
        this.offset += 4;
        return value;
    }

    readUInt64LE() {
        const value = this.buffer.readBigUInt64LE(this.offset);
        this.offset += 8;
        return value;
    }

    readStructUInt8(count) {
        const arr = [];
        for (let i = 0; i < count; i++) {
            arr.push(this.readUInt8());
        }
        return arr;
    }

    readStructUInt16LE(count) {
        const arr = [];
        for (let i = 0; i < count; i++) {
            arr.push(this.readUInt16LE());
        }
        return arr;
    }

    readStructUInt32LE(count) {
        const arr = [];
        for (let i = 0; i < count; i++) {
            arr.push(this.readUInt32LE());
        }
        return arr;
    }

    /**
     * @param {number} count - Loop count
     * @returns Struct array
     */
    readStructFloatLE(count) {
        const arr = [];
        for (let i = 0; i < count; i++) {
            arr.push(this.readFloatLE());
        }
        return arr;
    }

    readString(count, encoding) {
        const arr = [];
        const bytes = this.readStructUInt8(count);
        for (let i = 0; i < count; i++) {
            const byte = bytes[i];
            if (byte === 0) break;
            arr.push(byte);
        }
        if (encoding === "sjis") {
            var unicodeArray = Encoding.convert(arr, {
                to: 'UNICODE',
                from: 'SJIS'
            });
            var str = Encoding.codeToString(unicodeArray); // 文字コード値の配列から文字列に変換
            return str;
        }
        return Buffer.from(arr).toString();
    }

    setDataEncodeTable(rawKey) {
        const generateScenarioDecodeKey = seed => {
            if (seed == -1) return 0;
            return 2 - (seed != 1 ? 1 : 0);
        }
        this.decodeKey = generateScenarioDecodeKey(rawKey);

    }

    /**
     * @param {typeof TYPE_DEF} type 
     */
    readByType = (type) => {
        switch (type) {
            case TYPE_DEF.UINT8:
                return this.readUInt8();

            case TYPE_DEF.UINT16:
                return this.readUInt16LE();

            case TYPE_DEF.UINT32:
                return this.readUInt32LE();

            default:
                throw new Error("Unsupported read type", type);
        }
    }

    readStruct = (structTypeDef, extractTarget) => {
        Object.keys(structTypeDef).forEach(fieldName => {
            const typeDef = structTypeDef[fieldName];
            if (typeDef instanceof Array) {
                if (typeDef[0] === TYPE_DEF.SKIP) {
                    this.offset += typeDef.length;
                    extractTarget[fieldName] = null;
                    return;
                }
                if (typeDef[0] === TYPE_DEF.CHAR) {
                    extractTarget[fieldName] = this.readString(typeDef.length);
                } else {
                    const aData = [];
                    typeDef.forEach(_typeDef => {
                        const data = this.readByType(_typeDef, this);
                        aData.push(data);
                    });
                    extractTarget[fieldName] = aData;
                }
            } else {
                const data = this.readByType(typeDef, this);
                extractTarget[fieldName] = data;
            }
        });
    }
}

export const TYPE_DEF = {
    UINT8: 0,
    UINT16: 1,
    UINT32: 2,
    CHAR: 3,
    SKIP: 0xFF,
}

if (module.exports) {
    module.exports = BufferReader;
}
export default BufferReader;