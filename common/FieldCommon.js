const MAP_FILE_HEADER_FORM = /Red Stone Scenario File (\d).(\d) beta/;

export const VUI_02_SHOP_INFO = 2;
export const VUI_03_ACTOR_SPEECH_DATA = 3;
export const VUI_04_SAVE_ACTOR_DATA_SKIP_POINT = 4;
export const VUI_05_CHANGE_SHOP_DATA_SAVE_LOCATE = 5;
export const VUI_06_SAVE_SHOP_DATA_SKIP_POINT = 6;
export const VUI_07_SAVE_SHOP_PRICE_FACTOR = 7;
export const VUI_08_ADD_DBOX_SIZE_AND_NO_SPEECH = 8;
export const VUI_09_ADD_ACTOR_NAME = 9;
export const VUI_10_ADD_BGM = 10;
export const VUI_11_ADD_MOVE_GATE_NAME = 11;
export const VUI_12_ADD_CURRENT_MAP_POS = 12;
export const VUI_13_CHANGE_DIALG_SELECT_SPEECH = 13;
export const VUI_14_ADD_RANDOM_CHOICE_DIALOG = 14;
export const VUI_15_ADD_OBJECT_SHADOW_CHECK = 15;
export const VUI_16_ADD_CHARACTER_EVENT = 16;
export const VUI_17_ADD_AREA_SAVE_POINT = 17;
export const VUI_18_ADD_CHARACTER_JOB_LIST = 18;
export const VUI_19_ADD_CUSTOM_ITEM = 19;
export const VUI_20_ADD_KARMA_OCCUR_CHANCE = 20;
export const VUI_21_ADD_BGM_LIST = 21;
export const VUI_22_ADD_TRIGGER_ACTIVE_CONDITION = 22;
export const VUI_23_ADD_CUSTOM_ITEM_NAME = 23;
export const VUI_24_ADD_CORRECT_MAGIC_RESISTANCE = 24;
export const VUI_25_ADD_KARMA = 25;
export const VUI_26_ADD_DUNGEON_VALUE_AND_KARMA_VALUE = 26;
export const VUI_27_ADD_CHARACTER_DATA = 27;
export const VUI_28_EXPAND_AREA_DATA = 28;
export const VUI_29_ADD_DOOR_LIST = 29;
export const VUI_30_ADD_CORECT_MONSTER_RESISTANCE = 30;
export const VUI_31_ADD_FIELD_KARMA = 31;
export const VUI_32_ADD_AREA_CC = 32;
export const VUI_33_REMOVE_DUNGEON_VALUE = 33;
export const VUI_34_ADD_CHARACTER_SKIN = 34;
export const VUI_35_ADD_BOSS_ZONE = 35;
export const VUI_36_ADD_CHARACTER_PATTERN = 36;
export const VUI_37_ADD_BLOCK_TO_AUTO_REGEN = 37;
export const VUI_38_ADD_CORRECT_CHARACTER_POWER = 38;
export const VUI_39_ADD_FIELD_VALUE = 39;
export const VUI_40_ADD_DAMAGE_IMMUNE = 40;
export const VUI_41_ADD_REVISE_INT = 41;
export const VUI_42_ADD_DUEL_SERVER = 42;
export const VVI_43_ADD_SEASON_VARIABLE = 43;
export const VVI_44_ADD_TOKEN_SHOP = 44;
export const VVI_45_ADD_MORE_CHARACTER_DATA = 45;
export const VVI_46_REVISE_BLOCK_TO_TAME = 46;
export const VVI_47_ADD_HIDE_NAME_BAR_OPTION = 47;
export const VVI_48_ENCRYT = 48;
export const VVI_49_ENCRYT_MORE = 49;
export const VVI_50_ADD_GENERATE_METHOD = 50;
export const VVI_51_ENCRYT2 = 51;
export const VUI_CURRENT_VERSION = 52;

export const CURRENT_MAP_VERSION = VUI_CURRENT_VERSION - 1;

export const GetMapDataVersion = strHeader => {
    const [, v1, v2] = strHeader.match(MAP_FILE_HEADER_FORM);

    return (parseInt(v1) - 1) * 10 + parseInt(v2);
}