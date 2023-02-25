import { fetchBinaryFile } from "../utils";
import BufferReader, { TYPE_DEF } from "../utils/BufferReader";
import { DATA_DIR } from "./Config";

class EffectDataManager {
    /**
     * @type {typeof EffectDataInfoTypeDef}
     */
    static aInfo = []; // CEffectDataInfo, offset: 0x524, size: 0x18800
    /**
     * @type {typeof SaveImageIndexDataTypeDef | typeof ClientSaveImageDataTypeDef}
     */
    static imageIndexData = {};

    static async init() {
        const effectDataBuffer = await fetchBinaryFile(`${DATA_DIR}/effect_data.dat`);
        const br = new BufferReader(effectDataBuffer);

        br.readUInt32LE();
        // br.readStructUInt8(0x524);
        br.readStruct(SaveImageIndexDataTypeDef, this.imageIndexData);
        br.readStruct(ClientSaveImageDataTypeDef, this.imageIndexData);
        // console.log("check current offset", br.offset);
        // br.offset = 1268;

        for (let i = 0; i < this.imageIndexData.m_iEffectCount; i++) {
            const effectInfo = {};
            br.readStruct(EffectDataInfoTypeDef, effectInfo);
            this.aInfo.push(effectInfo);
        }

        // console.log("effect indexes", this.imageIndexData);
        // console.log("effect info array", this.aInfo);
    }
}

