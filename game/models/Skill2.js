import { fetchBinaryFile } from "../../utils";
import BitFlagReader from "../../utils/BitFlagReader";
import BufferReader from "../../utils/BufferReader";
import { decodeScenarioBuffer } from "../../utils/RedStoneRandom";
import { DATA_DIR } from "../Config";

class SoundInfo {
    /**
     * @param {BufferReader} br 
     */
    constructor(br) {
        this.casting = br.readString(32);
        this.action = br.readString(32);
        this.hit = br.readString(32);
        this.create = br.readString(32);
        this.explosion = br.readString(32);
        this.miss = br.readString(32);
        this.seeSuccess = br.readUInt16LE();
        this.seeMiss = br.readUInt16LE();
    }

    reset() {
        this.casting = null;
        this.action = null;
        this.hit = null;
        this.create = null;
        this.explosion = null;
        this.miss = null;
        this.seeMiss = 0xffff;
        this.seeMiss = 0xffff;
    }
}

class Skill2 {
    /**
     * @type {Skill2[]}
     */
    static allSkills = [];

    static async loadAllSkill2() {
        const buffer = await fetchBinaryFile(`${DATA_DIR}/skill2_decrypted.dat`);
        const br = new BufferReader(buffer);

        // br.readUInt32LE();
        // br.readUInt32LE();

        const allSkillByteLen = (buffer.byteLength - 0x10 - 0x4);
        const skillCount = allSkillByteLen / 0x82C;

        // let skillSize = br.readUInt32LE();
        // const keySeed = br.readUInt32LE();

        // br.setDataEncodeTable(keySeed);

        br.offset = 0x10;
        const skillData = br.readStructUInt8(allSkillByteLen);
        // let unkSize = br.readUInt32LE();
        // unkSize = (unkSize * 11) << 0x2;
        // const unkBytes = br.readStructUInt8(unkSize);

        // skillSize = Buffer.from(decodeScenarioBuffer(skillSize, br.decodeKey)).readUInt32LE();

        const skillRawData_br = new BufferReader(Buffer.from(skillData));

        for (let i = 0; i < skillCount; i++) {
            if (i === 690) break; // skills after #690 may not be used??
            // const skillData = decodeScenarioBuffer(skillRawData_br.readStructUInt8(0x82C), br.decodeKey);
            const skillData = skillRawData_br.readStructUInt8(0x82C);
            const skillReader = new BufferReader(Buffer.from(skillData));
            const skill = new Skill2(skillReader);

            Skill2.allSkills.push(skill);
        }

        console.log("Skill2.dat loaded.", this.allSkills);
        return this.allSkills;
    }

