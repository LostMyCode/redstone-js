import * as PIXI from "pixi.js";
import BufferReader from "../../utils/BufferReader";
import CanvasManager from "../../utils/CanvasManager";
import { getRGBA15bit, getRGBA16bit, logger } from "../../utils/RedStoneRandom";

// Special Thanks: 今日のこぅくん

const SHADOW_PIXEL_DATA = [7, 7, 7, 0x80];
const OUTLINE_PIXEL_DATA = [1, 1, 1, 0xff];

class Texture {
    constructor(fileName, textureFileBuffer) {
        /**
         * @type {String}
         */
        this.fileName = fileName;
        /**
         * @type {Buffer}
         */
        this.textureFileBuffer = textureFileBuffer;
        /**
         * @type {String}
         */
        this.fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);

        this.paletteData = [];
        this.selectedPaletteNumber = null;

        /**
         * @type {BufferReader}
         */
        this.reader = new BufferReader(textureFileBuffer);

        this.isNewType = false;
        this.isHighColor = false;
        this.isExistShadow = false;
        this.isExistOutline = false;
        this.isZeroFillShadowData = false;
        this.frameCount = 0;

        this.shape = {
            body: new EffectShape(),
            shadow: new EffectShape(),
            outline: new EffectShape()
        };
        this.maxSizeInfo = {
            left: 0,
            top: 0,
            outerWidth: 0,
            outerHeight: 0
        };

        this.isAnalyzeFailed = false;
        this.isAnalyzed = false;

        // Draw
        this.drawFrame = 0;

