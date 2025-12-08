import * as PIXI from "pixi.js";

import GamePlay from "../GamePlay";
import { ImageManager } from "../ImageData";
import RedStone from "../RedStone";
import { BAR_CHECK } from "../../engine/BarMenu";
import Rect from "../../engine/Rect";
import Pos from "../../engine/Pos";
import CommonUI from "./CommonUI";
import ActorManager from "../actor/ActorManager";
import SaveData from "../SaveData";

//	Bottom Interface Menu
export const BIM_RUN = 0;
export const BIM_WALK = 1;
export const BIM_TRANS = 2;
export const BIM_QUICK_SKILL1 = 3;
export const BIM_QUICK_SKILL2 = 4;
export const BIM_QUICK_SKILL3 = 5;
export const BIM_QUICK_SKILL4 = 6;
export const BIM_QUICK_SKILL5 = 7;
export const BIM_QUICK_SKILL6 = 8;
export const BIM_QUICK_SKILL7 = 9;
export const BIM_QUICK_SKILL8 = 10;
export const BIM_QUICK_SKILL9 = 11;
export const BIM_QUICK_SKILL10 = 12;
export const BIM_QUICK_SKILL_UP = 13;
export const BIM_QUICK_SKILL_DOWN = 14;
export const BIM_LEFT_SKILL1 = 15;
export const BIM_RIGHT_SKILL1 = 16;
export const BIM_LEFT_SKILL2 = 17;
export const BIM_RIGHT_SKILL2 = 18;

export const BIM_QUICK_ITEM1 = 19;
export const BIM_QUICK_ITEM2 = 20;
export const BIM_QUICK_ITEM3 = 21;
export const BIM_QUICK_ITEM4 = 22;
export const BIM_QUICK_ITEM5 = 23;
export const BIM_QUICK_ITEM_RELOAD = 24;

export const BIM_MENU_STATUS = 25;
export const BIM_MENU_INVENTORY = 26;
export const BIM_MENU_SKILL = 27;
export const BIM_MENU_PARTY = 28;
export const BIM_MENU_QUEST = 29;
export const BIM_MENU_GUILD = 30;
export const BIM_MENU_FRIEND = 31;
export const BIM_MENU_SYSTEM = 32;
export const BIM_SITDOWN = 33;
export const BIM_STAND_UP = 34;

export const NOT_USE_SKILL = 0;
export const USE_SKILL_NOT_TARGET = 1;
export const USE_SKILL = 2;

const rectSkillSlots = [
    [8, 510, 8 + 34, 510 + 34],	//	left
    [758, 510, 758 + 34, 510 + 34],	//	right
    [22, 559, 22 + 34, 559 + 34],	//	passive
    [744, 559, 744 + 34, 559 + 34],	//	secondary

    [86, 524, 86 + 34, 524 + 34],	//	Quick 1
    [122, 524, 122 + 34, 524 + 34],
    [158, 524, 158 + 34, 524 + 34],
    [194, 524, 194 + 34, 524 + 34],
    [230, 524, 230 + 34, 524 + 34],

    [86, 562, 86 + 34, 562 + 34],
    [122, 562, 122 + 34, 562 + 34],
    [158, 562, 158 + 34, 562 + 34],
    [194, 562, 194 + 34, 562 + 34],
    [230, 562, 230 + 34, 562 + 34],
    [0xffff]
].map(info => new Rect(...info));

