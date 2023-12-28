import Skill2 from "../models/Skill2";

const dMAX_SKILL = 2048;

export default class Ability {
    constructor() {
        this.reset();
    }

    reset() {
        this.skill = 0xffff;
        this.level = 0;
    }

    set(skill, level) { this.skill = skill, this.level = level; }

    getSkill() {
        if (this.skill >= dMAX_SKILL)
            return null;

        if (Skill2.allSkills[this.skill].serial == 0xffff)
            return null;

        return Skill2.allSkills[this.skill];
    }

    isEnableJob(job) {
        const skill = this.getSkill();

        if (!skill) return false;

        return true; // temp
        // return skill.isEnableJob(job);
    }

    getAttackRange(weapon, defaultRange) {
        let range = 0;
        const skill = this.getSkill();

        if (!skill) return;


    }

    getMinimumAttackRange() {
        const skill = this.getSkill();

        if (!skill) return 0;

        return skill.minimumShootRange;
    }
}