        this.analyze();
        // this.createTextureCanvases();
    }

    analyze() {
        const reader = this.reader;
        this.isNewType = reader.readUInt32LE() === 0x12344321;

        if (this.isNewType) {
            this.decodeBuffer();
        }

        this.analyzeColorType();
        this.analyzeFrameCount();
        this.analyzePaletteData();
        this.analyzeBody();
        if (this.checkShadowExist()) {
            this.analyzeShadow();
        }
        if (this.checkOutlineExist()) {
            this.analyzeOutline();
        }
        this.evaluateMaxSize();

        if (this.fileExtension === "sad") {
            this.analyzeAction();
        }

        // this.createTextureCanvases();
        this.isAnalyzed = true;
    }

    decodeBuffer() {
        const buffer = this.textureFileBuffer;

        const ENCODE_KEY_LENGTH = 326;
        const ENCODE_START_ADDRESS = 0x1c;

        const limitAddress = buffer.readUInt32LE(0x4);
        const xorKey = new Int16Array(ENCODE_KEY_LENGTH);
        const numCounts = [];

        for (let i = 0; i < ENCODE_KEY_LENGTH; i++) {
            const a = new Array(256);
            a.fill(0);
            numCounts.push(a);
        }

        for (let i = ENCODE_START_ADDRESS, j = null; i < limitAddress; i++) {
            j = (i - ENCODE_START_ADDRESS) % ENCODE_KEY_LENGTH;
            numCounts[j][this.textureFileBuffer[i]]++;
        }

        for (let i = 0; i < ENCODE_KEY_LENGTH; i++) {
            xorKey[i] = numCounts[i].indexOf(Math.max.apply(null, numCounts[i]));
        }

        for (let i = ENCODE_START_ADDRESS, j = null; i < limitAddress; i++) {
            j = (i - ENCODE_START_ADDRESS) % ENCODE_KEY_LENGTH;
            this.textureFileBuffer[i] = this.textureFileBuffer[i] ^ xorKey[j];
        }
    }

    analyzeColorType() {
        const buffer = this.textureFileBuffer;

        switch (this.fileExtension) {
            case "mpr": {
                this.isHighColor = true;
                return;
            }
            case "smi": {
                if (buffer.readUInt8(0x3C) === 0x10) {
                    this.isHighColor = true;
                    return;
                }
            }
            case "sd": {
                if (buffer.readUInt8(0x36) === 0x10) {
                    this.isHighColor = true;
                    return;
                }
            }
        }

        if (!this.isNewType && buffer.readUInt8(0x3f) === 0x10) {
            this.isHighColor = true;
            return;
        }

        if (!this.isNewType) return;

        // new type
        if (buffer.readUInt8(0x1c) === 0x10) {
            this.isHighColor = true;
            return;
        }

        const tmpAddress = buffer.readUInt32LE(0x4);

        for (let i = tmpAddress; ;) {
            if (buffer.readUInt8(i) === 0x00) {
                i += 8;
                continue;
            }

            if (buffer.readUInt8(i + 9) === 0x00 && buffer.readUInt8(i + 11) <= 0x04) {
                this.isHighColor = true;
            } else {
                this.isHighColor = false;
            }
            return;
        }
    }

    analyzeFrameCount() {
        const buffer = this.textureFileBuffer;

        if (this.isNewType) {
            let tempAddress = buffer.readUInt32LE(0x8);
            while (true) {
                if (buffer.readUInt32LE(tempAddress) < 0x100) break;
                tempAddress += 40;
            }
            const unityCount = buffer.readUInt8(tempAddress);
            this.frameCount = buffer.readUInt32LE(tempAddress + (unityCount + 1) * 4);
        } else {
            if (this.fileExtension === "smi") {
                this.frameCount = buffer.readUInt16LE(0x40);
            }
            else if (this.fileExtension === "mpr") {
                this.frameCount = buffer.readUInt16LE(0x28);
            }
            else {
                this.frameCount = buffer.readUInt16LE(0x38);
            }

        }
    }

    analyzePaletteData() {
        if (this.isHighColor) return;

        const buffer = this.textureFileBuffer;
        let paletteDataStart;

        if (this.isNewType) {
            paletteDataStart = buffer.readUInt16LE(0x4) - ((this.frameCount + 1) * 4 * 3) - 512;
        } else {
            paletteDataStart = 0x40;
        }

        this.reader.offset = paletteDataStart;

        for (let i = 0; i < 512; i++) {
            this.paletteData[i] = this.reader.readUInt8();
        }
    }

    analyzeBody() {
        switch (this.fileExtension) {
            case "smi":
                this.analyzeBodySmi()
                break;

            case "mpr":
                this.analyzeBodyMpr()
                break;
            default:
                if (this.isNewType) {
                    this.analyzeBodyNewType()
                } else {
                    this.analyzeBodyOldType()
                }
                break;
        }
    }

    analyzeBodySmi() {
        const reader = this.reader;
        const offsetsInfoStart = 0x44;
        const spriteDataStart = offsetsInfoStart + 4 + (this.frameCount * 4);
        const pixelDataLength = 2;

        // Get offsets
        for (let i = 0; i < this.frameCount; i++) {
            reader.offset = offsetsInfoStart + (i * 4);
            this.shape.body.startOffset[i] = spriteDataStart + (reader.readUInt32LE() * pixelDataLength);
            this.shape.body.endOffset[i] = spriteDataStart + (reader.readUInt32LE() * pixelDataLength);
        }

        // Get body info
        for (let i = 0; i < this.frameCount; i++) {
            reader.offset = this.shape.body.startOffset[i];
            this.shape.body.width[i] = reader.readUInt16LE();
            this.shape.body.height[i] = reader.readUInt16LE();
            this.shape.body.left[i] = 0;
            this.shape.body.top[i] = 0;
        }
    }

    analyzeBodyMpr() {
        const reader = this.reader;
        reader.offset = 0x2a;
        const spriteWidth = reader.readUInt16LE();
        const spriteHeight = reader.readUInt16LE();
        const spriteDataStart = 0x2e;
        const pixelDataLength = 2;

        // Get offsets
        for (let i = 0; i < this.frameCount; i++) {
            this.shape.body.startOffset[i] = spriteDataStart + (i * spriteWidth * spriteHeight * pixelDataLength);
            this.shape.body.endOffset[i] = spriteDataStart + ((i + 1) * spriteWidth * spriteHeight * pixelDataLength);
        }

        // Get body info
        for (let i = 0; i < this.frameCount; i++) {
            this.shape.body.width[i] = spriteWidth;
            this.shape.body.height[i] = spriteHeight;
            this.shape.body.left[i] = 0;
            this.shape.body.top[i] = 0;
        }
    }

    analyzeBodyNewType() {
        const reader = this.reader;
        const buffer = this.textureFileBuffer;
        const spriteDataStart = buffer.readUInt16LE(0x4);
        const pixelDataLength = this.isHighColor ? 2 : 1;
        let tmpAddress = spriteDataStart;
        let unityCount;

        // frameCountが信頼出来ないため
        try {
            for (let i = 0; i < this.frameCount; i++) {
                reader.offset = tmpAddress;
                this.shape.body.startOffset[i] = tmpAddress;
                this.shape.body.width[i] = reader.readUInt16LE();
                this.shape.body.height[i] = reader.readUInt16LE();
                this.shape.body.left[i] = reader.readInt16LE();
                this.shape.body.top[i] = reader.readInt16LE();

                if (this.shape.body.width[i] === 0 || this.shape.body.height[i] === 0) {
                    this.shape.body.width[i] = 0;
                    this.shape.body.height[i] = 0;
                    this.shape.body.left[i] = 0;
                    this.shape.body.top[i] = 0;
                }

                tmpAddress += 8;

                // このフレームデータの最後までスキップ
                for (let j = 0; j < this.shape.body.height[i]; j++) {
                    reader.offset = tmpAddress;
                    if (this.isHighColor) {
                        unityCount = reader.readUInt16LE();
                    } else {
                        unityCount = reader.readUInt8();
                    }
                    while (unityCount--) {
                        reader.offset = tmpAddress + (2 * pixelDataLength);
                        if (this.isHighColor) {
                            tmpAddress += (reader.readUInt16LE() + 2) * pixelDataLength;
                        } else {
                            tmpAddress += (reader.readUInt8() + 2) * pixelDataLength;
                        }
                    }
                    tmpAddress += pixelDataLength;
                }

                this.shape.body.endOffset[i] = tmpAddress;
            }
        } catch (e) {
            logger.error(e);
            this.isAnalyzeFailed = true;
        }
    }

    analyzeBodyOldType() {
        const reader = this.reader;
        const offsetsInfoStart = this.isHighColor ? 0x40 : 0x240;
        const spriteDataStart = offsetsInfoStart + 4 + (this.frameCount * 4);
        const pixelDataLength = this.isHighColor ? 2 : 1;

        // Get offsets
        for (let i = 0; i < this.frameCount; i++) {
            reader.offset = offsetsInfoStart + (i * 4);
            this.shape.body.startOffset[i] = spriteDataStart + (reader.readUInt32LE() * pixelDataLength);
            this.shape.body.endOffset[i] = spriteDataStart + (reader.readUInt32LE() * pixelDataLength);
        }

        // Get body info
        for (let i = 0; i < this.frameCount; i++) {
            reader.offset = this.shape.body.startOffset[i];
            this.shape.body.width[i] = reader.readUInt16LE();
            this.shape.body.height[i] = reader.readUInt16LE();
            this.shape.body.left[i] = reader.readInt16LE();
            this.shape.body.top[i] = reader.readInt16LE();

            if (this.shape.body.width[i] === 0 || this.shape.body.height[i] === 0) {
                this.shape.body.width[i] = 0;
                this.shape.body.height[i] = 0;
                this.shape.body.left[i] = 0;
                this.shape.body.top[i] = 0;
            }
        }
    }

    checkShadowExist() {
        if (!["sad", "sd", "rso", "rfo", "rbd"].includes(this.fileExtension)) {
            this.isExistShadow = false;
            return false;
        }

        if (this.isNewType) {
            return this.checkShadowExistNewType();
        } else {
            return this.checkShadowExistOldType();
        }
    }

    checkShadowExistNewType() {
        const buffer = this.textureFileBuffer;
        const reader = this.reader;
        const spriteDataStart = this.shape.body.endOffset[this.frameCount - 1];
        let tmpAddress = spriteDataStart;
        let spriteHeight, unityCount;

        try {
            // フレームデータの末尾までスキップ
            for (let i = 0; i < this.frameCount; i++) {
                reader.offset = tmpAddress;

                spriteHeight = reader.readUInt16LE();
                spriteHeight = reader.readUInt16LE();

                tmpAddress += 8;

                for (let j = 0; j < spriteHeight; j++) {
                    unityCount = buffer.readUInt8(tmpAddress);
                    while (unityCount--) {
                        tmpAddress += 2;
                    }
                    tmpAddress += 1;
                }
            }

            if (tmpAddress >= buffer.readUInt32LE(0x8)) {
                this.isExistShadow = false;
                return false;
            }
        } catch (e) {
            logger.error(e);
            this.isExistShadow = false;
            this.isAnalyzeFailed = true;
            return false;
        }

        this.isExistShadow = true;
        return true;
    }

    checkShadowExistOldType() {
        const buffer = this.textureFileBuffer;
        const offsetsInfoStart = this.shape.body.endOffset[this.frameCount - 1];
        const spriteDataStart = offsetsInfoStart + 4 + (this.frameCount * 4);
        let lastOffset = 0;

        // 影データのオフセット情報がない
        if (buffer.readUInt32LE(offsetsInfoStart + 4) === 0 && buffer.readUInt32LE(offsetsInfoStart + 4 + 4) === 0) {
            this.isExistShadow = false;
            this.isZeroFillShadowData = true;
            return false;
        }

        // 映像データのあとに影と輪郭のデータがあるが、１つしかない場合はそれは輪郭データである
        lastOffset = buffer.readUInt32LE(offsetsInfoStart + ((this.frameCount) * 4)); // 最後のオフセット情報

        if (spriteDataStart + lastOffset >= buffer.byteLength) {
            this.isExistShadow = false;
            return false;
        }

        // TODO: この部分の必要性を確認する
        if (buffer.readUInt32LE(spriteDataStart + lastOffset + 4) === 0 && buffer.readUInt32LE(spriteDataStart + lastOffset + 4 + 4) === 0) {
            this.isExistShadow = false;
            return false;
        }

        this.isExistShadow = true;
        return true;
    }

    analyzeShadow() {
        if (!this.isExistShadow) {
            return;
        }

        if (this.isNewType) {
            this.analyzeShadowNewType();
        } else {
            this.analyzeShadowOldType();
        }
    }

    analyzeShadowNewType() {
        const reader = this.reader;
        const buffer = this.textureFileBuffer;
        const spriteDataStart = this.shape.body.endOffset[this.frameCount - 1];
        let tmpAddress = spriteDataStart;

        for (let i = 0; i < this.frameCount; i++) {
            reader.offset = tmpAddress;
            this.shape.shadow.startOffset[i] = tmpAddress;
            this.shape.shadow.width[i] = reader.readUInt16LE();
            this.shape.shadow.height[i] = reader.readUInt16LE();
            this.shape.shadow.left[i] = reader.readInt16LE();
            this.shape.shadow.top[i] = reader.readInt16LE();

            if (this.shape.shadow.width[i] === 0 || this.shape.shadow.height[i] === 0) {
                this.shape.shadow.width[i] = 0;
                this.shape.shadow.height[i] = 0;
                this.shape.shadow.left[i] = 0;
                this.shape.shadow.top[i] = 0;
            }

            tmpAddress += 8;

            // このフレームデータの最後までスキップ
            for (let j = 0; j < this.shape.shadow.height[i]; j++) {
                let unityCount = buffer.readUInt8(tmpAddress);
                while (unityCount--) {
                    tmpAddress += 2;
                }
                tmpAddress += 1;
            }

            this.shape.shadow.endOffset[i] = tmpAddress;
        }
    }

    analyzeShadowOldType() {
        const reader = this.reader;
        const offsetsInfoStart = this.shape.body.endOffset[this.frameCount - 1];
        const spriteDataStart = offsetsInfoStart + 4 + (this.frameCount * 4);

        // Get offsets
        for (let i = 0; i < this.frameCount; i++) {
            reader.offset = offsetsInfoStart + (i * 4);
            this.shape.shadow.startOffset[i] = spriteDataStart + reader.readUInt32LE();
            this.shape.shadow.endOffset[i] = spriteDataStart + reader.readUInt32LE();
        }

        // Get shadow info
        for (let i = 0; i < this.frameCount; i++) {
            reader.offset = this.shape.shadow.startOffset[i];
            this.shape.shadow.width[i] = reader.readUInt16LE();
            this.shape.shadow.height[i] = reader.readUInt16LE();
            this.shape.shadow.left[i] = reader.readInt16LE();
            this.shape.shadow.top[i] = reader.readInt16LE();

            if (this.shape.shadow.width[i] === 0 || this.shape.shadow.height[i] === 0) {
                this.shape.shadow.width[i] = 0;
                this.shape.shadow.height[i] = 0;
                this.shape.shadow.left[i] = 0;
                this.shape.shadow.top[i] = 0;
            }
        }
    }

    checkOutlineExist() {
        if (this.fileExtension !== "sad" && this.fileExtension !== "sd" && this.fileExtension !== "rso") {
            this.isExistOutline = false;
            return this.isExistOutline;
        }
        this.isExistOutline = true;
        return this.isExistOutline;
    }

    analyzeOutline() {
        if (!this.isExistOutline) {
            return;
        }

        if (this.isNewType) {
            this.analyzeOutlineNewType();
        } else {
            this.analyzeOutlineOldType();
        }
    }

    analyzeOutlineNewType() {
        const reader = this.reader;
        const buffer = this.textureFileBuffer;
        let tmpAddress, spriteDataStart;

        if (this.isExistShadow) {
            spriteDataStart = this.shape.shadow.endOffset[this.frameCount - 1];
        } else {
            spriteDataStart = this.shape.body.endOffset[this.frameCount - 1];
        }

        tmpAddress = spriteDataStart;

        // frameCountが信頼出来ないため
        try {
            for (let i = 0; i < this.frameCount; i++) {
                reader.offset = tmpAddress;
                this.shape.outline.startOffset[i] = tmpAddress;
                this.shape.outline.width[i] = reader.readUInt16LE();
                this.shape.outline.height[i] = reader.readUInt16LE();
                this.shape.outline.left[i] = reader.readInt16LE();
                this.shape.outline.top[i] = reader.readInt16LE();

                if (this.shape.outline.width[i] === 0 || this.shape.outline.height[i] === 0) {
                    this.shape.outline.width[i] = 0;
                    this.shape.outline.height[i] = 0;
                    this.shape.outline.left[i] = 0;
                    this.shape.outline.top[i] = 0;
                }

                tmpAddress += 8;

                // このフレームデータの最後までスキップ
                for (let j = 0; j < this.shape.outline.height[i]; j++) {
                    let unityCount = buffer.readUInt8(tmpAddress);
                    while (unityCount--) {
                        tmpAddress += 2;
                    }
                    tmpAddress += 1;
                }

                this.shape.outline.endOffset[i] = tmpAddress;
            }
        } catch (e) {
            logger.error(e);
            this.isExistOutline = false;
            this.isAnalyzeFailed = true;
            return;
        }
    }

    analyzeOutlineOldType() {
        const reader = this.reader;
        let offsetsInfoStart, spriteDataStart;

        if (this.isExistShadow) {
            offsetsInfoStart = this.shape.shadow.endOffset[this.frameCount - 1];
            spriteDataStart = offsetsInfoStart + 4 + (this.frameCount * 4);
        } else {
            offsetsInfoStart = this.shape.body.endOffset[this.frameCount - 1];

            if (this.isZeroFillShadowData) {
                offsetsInfoStart += this.frameCount * 4 + 4;
            }

            spriteDataStart = offsetsInfoStart + 4 + (this.frameCount * 4);
        }

        // Get offsets
        for (let i = 0; i < this.frameCount; i++) {
            reader.offset = offsetsInfoStart + (i * 4);
            this.shape.outline.startOffset[i] = spriteDataStart + reader.readUInt32LE();
            this.shape.outline.endOffset[i] = spriteDataStart + reader.readUInt32LE();
        }

        // Get outline info
        for (let i = 0; i < this.frameCount; i++) {
            reader.offset = this.shape.outline.startOffset[i];
            this.shape.outline.width[i] = reader.readUInt16LE();
            this.shape.outline.height[i] = reader.readUInt16LE();
            this.shape.outline.left[i] = reader.readInt16LE();
            this.shape.outline.top[i] = reader.readInt16LE();

            if (this.shape.outline.width[i] === 0 || this.shape.outline.height[i] === 0) {
                this.shape.outline.width[i] = 0;
                this.shape.outline.height[i] = 0;
                this.shape.outline.left[i] = 0;
                this.shape.outline.top[i] = 0;
            }
        }
    }

    analyzeAction() {
        if (this.fileExtension !== "sad") return;

        const byteLen = this.textureFileBuffer.byteLength;
        const br = new BufferReader(this.textureFileBuffer);

        let actionCount = 0;
        let checkCount = 0;
        let hasAction = false;
        while (true) {
            br.offset = byteLen - 64 * (actionCount + 1);
            const actionName = br.readString(64); // its not correct length though

            const m = actionName.match(/\d{2}/); // e.g. 01walk, 00, 02_run, ...
            if (m) {
                hasAction = true;
            } else if (hasAction) {
                break;
            } else {
                if (checkCount < 3) { // check atleast 3 times coz there may be action name that doesnt match [00name] pattern
                    checkCount++;
                } else {
                    hasAction = false;
                    break;
                }
            }

            actionCount++;
        }

        if (!hasAction || !actionCount) return;

        br.offset = byteLen;
        br.offset -= 64 * actionCount;
        br.offset -= 4; // 0 0 0 0
        br.offset -= 4 * (actionCount + 1); // actionStartFrameIndexes and lastFrame - 1 index
        br.offset -= 4; // action count

        const c = br.readUInt32LE();
        if (actionCount !== c) {
            throw new Error(`Failed to analyze action info. action count didnt match. File: ${this.fileName}, Count: ${actionCount} vs ${c}`);
        }

        const actions = new Array(actionCount);

        for (let i = 0; i < actionCount; i++) {
            actions[i] = { startFrameIndex: br.readUInt32LE(), index: i };
        }

        br.offset += 4; // last frame index
        br.offset += 4; // 0 0 0 0

        for (let i = 0; i < actionCount; i++) {
            actions[i].name = br.readString(64);

            // calc and insert action frame count
            const nextAction = actions[i + 1];
            if (nextAction) {
                actions[i].frameCount = nextAction.startFrameIndex - actions[i].startFrameIndex;
            } else {
                // theres no next action
                actions[i].frameCount = this.frameCount - actions[i].startFrameIndex;
            }
        }

        this.actions = actions;
    }

    evaluateMaxSize() {
        const shapeOuterWidth = [];
        const shapeOuterHeight = [];
        const shadowOuterWidth = [];
        const shadowOuterHeight = [];
        const outlineOuterWidth = [];
        const outlineOuterHeight = [];

        // left, top
        this.maxSizeInfo.left = Math.max(
            Math.max.apply(Math, this.shape.body.left),
            this.isExistShadow ? Math.max.apply(Math, this.shape.shadow.left) : 0,
            this.isExistOutline ? Math.max.apply(Math, this.shape.outline.left) : 0
        );
        this.maxSizeInfo.top = Math.max(
            Math.max.apply(Math, this.shape.body.top),
            this.isExistShadow ? Math.max.apply(Math, this.shape.shadow.top) : 0,
            this.isExistOutline ? Math.max.apply(Math, this.shape.outline.top) : 0
        );

        // データ準備
        for (let i = 0; i < this.frameCount; i++) {
            shapeOuterWidth[i] = this.shape.body.width[i] + this.maxSizeInfo.left - this.shape.body.left[i];
            shapeOuterHeight[i] = this.shape.body.height[i] + this.maxSizeInfo.top - this.shape.body.top[i];

            if (this.isExistShadow) {
                shadowOuterWidth[i] = this.shape.shadow.width[i] + this.maxSizeInfo.left - this.shape.shadow.left[i];
                shadowOuterHeight[i] = this.shape.shadow.height[i] + this.maxSizeInfo.top - this.shape.shadow.top[i];
            }

            if (this.isExistOutline) {
                outlineOuterWidth[i] = this.shape.outline.width[i] + this.maxSizeInfo.left - this.shape.outline.left[i];
                outlineOuterHeight[i] = this.shape.outline.height[i] + this.maxSizeInfo.top - this.shape.outline.top[i];
            }
        }

        // outerWidth, outerHeight
        this.maxSizeInfo.outerWidth = Math.max(
            Math.max.apply(Math, shapeOuterWidth),
            Math.max.apply(Math, shadowOuterWidth),
            Math.max.apply(Math, outlineOuterWidth)
        );
        this.maxSizeInfo.outerHeight = Math.max(
            Math.max.apply(Math, shapeOuterHeight),
            Math.max.apply(Math, shadowOuterHeight),
            Math.max.apply(Math, outlineOuterHeight)
        );
    }

    getCanvas(frameIndex, type = "body") {
        const shape = this.shape[type];

        if (shape.canvas[frameIndex]) {
            return shape.canvas[frameIndex];
        }

        const width = this.getIsUseMargin() ? this.maxSizeInfo.outerWidth : shape.width[frameIndex];
        const height = this.getIsUseMargin() ? this.maxSizeInfo.outerHeight : shape.height[frameIndex];

        const app = new PIXI.Application({
            width,
            height,
            backgroundColor: 0x1099bb,
            antialias: true
        });

        const texture = this.getPixiTexture(frameIndex, type);
        const sprite = new PIXI.Sprite(texture);
        const renderTexture = PIXI.RenderTexture.create({
            width: texture.width,
            height: texture.height,
            resolution: texture.resolution || 1
        });

        app.renderer.render(sprite, { renderTexture });

        const canvas = document.createElement('canvas');
        canvas.width = texture.width;
        canvas.height = texture.height;
        const ctx = canvas.getContext('2d');

        const pixels = app.renderer.extract.pixels(renderTexture);
        const imageData = ctx.createImageData(texture.width, texture.height);
        imageData.data.set(pixels);
        ctx.putImageData(imageData, 0, 0);

        renderTexture.destroy();
        sprite.destroy();
        app.destroy();

        shape.canvas[frameIndex] = canvas;

        return canvas;
    }

    getPixiTexture(frameIndex, type = "body") {
        if (!this.isAnalyzed) this.analyze();

        const shape = this.shape[type];

        // Return from cache if available
        if (shape.textures[frameIndex]) {
            return shape.textures[frameIndex];
        }

        // Generate pixel data if not available
        if (!shape.pixelData[frameIndex]) {
            this.draw(frameIndex, type);
        }

        const pixelData = shape.pixelData[frameIndex];
        if (!pixelData) {
            // Return empty texture for empty frames
            return PIXI.Texture.EMPTY;
        }

        const width = this.getIsUseMargin() ? this.maxSizeInfo.outerWidth : shape.width[frameIndex];
        const height = this.getIsUseMargin() ? this.maxSizeInfo.outerHeight : shape.height[frameIndex];

        const texture = PIXI.Texture.fromBuffer(pixelData, width, height);
        shape.textures[frameIndex] = texture; // Cache the texture

        return texture;
    }

    draw(frameIndex, type = "body") {
        const shape = this.shape[type];
        const width = this.getIsUseMargin() ? this.maxSizeInfo.outerWidth : shape.width[frameIndex];
        const height = this.getIsUseMargin() ? this.maxSizeInfo.outerHeight : shape.height[frameIndex];

        if (width === 0 || height === 0) {
            shape.pixelData[frameIndex] = null;
            return;
        }

        const pixelData = new Uint8ClampedArray(width * height * 4);

        switch (type) {
            case "body":
                this.drawBody(frameIndex, pixelData, width, height);
                break;
            case "shadow":
                this.drawShadow(frameIndex, pixelData, width, height);
                break;
            case "outline":
                this.drawOutline(frameIndex, pixelData, width, height);
                break;
        }

        shape.pixelData[frameIndex] = pixelData;
    }

    drawBody(frameIndex, pixelData, canvasWidth, canvasHeight) {
        if (!this.getIsShowBody()) {
            return;
        }

        switch (this.fileExtension) {
            case "smi":
            case "mpr":
                this.drawBodySmi(frameIndex, pixelData, canvasWidth, canvasHeight);
                break;
            default:
                if (this.isHighColor) {
                    this.drawBodyHighColor(frameIndex, pixelData, canvasWidth, canvasHeight);
                } else {
                    this.drawBodyLowColor(frameIndex, pixelData, canvasWidth, canvasHeight);
                }
        }
    }

    drawBodySmi(frameIndex, pixelData, canvasWidth, canvasHeight) {
        const reader = this.reader;
        const isUseOpacity = this.getIsUseOpacity();
        const isUseMargin = this.getIsUseMargin();

        const startOffset = this.shape.body.startOffset[frameIndex];
        const width = this.shape.body.width[frameIndex];
        const height = this.shape.body.height[frameIndex];
        const left = isUseMargin ? this.maxSizeInfo.left - this.shape.body.left[frameIndex] : 0;
        const top = isUseMargin ? this.maxSizeInfo.top - this.shape.body.top[frameIndex] : 0;

        let w, h, colorData1, colorData2;

        reader.offset = startOffset;

        if (this.fileExtension === "smi") {
            reader.offset += 4; // Skip shape info data
        }

        for (h = 0; h < height; h++) {
            for (w = 0; w < width; w++) {
                colorData2 = reader.readUInt8();
                colorData1 = reader.readUInt8();

                const [r, g, b, a] = getRGBA15bit(colorData1, colorData2, isUseOpacity);
                const pixelIndex = ((top + h) * canvasWidth + (left + w)) * 4;

                pixelData[pixelIndex] = r;
                pixelData[pixelIndex + 1] = g;
                pixelData[pixelIndex + 2] = b;
                pixelData[pixelIndex + 3] = a;
            }
        }
    }

    drawBodyHighColor(frameIndex, pixelData, canvasWidth, canvasHeight) {
        const reader = this.reader;
        const isUseOpacity = this.getIsUseOpacity();
        const isUseMargin = this.getIsUseMargin();

        const startOffset = this.shape.body.startOffset[frameIndex];
        const height = this.shape.body.height[frameIndex];
        const left = isUseMargin ? this.maxSizeInfo.left - this.shape.body.left[frameIndex] : 0;
        const top = isUseMargin ? this.maxSizeInfo.top - this.shape.body.top[frameIndex] : 0;

        let w, h, unityCount, unityWidth, colorData1, colorData2;

        reader.offset = startOffset + 8; // Skip shape info data

        for (h = 0; h < height; h++) {
            unityCount = reader.readUInt16LE();
            w = 0;

            while (unityCount--) {
                w += reader.readUInt16LE();
                unityWidth = reader.readUInt16LE();

                while (unityWidth--) {
                    colorData2 = reader.readUInt8();
                    colorData1 = reader.readUInt8();

                    const [r, g, b, a] = getRGBA15bit(colorData1, colorData2, isUseOpacity);
                    const pixelIndex = ((top + h) * canvasWidth + (left + w)) * 4;

                    pixelData[pixelIndex] = r;
                    pixelData[pixelIndex + 1] = g;
                    pixelData[pixelIndex + 2] = b;
                    pixelData[pixelIndex + 3] = a;
                    w++;
                }
            }
        }
    }

    drawBodyLowColor(frameIndex, pixelData, canvasWidth, canvasHeight) {
        const reader = this.reader;
        const isUseOpacity = this.getIsUseOpacity();
        const isUseMargin = this.getIsUseMargin();
        const isUsePalette = this.getIsUsePalette();

        const startOffset = this.shape.body.startOffset[frameIndex];
        const height = this.shape.body.height[frameIndex];
        const left = isUseMargin ? this.maxSizeInfo.left - this.shape.body.left[frameIndex] : 0;
        const top = isUseMargin ? this.maxSizeInfo.top - this.shape.body.top[frameIndex] : 0;

        // var paletteFile = _App.fileManager.paletteFile;
        var paletteFile = null;
        var paletteNumber = this.selectedPaletteNumber;
        var paletteData = (isUsePalette && paletteFile) ? paletteFile.paletteData[paletteNumber] : this.paletteData;

        var _getRGB, w, h, unityCount, unityWidth, colorReference, colorData1, colorData2;

        if (isUsePalette && paletteFile && paletteFile.is16bitColor) {
            _getRGB = getRGBA16bit;
        } else {
            _getRGB = getRGBA15bit;
        }

        reader.offset = startOffset + 8; // Skip shape info data

        for (h = 0; h < height; h++) {
            unityCount = reader.readUInt8();
            w = 0;

            while (unityCount--) {
                w += reader.readUInt8();
                unityWidth = reader.readUInt8();

                while (unityWidth--) {
                    colorReference = reader.readUInt8();
                    colorData1 = paletteData[colorReference * 2 + 1];
                    colorData2 = paletteData[colorReference * 2];

                    const [r, g, b, a] = _getRGB.call(this, colorData1, colorData2, isUseOpacity);
                    const pixelIndex = ((top + h) * canvasWidth + (left + w)) * 4;

                    pixelData[pixelIndex] = r;
                    pixelData[pixelIndex + 1] = g;
                    pixelData[pixelIndex + 2] = b;
                    pixelData[pixelIndex + 3] = a;
                    w++;
                }
            }
        }
    }

    drawShadow(frameIndex, pixelData, canvasWidth, canvasHeight) {
        if (!this.isExistShadow) {
            return;
        }

        const reader = this.reader;
        const startOffset = this.shape.shadow.startOffset[frameIndex];
        const height = this.shape.shadow.height[frameIndex];
        const left = 0;
        const top = 0;

        let w, h, unityCount, unityWidth;

        reader.offset = startOffset + 8; // Skip shape info data

        for (h = 0; h < height; h++) {
            unityCount = reader.readUInt8();
            w = 0;

            while (unityCount--) {
                w += reader.readUInt8();
                unityWidth = reader.readUInt8();

                while (unityWidth--) {
                    const [r, g, b, a] = SHADOW_PIXEL_DATA;
                    const pixelIndex = ((top + h) * canvasWidth + (left + w)) * 4;

                    pixelData[pixelIndex] = r;
                    pixelData[pixelIndex + 1] = g;
                    pixelData[pixelIndex + 2] = b;
                    pixelData[pixelIndex + 3] = a;
                    w++;
                }
            }
        }
    }

    drawOutline(frameIndex, pixelData, canvasWidth, canvasHeight) {
        if (!this.isExistOutline || !this.getIsShowOutline()) {
            return;
        }

        if (!this.getIsUseMargin()) {
            return;
        }

        const reader = this.reader;
        const startOffset = this.shape.outline.startOffset[frameIndex];
        const height = this.shape.outline.height[frameIndex];
        const left = this.maxSizeInfo.left - this.shape.outline.left[frameIndex];
        const top = this.maxSizeInfo.top - this.shape.outline.top[frameIndex];

        let w, h, unityCount, unityWidth;

        this.stream.seek(startOffset + 8);
        reader.offset = startOffset + 8;  // Skip shape info data

        for (h = 0; h < height; h++) {
            unityCount = reader.readUInt8();
            w = 0;

            while (unityCount--) {
                w += reader.readUInt8();
                unityWidth = reader.readUInt8();

                while (unityWidth--) {
                    const [r, g, b, a] = OUTLINE_PIXEL_DATA;
                    const pixelIndex = ((top + h) * canvasWidth + (left + w)) * 4;

                    pixelData[pixelIndex] = r;
                    pixelData[pixelIndex + 1] = g;
                    pixelData[pixelIndex + 2] = b;
                    pixelData[pixelIndex + 3] = a;
                    w++;
                }
            }
        }
    }

    getIsShowBody() {
        return true;
    }

    getIsUseOpacity() {
        return false;
    }

    getIsUseMargin() {
        return false;
    }

    getIsUseBackground() {
        return false;
    }

    getIsUsePalette() {
        return false;
    }

    getIsShowOutline() {
        return false;
    }
}

class EffectShape {
    constructor() {
        this.startOffset = [];
        this.endOffset = [];
        this.width = [];
        this.height = [];
        this.left = [];
        this.top = [];
        this.pixelData = []; // For storing raw pixel data
        this.textures = []; // For caching PIXI.Texture
        this.canvas = []; // For caching HTMLCanvasElement
    }
}

export class ZippedTextures {
    constructor(zipBuffer) {
        this.zipBuffer = zipBuffer;
        this.unzip = new Zlib.Unzip(zipBuffer);
        this.fileNames = this.unzip.getFilenames();

        this.extractedTextures = {};
    }

    /**
     * @param {String} fileName 
     * @returns {Texture}
     */
    getTexture(fileName) {
        if (this.extractedTextures[fileName]) {
            return this.extractedTextures[fileName];
        }
        const data = this.unzip.decompress(fileName);
        const texture = new Texture(fileName, Buffer.from(data));
        this.extractedTextures[fileName] = texture;
        return texture;
    }

    extractAll() {
        const allTextures = this.fileNames.map(fileName => {
            return this.getTexture(fileName);
        });
        return allTextures;
    }
}

export default Texture;