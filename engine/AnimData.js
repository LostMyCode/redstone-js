import BufferReader from "../utils/BufferReader";
import { EVENT_DAMAGE, EVENT_LOOP_END, EVENT_LOOP_START, EVENT_STEP, EVENT_TRIGGER, FlipedDirect } from "./ImageH";

class AnimInfo {
    anmType = 0;
    directCount = 0;
    alpha = 0;
    fps = 0;
    pps = 0;
    isRelease = false;
    isRefitFrame = false;
    linkAnm = 0;

    /**
     * @param {AnimInfo} instance 
     * @param {BufferReader} reader 
     */
    static readAnimInfo(instance, reader) {
        instance.anmType = reader.readInt32LE();
        instance.directCount = reader.readInt32LE();
        instance.alpha = reader.readInt32LE();
        instance.fps = reader.readInt32LE();
        instance.pps = reader.readInt32LE();
        instance.isRelease = reader.readInt32LE() === 1;
        instance.isRefitFrame = reader.readInt32LE() === 1;
        instance.linkAnm = reader.readInt32LE();
    }
}

export default class AnimData extends AnimInfo {
    reset() {
        this.pos = null;
        this.sprite = null;
        this.backFrame = null;
        this.isEvent = null;
        this.releasePos = null;
        this.linkAnm = 0xffff;
    }

    /**
     * @param {BufferReader} br 
     */
    init(br) {
        this.reset();

        this.frameCount = br.readInt32LE();

        if (this.frameCount > 0) {
            AnimInfo.readAnimInfo(this, br);

            this.isEvent = br.readStructUInt8(this.frameCount);
            this.sprite = br.readStructUInt16LE(this.frameCount * this.directCount);
            this.backFrame = br.readStructUInt8(this.frameCount * this.directCount);

            if (this.isRelease) {
                this.releasePos = br.readStructUInt32LE(this.directCount);
            }

            if (this.isRefitFrame) {
                this.pos = br.readStructUInt32LE(this.frameCount * this.directCount);
            }
        }

        this.isEvent && this.isEvent.forEach((event, idx) => {
            if (event & EVENT_LOOP_START) this.loopBegin = idx;
            if (event & EVENT_LOOP_END) this.loopEnd = idx;
        });
    }

    isTrigger = frame => this.isEvent[frame] & EVENT_TRIGGER;
    isDamage = frame => this.isEvent[frame] & EVENT_DAMAGE;
    isStep = frame => this.isEvent[frame] & EVENT_STEP;

    getSprite(direct, frame, isFlip) {
        return this.sprite[
            FlipedDirect[isFlip ? 1 : 0][this.anmType][direct] * this.frameCount + frame
        ];
    }
    isBack(direct, frame, isFlip) {
        return this.backFrame[
            FlipedDirect[isFlip ? 1: 0][this.anmType][direct] * this.frameCount + frame
        ]
    }
}