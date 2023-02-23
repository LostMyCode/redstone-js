import BufferReader from "../../utils/BufferReader";
import { decodeScenarioBuffer } from "../../utils/RedStoneRandom";
import Event from "./Event";
import Karma from "./Karma";

export const CType = {
    /**
     * プレイヤー
     */
    Player: 0,

    /**
     * NPC
     */
    NPC: 1,

    /**
     * モンスター
     */
    Monster: 2,

    /**
     * 武具商人
     */
    Equipment_merchant: 3,

    /**
     * 防具商人
     */
    ArmorMerchant: 4,

    /**
     * 雑貨商人
     */
    MiscellaneousGoodsMerchant: 5,

    /**
     * 道具商人
     */
    ToolMerchant: 6,

    /**
     * 取引仲介人
     */
    BrokerageHuman: 7,

    /**
     * 銀行員
     */
    Banker: 8,

    /**
     * スキルマスター
     */
    SkillMaster: 9,

    /**
     * 一般クエスト
     */
    GeneralQuest: 10,

    /**
     * 称号クエスト
     */
    TitleQuest: 11,

    /**
     * ギルドクエスト
     */
    GuildQuest: 12,

    /**
     * メインクエスト
     */
    MainQuest: 13,

    /**
     * サポーター1
     */
    Supporters1: 14,

    /**
     * テレポーター
     */
    Teleporters: 15,

    /**
     * 治療師
     */
    Healers: 16,

    /**
     * クエスト案内人
     */
    QuestGuidPeople: 17,

    /**
     * 鍛冶屋
     */
    Blacksmith: 18,

    /**
     * サポーター2
     */
    Supporters2: 19,

    /**
     * クエスト依頼人
     */
    QuestAskedPeople: 20,

    /**
     * クエスト関連人
     */
    QuestRelatedPerson: 21,

    /**
     * クエストモンスター
     */
    QuestMonster: 22,

    /**
     * 武器商人<br/>(剣士/戦士)
     */
    ArmsDealerSwordsmanOrWarrior: 23,

    /**
     * 武器商人<br/>(ウィザード/ウルフマン)
     */
    ArmsDealerWizardOrWolfman: 24,

    /**
     * 武器商人<br/>(ビショップ/追放天使)
     */
    ArmsDealerBishopOrexiled_angel: 25,

    /**
     * 武器商人<br/>(シーフ/武道家)
     */
    ArmsDealerThiefOrmartial_artist: 26,

    /**
     * 武器商人<br/>(アーチャー/ランサー)
     */
    ArmsDealerArcherOrLancer: 27,

    /**
     * 武器商人<br/>(ビーストテイマー/サマナー)
     */
    ArmsDealerBisutoteimaOrSummoner: 28,

    /**
     * 武器商人<br/>(プリンセス/リトルウィッチ)
     */
    ArmsDealerPrincessOrLittlewitch: 29,

    /**
     * 武器商人<br/>(ネクロマンサー/悪魔)
     */
    ArmsDealerNecromancerOrDevil: 30,

    /**
     * 決戦報酬商人
     */
    BattleRewardMerchant: 31,

    /**
     * 武器商人<br/>(霊術師/闘士)
     */
    WeaponNumerologyTeacherMerchantOrWarrior: 32,

    /**
     * ギルドホールテレポーター
     */
    GuildHallTeleporters: 33,

    /**
     * イベント案内人
     */
    EventGuidepeople: 34,

    /**
     * 冒険家協会
     */
    AdventurerAssociation: 35,

    /**
     * 武器商人<br/>(光奏師/獣人)
     */
    ArmsDealerLightResponseRateNursesOrBeastPeople: 36,

    /**
     * 1Dayクエスト
     */
    OneDayQuest: 37,

    /**
     * 錬成案内人
     */
    DrillingGuidePeople: 38,

    /**
     * 武器商人<br/>(メイド/黒魔術師)
     */
    ArmsDealerMaidOrBlackMagician: 39
}

