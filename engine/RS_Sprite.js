import BufferReader from "../utils/BufferReader";
import { PUT_NORMAL, SPRITE_BPP16, SPRITE_BPP8 } from "./DrawH";
import Rect from "./Rect";

export default class RS_Sprite {
    constructor() {
        this.height = 0;
        this.maxSpriteWidth = 0;
        this.maxSpriteHeight = 0;
    }

    close() {
        /**
         * @type {BufferReader}
         */
        this._16Sprite = null;
        /**
         * @type {BufferReader}
         */
        this._8Sprite = null;
        /**
         * @type {BufferReader}
         */
        this.layer = null;
        /**
         * @type {BufferReader}
         */
        this.shadow = null;

        this.spriteOffset = null;
        this.layerOffset = null;
        this.shadowOffset = null;
        this.plt = null;
        // lpPlt = null;
        this.serial = null;
    }

    reset() {
        this.count = 0;
        this.bpp = SPRITE_BPP16;
        this.serial = -1;
        this.isLoadedPlt = false;
        this.height = 0;
    }

    // getMaxSize() {
    //     this.maxSpriteWidth = 0;
    //     this.maxSpriteHeight = 0;

    //     this.maxShadowWidth = 0;
    //     this.maxShadowHeight = 0;


    // }

    /**
     * @param {BufferReader} br 
     * @param {boolean} loadPalette 
     */
    load(br, loadPalette) {
        this.close();

        this.isLoadedPlt = loadPalette;

        if (this.bpp === SPRITE_BPP8) {
            if (loadPalette) {
                //   
            } else {
                this.plt = br.readStructUInt8(512);
            }
        }

        this.spriteOffset = br.readStructUInt32LE((this.count + 1));

        if (this.bpp === SPRITE_BPP16) {

        } else {
            this._8Sprite = new BufferReader(Buffer.from(br.readStructUInt8(this.spriteOffset[this.count])));
        }

        if (this.isShadow) {
            this.shadowOffset = br.readStructUInt32LE((this.count + 1));

            if (this.shadowOffset[this.count] > 0) {
                this.shadow = new BufferReader(Buffer.from(br.readStructUInt8(this.shadowOffset[this.count])));
            }
        }

        if (this.isLayer) {
            this.layerOffset = br.readStructUInt32LE(this.count + 1);
            this.layer = new BufferReader(Buffer.from(br.readStructUInt8(this.layerOffset[this.count])));
        } else {
            br.offset += this.count * 4;
            br.offset += br.readUInt32LE();
        }

        if (this._16Sprite) {
            const br = this._16Sprite;

            br.offset = 0;

            const width = br.readUInt16LE();
            const height = br.readUInt16LE();
            const left = br.readInt16LE();
            const top = br.readInt16LE();

            this.width = width;
            this.height = height - top;
        }
        if (this._8Sprite) {
            const br = this._8Sprite;

            br.offset = 0;

            const width = br.readUInt16LE();
            const height = br.readUInt16LE();
            const left = br.readInt16LE();
            const top = br.readInt16LE();

            this.width = width;
            this.height = top;
        }

        return true;
    }

    put(x, y, index, xRate, yRate, effect, alpha, flip) {
        if (effect < PUT_NORMAL) {
            alpha = effect;
        }

        if (!this._8Sprite && !this._16Sprite) return;

        // _PutSprite
        // this.putSprite(
        //     x, y,
        //     this.bpp,
        //     flip,
        //     this._16Sprite[this.spriteOffset[index]],
        //     this._8Sprite[this.spriteOffset[index]],
        //     this.plt,
        //     xRate, yRate,
        //     effect,
        //     alpha,
        //     this.maxSpriteWidth,
        //     this.maxSpriteHeight
        // );
    }

    /**
     * @param {number} index int
     * @param {Rect} rect 
     * @param {number} scale int
     */
    getRect(index, rect, scale = 100) {
        if (index >= this.count) {
            rect.set(-100000, -100000, -90000, -90000);
            return false;
        }

        const br = this._16Sprite || this._8Sprite;

        br.offset = this.spriteOffset[index];

        const width = br.readUInt16LE();
        const height = br.readUInt16LE();
        const left = br.readInt16LE();
        const top = br.readInt16LE();

        rect.x1 = ~~(- left * scale / 100);
        rect.y1 = ~~(- top * scale / 100);
        rect.x2 = ~~(rect.x1 + width * scale / 100);
        rect.y2 = ~~(rect.y1 + height * scale / 100);

        return true;
    }

    get16(index) {
        if (!this._16Sprite) return null;
        if (index >= this.count) return null;

        const reader = new BufferReader(this._16Sprite.buffer);

        reader.offset = this.spriteOffset[index];

        return reader;
    }

    get8(index) {
        if (!this._8Sprite) return null;
        if (index >= this.count) return null;

        const reader = new BufferReader(this._8Sprite.buffer);

        reader.offset = this.spriteOffset[index];

        return reader;
    }
}