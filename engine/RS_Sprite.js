import BufferReader from "../utils/BufferReader";
import { PUT_NORMAL, SPRITE_BPP16, SPRITE_BPP8 } from "./DrawH";

export default class RS_Sprite {
    constructor() {
        this.height = 0;
        this.maxSpriteWidth = 0;
        this.maxSpriteHeight = 0;
    }

    close() {
        this._16Sprite = null;
        this._8Sprite = null;
        this.layer = null;
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
            this._8Sprite = br.readStructUInt8(this.spriteOffset[this.count]);
        }

        if (this.isShadow) {
            this.shadowOffset = br.readStructUInt32LE((this.count + 1));

            if (this.shadowOffset[this.count] > 0) {
                this.shadow = br.readStructUInt8(this.shadowOffset[this.count]);
            }
        }

        if (this.isLayer) {
            this.layerOffset = br.readStructUInt32LE(this.count + 1);
            this.layer = br.readStructUInt8(this.layerOffset[this.count]);
        } else {
            br.offset += this.count * 4;
            br.offset += br.readUInt32LE();
        }

        if (this._16Sprite) {
            const br = new BufferReader(Buffer.from(this._16Sprite.slice(0, 8)));
            const width = br.readUInt16LE();
            const height = br.readUInt16LE();
            const left = br.readInt16LE();
            const top = br.readInt16LE();

            this.width = width;
            this.height = height - top;
        }
        if (this._8Sprite) {
            const br = new BufferReader(Buffer.from(this._8Sprite.slice(0, 8)));
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
}