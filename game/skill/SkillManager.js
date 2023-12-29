import ActiveSkill from "./ActiveSkill";
import { SKILL_TYPE_SPECIAL_MISSILE } from "./SkillDefine";

class SkillManager {
    constructor() {
        /**
         * @type {ActiveSkill[]}
         */
        this.activeSkills = [];
        this.rookie = 0;
    }

    get(index) {
        if (this.activeSkills[index].serial === 0xffff) return;
        return this.activeSkills[index];
    }

    draw() {
        this.activeSkills.forEach(activeSkill => {
            if (activeSkill.serial === 0xffff) return;
            activeSkill.put();
        });
    }

    update() {
        this.activeSkills.forEach((activeSkill, idx) => {
            if (activeSkill.serial === 0xffff) return;

            if (activeSkill.update()) {
                this.remove(idx);
            }
        });
    }

    remove(serial) {
        if (serial < this.rookie) {
            this.rookie = serial;
        }

        if (this.activeSkills[serial].serial === 0xffff) {
            return false;
        }

        this.activeSkills[serial].reset();

        return true;
    }

    castContinuousAttackSkill(caster, target, ability, shotCount, fps) {
        const skill = ability.getSkill();
        // const activeSkill = this.activeSkills[this.rookie];
        const activeSkill = new ActiveSkill();
        this.activeSkills[this.rookie] = activeSkill;

        activeSkill.ability = ability;
        activeSkill.type = skill.type;
        activeSkill.caster = caster;
        activeSkill.target = target;
        activeSkill.pos.x = caster.pos.x;
        activeSkill.pos.y = caster.pos.y - caster.getHeight();
        activeSkill.posTarget.x = target.pos.x;
        activeSkill.posTarget.y = target.pos.y - caster.getHeight();
        activeSkill.skill = skill;
        activeSkill.setContinuousAttackShotCount(shotCount);
        activeSkill.setContinuousAttackActionFPS(fps);

        if (!activeSkill.fire()) return 0xffff;

        activeSkill.serial = this.rookie;

        const emptySlotIndex = this.activeSkills.findIndex(as => as.serial === 0xffff);
        this.rookie = emptySlotIndex === -1 ? this.activeSkills.length : emptySlotIndex;

        return activeSkill.serial;
    }

    castSpecialMissile(caster, target, x, y, hitInfo, ability) {
        const skill = ability.getSkill();
        const activeSkill = new ActiveSkill();
        this.activeSkills[this.rookie] = activeSkill;

        activeSkill.ability = ability;
        activeSkill.type = SKILL_TYPE_SPECIAL_MISSILE;
        activeSkill.caster = caster;
        activeSkill.target = target;
        activeSkill.pos.x = x;
        activeSkill.pos.y = y;
        activeSkill.posTarget.x = target.pos.x;
        activeSkill.posTarget.y = target.pos.y - target.getHeight();
        activeSkill.skill = skill;
        activeSkill.range = 0xffff;
        activeSkill.hitInfo = hitInfo;

        if (!activeSkill.fire()) return 0xffff;

        activeSkill.serial = this.rookie;

        const emptySlotIndex = this.activeSkills.findIndex(as => as.serial === 0xffff);
        this.rookie = emptySlotIndex === -1 ? this.activeSkills.length : emptySlotIndex;

        return activeSkill.serial;
    }
}

export default new SkillManager();