
export const SKILL_COMMENT_LENGTH = 256;
export const SKILL_POWER_UP_COMMENT_LENGTH = 64;
export const SKILL_NAME_LENGTH = 32;
export const SKILL_SOUND_FILE_LENGTH = 32;

export const LIMIT_SKILL_LEVEL = 50;

export const MAX_SKILL = 2048;
export const MAX_ACTIVE_SKILL = 256;
export const VALID_BLOCKER_CODE = MAX_ACTIVE_SKILL;


export const ABILITY_COUNT = 52;
export const HERO_ABILITY_COUNT = 52;
export const MONSTER_ABILITY_COUNT = 10;

export const ACTIVE_REACTION_COUNT = 4;
export const PLAYER_ACTIVE_REACTION_LIMIT = 2;
export const SKILL_SPARE_VALUE_COUNT = 20; // Spare state value
export const MAX_REQUIRE_SKILL_COUNT = 5;
export const EXTRA_EFFECT_COUNT = 10;

export const SKILL_ACTION_TO_OBJECT = 0xfff9; // Treasure Chest
export const SKILL_BASIC_ATTACK_TO_ARCA = 0xfffa; // Treasure Chest
export const SKILL_BASIC_ATTACK_TO_DOOR = 0xfffb; // Door Attack
export const SKILL_BORDER_OF_ATTACK_TO_OBJECT = 0xfffb; // Door attack
export const SKILL_BASIC_ATTACK = 0xfffe; // Basic Attack
export const SKILL_CONTINUOUS_HIT_ATTACK = 0xfffd; // Continuous Hit Attack
export const SKILL_ILLUSION_ATTACK = 0xfffc; // Delayed attack
export const SKILL_INREGULAR_SKILL = 0xfff0; // Basic Attack
export const SKILL_SERIAL_HOLYCROSS = 144; // Holy Cross serial number 09.09.24 
export const SKILL_SERIAL_PLOT_OF_SHADOW = 357; // Plot of Shadow serial number 09.10.29
export const SKILL_HELL_PRISON = 381;
export const JOB_MONSTER_START = 201;
export const BREAK_EQUIPMENT_FACTOR = 2;
export const NEED_STATE_EMPTY = 0x3f; // Need state. 

export const PASSIVE_SKILL_COUNT = 5; // Maximum number of passive skills...


export const MAX_PHYSICAL_DAMAGE = 2000000;
export const MAX_MAGICAL_DAMAGE = 2000000;

export const SKILL_FIRE_RESULT_OK = 0;
export const SKILL_FIRE_RESULT_FAILED = 1;
export const SKILL_TYPE_BIT_GLIDER = 27;
export const SKILL_TYPE_EXPLOSION_DEPEND_ON_IMAGE = 31;
export const SKILL_TYPE_WATER_FALL = 35;
export const SKILL_TYPE_MACHINE_MISSILE = 39;
export const SKILL_TYPE_SPECIAL_MISSILE = 40;

//	HEOP	-	Hit Effect Ouput Part
export const HEOP_HIT_ZONE = 0
export const HEOP_FOOT = 1
export const HEOP_SHOULDER = 2
export const HEOP_ON_THE_HEAD = 3;

// Shake Timing
export const ST_EXPLOSION = 0;
export const ST_CAST = 1;

export const SKILL_CAST_AT_ENEMY = 0x00000001;
export const SKILL_CAST_AT_PLAYER = 0x00000002;
export const SKILL_CAST_AT_DEATH_PLAYER = 0x00000004;
export const SKILL_CAST_AT_GROUND = 0x00000008;
export const SKILL_CAST_QUICK = 0x00000010;
export const SKILL_CAST_AT_CASTER = 0x00000020;
export const SKILL_CAST_ON_DEATH_SUMMON_BEAST = 0x00000040;
export const SKILL_CAST_ON_PARTY_MEMBER = 0x00000080;
export const SKILL_CAST_ON_PET = 0x00000100;
export const SKILL_CAST_ON_ENEMY_PET = 0x00000200;
export const SKILL_CAST_ON_DEATH_PET = 0x00000400;
export const SKILL_CAST_ON_SUMMON_BEAST = 0x00000800;
export const SKILL_CAST_ON_KELBY = 0x00001000;
export const SKILL_CAST_ON_TRAP = 0x00002000;
export const SKILL_CAST_ON_ARCA = 0x00004000;
export const SKILL_CAST_ON_DOOR = 0x00008000;
export const SKILL_CAST_ON_USER_PARTY_MEMBER = 0x00010000;