// enum
const BII_MAIN = 0
const BII_MOVE_WALK_NORMAL = 1
const BII_MOVE_WALK_ACTIVE = 2
const BII_MOVE_WALK_PRESSED = 3
const BII_MOVE_RUN_NORMAL = 4
const BII_MOVE_RUN_ACTIVE = 5
const BII_MOVE_RUN_PRESSED = 6
const BII_CHANGE_JOB_NORMAL = 7
const BII_CHANGE_JOB_ACTIVE = 8
const BII_CHANGE_JOB_PRESSED = 9
const BII_CHANGE_JOB_DISABLE = 10
const BII_STAND_NORMAL = 11
const BII_STAND_ACTIVE = 12
const BII_STAND_PRESSED = 13
const BII_STAND_DISABLE = 14
const BII_SITDOWN_NORMAL = 15
const BII_SITDOWN_ACTIVE = 16
const BII_SITDOWN_PRESSED = 17
const BII_SITDOWN_DISABLE = 18
const BII_MENU_STATUS_ACTIVE = 19
const BII_MENU_STATUS_PRESSED = 20
const BII_MENU_STATUS_CHECK = 21
const BII_MENU_INVENTORY_ACTIVE = 22
const BII_MENU_INVENTORY_PRESSED = 23
const BII_MENU_INVENTORY_CHECK = 24
const BII_MENU_SKILL_ACTIVE = 25
const BII_MENU_SKILL_PRESSED = 26
const BII_MENU_SKILL_CHECK = 27
const BII_MENU_PARTY_ACTIVE = 28
const BII_MENU_PARTY_PRESSED = 29
const BII_MENU_PARTY_CHECK = 30
const BII_MENU_QUEST_ACTIVE = 31
const BII_MENU_QUEST_PRESSED = 32
const BII_MENU_QUEST_CHECK = 33
const BII_MENU_GUILD_ACTIVE = 34
const BII_MENU_GUILD_PRESSED = 35
const BII_MENU_GUILD_CHECK = 36
const BII_MENU_FRIEND_ACTIVE = 37
const BII_MENU_FRIEND_PRESSED = 38
const BII_MENU_FRIEND_CHECK = 39
const BII_MENU_SYSTEM_ACTIVE = 40
const BII_MENU_SYSTEM_PRESSED = 41
const BII_MENU_SYSTEM_CHECK = 42
const BII_QUICK_SKILL_SLOT0 = 43
const BII_QUICK_SKILL_SLOT1 = 44
const BII_QUICK_SKILL_SLOT2 = 45
const BII_QUICK_SKILL_SLOT3 = 46
const BII_QUICK_SKILL_SLOT4 = 47
const BII_QUICK_SKILL_SLOT5 = 48
const BII_QUICK_SKILL_SLOT6 = 49
const BII_QUICK_SKILL_SLOT7 = 50
const BII_QUICK_SKILL_SLOT8 = 51
const BII_QUICK_SKILL_SLOT9 = 52
const BII_QUICK_SKILL_UP_ACTIVE = 53
const BII_QUICK_SKILL_UP_PRESSED = 54
const BII_QUICK_SKILL_DOWN_ACTIVE = 55
const BII_QUICK_SKILL_DOWN_PRESSED = 56
const BII_RELOAD_ACTIVE = 57
const BII_RELOAD_PRESSED = 58
const BII_EXP_GAUGE = 59
const BII_SKILL_EXP_GAUGE = 60
const BII_RED_STONE_01 = 61
const BII_RED_STONE_02 = 62
const BII_RED_STONE_03 = 63
const BII_RED_STONE_04 = 64
const BII_RED_STONE_05 = 65
const BII_RED_STONE_06 = 66
const BII_RED_STONE_07 = 67
const BII_RED_STONE_08 = 68
const BII_RED_STONE_09 = 69
const BII_RED_STONE_10 = 70
const BII_RED_STONE_11 = 71
const BII_RED_STONE_12 = 72
const BII_RED_STONE_13 = 73
const BII_RED_STONE_14 = 74
const BII_RED_STONE_15 = 75
const BII_RED_STONE_16 = 76
const BII_CP_LEVEL_MINUS_01 = 77
const BII_CP_LEVEL_MINUS_02 = 78
const BII_CP_LEVEL_MINUS_03 = 79
const BII_CP_LEVEL_MINUS_04 = 80
const BII_CP_LEVEL_MINUS_05 = 81
const BII_CP_LEVEL_MINUS_06 = 82
const BII_CP_LEVEL_MINUS_07 = 83
const BII_CP_LEVEL_MINUS_08 = 84
const BII_CP_LEVEL_MINUS_09 = 85
const BII_CP_LEVEL_MINUS_10 = 86
const BII_CP_LEVEL_MINUS_11 = 87
const BII_CP_LEVEL_MINUS_12 = 88
const BII_CP_LEVEL_MINUS_13 = 89
const BII_CP_LEVEL_MINUS_14 = 90
const BII_CP_LEVEL_MINUS_15 = 91
const BII_CP_LEVEL_MINUS_16 = 92
const BII_CP_LEVEL_MINUS_01_LEFT = 93
const BII_CP_LEVEL_MINUS_02_LEFT = 94
const BII_CP_LEVEL_MINUS_03_LEFT = 95
const BII_CP_LEVEL_MINUS_04_LEFT = 96
const BII_CP_LEVEL_MINUS_05_LEFT = 97
const BII_CP_LEVEL_MINUS_06_LEFT = 98
const BII_CP_LEVEL_MINUS_07_LEFT = 99
const BII_CP_LEVEL_MINUS_08_LEFT = 100
const BII_CP_LEVEL_MINUS_09_LEFT = 101
const BII_CP_LEVEL_MINUS_10_LEFT = 102
const BII_CP_LEVEL_MINUS_11_LEFT = 103
const BII_CP_LEVEL_MINUS_12_LEFT = 104
const BII_CP_LEVEL_MINUS_13_LEFT = 105
const BII_CP_LEVEL_MINUS_14_LEFT = 106
const BII_CP_LEVEL_MINUS_15_LEFT = 107
const BII_CP_LEVEL_MINUS_16_LEFT = 108
const BII_CP_LEVEL_MINUS_ACTIVE_1 = 109
const BII_CP_LEVEL_MINUS_ACTIVE_2 = 110
const BII_CP_LEVEL_MINUS_ACTIVE_3 = 111
const BII_CP_LEVEL_1_01 = 112
const BII_CP_LEVEL_1_02 = 113
const BII_CP_LEVEL_1_03 = 114
const BII_CP_LEVEL_1_04 = 115
const BII_CP_LEVEL_1_05 = 116
const BII_CP_LEVEL_1_06 = 117
const BII_CP_LEVEL_1_07 = 118
const BII_CP_LEVEL_1_08 = 119
const BII_CP_LEVEL_1_09 = 120
const BII_CP_LEVEL_1_10 = 121
const BII_CP_LEVEL_1_11 = 122
const BII_CP_LEVEL_1_12 = 123
const BII_CP_LEVEL_1_13 = 124
const BII_CP_LEVEL_1_14 = 125
const BII_CP_LEVEL_1_15 = 126
const BII_CP_LEVEL_1_16 = 127
const BII_CP_LEVEL_1_01_LEFT = 128
const BII_CP_LEVEL_1_02_LEFT = 129
const BII_CP_LEVEL_1_03_LEFT = 130
const BII_CP_LEVEL_1_04_LEFT = 131
const BII_CP_LEVEL_1_05_LEFT = 132
const BII_CP_LEVEL_1_06_LEFT = 133
const BII_CP_LEVEL_1_07_LEFT = 134
const BII_CP_LEVEL_1_08_LEFT = 135
const BII_CP_LEVEL_1_09_LEFT = 136
const BII_CP_LEVEL_1_10_LEFT = 137
const BII_CP_LEVEL_1_11_LEFT = 138
const BII_CP_LEVEL_1_12_LEFT = 139
const BII_CP_LEVEL_1_13_LEFT = 140
const BII_CP_LEVEL_1_14_LEFT = 141
const BII_CP_LEVEL_1_15_LEFT = 142
const BII_CP_LEVEL_1_16_LEFT = 143
const BII_CP_LEVEL_1_ACTIVE_1 = 144
const BII_CP_LEVEL_1_ACTIVE_2 = 145
const BII_CP_LEVEL_1_ACTIVE_3 = 146
const BII_CP_LEVEL_2_01 = 147
const BII_CP_LEVEL_2_02 = 148
const BII_CP_LEVEL_2_03 = 149
const BII_CP_LEVEL_2_04 = 150
const BII_CP_LEVEL_2_05 = 151
const BII_CP_LEVEL_2_06 = 152
const BII_CP_LEVEL_2_07 = 153
const BII_CP_LEVEL_2_08 = 154
const BII_CP_LEVEL_2_09 = 155
const BII_CP_LEVEL_2_10 = 156
const BII_CP_LEVEL_2_11 = 157
const BII_CP_LEVEL_2_12 = 158
const BII_CP_LEVEL_2_13 = 159
const BII_CP_LEVEL_2_14 = 160
const BII_CP_LEVEL_2_15 = 161
const BII_CP_LEVEL_2_16 = 162
const BII_CP_LEVEL_2_01_LEFT = 163
const BII_CP_LEVEL_2_02_LEFT = 164
const BII_CP_LEVEL_2_03_LEFT = 165
const BII_CP_LEVEL_2_04_LEFT = 166
const BII_CP_LEVEL_2_05_LEFT = 167
const BII_CP_LEVEL_2_06_LEFT = 168
const BII_CP_LEVEL_2_07_LEFT = 169
const BII_CP_LEVEL_2_08_LEFT = 170
const BII_CP_LEVEL_2_09_LEFT = 171
const BII_CP_LEVEL_2_10_LEFT = 172
const BII_CP_LEVEL_2_11_LEFT = 173
const BII_CP_LEVEL_2_12_LEFT = 174
const BII_CP_LEVEL_2_13_LEFT = 175
const BII_CP_LEVEL_2_14_LEFT = 176
const BII_CP_LEVEL_2_15_LEFT = 177
const BII_CP_LEVEL_2_16_LEFT = 178
const BII_CP_LEVEL_2_ACTIVE_1 = 179
const BII_CP_LEVEL_2_ACTIVE_2 = 180
const BII_CP_LEVEL_2_ACTIVE_3 = 181
const BII_CP_LEVEL_3_01 = 182
const BII_CP_LEVEL_3_02 = 183
const BII_CP_LEVEL_3_03 = 184
const BII_CP_LEVEL_3_04 = 185
const BII_CP_LEVEL_3_05 = 186
const BII_CP_LEVEL_3_06 = 187
const BII_CP_LEVEL_3_07 = 188
const BII_CP_LEVEL_3_08 = 189
const BII_CP_LEVEL_3_09 = 190
const BII_CP_LEVEL_3_10 = 191
const BII_CP_LEVEL_3_11 = 192
const BII_CP_LEVEL_3_12 = 193
const BII_CP_LEVEL_3_13 = 194
const BII_CP_LEVEL_3_14 = 195
const BII_CP_LEVEL_3_15 = 196
const BII_CP_LEVEL_3_16 = 197
const BII_CP_LEVEL_3_01_LEFT = 198
const BII_CP_LEVEL_3_02_LEFT = 199
const BII_CP_LEVEL_3_03_LEFT = 200
const BII_CP_LEVEL_3_04_LEFT = 201
const BII_CP_LEVEL_3_05_LEFT = 202
const BII_CP_LEVEL_3_06_LEFT = 203
const BII_CP_LEVEL_3_07_LEFT = 204
const BII_CP_LEVEL_3_08_LEFT = 205
const BII_CP_LEVEL_3_09_LEFT = 206
const BII_CP_LEVEL_3_10_LEFT = 207
const BII_CP_LEVEL_3_11_LEFT = 208
const BII_CP_LEVEL_3_12_LEFT = 209
const BII_CP_LEVEL_3_13_LEFT = 210
const BII_CP_LEVEL_3_14_LEFT = 211
const BII_CP_LEVEL_3_15_LEFT = 212
const BII_CP_LEVEL_3_16_LEFT = 213
const BII_CP_LEVEL_3_ACTIVE_1 = 214
const BII_CP_LEVEL_3_ACTIVE_2 = 215
const BII_CP_LEVEL_3_ACTIVE_3 = 216
const BII_CP_LEVEL_4_01 = 217
const BII_CP_LEVEL_4_02 = 218
const BII_CP_LEVEL_4_03 = 219
const BII_CP_LEVEL_4_04 = 220
const BII_CP_LEVEL_4_05 = 221
const BII_CP_LEVEL_4_06 = 222
const BII_CP_LEVEL_4_07 = 223
const BII_CP_LEVEL_4_08 = 224
const BII_CP_LEVEL_4_09 = 225
const BII_CP_LEVEL_4_10 = 226
const BII_CP_LEVEL_4_11 = 227
const BII_CP_LEVEL_4_12 = 228
const BII_CP_LEVEL_4_13 = 229
const BII_CP_LEVEL_4_14 = 230
const BII_CP_LEVEL_4_15 = 231
const BII_CP_LEVEL_4_16 = 232
const BII_CP_LEVEL_4_01_LEFT = 233
const BII_CP_LEVEL_4_02_LEFT = 234
const BII_CP_LEVEL_4_03_LEFT = 235
const BII_CP_LEVEL_4_04_LEFT = 236
const BII_CP_LEVEL_4_05_LEFT = 237
const BII_CP_LEVEL_4_06_LEFT = 238
const BII_CP_LEVEL_4_07_LEFT = 239
const BII_CP_LEVEL_4_08_LEFT = 240
const BII_CP_LEVEL_4_09_LEFT = 241
const BII_CP_LEVEL_4_10_LEFT = 242
const BII_CP_LEVEL_4_11_LEFT = 243
const BII_CP_LEVEL_4_12_LEFT = 244
const BII_CP_LEVEL_4_13_LEFT = 245
const BII_CP_LEVEL_4_14_LEFT = 246
const BII_CP_LEVEL_4_15_LEFT = 247
const BII_CP_LEVEL_4_16_LEFT = 248
const BII_CP_LEVEL_4_ACTIVE_1 = 249
const BII_CP_LEVEL_4_ACTIVE_2 = 250
const BII_CP_LEVEL_4_ACTIVE_3 = 251
const BII_CP_LEVEL_5_01 = 252
const BII_CP_LEVEL_5_02 = 253
const BII_CP_LEVEL_5_03 = 254
const BII_CP_LEVEL_5_04 = 255
const BII_CP_LEVEL_5_05 = 256
const BII_CP_LEVEL_5_06 = 257
const BII_CP_LEVEL_5_07 = 258
const BII_CP_LEVEL_5_08 = 259
const BII_CP_LEVEL_5_09 = 260
const BII_CP_LEVEL_5_10 = 261
const BII_CP_LEVEL_5_11 = 262
const BII_CP_LEVEL_5_12 = 263
const BII_CP_LEVEL_5_13 = 264
const BII_CP_LEVEL_5_14 = 265
const BII_CP_LEVEL_5_15 = 266
const BII_CP_LEVEL_5_16 = 267
const BII_CP_LEVEL_5_01_LEFT = 268
const BII_CP_LEVEL_5_02_LEFT = 269
const BII_CP_LEVEL_5_03_LEFT = 270
const BII_CP_LEVEL_5_04_LEFT = 271
const BII_CP_LEVEL_5_05_LEFT = 272
const BII_CP_LEVEL_5_06_LEFT = 273
const BII_CP_LEVEL_5_07_LEFT = 274
const BII_CP_LEVEL_5_08_LEFT = 275
const BII_CP_LEVEL_5_09_LEFT = 276
const BII_CP_LEVEL_5_10_LEFT = 277
const BII_CP_LEVEL_5_11_LEFT = 278
const BII_CP_LEVEL_5_12_LEFT = 279
const BII_CP_LEVEL_5_13_LEFT = 280
const BII_CP_LEVEL_5_14_LEFT = 281
const BII_CP_LEVEL_5_15_LEFT = 282
const BII_CP_LEVEL_5_16_LEFT = 283
const BII_CP_LEVEL_5_ACTIVE_1 = 284
const BII_CP_LEVEL_5_ACTIVE_2 = 285
const BII_CP_LEVEL_5_ACTIVE_3 = 286