const SaveImageIndexDataTypeDef = {
    m_iEffectCount: TYPE_DEF.UINT32,
    m_wImagePlayerEnterance: TYPE_DEF.UINT16,
    m_wImageMonsterEnterance: TYPE_DEF.UINT16,
    m_wImageLevelUp: TYPE_DEF.UINT16,
    m_wImageSkillLevelUp: TYPE_DEF.UINT16,
    m_wInstanceKillEffect: TYPE_DEF.UINT16,
    m_wDancingBlocker: TYPE_DEF.UINT16,
    m_wNormalHit: TYPE_DEF.UINT16,
    m_wDamageReturnEffect: TYPE_DEF.UINT16,
    m_wDamageAbsorbEffect: TYPE_DEF.UINT16,
    m_wCriticalHitEffect: TYPE_DEF.UINT16,
    m_wSoulOutEffect: TYPE_DEF.UINT16,
    m_wBlockerImage: TYPE_DEF.UINT16,
    m_wSpearBlockerImage: TYPE_DEF.UINT16,
    m_wBoomerangeImage: TYPE_DEF.UINT16,
    m_wRegenHPImage: TYPE_DEF.UINT16,
    m_wHitPoisonEffect: TYPE_DEF.UINT16,
    m_wRushDustImage: TYPE_DEF.UINT16,
    m_wStunImage: TYPE_DEF.UINT16,
    m_wSleepImage: TYPE_DEF.UINT16,
    m_wDisplacementImage: TYPE_DEF.UINT16,
    m_wCastDisplacementImage: TYPE_DEF.UINT16,
    m_wConfuseImage: TYPE_DEF.UINT16,
    m_wBerserkImage: TYPE_DEF.UINT16,
    m_wBlindImage: TYPE_DEF.UINT16,
    m_wLevitateShadow: TYPE_DEF.UINT16,
    m_wGuardianPostImage: TYPE_DEF.UINT16,
    m_wEatPotionImage: TYPE_DEF.UINT16,
    m_wCharmedImage: TYPE_DEF.UINT16,
    m_wTownPortalImage: TYPE_DEF.UINT16,
    m_wPortalImage: TYPE_DEF.UINT16,
    m_wBreedingRecordImage: TYPE_DEF.UINT16,
    m_wPetAnalCommandImage: TYPE_DEF.UINT16,
    m_wPetMark: TYPE_DEF.UINT16,
    m_wPetUnsealImage: TYPE_DEF.UINT16,
    m_wSummonBeastPowerUp1: TYPE_DEF.UINT16,
    m_wSummonBeastPowerUp2: TYPE_DEF.UINT16,
    m_wSummonningSummonBeast: TYPE_DEF.UINT16,
    m_wInnerTeleport: TYPE_DEF.UINT16,
    m_wInvincible: TYPE_DEF.UINT16,
    m_wLevelDrain: TYPE_DEF.UINT16,
    m_wLevelDown: TYPE_DEF.UINT16,
    m_wDeathCounter: TYPE_DEF.UINT16,
    m_wStealMoney: TYPE_DEF.UINT16,
    m_wHitTortureDamageImage: TYPE_DEF.UINT16,
    m_wBreakArmor: TYPE_DEF.UINT16,
    m_wBreakWeapon: TYPE_DEF.UINT16,
    m_wEI_FlameRing: TYPE_DEF.UINT16,
    m_wEI_Incinerate: TYPE_DEF.UINT16,
    m_wEI_VaccumPoint: TYPE_DEF.UINT16,
    m_wEI_InclineStatus: TYPE_DEF.UINT16,
    m_wEI_DeclineStatus: TYPE_DEF.UINT16,
    m_wEI_Taunt: TYPE_DEF.UINT16,
    m_wEI_HotSkin: TYPE_DEF.UINT16,
    m_wEI_DarkWeapon: TYPE_DEF.UINT16,
    m_wEI_Torture: TYPE_DEF.UINT16,
    m_wEI_CancerHall: TYPE_DEF.UINT16,
    m_wEI_UntimateBarrier: TYPE_DEF.UINT16,
    m_wEI_RabbitRush: TYPE_DEF.UINT16,
    m_wEI_Impulse: TYPE_DEF.UINT16,
    m_wEI_BloodDrain: TYPE_DEF.UINT16,
    m_wEI_HwaByung: TYPE_DEF.UINT16,
    m_wEI_PlotOfShadow: TYPE_DEF.UINT16,
    m_wEI_SmellOfDeath: TYPE_DEF.UINT16,
    m_wEI_InterruptingArmor: TYPE_DEF.UINT16,
    m_wEI_Contract: TYPE_DEF.UINT16,
    m_wEI_BloodCompact: TYPE_DEF.UINT16,
    m_wEI_SoulOath: TYPE_DEF.UINT16,
    m_wEI_Marionette: TYPE_DEF.UINT16,
    m_wEI_ReversalPower: TYPE_DEF.UINT16,
    m_wEI_LightningBarrier: TYPE_DEF.UINT16,
    m_wEI_NoMoreFight: TYPE_DEF.UINT16,
    m_wHitDarkDamageEffect: TYPE_DEF.UINT16,
    m_wLaziness: TYPE_DEF.UINT16,
    m_wUseSpecialAttack: TYPE_DEF.UINT16,
    m_wPigeonPost: TYPE_DEF.UINT16,
    m_wRollinggLog: TYPE_DEF.UINT16,
    m_wTransImage: TYPE_DEF.UINT16,
    m_wMainQuestEagle: TYPE_DEF.UINT16,
    m_wSetOffFirecrackerImage: TYPE_DEF.UINT16,
    m_awFirecrackerImage: (new Array(10)).fill(TYPE_DEF.UINT16),
    m_wShutInMagicBox: TYPE_DEF.UINT16,
    m_wSnowImage: TYPE_DEF.UINT16,
    m_wEI_SC_Soul_Consensus: TYPE_DEF.UINT16,
    m_wEI_SC_Soul_WindmilSlash: TYPE_DEF.UINT16,
    m_wEI_SC_Soul_BindingWords: TYPE_DEF.UINT16,
    m_wEI_SC_Soul_Blaze: TYPE_DEF.UINT16,
    m_wEI_SC_Soul_TyphoonSlash: TYPE_DEF.UINT16,
    m_wEI_SC_Soul_Snatcher: TYPE_DEF.UINT16,
    m_wEI_SS_Soul_Blaze: TYPE_DEF.UINT16,
    m_wEI_SA_Soul_StrikeSlash: TYPE_DEF.UINT16,
    m_wEI_SS_Soul_CruelSoul: TYPE_DEF.UINT16,
    m_wEI_SH_Soul_Binding: TYPE_DEF.UINT16,
    m_wEI_SS_Soul_Release: TYPE_DEF.UINT16,
    m_wEI_SC_Soul_Casting: TYPE_DEF.UINT16,
    m_wEI_SS_Soul_Consensus: TYPE_DEF.UINT16,
    m_wEI_SS_Soul_InterruptingWeapon: TYPE_DEF.UINT16,
    m_wEI_SC_Soul_Release: TYPE_DEF.UINT16,
    m_wEI_SS_Soul_BindingWords: TYPE_DEF.UINT16,
    m_wEI_SS_Soul_NotUseReaction: TYPE_DEF.UINT16,
    // m_wEI_SS_Cham_Bear: TYPE_DEF.UINT16,
    // m_wEI_SS_Cham_Bull: TYPE_DEF.UINT16,
    // m_wEI_SS_Cham_Hawk: TYPE_DEF.UINT16,
    // m_wEI_SS_Cham_Snake: TYPE_DEF.UINT16,
    // m_wEI_SS_Cham_Puma: TYPE_DEF.UINT16,
    // m_wEI_Hit_Hard_Blow: TYPE_DEF.UINT16,
    // m_wEI_Hit_FightingSpirit: TYPE_DEF.UINT16,
    // m_wEI_SS_Hard_Blow: TYPE_DEF.UINT16,
    // m_wEI_Hit_Ignore_Block: TYPE_DEF.UINT16,
    // m_wEI_WhiteBit: TYPE_DEF.UINT16,
    // m_wEI_RedBit: TYPE_DEF.UINT16,
    // m_wEI_GleamTant: TYPE_DEF.UINT16,
    // m_wEI_PowerOfVitalization: TYPE_DEF.UINT16,
    // m_wHitBleedingEffect: TYPE_DEF.UINT16,
    // m_wHitElectricShockEffect: TYPE_DEF.UINT16,
    // m_wEI_MakeTypeUndead: TYPE_DEF.UINT16,
    // m_wEI_ElectricShock: TYPE_DEF.UINT16,
    // m_wEI_Hit_RightPunch: TYPE_DEF.UINT16,
    // m_wEI_Hit_LeftPunch: TYPE_DEF.UINT16,
    // m_wEI_Hit_RightKick: TYPE_DEF.UINT16,
    // m_wEI_Hit_LeftKick: TYPE_DEF.UINT16,
    // m_wEI_Hit_DownKick: TYPE_DEF.UINT16,
    // m_wEI_WM_House_Over: TYPE_DEF.UINT16,
    // m_wEI_WM_Castle_Over: TYPE_DEF.UINT16,
    // m_wEI_WM_Portal_Over: TYPE_DEF.UINT16,
    m_abImageOutputMethod: (new Array(1024)).fill(TYPE_DEF.UINT8),
}

const ClientSaveImageDataTypeDef = {
    m_wSmellOfDeathImage: TYPE_DEF.UINT16,
    m_wMiniPetSummon: TYPE_DEF.UINT16,
    m_wRebirthImage: TYPE_DEF.UINT16,
    m_awRebirthMarkImage: (new Array(5)).fill(TYPE_DEF.UINT16),
    m_wSoundOfLeadersBellImage: TYPE_DEF.UINT16,
    m_wSoundOfLeadersBellMarkImage: TYPE_DEF.UINT16,
}

const EffectDataInfoTypeDef = {
    m_strImageName: (new Array(32)).fill(TYPE_DEF.SKIP), // (new Array(32)).fill(TYPE_DEF.CHAR_EUC_KR)
    m_strImageFileName: (new Array(64)).fill(TYPE_DEF.CHAR),
    m_wType: TYPE_DEF.UINT16
}

export default EffectDataManager;