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
}

if (module.exports) {
    module.exports = BufferReader;
}
export default BufferReader;