const quickSlotShotKey = 'QWERTASDFG';

PIXI.BitmapFont.from("ShotKey", {
    fill: "#f5b042",
    fontSize: 9
}, {
    chars: quickSlotShotKey,
    resolution: window.devicePixelRatio
});

// temp
let correctBI_X = ~~((window.innerWidth - 800) / 2);
let correctBI_Y = ~~(window.innerHeight - 600);

export default class GameBottomInterface {
    static initBottomInterface() {
        //

        GamePlay.bottomMenu.init(ImageManager.gameBottomInterface, 40, BAR_CHECK);

        //

        // temp
        const dMSG_STATUS_INFO_WINDOW = "";
        const dMSG_INVENTORY_MENU = "";
        const dMSG_SKILL_INTERFACE = "";
        const dMSG_PARTY_MENU = ""
        const dMSG_QUEST_MENU = ""
        const dMSG_GUILD_MENU = ""
        const dMSG_FRIEND_MENU = ""
        const dMSG_SYSTEM_MENU = ""

        const hitArea = new PIXI.Rectangle(0, 0, 46, 17);

        GamePlay.bottomMenu.setCallback(this.handleCallback);

        GamePlay.bottomMenu.addImageBar("", BIM_MENU_STATUS, 529 + correctBI_X, 562 + correctBI_Y, 0xffff, BII_MENU_STATUS_ACTIVE, BII_MENU_STATUS_PRESSED, BII_MENU_STATUS_CHECK, 0xffff, dMSG_STATUS_INFO_WINDOW, hitArea);
        GamePlay.bottomMenu.addImageBar("", BIM_MENU_INVENTORY, 576 + correctBI_X, 562 + correctBI_Y, 0xffff, BII_MENU_INVENTORY_ACTIVE, BII_MENU_INVENTORY_PRESSED, BII_MENU_INVENTORY_CHECK, 0xffff, dMSG_INVENTORY_MENU, hitArea);
        GamePlay.bottomMenu.addImageBar("", BIM_MENU_SKILL, 623 + correctBI_X, 562 + correctBI_Y, 0xffff, BII_MENU_SKILL_ACTIVE, BII_MENU_SKILL_PRESSED, BII_MENU_SKILL_CHECK, 0xffff, dMSG_SKILL_INTERFACE, hitArea);
        GamePlay.bottomMenu.addImageBar("", BIM_MENU_PARTY, 670 + correctBI_X, 562 + correctBI_Y, 0xffff, BII_MENU_PARTY_ACTIVE, BII_MENU_PARTY_PRESSED, BII_MENU_PARTY_CHECK, 0xffff, dMSG_PARTY_MENU, hitArea);
        GamePlay.bottomMenu.addImageBar("", BIM_MENU_QUEST, 529 + correctBI_X, 583 + correctBI_Y, 0xffff, BII_MENU_QUEST_ACTIVE, BII_MENU_QUEST_PRESSED, BII_MENU_QUEST_CHECK, 0xffff, dMSG_QUEST_MENU, hitArea);
        GamePlay.bottomMenu.addImageBar("", BIM_MENU_GUILD, 576 + correctBI_X, 583 + correctBI_Y, 0xffff, BII_MENU_GUILD_ACTIVE, BII_MENU_GUILD_PRESSED, BII_MENU_GUILD_CHECK, 0xffff, dMSG_GUILD_MENU, hitArea);
        GamePlay.bottomMenu.addImageBar("", BIM_MENU_FRIEND, 623 + correctBI_X, 583 + correctBI_Y, 0xffff, BII_MENU_FRIEND_ACTIVE, BII_MENU_FRIEND_PRESSED, BII_MENU_FRIEND_CHECK, 0xffff, dMSG_FRIEND_MENU, hitArea);
        GamePlay.bottomMenu.addImageBar("", BIM_MENU_SYSTEM, 670 + correctBI_X, 583 + correctBI_Y, 0xffff, BII_MENU_SYSTEM_ACTIVE, BII_MENU_SYSTEM_PRESSED, BII_MENU_SYSTEM_CHECK, 0xffff, dMSG_SYSTEM_MENU, hitArea);

        //

        // for (let i = 0; i < 10; i++) {
        //     GamePlay.bottomMenu.addImageBar("", BIM_QUICK_SKILL1 + i, rectSkillSlots[i + 4].x1, rectSkillSlots[i + 4].y1);
        //     GamePlay.bottomMenu.setSize(BIM_QUICK_SKILL1 + i, rectSkillSlots[i + 4].x1, rectSkillSlots[i + 4].y1, rectSkillSlots[i + 4].getWidth(), rectSkillSlots[i + 4].getHeight());
        //     // setkey
        // }

        window.addEventListener("resize", () => {
            correctBI_X = ~~((window.innerWidth - 800) / 2);
            correctBI_Y = ~~(window.innerHeight - 600);

            GamePlay.bottomMenu.setPosition(BIM_MENU_STATUS, 529 + correctBI_X, 562 + correctBI_Y);
            GamePlay.bottomMenu.setPosition(BIM_MENU_INVENTORY, 576 + correctBI_X, 562 + correctBI_Y);
            GamePlay.bottomMenu.setPosition(BIM_MENU_SKILL, 623 + correctBI_X, 562 + correctBI_Y);
            GamePlay.bottomMenu.setPosition(BIM_MENU_PARTY, 670 + correctBI_X, 562 + correctBI_Y);
            GamePlay.bottomMenu.setPosition(BIM_MENU_QUEST, 529 + correctBI_X, 583 + correctBI_Y);
            GamePlay.bottomMenu.setPosition(BIM_MENU_GUILD, 576 + correctBI_X, 583 + correctBI_Y);
            GamePlay.bottomMenu.setPosition(BIM_MENU_FRIEND, 623 + correctBI_X, 583 + correctBI_Y);
            GamePlay.bottomMenu.setPosition(BIM_MENU_SYSTEM, 670 + correctBI_X, 583 + correctBI_Y);
        });

        window.addEventListener("mouseup", (e) => {
            if (typeof RedStone.dragSkill === "number") {
                const rect = new Rect();
                const index = rectSkillSlots.findIndex(slot => {
                    rect.set(slot.x1, slot.y1, slot.x2, slot.y2);
                    rect.add(correctBI_X, correctBI_Y);
                    return rect.isIn(e.pageX, e.pageY);
                });
                if (index >= 4) {
                    RedStone.hero.quickSkills[RedStone.hero.currentQuickSkillSlot][index - 4][RedStone.hero.job % 2] = RedStone.dragSkill;
                    RedStone.hero.quickSkillsEachJob[RedStone.hero.job] = RedStone.hero.quickSkills;
                    SaveData.save();
                }
                RedStone.dragSkill = null;
            }
        });

        window.addEventListener("keydown", (e) => {
            const index = quickSlotShotKey.indexOf(e.key.toUpperCase());
            if (index !== -1) {
                const ability = RedStone.hero.getQuickSkill(index);

                if (!ability) return;

                const skill = ability.getSkill();

                if (ability.isCastGroundSkill() || ActorManager.focusActor_tmp) {
                    RedStone.hero.useSkillToTarget(skill, ActorManager.focusActor_tmp)
                }
            }

            if (e.key === "Escape") {
                window.dispatchEvent(new CustomEvent("activeModalChange", { detail: null }));
            }
        })
    }

