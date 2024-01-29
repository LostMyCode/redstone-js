import { fetchBinaryFile } from "../utils";
import BufferReader from "../utils/BufferReader";
import { DATA_DIR } from "./Config";
import SettingsManager from "./SettingsManager";
import Skill2 from "./models/Skill2";

const MonsterSoundInfo = [
    [2, "SkeletonAxe", "SkeletonAxe_die"],
    [2, "SkeletonSword", "SkeletonSword_die"],
    [2, "SkeletonKnight", "SkeletonKnight_die"],
    [2, "Zombie", "Zombie_die"],
    [2, "LivingDead", "LivingDead_die"],
    [2, "Ghost", "Ghost_die"],
    [2, "Mummy", "Mummy_die"],
    [2, "GhostArmor", "GhostArmor_die"],
    [2, "Vampire", "Vampire_die"],
    [2, "Lich", "Lich_die"],
    [2, "DarkElf", "DarkElf_die"],
    [2, "Assassin", "Assassin_die"],
    [2, "AggressiveNative", "AggressiveNative_die"],
    [2, "FallenWizard", "FallenWizard_die"],
    [2, "TempleKnight", "TempleKnight_die"],
    [2, "DarkPriest", "DarkPriest_die"],
    [2, "Conjuerer", "Conjuerer_die"],
    [2, "Giant", "Giant_die"],
    [2, "ElfKing", "ElfKing_die"],
    [2, "Archmage", "Archmage_die"],
    [2, "DemiBeholder", "DemiBeholder_die"],
    [2, "Reptile", "Reptile_die"],
    [2, "CockFighter", "CockFighter_die"],
    [2, "LizardWarrior", "LizardWarrior_die"],
    [2, "LizardRider", "LizardRider_die"],
    [2, "RatFighter", "RatFighter_die"],
    [2, "Demon", "Demon_die"],
    [2, "Ogre", "Ogre_die"],
    [2, "Bahomate", "Bahomate_die"],
    [2, "RedDemon", "RedDemon_die"],
    [2, "TurtleDragon", "TurtleDragon_die"],
    [2, "Spider", "Spider_die"],
    [2, "Scorpion", "Scorpion_die"],
    [2, "JellyFish", "JellyFish_die"],
    [2, "GiantWorm", "GiantWorm_die"],
    [2, "KingCrab", "KingCrab_die"],
    [2, "InsectSwarm", "InsectSwarm_die"],
    [2, "Wolf", "Wolf_die"],
    [2, "BigMole", "BigMole_die"],
    [2, "MadBear", "MadBear_die"],
    [2, "FireBogy", "FireBogy_die"],
    [2, "TongueEye", "TongueEye_die"],
    [2, "Gargoyle", "Gargoyle_die"],
    [2, "MetalGolem", "MetalGolem_die"],
    [2, "Centaurs", "Centaurs_die"],
    [2, "MermanKnight", "MermanKnight_die"],
    [2, "TimberMan", "TimberMan_die"],
    [2, "Salamander", "Salamander_die"],
    [2, "DarkFire", "DarkFire_die"],
    [2, "WhiteShadow", "WhiteShadow_die"],
].map(el => {
    const [soundCount, attackSound, deathSound] = el;
    return {
        soundCount, attackSound, deathSound
    }
});

export default class SoundManager {
    static bgmMap = [];

    static async init() {
        const buffer = await fetchBinaryFile(`${DATA_DIR}/bgm.dat`);
        const br = new BufferReader(buffer);

        this.bgmMap = br.readStructUInt16LE(1024);
    }

    static async play(fileName, isFullPath = false) {
        if (!fileName) return;
        const audio = new Audio();
        audio.src = isFullPath ? fileName : `${DATA_DIR}/Sound/${fileName}`;
        audio.volume = SettingsManager.get("volume") / 100;
        audio.play();
    }

    /**
     * @param {Skill2} skill 
     */
    static playActionSound(skill) {
        this.play(skill.sound.action);
    }

    /**
     * @param {Skill2} skill 
     */
    static playHitSound(skill) {
        this.play(skill.sound.hit);
    }

    /**
     * @param {Skill2} skill 
     */
    static playCastingSound(skill) {
        this.play(skill.sound.casting);
    }

    /**
     * @param {Skill2} skill 
     */
    static playCreateSound(skill) {
        this.play(skill.sound.create);
    }

    /**
     * @param {Skill2} skill 
     */
    static playExplosionSound(skill) {
        this.play(skill.sound.explosion);
    }

    /**
     * @param {Skill2} skill 
     */
    static playMissSound(skill) {
        this.play(skill.sound.miss);
    }

    static playMonsterDeathSound(index) {
        // if (!this.isActive) return;

        const name = MonsterSoundInfo[index].deathSound;
        const path = `${DATA_DIR}/Sound/monster/${name}.wav`;

        this.play(path, true);
    }
}