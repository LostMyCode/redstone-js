import { fetchBinaryFile } from "../utils";
import BufferReader from "../utils/BufferReader";
import { DATA_DIR } from "./Config";

export default class SoundManager {
    static bgmMap = [];

    static async init() {
        const buffer = await fetchBinaryFile(`${DATA_DIR}/bgm.dat`);
        const br = new BufferReader(buffer);

        this.bgmMap = br.readStructUInt16LE(1024);
    }
}