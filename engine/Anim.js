import BufferReader from "../utils/BufferReader";
import AnimBase from "./AnimBase";
import { SPRITE_BPP16, SPRITE_BPP8 } from "./DrawH";
import { REGSADHEADER2, SADHEADER } from "./ImageH";
import Rect from "./Rect";
import Pos from "./Pos"
import AnimData from "./AnimData";
import RS_Sprite from "./RS_Sprite";

export default class Anim extends AnimBase {
    constructor() {
        super();
        /**
         * @type {RS_Sprite}
         */
        this.sprite = new RS_Sprite();
        /**
         * @type {AnimData[]}
         */
        this.anmData = [];
    }

    destroy = () => this.reset();

    reset() {
        this.sprite.close();
        this.anmData = [];
    }

    /**
     * @param {BufferReader} br 
     * @param {boolean} loadPalette 
     */
    load(br, loadPalette) {
        const header = new SADHEADER(br);

        this.anmCount = header.anmCount;
        this.isFlip = header.bHalf;
        this.sprite.bpp = header.bpp;
        this.sprite.isShadow = header.bShadow;
        // this.sprite.isLayer = header.bOutline;
        this.sprite.isLayer = true;
        this.sprite.count = header.imageCount;

        if (this.sprite.bpp === 16) {
            this.sprite.bpp = SPRITE_BPP16;
        } else {
            this.sprite.bpp = SPRITE_BPP8;
        }

        const result = this.loadPhase2(br, loadPalette);

        if (header.reg === REGSADHEADER2) {
            this.sprite.maxSpriteWidth = header.maxSpriteWidth;
            this.sprite.maxSpriteHeight = header.maxSpriteHeight;
            this.sprite.maxShadowWidth = header.maxShadowWidth;
            this.sprite.maxShadowHeight = header.maxShadowHeight;
        } else {
            this.sprite.getMaxSize();

            throw new Error("not implemented yet");
        }

        return result;
    }

    /**
     * @param {BufferReader} br 
     * @param {boolean} loadPalette 
     */
    loadPhase2(br, loadPalette) {
        this.reset();

        this.sprite.load(br, loadPalette);
        this.anmData = [];

        this.moveOval = br.readInt32LE();
        this.rectCrash = new Rect(...br.readStructInt32LE(4));
        this.rectSelect = new Rect(...br.readStructInt32LE(4));
        this.kind = br.readInt32LE();
        this.posRefit = new Pos(...br.readStructInt32LE(2));
        this.crashSize = br.readInt32LE();
        this.defaultAttack = br.readInt32LE();

        this.defaultMagic = br.readUInt16LE();
        this.isOccasionallyRestAction = br.readUInt16LE();

        for (let i = 0; i < this.anmCount; i++) {
            const ad = new AnimData();
            ad.init(br);
            this.anmData.push(ad);
        }

        if (this.anmCount && this.anmData[0].linkAnm >= 0 && this.anmData[0].linkAnm < this.anmCount) {
            const rect = new Rect();
            this.getRect(this.anmData[0].linkAnm, 0, 0, rect);
            this.sprite.height = Math.max(this.sprite.height, rect.getHeight());
        }

        this.sprite.height += this.posRefit.y;

        return true;
    }

    /**
     * @param {number} anm 
     * @param {number} direct 
     * @param {number} frame 
     * @param {Rect} rect 
     * @param {number} scale 
     */
    getRect(anm, direct, frame, rect, scale = 100) {
        rect.set(0, 0, 0, 0);

        if (this.anmData[anm].frameCount === 0) {
            return false;
        }

        const index = this.anmData[anm].getSprite(direct, frame, this.isFlip);

        if (!this.sprite.getRect(index, rect, scale)) {
            return false;
        }

        rect.add(-(this.posRefit.x * scale / 100), -(this.posRefit.y * scale / 100));

        if (this.anmData[anm].isRefitFrame) {
            rect.add(
                -(this.anmData[anm].pos[direct * this.anmData[anm].frameCount + frame].x * scale / 100),
                -(this.anmData[anm].pos[direct * this.anmData[anm].frameCount + frame].y * scale / 100)
            );
        }

        return true;
    }

    getSpriteHeight(anm, direct, frame) {
        const index = this.getSpriteIndex(anm, direct, frame);
        const reader = this.sprite.get16(index) || this.sprite.get8(index);

        if (reader) {
            reader.offset += 2;
            return reader.readUInt16LE();
        }

        return 0;
    }

    getSpriteWidth(anm, direct, frame) {
        const index = this.getSpriteIndex(anm, direct, frame);
        const reader = this.sprite.get16(index) || this.sprite.get8(index);

        if (reader) return reader.readUInt16LE();

        return 0;
    }

    getFrameCount = anm => this.anmData[anm].frameCount;

    getFPS = anm => this.anmData[anm].fps;

    getDirectCount = anm => this.anmData[anm].directCount;
    getSpriteIndex = (anm, direct, frame) => this.anmData[anm].getSprite(direct, frame, false);
}