export const ActorDirect = {
    Up: 0,
    UpRight: 1,
    Right: 2,
    DownRight: 3,
    Down: 4,
    DownLeft: 5,
    Left: 6,
    UpLeft: 7,

    /**
     * リスポーンフラグ
     */
    Spawn: 8,
}

export const MonsterType = {
    201: "SkeletonAxe",
    202: "SkeletonSword",
    203: "SkeletonKnight",
    204: "Zombie",
    205: "LivingDead",
    206: "Ghost",
    207: "Mummy",
    208: "GhostArmor",
    209: "Vampire",
    210: "Lich",
    211: "DarkElf",
    212: "Assassin",
    213: "AggressiveNative",
    214: "FallenWizard",
    215: "TempleKnight",
    216: "DarkPriest",
    217: "Conjuerer",
    218: "Giant",
    219: "ElfKing",
    220: "Archmage",
    221: "DemiBeholder",
    222: "Reptile",
    223: "CockFighter",
    224: "LizardWarrior",
    225: "LizardRider",
    226: "RatFighter",
    227: "Demon",
    228: "Ogre",
    229: "Bahomate",
    230: "RedDemon",
    231: "TurtleDragon",
    232: "Spider",
    233: "Scorpion",
    234: "JellyFish",
    235: "GiantWorm",
    236: "KingCrab",
    237: "InsectSwarm",
    238: "Wolf",
    239: "BigMole",
    240: "MadBear",
    241: "FireBogy",
    242: "TongueEye",
    243: "Gargoyle",
    244: "MetalGolem",
    245: "Centaurs",
    246: "MermanKnight",
    247: "TimberMan",
    248: "Salamander",
    249: "DarkFire",
    250: "WhiteShadow",
    251: "SkeletonSanta",
    252: "sage",
    253: "sage_master",
    254: "tiamath_left_feeler",
    255: "tiamath",
    256: "tiamath_right_feeler",
    257: "water_dragon",
    258: "arch_devil",
    259: "draco_lich",
    260: "draco_lich_orb",
    261: "Giant_Skull",
    262: "Undead_Magician",
    263: "Bone_Chimera",
    264: "High_Elf",
    265: "Gangster",
    266: "Sikhs",
    267: "Escapee",
    268: "Mad_Demon",
    269: "God_of_Death",
    270: "Succubus",
    271: "Mantis_Warrior",
    272: "Pumpkin_Head",
    273: "Monkey_King",
    274: "Giant_Frog",
    275: "Tongue_Monster",
    276: "Dark_Buffalo",
    277: "Unicorn",
    278: "Apostles",
    279: "Cherubim"
}

export const ActorImage = {
    250: "MAN1",
    251: "MAN2",
    252: "WOMAN1",
    253: "WOMAN2",
    254: "YOUNG_MAN1",
    255: "YOUNG_MAN2",
    256: "LADY1",
    257: "LADY2",
    258: "GRAND_FATHER",
    259: "GRAND_MOTHER",
    260: "BOY1",
    261: "BOY2",
    262: "GIRL1",
    263: "GIRL2",
    264: "NOBLE_MAN1",
    265: "NOBLE_MAN2",
    266: "NOBLE_WOMAN1",
    267: "NOBLE_WOMAN2",
    268: "NOBLE_BOY",
    269: "NOBLE_GIRL",
    270: "GYPSY_MAN1",
    271: "GYPSY_MAN2",
    272: "GYPSY_WOMAN1",
    273: "GYPSY_WOMAN2",
    274: "GYPSY_BOY1",
    275: "GYPSY_BOY2",
    276: "GYPSY_GIRL1",
    277: "GYPSY_GIRL2",
    278: "FARMER1",
    279: "FARMER2",
    280: "WOODCUTTER1",
    281: "WOODCUTTER2",
    282: "MINER",
    283: "SAILER",
    284: "HALBERD_MAN",
    285: "TEMPLE_KNIGHT_M",
    286: "TEMPLE_KNIGHT_F",
    287: "BISHOP",
    288: "PRIEST",
    289: "NUN",
    290: "MERCENARY_SOLDIER_M",
    291: "MERCENARY_SOLDIER_F",
    292: "BAGGER",
    293: "DANCING_GIRL",
    294: "INSTRUCTOR_M",
    295: "INSTRUCTOR_F",
    296: "CADET1",
    297: "CADET2",
    298: "WIZARD",
    299: "MAGICIAN_M",
    300: "MAGICIAN_F",
    301: "SHOPKEEPER_WEAPON",
    302: "GROCER_M",
    303: "GROCER_F",
    304: "PITCHMAN_M",
    305: "PITCHMAN_F",
    306: "PITCHMAN_GRAND_FATHER",
    307: "PITCHMAN_GRAND_MOTHER",
    308: "ANGEL"
}

