import BufferReader from "../../utils/BufferReader";
import { decodeScenarioBuffer } from "../../utils/RedStoneRandom";

export default class Karma {
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

export class KarmaItem {
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