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

        // this.createTextureCanvases();
        this.isAnalyzed = true;
    }

    decodeBuffer() {
        const reader = this.reader;

        const ENCODE_KEY_LENGTH = 326;
        const ENCODE_START_ADDRESS = 0x1c;

        const limitAddress = reader.readUInt32LE();
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

        for (let i = ENCODE_KEY_LENGTH, j = null; i < limitAddress; i++) {
            j = (i - ENCODE_START_ADDRESS) % ENCODE_KEY_LENGTH;
            this.textureFileBuffer[i] = this.textureFileBuffer[i] ^ xorKey[i];
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

    createTextureCanvases(type = "body") {
        for (let i = 0; i < this.frameCount; i++) {
            this.draw(i, type);
        }
        return this.shape[type].canvas;
    }

    createTextureCanvas(frameIndex, type) {
        this.draw(frameIndex, type);
        return this.shape[type].canvas[frameIndex];
    }

    getCanvas(frameIndex, type = "body") {
        if (!this.isAnalyzed) this.analyze();
        if (!this.shape[type].canvas[frameIndex]) this.createTextureCanvas(frameIndex, type);
        return this.shape[type].canvas[frameIndex].canvas;
    }

    getPixiTexture(frameIndex, type = "body") {
        if (!this.isAnalyzed) this.analyze();
        if (!this.shape[type].canvas[frameIndex]) this.createTextureCanvas(frameIndex, type);
        const texture = PIXI.Texture.from(this.shape[type].canvas[frameIndex].canvas);
        return texture;
    }

    draw(frameIndex, type = "body") {
        this.drawFrame = frameIndex;
        this.drawShapeType = type;
        const canvasManager = this.shape[type].canvas[frameIndex] || new CanvasManager();
        this.shape[type].canvas[frameIndex] = canvasManager;

        this.resizeCanvas();

        type === "body" && this.drawBody();
        type === "shadow" && this.drawShadow();
        type === "outline" && this.drawOutline();

        // update
        canvasManager.update();
    }

    redraw() {
        this.draw(this.drawFrame);
    }

    resizeCanvas() {
        const canvasManager = this.shape[this.drawShapeType].canvas[this.drawFrame];

        if (false/* this.getIsUseMargin() */) {
            canvasManager.resize(this.maxSizeInfo.outerWidth, this.maxSizeInfo.outerHeight);
        } else {
            canvasManager.resize(this.shape[this.drawShapeType].width[this.drawFrame], this.shape[this.drawShapeType].height[this.drawFrame])
        }
    }

    drawBody() {
        if (!this.getIsShowBody()) {
            return;
        }

        switch (this.fileExtension) {
            case "smi":
            case "mpr":
                this.drawBodySmi();
                break;
            default:
                if (this.isHighColor) {
                    this.drawBodyHighColor();
                } else {
                    this.drawBodyLowColor();
                }
        }
    }

    drawBodySmi() {
        const reader = this.reader;
        const canvasManager = this.shape.body.canvas[this.drawFrame];

        var isUseOpacity = this.getIsUseOpacity();
        var isUseMargin = this.getIsUseMargin();
        var isUseBackground = this.getIsUseBackground();

        var startOffset = this.shape.body.startOffset[this.drawFrame];
        var width = this.shape.body.width[this.drawFrame];
        var height = this.shape.body.height[this.drawFrame];
        var left = isUseMargin ? this.maxSizeInfo.left - this.shape.body.left[this.drawFrame] : 0;
        var top = isUseMargin ? this.maxSizeInfo.top - this.shape.body.top[this.drawFrame] : 0;

        var w, h, colorData1, colorData2, _drawPixel;

        if (isUseBackground && isUseOpacity) {
            _drawPixel = canvasManager.drawBlendPixel;
        } else {
            _drawPixel = canvasManager.drawPixel;
        }

        reader.offset = startOffset;

        if (this.fileExtension === "smi") {
            reader.offset += 4; // Skip shape info data
        }

        for (h = 0; h < height; h++) {
            for (w = 0; w < width; w++) {
                colorData2 = reader.readUInt8();
                colorData1 = reader.readUInt8();

                _drawPixel.call(
                    canvasManager,
                    left + w,
                    top + h,
                    getRGBA15bit(colorData1, colorData2, isUseOpacity)
                )
            }
        }
    }

    drawBodyHighColor() {
        const reader = this.reader;
        const canvasManager = this.shape.body.canvas[this.drawFrame];

        var isUseOpacity = this.getIsUseOpacity();
        var isUseMargin = this.getIsUseMargin();
        var isUseBackground = this.getIsUseBackground();

        var startOffset = this.shape.body.startOffset[this.drawFrame];
        var width = this.shape.body.width[this.drawFrame];
        var height = this.shape.body.height[this.drawFrame];
        var left = isUseMargin ? this.maxSizeInfo.left - this.shape.body.left[this.drawFrame] : 0;
        var top = isUseMargin ? this.maxSizeInfo.top - this.shape.body.top[this.drawFrame] : 0;

        var _drawPixel, w, h, unityCount, unityWidth, colorData1, colorData2;

        if (isUseBackground && isUseOpacity) {
            _drawPixel = canvasManager.drawBlendPixel;
        } else {
            _drawPixel = canvasManager.drawPixel;
        }

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

                    _drawPixel.call(
                        canvasManager,
                        left + w,
                        top + h,
                        getRGBA15bit(colorData1, colorData2, isUseOpacity)
                    )
                    w++;
                }
            }
        }
    }

    drawBodyLowColor() {
        const reader = this.reader;
        const canvasManager = this.shape.body.canvas[this.drawFrame];

        var isUseOpacity = this.getIsUseOpacity();
        var isUseMargin = this.getIsUseMargin();
        var isUseBackground = this.getIsUseBackground();
        var isUsePalette = this.getIsUsePalette();

        var startOffset = this.shape.body.startOffset[this.drawFrame];
        var width = this.shape.body.width[this.drawFrame];
        var height = this.shape.body.height[this.drawFrame];
        var left = isUseMargin ? this.maxSizeInfo.left - this.shape.body.left[this.drawFrame] : 0;
        var top = isUseMargin ? this.maxSizeInfo.top - this.shape.body.top[this.drawFrame] : 0;

        // var paletteFile = _App.fileManager.paletteFile;
        var paletteFile = null;
        var paletteNumber = this.selectedPaletteNumber;
        var paletteData = (isUsePalette && paletteFile) ? paletteFile.paletteData[paletteNumber] : this.paletteData;

        var _drawPixel, _getRGB, w, h, unityCount, unityWidth, colorReference, colorData1, colorData2;

        if (isUseBackground && isUseOpacity) {
            _drawPixel = canvasManager.drawBlendPixel;
        } else {
            _drawPixel = canvasManager.drawPixel;
        }

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

                    _drawPixel.call(
                        canvasManager,
                        left + w,
                        top + h,
                        _getRGB.call(this, colorData1, colorData2, isUseOpacity)
                    )
                    w++;
                }
            }
        }
    }

    drawShadow() {
        if (!this.isExistShadow) {
            return;
        }

        const reader = this.reader;
        const canvasManager = this.shape.shadow.canvas[this.drawFrame];

        var startOffset = this.shape.shadow.startOffset[this.drawFrame];
        var width = this.shape.shadow.width[this.drawFrame];
        var height = this.shape.shadow.height[this.drawFrame];
        var left = 0;
        var top = 0;

        var w, h, unityCount, unityWidth;

        reader.offset = startOffset + 8; // Skip shape info data

        for (h = 0; h < height; h++) {
            unityCount = reader.readUInt8();
            w = 0;

            while (unityCount--) {
                w += reader.readUInt8();
                unityWidth = reader.readUInt8();

                while (unityWidth--) {
                    canvasManager.drawBlendPixel(
                        left + w,
                        top + h,
                        SHADOW_PIXEL_DATA
                    );
                    w++;
                }
            }
        }
    }

    drawOutline() {
        if (!this.isExistOutline || !this.getIsShowOutline()) {
            return;
        }

        if (!this.getIsUseMargin()) {
            return;
        }

        const reader = this.reader;
        const canvasManager = this.shape.outline.canvas[this.drawFrame];

        var startOffset = this.shape.outline.startOffset[this.drawFrame];
        var width = this.shape.outline.width[this.drawFrame];
        var height = this.shape.outline.height[this.drawFrame];
        var left = this.maxSizeInfo.left - this.shape.outline.left[this.drawFrame];
        var top = this.maxSizeInfo.top - this.shape.outline.top[this.drawFrame];

        var w, h, unityCount, unityWidth;

        this.stream.seek(startOffset + 8);
        reader.offset = startOffset + 8;  // Skip shape info data

        for (h = 0; h < height; h++) {
            unityCount = reader.readUInt8();
            w = 0;

            while (unityCount--) {
                w += reader.readUInt8();
                unityWidth = reader.readUInt8();

                while (unityWidth--) {
                    canvasManager.drawBlendPixel(
                        left + w,
                        top + h,
                        OUTLINE_PIXEL_DATA
                    );
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
        this.canvas = [];
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