export class MapActorSingle {
    constructor(br) {
        /**
         * @type {BufferReader}
         */
        this.br = br;
        /**
         * @type {Number}
         */
        this.internalID = null;

        this.readData(br);
    }

    /**
     * @param {BufferReader} br 
     */
    readData(br) {
        const decryptedBuf = decodeScenarioBuffer(br.readStructUInt8(0xB0), br.decodeKey);
        const baseReader = new BufferReader(decryptedBuf);

        this.index = baseReader.readUInt32LE();
        this.internalID = baseReader.readUInt16LE();
        this.charType = baseReader.readUInt16LE(); // character type
        this.direct = baseReader.readInt16LE(); // ActorDirect
        this.unknown_0 = baseReader.readUInt16LE();
        this.popSpeed = baseReader.readUInt32LE();
        this.unknown_1 = baseReader.readStructUInt8(0x78);
        this.point = { x: baseReader.readUInt32LE(), y: baseReader.readUInt32LE() };
        this.name = baseReader.readString(0x10, "sjis");
        this.unknown_2 = baseReader.readStructUInt8(0x10);

        this.events = new Array(br.readInt16LE()) // Event array
        if (this.events.length > 0) {
            const speechType = br.readUInt16LE();
            const unknown = br.readUInt16LE();
            for (let i = 0; i < this.events.length; i++) {
                this.events[i] = new Event(br, speechType);
            }
        }
    }

    get isMonster() {
        return [CType.Monster, CType.QuestMonster].includes(this.charType);
    }
}

export class MapActorGroup {
    constructor(br, structLength, job2Index) {
        this.br = br;
        this.structLength = structLength;
        this.job = job2Index;
        this.readData(br);
    }

    /**
     * @param {BufferReader} br 
     */
    readData(br) {
        let encryptedBuf = Buffer.from(br.readStructUInt8(this.structLength));
        let decryptedBuf = decodeScenarioBuffer(encryptedBuf, br.decodeKey);

        const baseReader = new BufferReader(decryptedBuf);
        this.internalID = baseReader.readUInt16LE();
        this.unknown_1 = baseReader.readUInt16LE(); // is same value as job2Index?
        this.minLevel = baseReader.readUInt16LE();
        this.name = baseReader.readString(0x14, "sjis");
        this.imageSumCandidate = baseReader.readStructUInt16LE(0x03);
        this.unknown_4 = baseReader.readUInt16LE();
        this.scale = { width: baseReader.readUInt16LE(), height: baseReader.readUInt16LE() };
        this.maxLevel = baseReader.readUInt16LE();
        this.unknown_3 = baseReader.readStructUInt8(this.structLength - baseReader.offset);

        const enemyKarmaInfoLen = br.readInt32LE();
        this.enemyKarmaInfos = [];
        for (let i = 0; i < enemyKarmaInfoLen; i++) {
            const enemyKarmaInfo = {
                timing: br.readInt32LE(),
                karmas: new Array(br.readUInt16LE()), // new Karma[len]
                comment: (() => {
                    let commentString = "";
                    const count = br.readInt16LE();
                    const encryptedBytes = br.readStructUInt8(count); // EUC-KR
                    return commentString;
                })()
            };
            this.enemyKarmaInfos.push(enemyKarmaInfo);
            for (let j = 0; j < enemyKarmaInfo.karmas.length; j++) {
                enemyKarmaInfo.karmas[j] = new Karma(br);
            }
        }
    }
}