    static drawBottomInterface() {
        if (!RedStone.initialized) return;

        //

        ImageManager.gameBottomInterface.put(
            RedStone.mainCanvas.interfaceContainer,
            correctBI_X,
            window.innerHeight - 108,
            BII_MAIN
        );

        // TODO: draw chat

        GamePlay.bottomMenu.draw();

        {
            const leftBlockSprite = new PIXI.Sprite(ImageManager.packedGameInterface.getPixiTexture("interface2_0308.png"));
            const rightBlockSprite = new PIXI.Sprite(ImageManager.packedGameInterface.getPixiTexture("interface2_0309.png"));

            leftBlockSprite.position.set(correctBI_X - 73, window.innerHeight - 108);
            rightBlockSprite.position.set(correctBI_X + 800, window.innerHeight - 108);

            RedStone.mainCanvas.interfaceContainer.addChild(leftBlockSprite, rightBlockSprite);
        }

        for (let i = 0; i < 10; i++) {
            const index = RedStone.hero.quickSkills[RedStone.hero.currentQuickSkillSlot][i][RedStone.hero.job % 2];

            //

            const ability = RedStone.hero.getQuickSkill(i);

            // ability && console.log(ability);

            if (!ability) continue;

            const skill = ability.getSkill();

            // if (!skill || ability.level === 0) {
            //     RedStone.hero.setQuickSlotAbility(0xffff, i);
            //     continue;
            // }

            const pos = new Pos();

            pos.set(rectSkillSlots[4 + i].x1 + correctBI_X, rectSkillSlots[4 + i].y1 + correctBI_Y);

            const texture = CommonUI.smiIconSkill.getPixiTexture(skill.iconIndex);
            const sprite = new PIXI.Sprite(texture);

            sprite.position.set(pos.x, pos.y);

            RedStone.mainCanvas.interfaceContainer.addChild(sprite);

            //

            if (true/* isDisplayShotKey */) {
                // let stateUseSkill = 

                //

                const text = new PIXI.BitmapText(quickSlotShotKey[i], {
                    fontName: "ShotKey"
                });
                text.position.set(pos.x, pos.y);

                const rectangle = PIXI.Sprite.from(PIXI.Texture.WHITE);
                rectangle.width = 9;
                rectangle.height = 11;
                rectangle.tint = 0;
                rectangle.position.set(pos.x, pos.y + 1);

                RedStone.mainCanvas.interfaceContainer.addChild(rectangle, text);
            }
        }

        ImageManager.gameBottomInterface.put(
            RedStone.mainCanvas.interfaceContainer,
            283 + correctBI_X,
            521 + correctBI_Y,
            BII_QUICK_SKILL_SLOT0, // BII_QUICK_SKILL_SLOT0 + hero.currentQuickSkillSlot

        );

        {
            const width = ImageManager.gameBottomInterface.getSpriteWidth(BII_RED_STONE_01);
            const bloodStoneWidth = width; // hero.hp * width / hero.getMaxHP();
            const hpGuageFrameCount = 16;
            const bloodStoneImage = BII_RED_STONE_01 + ~~((RedStone.mainCanvas.frameCounter / 12) % 16);

            // use putClippedImage instead
            ImageManager.gameBottomInterface.put(
                RedStone.mainCanvas.interfaceContainer,
                297 + correctBI_X,
                542 + correctBI_Y,
                bloodStoneImage
            );
        }

        {
            const width = ImageManager.gameBottomInterface.getSpriteWidth(BII_CP_LEVEL_MINUS_01);
            const maxCP = 100; // temp, hero.getMaxCP();
            const cp = 100; // temp, hero.cp;
            const cpLevel = 5; // temp, Math.max(getCPLevel(cp), 0);
            const cpGuageAnmFrameCount = 16;
            const cpGuageFrameCount = 16 * 2 + 3;
            const cpGuageImage = BII_CP_LEVEL_MINUS_01 + cpLevel * cpGuageFrameCount + ~~((RedStone.mainCanvas.frameCounter / 12) % cpGuageAnmFrameCount);
            const guageWidth = Math.min(cp * width / maxCP, width);

            if (cpLevel > 0) {
                // temp
                ImageManager.gameBottomInterface.put(
                    RedStone.mainCanvas.interfaceContainer,
                    330 + correctBI_X,
                    562 + correctBI_Y,
                    cpGuageImage
                );
            }

            ImageManager.gameBottomInterface.put(
                RedStone.mainCanvas.interfaceContainer,
                289 + correctBI_X,
                564 + correctBI_Y,
                cpGuageImage + cpGuageAnmFrameCount,
            );
        }
    }

