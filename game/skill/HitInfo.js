class ContinuousHitInfo {
    constructor() {
        this.continuousShotCount = 0;
        this.missCount = 0;
        this.criticalCount = 0;
        this.doubleCriticalCount = 0;
        this.hardBlowCount = 0;
    }

    reset() {
        Object.keys(this).forEach(m => this[m] = 0);
    }
}

export default class HitInfo {
    constructor() {
        this.physicalDamage = 0;
        this.magicDamage = 0;
        this.resultField = 0;
        this.continuousHitInfo = new ContinuousHitInfo();
    }

    reset(isWantResetResult = false) {
        if (isWantResetResult) {
            this.resultField = 0;
        } else {
            this.resultField = 0xffffffff;
        }

        this.physicalDamage = 0;
        this.magicDamage = 0;
        this.continuousHitInfo.reset();
    }

    getDamage() {
        return this.physicalDamage + this.magicDamage;
    }
}