    /**
     * @param {BufferReader} br 
     */
    constructor(br) {
        this.serial = br.readUInt16LE();
        this.iconIndex = br.readUInt16LE();
        this.type = br.readUInt16LE();
        this.action = br.readUInt16LE();
        this.action2 = br.readUInt16LE();
        this.overlapAction = br.readUInt16LE();
        this.overlapAction2 = br.readUInt16LE();
        this.reiterationDamageCountSyncWithOverlapAction = br.readUInt16LE();
        this.enableJob = br.readUInt16LE();
        this.speed = br.readUInt16LE();
        this.correctFPS = br.readUInt16LE();

        this.name = br.readString(32, "sjis");
        this.difficultyLevel = br.readUInt16LE();
        this.skillGroup = br.readUInt16LE();
        this.castMethod = br.readUInt16LE();

        this.damageAttribute = br.readUInt16LE();
        this.targetTypeLimit = br.readUInt16LE();
        this.targetMethod = br.readUInt32LE();

        this.spentHPPercentage = br.readUInt16LE();
        this.spentHPPercentageBasedBloodWing = br.readUInt16LE();
        this.spentCP = br.readUInt16LE();
        this.spentCPPerLevel = br.readUInt16LE();
        this.getCP = br.readUInt16LE();
        this.getCPPerLevel = br.readUInt16LE();
        this.getCPTiming = br.readUInt16LE();

        this.missileDustRange = br.readUInt16LE();
        this.isNotSyncCP = br.readUInt16LE();
        this.isMagicDamageBasedLastHitDamage = br.readUInt16LE();

        let bfr = new BitFlagReader(br.readUInt32LE(), 32);
        this.isIgnoreWeaponDamage = bfr.readBool();
        this.isPenetrationRush = bfr.readBool();
        this.isLoopRushAni = bfr.readBool();
        this.isAttackOnlyTargetRush = bfr.readBool();
        this.isWhirlRunningStyleRush = bfr.readBool();
        this.parallelRushAngle = bfr.readBits(9);
        this.parallelRushGab = bfr.readBits(8);
        this.isShimmeringShieldByWeapon = bfr.readBool();
        this.isIgnoreTargetDodgeCorrectValue = bfr.readBool();
        this.isSyncShieldShape = bfr.readBool();
        this.isNotWhirlTornado = bfr.readBool();
        this.setRushImageByTriggerNextFrame = bfr.readBool();
        this.beastBerserker = bfr.readBool();
        this.isGlareSkill = bfr.readBool();
        this.notRevenge = bfr.readBool();
        this.isSummonBeastCommand = bfr.readBool();
        this.isSummonedBeastSkill = bfr.readBool();

        // cSkillAiPatternInfo (size: 12) * 8
        // this.aiPatternInfoList = [];
        br.offset += 96;

        this.aiTarget = br.readUInt16LE();
        this.limitCrushChance = br.readUInt16LE();
        this.shootRangeCorrect = br.readUInt16LE();
        this.limitShotCount = br.readUInt16LE();
        this.skillUniqueSpecialFeature = br.readUInt16LE();
        this.imageRadius = br.readUInt16LE();
        this.outputEffect = br.readUInt16LE();
        this.limitActiveCount = br.readUInt16LE();
        this.missileFollowImage = br.readUInt16LE();
        this.tempBuffer = br.readStructUInt8(2);

        bfr = new BitFlagReader(br.readUInt32LE(), 32);
        this.isHideMissImage = bfr.readBool();
        this.isRightPunchSkill = bfr.readBool();
        this.isLeftPunchSkill = bfr.readBool();
        this.isRightKickSkill = bfr.readBool();
        this.isLeftKickSkill = bfr.readBool();
        this.isDownKickSkill = bfr.readBool();
        this.isCancelKnockBackSkill = bfr.readBool();
        this.isDecreaseWeaponCount = bfr.readBool();
        this.isInstanceApplyAura = bfr.readBool();
        this.isDefendOnImageTrap = bfr.readBool();
        this.isMonsterCounter = bfr.readBool();
        this.isApplyHealPointByPercentage = bfr.readBool();
        this.isIgnoreDodgeBlockReaction = bfr.readBool();
        this.isAttackDamageBasedAttackerRemainHPRate = bfr.readBool();
        this.isSelfDestructionSkill = bfr.readBool();
        this.isRefitImageSizeByHitRange = bfr.readBool();
        this.isCatchAndThrowingTypeAttackPower = bfr.readBool();
        this.isTagetingToBattleWithPartyMember = bfr.readBool();
        this.isPutHitDamage = bfr.readBool();
        this.isNonAggressiveSkill = bfr.readBool();
        this.defensePowerByCurseResistance = bfr.readBool();
        this.darkDamageAttackByDamagePoint = bfr.readBool();
        this.isPigeonPostItemSkill = bfr.readBool();
        this.isLoopLastFrame = bfr.readBool();
        this.isCastOnDestPosSkill = bfr.readBool();
        this.putTrasAfterAnm = bfr.readBool();
        this.isIllusionAttack = bfr.readBool();
        this.isResistKnockBackByCurse = bfr.readBool();
        this.isRequireFeignDeathStatus = bfr.readBool();
        this.isStopWhenFailedFirstSE = bfr.readBool();
        this.isToggleSkill = bfr.readBool();
        this.isCastImageOnReleasPos = bfr.readBool();

        this.damageToHP = br.readUInt16LE();
        this.damageToHPPerLevel = br.readUInt16LE();
        this.wadDamageMethod = br.readUInt16LE();
        this.wadDamageGradeCount = br.readUInt16LE();
        this.wadDamageValue = br.readUInt16LE();
        this.wadMaxDamage = br.readUInt16LE();
        this.wadMinDamage = br.readUInt16LE();

        bfr = new BitFlagReader(br.readUInt16LE(), 16);
        this.isIgnoreTargetBlockingChance = bfr.readBool()
        this.isRandomDustImageFrame = bfr.readBool()
        this.isOnOffSkill = bfr.readBool()
        this.isGroundMissile = bfr.readBool()
        this.isApplyPhysicalDamageOnlyTarget = bfr.readBool();
        this.isParallelAfterImage = bfr.readBool()
        this.isSyncSkillExtraEffectWithPlayer = bfr.readBool();
        this.isMagicDamageBasedRemainHP = bfr.readBool()
        this.isZoomInEffectSkill = bfr.readBool()
        this.isHpSyncSkill = bfr.readBool()
        this.isTestSkill = bfr.readBool()
        this.isUsHealEffectToHitImageForAuraSkill = bfr.readBool();
        this.isNotIncreaseByActiveAura = bfr.readBool()
        this.isGetCPGasSkillByCasting = bfr.readBool()
        this.isRequireMissImage = bfr.readBool()
        this.isBlockInDuelField = bfr.readBool()

        this.coolTimeIndex = br.readUInt16LE();
        this.coolTime = br.readUInt16LE();
        this.coolTimePerLevel = br.readUInt16LE();
        this.minimumCoolTime = br.readUInt16LE();
        this.correctTargetDefensivePower = br.readUInt16LE();
        this.petCommand = br.readUInt16LE();
        this.increasePetPowerPerLevel = br.readInt16LE(); // short

        this.limitPhysicalDamage = br.readUInt16LE();
        this.limitMagicDamage = br.readUInt16LE();
        this.limitPhysicalDamagePerLevel = br.readInt16LE(); // short
        this.limitMagicDamagePerLevel = br.readInt16LE(); // short
        this.circleRange = br.readUInt16LE(); // for Scimitar Cutting skill

        this.auraActivePeriod = br.readInt16LE();
        this.auraActivePeriodPerLevel = br.readInt16LE();
        this.auraActivePeriodDecimalMethod = br.readInt16LE();
        this.cureEffectField = br.readUInt16LE();
        this.applyLimitHPPercentage = br.readInt16LE();
        this.applyLimitHPPercentagePerLevel = br.readInt16LE();
        this.limitApplyHPPercentage = br.readUInt16LE();
        this.targetLevelLimitType1 = br.readInt16LE();
        this.humanTargetLevelLimitType1 = br.readInt16LE();
        this.animalTargetLevelLimitType1 = br.readInt16LE();
        this.holyBeastTargetLevelLimitType1 = br.readInt16LE();
        this.demonTargetLevelLimitType1 = br.readInt16LE();
        this.undeadTargetLevelLimitType1 = br.readInt16LE();
        this.healPercentageBasedCurrentHP = br.readInt16LE();
        this.healPercentageBasedCurrentHPperLevel = br.readInt16LE();
        this.healPoint = br.readUInt16LE();
        this.healPointPerLevel = br.readUInt16LE();
        this.hideWeaponTime = br.readInt16LE();
        this.hideWeaponTimePerLevel = br.readInt16LE();

        this.wideAreaAttackDamagePercent = br.readUInt16LE();
        this.wideAreaAttackDamagePercentPerLevel = br.readUInt16LE();
        this.blackBluesFactor = br.readUInt16LE();
        this.blackBluesFactorPerLevel = br.readUInt16LE();
        this.blackBluesFactorLimit = br.readUInt16LE();
        this.attackPoint = br.readInt16LE();
        this.attackPointPerLevel = br.readInt16LE();
        this.attackPointRange = br.readInt16LE();
        this.attackPointRangePerLevel = br.readInt16LE();
        this.correctAttackPoint = br.readInt16LE();
        this.attackPercentage = br.readInt16LE();
        this.attackPercentagePerLevel = br.readInt16LE();
        this.defensePoint = br.readInt16LE();
        this.defensePointPerLevel = br.readInt16LE();
        this.defensePercentage = br.readInt16LE();
        this.defensePercentagePerLevel = br.readInt16LE();

        this.fireDamage = br.readInt16LE();
        this.fireDamagePerLevel = br.readInt16LE();
        this.fireDamageRange = br.readInt16LE();
        this.fireDamageRangePerLevel = br.readInt16LE();
        this.fireDamagePercentage = br.readInt16LE();
        this.fireDamagePercentagePerLevel = br.readInt16LE();
        this.fireDamagePercentageLimit = br.readInt16LE();
        this.waterDamage = br.readInt16LE();
        this.waterDamagePerLevel = br.readInt16LE();
        this.waterDamageRange = br.readInt16LE();
        this.waterDamageRangePerLevel = br.readInt16LE();
        this.waterDamagePercentage = br.readInt16LE();
        this.waterDamagePercentagePerLevel = br.readInt16LE();
        this.waterDamagePercentageLimit = br.readInt16LE();
        this.windDamage = br.readInt16LE();
        this.windDamagePerLevel = br.readInt16LE();
        this.windDamageRange = br.readInt16LE();
        this.windDamageRangePerLevel = br.readInt16LE();
        this.windDamagePercentage = br.readInt16LE();
        this.windDamagePercentagePerLevel = br.readInt16LE();
        this.windDamagePercentageLimit = br.readInt16LE();
        this.earthDamage = br.readInt16LE();
        this.earthDamagePerLevel = br.readInt16LE();
        this.earthDamageRange = br.readInt16LE();
        this.earthDamageRangePerLevel = br.readInt16LE();
        this.earthDamagePercentage = br.readInt16LE();
        this.earthDamagePercentagePerLevel = br.readInt16LE();
        this.earthDamagePercentageLimit = br.readInt16LE();
        this.lightDamage = br.readInt16LE();
        this.lightDamagePerLevel = br.readInt16LE();
        this.lightDamageRange = br.readInt16LE();
        this.lightDamageRangePerLevel = br.readInt16LE();
        this.lightDamagePercentage = br.readInt16LE();
        this.lightDamagePercentagePerLevel = br.readInt16LE();
        this.lightDamagePercentageLimit = br.readInt16LE();
        this.darkDamage = br.readInt16LE();
        this.darkDamagePerLevel = br.readInt16LE();
        this.darkDamageRange = br.readInt16LE();
        this.darkDamageRangePerLevel = br.readInt16LE();
        this.darkDamagePercentage = br.readInt16LE();
        this.darkDamagePercentagePerLevel = br.readInt16LE();
        this.darkDamagePercentageLimit = br.readInt16LE();

        this.piercingChance = br.readInt16LE();
        this.piercingChancePerLevel = br.readInt16LE();

        this.specialEffect = br.readUInt16LE();

        // CSkillExtraEffect * 10
        // this.extraEffects = [];
        br.offset += 640;

        this.applyExtraEffectCount = br.readUInt16LE();
        this.activateTrigger = br.readUInt16LE();
        this.nockbackDistance = br.readInt16LE();
        this.nockbackDistancePerLevel = br.readInt16LE();

        this.castingTime = br.readInt16LE();
        this.attackSpeed = br.readInt16LE();
        this.attackSpeedPerLevel = br.readInt16LE();
        this.limitAttackSpeed = br.readInt16LE();
        this.correctAttackSpeed = br.readInt16LE();
        this.correctAttackSpeedPerLevel = br.readInt16LE();

        this.minimumShootRange = br.readUInt16LE();
        this.shootRange = br.readUInt16LE();
        this.shootRangePerLevel = br.readUInt16LE();
        this.weaponShootRangeCorrect = br.readUInt16LE();
        this.weaponShootRangeCorrectPerLevel = br.readUInt16LE();

        this.minimumHitRange = br.readUInt16LE();
        this.hitRange = br.readUInt16LE();
        this.hitRangePerLevel = br.readUInt16LE();
        this.weaponHitRangeCorrect = br.readUInt16LE();
        this.angle = br.readUInt16LE();

        this.hitChance = br.readInt16LE();
        this.hitChancePerLevel = br.readInt16LE();
        this.fixHitChance = br.readInt16LE();
        this.dodgeChance = br.readInt16LE();
        this.dodgeChancePerLevel = br.readInt16LE();
        this.fixDodgeCahnce = br.readInt16LE();
        this.criticalChance = br.readInt16LE();
        this.criticalChancePerLevel = br.readInt16LE();
        this.fixCriticalChance = br.readInt16LE();
        this.crushChance = br.readInt16LE();
        this.crushChancePerLevel = br.readInt16LE();
        this.fixCrushChance = br.readInt16LE();
        this.criticalToUndead = br.readInt16LE();
        this.criticalToUndeadPerLevel = br.readInt16LE();
        this.criticalToDemon = br.readInt16LE();
        this.criticalToDemonPerLevel = br.readInt16LE();
        this.criticalToAnimal = br.readInt16LE();
        this.criticalToAnimalPerLevel = br.readInt16LE();
        this.criticalToHuman = br.readInt16LE();
        this.criticalToHumanPerLevel = br.readInt16LE();
        this.criticalToHolyAnimal = br.readInt16LE();
        this.criticalToHolyAnimalPerLevel = br.readInt16LE();
        this.instanceKillMethod = br.readUInt16LE();
        this.instanceKillToUndead = br.readInt16LE();
        this.instanceKillToDemon = br.readInt16LE();
        this.instanceKillToAnimal = br.readInt16LE();
        this.instanceKillToHuman = br.readInt16LE();
        this.instanceKillToHolyAnimal = br.readInt16LE();
        this.instanceKillToUndeadPerLevel = br.readInt16LE();
        this.instanceKillToDemonPerLevel = br.readInt16LE();
        this.instanceKillToAnimalPerLevel = br.readInt16LE();
        this.instanceKillToHumanPerLevel = br.readInt16LE();
        this.instanceKillToHolyAnimalPerLevel = br.readInt16LE();
        this.blockingChance = br.readInt16LE();
        this.blockingChancePerLevel = br.readInt16LE();
        this.maximumBlockingChance = br.readInt16LE();
        this.fixBlockingChance = br.readInt16LE();
        this.concentration = br.readInt16LE();
        this.concentrationPerLevel = br.readInt16LE();

        this.stunResistance = br.readInt16LE();
        this.stunResistancePerLevel = br.readInt16LE();
        this.strangeStatusResistance = br.readInt16LE();
        this.strangeStatusResistancePerLevel = br.readInt16LE();
        this.declineResistance = br.readInt16LE();
        this.declineResistancePerLevel = br.readInt16LE();
        this.curseResistance = br.readInt16LE();
        this.curseResistancePerLevel = br.readInt16LE();

        this.fireResistance = br.readInt16LE();
        this.fireResistancePerLevel = br.readInt16LE();
        this.waterResistance = br.readInt16LE();
        this.waterResistancePerLevel = br.readInt16LE();
        this.windResistance = br.readInt16LE();
        this.windResistancePerLevel = br.readInt16LE();
        this.earthResistance = br.readInt16LE();
        this.earthResistancePerLevel = br.readInt16LE();
        this.lightResistance = br.readInt16LE();
        this.lightResistancePerLevel = br.readInt16LE();
        this.darkResistance = br.readInt16LE();
        this.darkResistancePerLevel = br.readInt16LE();

        this.bulletCount = br.readInt16LE();
        this.bulletCountPerLevel = br.readInt16LE();
        this.bulletLimitCount = br.readInt16LE();
        this.bulletDecimalMethod = br.readInt16LE();
        this.shotCount = br.readInt16LE();
        this.shotCountPerLevel = br.readInt16LE();
        this.shotCountDecimalMethod = br.readInt16LE();
        this.continiousShotMaxCount = br.readInt16LE();
        this.continiousShotCount = br.readInt16LE();
        this.continiousShotCountPerLevel = br.readInt16LE();
        this.continiousShotPeriod = br.readInt16LE();
        this.continiousShotDecimalMethod = br.readInt16LE();
        this.increaseActionAnmCount = br.readInt16LE();

        this.correctTargetHitChance = br.readInt16LE();
        this.correctTargetHitChancePerLevel = br.readInt16LE();

        this.upkeepTime = br.readUInt16LE();
        this.upkeepTimePerLevel = br.readUInt16LE();

        this.targetFleeChance = br.readInt16LE();
        this.targetStunChance = br.readInt16LE();
        this.instanceKillChance = br.readInt16LE();
        this.instanceKillChancePerLevel = br.readInt16LE();
        this.targetDecreaseHitChance = br.readInt16LE();
        this.targetDecreaseHitChancePerLevel = br.readInt16LE();

        this.sExemptToDemonType = br.readInt16LE();
        this.sExemptToHumanType = br.readInt16LE();
        this.sExemptToAnimalType = br.readInt16LE();
        this.sExemptToHolyAnimalType = br.readInt16LE();
        this.sExemptToUndeadType = br.readInt16LE();
        this.intelligencePerLevel = br.readInt16LE();
        this.strengthPerLevel = br.readInt16LE();
        this.luckPerLevel = br.readInt16LE();
        this.agilityPerLevel = br.readInt16LE();
        this.wisdomPerLevel = br.readInt16LE();
        this.charismaPerLevel = br.readInt16LE();

        this.occurActionPeriod = br.readInt16LE();
        this.healPoint = br.readInt16LE();
        this.healPointPerLevel = br.readInt16LE();
        this.firstAidPoint = br.readInt16LE();
        this.firstAidPointPerLevel = br.readInt16LE();
        this.firstAidUpkeepTime = br.readInt16LE();
        this.disarmLevel = br.readInt16LE();
        this.disarmLevelPerLevel = br.readInt16LE();
        this.detectLevelPerLevel = br.readInt16LE();
        this.detectLevel = br.readInt16LE();
        this.activeChance = br.readInt16LE();
        this.activeChancePerLevel = br.readInt16LE();
        this.activeChanceByInRangeEnemyCount = br.readUInt16LE();
        this.limitActiveChance = br.readUInt16LE();

        this.requireEquipment = br.readUInt16LE();

        // cREQUIRE_SKILL * 5
        // this.requireSkills = [];
        br.offset += 20;

        this.sound = new SoundInfo(br);

        this.skillSpareValues = br.readStructInt16LE(20); // short * 20

        this.imageScale = br.readUInt16LE();
        this.targetMarkImage = br.readUInt16LE();
        this.shootImage = br.readUInt16LE();
        this.missileHeadImage = br.readUInt16LE();
        this.machineImage = br.readUInt16LE();
        this.explosionImage = br.readUInt16LE();
        this.missImage = br.readUInt16LE();

        this.aidAttackImage = br.readUInt16LE();
        this.aidAttackImageOutputPart = br.readUInt16LE();
        this.aidAttackImageEffect = br.readUInt16LE();
        this.hitImage = br.readUInt16LE();
        this.hitImageOutputPart = br.readUInt16LE();
        this.hitImageEffect = br.readUInt16LE();
        this.healImage = br.readUInt16LE();
        this.healImageOutputPart = br.readUInt16LE();
        this.healImageEffect = br.readUInt16LE();
        this.addHitImage = br.readUInt16LE();
        this.addHitImageOutputPart = br.readUInt16LE();
        this.addHitImageEffect = br.readUInt16LE();
        this.castImage = br.readUInt16LE();
        this.castImageOutputPart = br.readUInt16LE();
        this.castImageEffect = br.readUInt16LE();
        this.aidSkillCastingImage = br.readUInt16LE();
        this.aidSkillCastingImageOutputPart = br.readUInt16LE();
        this.aidSkillCastingImageEffect = br.readUInt16LE();
        this.skillImage = br.readUInt16LE();
        this.skillImageOutputPart = br.readUInt16LE();
        this.skillImageEffect = br.readUInt16LE();
        this.casterHitImage = br.readUInt16LE();
        this.casterHitImageOutputPart = br.readUInt16LE();
        this.casterHitImageEffect = br.readUInt16LE();
        this.swingImage = br.readUInt16LE();
        this.swingImageEffect = br.readUInt16LE();
        this.bottomImage = br.readUInt16LE();

        this.dodgeAngle = br.readUInt16LE();
        this.hitAngleRange = br.readUInt16LE();
        this.hitAngleRangePerLevel = br.readUInt16LE();
        this.dodgeDistance = br.readUInt16LE();
        this.paletteIndex = br.readUInt16LE();

        br.offset += 2; // padding

        this.enchantedEffectMask = br.readUInt32LE();
        this.enchantedImage = br.readUInt16LE();
        this.dustImageRange = br.readUInt16LE();

        this.shakeTiming = br.readUInt16LE();
        this.shakeIntensity = br.readUInt16LE();
        this.shakeTime = br.readUInt16LE();

        this.characterAfterImageType = br.readUInt8();
        this.characterAfterImageDelayTime = br.readUInt8();
        this.strikePeriod = br.readUInt16LE();
        this.strikePeriodPerLevel = br.readInt16LE();
        this.minimumStrikePeriod = br.readUInt16LE();

        this.afterImageType = br.readUInt16LE();
        this.afterImageGap = br.readUInt16LE();
        this.afterImageFirstImageDistance = br.readUInt16LE();
        this.afterImageFirstImageAlphaDepth = br.readUInt16LE();
        this.afterImageDecreaseAlphaDepthValue = br.readUInt16LE();
        this.afterImageCount = br.readUInt16LE();

        br.offset += 2; // padding

        bfr = new BitFlagReader(br.readUInt32LE(), 32);
        this.isBlockOnlyMissileAttack = bfr.readBool();
        this.isExclusiveAction = bfr.readBool();
        this.hitDamagePeriod = bfr.readBits(5);
        this.isRoundRappedBunshinAttack = bfr.readBool();
        this.bunshineAlphaDepth = bfr.readBits(5);
        this.maxPetCount = bfr.readBits(3);
        this.requireSummonBeastGrade = bfr.readBits(2);
        this.operateSummonBeast = bfr.readBits(2);
        this.isPohibitAction = bfr.readBool(); // typo? prohibited?
        this.shootRangeZeroSkill = bfr.readBool();
        this.isTrap = bfr.readBool();
        this.isFlatTrap = bfr.readBool();
        this.isInstanceHeal = bfr.readBool();
        this.isOnlySelfEnchantSkill = bfr.readBool();
        this.isSecondJobMachine = bfr.readBool();
        this.isRapeExplosionImage = bfr.readBool();
        this.isLaser = bfr.readBool();
        this.attackByDamagedDamage = bfr.readBool();
        this.playCastSoundByEnchantAidSkill = bfr.readBool();
        this.rootAttackPower = bfr.readBool();

        // uEnchantedImage
        // this.enchantedImage
        br.offset += 12;

        this.commandSkill = br.readUInt16LE();

        br.offset += 2; // padding

        // uCheckStatus * 2
        // this.checkTargetStatus
        // this.checkCasterStatus
        br.offset += 8;

        bfr = new BitFlagReader(br.readUInt32LE(), 32);
        this.isObitianSkill = bfr.readBool();
        this.isDashBladeSkill = bfr.readBool();
        this.isAstroBowSkill = bfr.readBool();
        this.isCristalWaterSkill = bfr.readBool(); // crystal typo?
        this.isApplyToPartyAura = bfr.readBool();
        this.changeDirect = bfr.readBits(4);
        this.isCastSelfBuff = bfr.readBool();
        this.isExplosionAtCastPos = bfr.readBool();
        this.isInstanceWaterFall = bfr.readBool();
        this.miniPetType = bfr.readBits(5);
        this.isDefaultMiniPetSkill = bfr.readBool();
        this.miniPetSkillType = bfr.readBits(5);
        this.isXMiniPetLevel = bfr.readBool();
        this.petSkillDamageExpressionType = bfr.readBits(4);
        this.isNormalMiniPetSkill = bfr.readBool();
        this.isDuelCoolTimeSkill = bfr.readBool();
        this.isShadowHideSkill = bfr.readBool();
        this.isApplyShadowHideEffect = bfr.readBool();

        bfr = new BitFlagReader(br.readUInt32LE(), 32);
        this.duelServerpenaltyDiv = bfr.readBits(7);
        this.petSkillDamageExpressionTypeForAwaken = bfr.readBits(4);
        this.needState = bfr.readBits(6);
        this.isCancelNeedState = bfr.readBool();
        this.isReactionLimitCount = bfr.readBool();
        this.isIgnoreOptionAttackSpeed = bfr.readBool();
        this.isIgnoreLucky = bfr.readBool();
        this.isRushAttack = bfr.readBool();
        this.isIgnoreDelayAfterAttack = bfr.readBool();
        this.isApplyEffectChanceToPlayer = bfr.readBool();
        this.isApplyFightingSpirit = bfr.readBool();
        this.isCanNotApplySameEffect = bfr.readBool();
        this.isTargetingToActorStickedBit = bfr.readBool();
        this.spendBit = bfr.readBits(4);
        this.isApplyCriticalEffectWhenBeLightEffect = bfr.readBool();

        this.awakenSkillBonusActiveChance = br.readUInt16LE();
        this.awakenSkillBonusActiveChancePerLevel = br.readUInt16LE();

        this.awakenSkillBonusDamage = br.readInt16LE();
        this.awakenSkillBonusDamagePerLevel = br.readInt16LE();
        this.awakenSkillBonusDamageForOrigin = br.readInt16LE();
        this.awakenSkillBonusDamagePerLevelForOrigin = br.readInt16LE();
        this.awakenSkillBonusDamageValueRangeForOrigin = br.readInt16LE();
        this.awakenSkillBonusDamageValueRangePerLevelForOrigin = br.readInt16LE();

        this.awakenSkillBonusRange = br.readInt16LE();
        this.awakenSkillBonusRangePerLevel = br.readInt16LE();

        this.awakenSkillBonusDamageForBoJoSkill = br.readInt16LE();
        this.awakenSkillBonusDamageForBoJoSkillPerLevel = br.readInt16LE();

        this.awakenSkillBonusActiveChanceForBoJoSKill = br.readInt16LE();
        this.awakenSkillBonusActiveChanceForBoJoSKillPerLevel = br.readInt16LE();

        this.applyEffectChanceToPlayer = br.readUInt16LE();
        this.applyEffectChancePerLevelToPlayer = br.readUInt16LE();
        this.applyEffectChanceLimitToPlayer = br.readUInt16LE();

        bfr = new BitFlagReader(br.readUInt16LE(), 16);
        this.isApplyMinDamageWhenBeNotLightEffect = bfr.readBool();
        this.isApplyExplosionWhenHitTargetStickedBit = bfr.readBool();
        this.isApplySameTarget = bfr.readBool();
        this.arcHeight = bfr.readBits(11);
        this.isAbleSkillWhenTransToWeapon = bfr.readBool(); // index: 15

        this.attackPointPerActorLevel = br.readInt16LE();
        this.addDamagePercent = br.readInt16LE();

        bfr = new BitFlagReader(br.readUInt16LE(), 16);
        this.magicDamageDiceCount = bfr.readBits(5);
        this.magicDamageDiceCountLimit = bfr.readBits(5);

        this.magicDamageDiceCountPerLevel = br.readInt16LE();

        this.spareSkillBuffer = br.readStructUInt8(12);

        this.comment = br.readString(256, "sjis");
        this.powerup = br.readString(64, "sjis");
    }

    isEnableJob(job) {
        //

        if (this.enableJob === job) {
            return true;
        }

        return false;
    }
}

export default Skill2;