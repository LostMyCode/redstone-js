import BufferReader from "../../utils/BufferReader";
import { decodeScenarioBuffer, sjisByteToString } from "../../utils/RedStoneRandom";
import Karma, { KarmaItem } from "./Karma";

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

export default Event;