    static handleCallback = (event, menu) => {
        if (event !== "click") return;

        const dispatchEvent = () => {
            window.dispatchEvent(new CustomEvent("activeModalChange", { detail: menu }));
        }

        switch (menu) {
            case BIM_RUN:
            case BIM_WALK:
                //
                break;

            case BIM_MENU_STATUS:
                dispatchEvent();
                break;

            case BIM_MENU_INVENTORY:
                dispatchEvent();
                break;

            case BIM_MENU_SKILL:
                dispatchEvent();
                break;

            case BIM_MENU_QUEST:
                dispatchEvent();
                break;

            case BIM_MENU_FRIEND:
                dispatchEvent();
                break;

            case BIM_MENU_GUILD:
                dispatchEvent();
                break;

            case BIM_MENU_PARTY:
                dispatchEvent();
                break;

            case BIM_MENU_SYSTEM:
                dispatchEvent();
                break;

            case BIM_TRANS:
                //
                break;

            case BIM_SITDOWN:
            case BIM_STAND_UP:
                //
                break;

            case BIM_QUICK_SKILL1:
            case BIM_QUICK_SKILL2:
            case BIM_QUICK_SKILL3:
            case BIM_QUICK_SKILL4:
            case BIM_QUICK_SKILL5:
            case BIM_QUICK_SKILL6:
            case BIM_QUICK_SKILL7:
            case BIM_QUICK_SKILL8:
            case BIM_QUICK_SKILL9:
            case BIM_QUICK_SKILL10:
                {

                    //
                    break;
                }
            case BIM_QUICK_SKILL_UP:
                //
                break;
            case BIM_QUICK_SKILL_DOWN:
                //
                break;
            case BIM_LEFT_SKILL1:
                break;
            case BIM_LEFT_SKILL2:
                //
                break;
            case BIM_RIGHT_SKILL1:
                break;
            case BIM_RIGHT_SKILL2:
                break;

            case BIM_QUICK_ITEM1:
            case BIM_QUICK_ITEM2:
            case BIM_QUICK_ITEM3:
            case BIM_QUICK_ITEM4:
            case BIM_QUICK_ITEM5:
                {
                    //
                }

            case BIM_QUICK_ITEM_RELOAD:
                //
                break;
        }
    }
}