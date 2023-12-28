import AnimData from "./AnimData";
import { EVENT_DAMAGE, EVENT_TRIGGER } from "./ImageH";
import Pos from "./Pos";
import Rect from "./Rect";

export default class AnimBase {
    constructor() {
        /**
         * @type {AnimData[]}
         */
        this.anmData = [];
        this.anmCount = 0;
        this.isFlip = false;
        this.moveOval = 0;
        /**
         * @type {Rect}
         */
        this.rectCrash = null;
        /**
         * @type {Rect}
         */
        this.rectSelect = null;
        this.kind = 0;
        /**
         * @type {Pos}
         */
        this.posRefit = null;
        this.crashSize = 0;
        this.defaultAttack = 0;
        this.defaultMagic = 0;
        this.isOccasionallyRestAction = 0;
    }

    isTrigger(anm, frame) {
        if (frame >= this.anmData[anm].frameCount) return false;
        return this.anmData[anm].isEvent[frame] & EVENT_TRIGGER;
    }

    isDamage(anm, frame) {
        if (frame >= this.anmData[anm].frameCount) return false;
        return this.anmData[anm].isEvent[frame] & EVENT_DAMAGE;
    }
}