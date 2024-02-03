import BufferReader, { TYPE_DEF } from "../utils/BufferReader";

export const REGSDHEADER = "하늘 스프라이트 데이터";
export const REGSDHEADER2 = "하늘 스프라이트 데이터 2";
export const REGSADHEADER = "하늘 스프라이트 에니메이션 데이터";
export const REGSADHEADER2 = "하늘 스프라이트 에니메이션 데이터 2";

export const EVENT_DAMAGE = 1;
export const EVENT_TRIGGER = 2;
export const EVENT_LOOP_START = 4;
export const EVENT_LOOP_END = 8;
export const EVENT_STEP = 16;

export class SDHEADER {
    /**
     * @param {BufferReader} br 
     */
    constructor(br) {
        this.size = br.readInt32LE();
        this.reg = br.readString(40, "kr");
        this.maxSpriteWidth = br.readUInt16LE();
        this.maxSpriteHeight = br.readUInt16LE();
        this.maxShadowWidth = br.readUInt16LE();
        this.maxShadowHeight = br.readUInt16LE();
        this.buffer = br.readArray(2, TYPE_DEF.UINT8);
        this.bpp = br.readUInt8();

        br.offset += 1; // padding
        
        this.imageCount = br.readUInt16LE();
        this.alpha = br.readUInt8();
        this.bOutline = br.readUInt8() === 1;
        this.bShadow = br.readUInt8() === 1;

        br.offset += 3; // padding
    }
}

export class SADHEADER {
    /**
     * @param {BufferReader} br 
     */
    constructor(br) {
        this.size = br.readInt32LE();
        this.reg = br.readString(40, "kr");
        this.maxSpriteWidth = br.readUInt16LE();
        this.maxSpriteHeight = br.readUInt16LE();
        this.maxShadowWidth = br.readUInt16LE();
        this.maxShadowHeight = br.readUInt16LE();
        this.buffer = br.readArray(2, TYPE_DEF.UINT8);
        this.anmCount = br.readUInt8();
        this.byAlpha = br.readUInt8();
        this.imageCount = br.readUInt16LE();
        this.anmType = br.readUInt8();
        this.crashType = br.readUInt8();
        this.bOutline = br.readUInt8() === 1;
        this.bShadow = br.readUInt8() === 1;
        this.bHalf = br.readUInt8() === 1;
        this.bpp = br.readUInt8();
    }
}

// Crash box type
export const CRASH_NONE = 0; // None
export const CRASH_ONE = 1; // There is one.
export const CRASH_PER_ANM = 2; // One per animation.
export const CRASH_PER_DIRECT = 3; // One per direction.
export const CRASH_PER_IMAGE = 4; // One per image.

// Animation type
export const ANI_CUSTOM = 0; // No normal animation direction.
export const ANI_DIRECT2X = 1; // Only 2 directions, left and right.
export const ANI_DIRECT2Y = 2; // Only 2 directions up and down.
export const ANI_DIRECT4 = 3; // 4 directions
export const ANI_DIRECT8 = 4; // 8 directions
export const ANI_DIRECT16 = 5; // 16th direction

// 2 directions left and right
export const _2DIRECT_W = 0;
export const _2DIRECT_E = 1;

// 2 directions up and down
export const _2DIRECT_N = 0;
export const _2DIRECT_S = 1;

// 4-way
export const _4DIRECT_N = 0;
export const _4DIRECT_E = 1;
export const _4DIRECT_S = 2;
export const _4DIRECT_W = 3;

// 8-way
export const _8DIRECT_N = 0;
export const _8DIRECT_NE = 1;
export const _8DIRECT_E = 2;
export const _8DIRECT_SE = 3;
export const _8DIRECT_S = 4;
export const _8DIRECT_SW = 5;
export const _8DIRECT_W = 6;
export const _8DIRECT_NW = 7;

// 16-direction
export const _16DIRECT_N = 0;
export const _16DIRECT_NNE = 1;
export const _16DIRECT_NE = 2;
export const _16DIRECT_ENE = 3;
export const _16DIRECT_E = 4;
export const _16DIRECT_ESE = 5;
export const _16DIRECT_SE = 6;
export const _16DIRECT_SSE = 7;
export const _16DIRECT_S = 8;
export const _16DIRECT_SSW = 9;
export const _16DIRECT_SW = 10;
export const _16DIRECT_WSW = 11;
export const _16DIRECT_W = 12;
export const _16DIRECT_WNW = 13;
export const _16DIRECT_NW = 14;
export const _16DIRECT_NNW = 15;

export const FlipedDirect = [
    [
        [0],        //    Not flipped
        [_2DIRECT_E, _2DIRECT_W],
        [_2DIRECT_N, _2DIRECT_S],
        [_4DIRECT_N, _4DIRECT_E, _4DIRECT_S, _4DIRECT_W],
        [_8DIRECT_N, _8DIRECT_NE, _8DIRECT_E, _8DIRECT_SE, _8DIRECT_S, _8DIRECT_SW, _8DIRECT_W, _8DIRECT_NW],
        [_16DIRECT_N, _16DIRECT_NNE, _16DIRECT_NE, _16DIRECT_ENE, _16DIRECT_E, _16DIRECT_ESE, _16DIRECT_SE, _16DIRECT_SSE,
            _16DIRECT_S, _16DIRECT_SSW, _16DIRECT_SW, _16DIRECT_WSW, _16DIRECT_W, _16DIRECT_WNW, _16DIRECT_NW, _16DIRECT_NNW],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
            32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63],
    ],
    [
        [0],        //    Flip
        [_2DIRECT_E, _2DIRECT_E],
        [_2DIRECT_N, _2DIRECT_S],
        [_4DIRECT_N, _4DIRECT_E, _4DIRECT_S, _4DIRECT_E],
        [_8DIRECT_N, _8DIRECT_NE, _8DIRECT_E, _8DIRECT_SE, _8DIRECT_S, _8DIRECT_SE, _8DIRECT_E, _8DIRECT_NE],
        [_16DIRECT_N, _16DIRECT_NNE, _16DIRECT_NE, _16DIRECT_ENE, _16DIRECT_E, _16DIRECT_ESE, _16DIRECT_SE, _16DIRECT_SSE,
            _16DIRECT_S, _16DIRECT_SSE, _16DIRECT_SE, _16DIRECT_ESE, _16DIRECT_E, _16DIRECT_ENE, _16DIRECT_NE, _16DIRECT_NNE],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
            32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63],
    ]
];