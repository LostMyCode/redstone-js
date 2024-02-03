import Skill2 from "../models/Skill2";
import { SKILL_CAST_AT_GROUND } from "./SkillDefine";

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
    copy(ability) { this.skill = ability.skill, this.level = ability.level };

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

        return skill.isEnableJob(job);
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

    getHitRange(weapon) {
        let range = 0;

        const skill = this.getSkill();

        if (!skill) return range;

        if (skill.hitRange === 0 && skill.hitRangePerLevel === 0) {
            if (weapon) {
                range = weapon.getBasicItem(true).range;
            }

            range = range * skill.weaponHitRangeCorrect / 100;
        } else {
            if (skill.hitRange === 0xffff) {
                range = skill.hitRangePerLevel;
            } else {
                range = (skill.hitRange + skill.hitRangePerLevel * this.level) / 100;
            }
        }

        return ~~(range);
    }

    getUpkeepTime() {
        const skill = this.getSkill();

        const time = (skill.upkeepTime + skill.upkeepTimePerLevel * this.level) / 100;

        return ~~time;
    }

    isCastGroundSkill() {
        if (this.getSkill()?.targetMethod & SKILL_CAST_AT_GROUND) {
            return true;
        }

        return false;
    }
}