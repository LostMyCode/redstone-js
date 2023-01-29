import * as PIXI from "pixi.js";

import RedStoneMap, { Mapset } from "./models/Map";
import { fetchBinaryFile, loadTexture, loadZippedTextures } from "../utils";
import BufferReader from "../utils/BufferReader";
import { getKeyByValue } from "../utils/RedStoneRandom";
import MainCanvas from "./MainCanvas";
import Map from "./models/Map";

const DATA_DIR = "https://sigr.io/redstone";
const MAPSET_DIR = "https://sigr.io/redstone/Mapset";
const INTERFACE_DIR = "https://sigr.io/redstone/Interface";
const RMD_DIR = "https://sigr.io/redstone/Scenario";

const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;

const getTextureFileName = (textureId, extension = "rso") => {
    if (!extension) throw new Error("[Error] Invalid file extension");

    const idStrLen = String(textureId).length;
    const numZero = 4 - idStrLen;
    if (["rso", "rfo"].includes(extension)) {
        return `sn__object_${(new Array(numZero)).fill(0).join("")}${textureId}.${extension}`;
    }
    else if (extension === "rbd") {
        return `sn__building_${(new Array(numZero)).fill(0).join("")}${textureId}.rbd`;
    }
    else {
        throw new Error("[Error] Unsupported texture type");
    }
}

// temp
const animationObjectTexIds = {
    Brunenstig: {
        rso: [0, 1, 2, 3, 4, 5],
        rfo: [4, 7]
    }
}

class GameMap {
    constructor(mainCanvas) {
        /**
         * @type {MainCanvas}
         */
        this.mainCanvas = mainCanvas;
        /**
         * @type {Map}
         */
        this.map = null;
        this.mapsetName = null;

        this.tileContainer = new PIXI.Container();
        this.objectContainer = new PIXI.Container();
        this.positionSpecifiedObjectContainer = new PIXI.Container();
        this.shadowContainer = new PIXI.Container();
    }

    async loadMap() {
        console.log("[Game]", "Loading scenario file...");
        // const rmd = await fetchBinaryFile(`${RMD_DIR}/[060]T01_A01.rmd`);
        const rmd = await fetchBinaryFile(`${RMD_DIR}/[000]T01.rmd`);
        this.map = new RedStoneMap(new BufferReader(rmd));
        console.log("[Game]", "Scenario loaded");

        const mapsetName = this.map.getMapsetName();
        this.tileTexture = await loadTexture(`${MAPSET_DIR}/${mapsetName}/tile.mpr`);
        this.objectTextures = await loadZippedTextures(`${MAPSET_DIR}/${mapsetName}/${mapsetName}_Objects.zip`);
        this.buildingTextures = Object.keys(this.map.buildingInfos).length ? await loadZippedTextures(`${MAPSET_DIR}/${mapsetName}/${mapsetName}_Buildings.zip`) : null;
    }

    render() {
        const map = this.map;

        for (let i = 0; i < map.size.height; i++) {
            for (let j = 0; j < map.size.width; j++) {
                const tileCode = map.tileData1[i * map.size.width + j];
                const objectCode = map.tileData3[i * map.size.width + j];

                this.renderTile(tileCode, j, i);
                this.renderObject(objectCode, j, i);
            }
        }

        // render position specified objects
        const objects = map.positionSpecifiedObjects;
        objects.forEach(obj => {
            const fileName = getTextureFileName(obj.textureId, "rfo");
            const texture = this.objectTextures.getTexture(fileName);
            const pixiTexture = texture.getPixiTexture(0);
            const x = obj.point.x - texture.shape.body.left[0];
            const y = obj.point.y - texture.shape.body.top[0];

            const sprite = new PIXI.Sprite(pixiTexture);
            sprite.position.set(x, y);

            this.positionSpecifiedObjectContainer.addChild(sprite);
        });

        this.tileContainer.cacheAsBitmap = true;
        this.shadowContainer.cacheAsBitmap = true;

        this.mainCanvas.mainContainer.addChild(this.tileContainer);
        this.mainCanvas.mainContainer.addChild(this.positionSpecifiedObjectContainer);
        this.mainCanvas.mainContainer.addChild(this.shadowContainer);
        this.mainCanvas.mainContainer.addChild(this.objectContainer);
    }

    renderTile(code, blockX, blockY) {
        const tileTextureId = code % (16 << 10);
        const texture = this.tileTexture.getPixiTexture(tileTextureId);
        const sprite = new PIXI.Sprite(texture);
        sprite.position.set(blockX * TILE_WIDTH, blockY * TILE_HEIGHT);
        sprite.width = TILE_WIDTH;
        sprite.height = TILE_HEIGHT;
        this.tileContainer.addChild(sprite);
    }

    renderObject(code, blockX, blockY) {
        // TODO: sort objects and shadows

        const map = this.map;
        const mapsetName = this.map.getMapsetName();

        if (code === 0) return;
        if (map.scenarioVersion === 5.3 && code < 16 << 8) return;
        if (map.scenarioVersion === 6.1 && code < 16 << 10) return;

        let index;
        let isBuilding = false;

        if (map.scenarioVersion === 5.3) {
            index = code % (16 << 8);
        }
        else if (map.scenarioVersion === 6.1) {
            isBuilding = code >= 16 << 11;
            index = isBuilding ? code % (16 << 11) : code % (16 << 10);
        }
        else {
            console.log("[Map Object Renderer] Untested scenario version:", map.scenarioVersion);
        }

        const objectInfo = isBuilding ? map.buildingInfos[index + 1] : map.objectInfos[index + 1];
        if (!objectInfo) {
            return;
        }

        const fileName = getTextureFileName(objectInfo.textureId, isBuilding ? "rbd" : undefined);
        const texture = isBuilding ? this.buildingTextures.getTexture(fileName) : this.objectTextures.getTexture(fileName);
        const pixiTexture = texture.getPixiTexture(0);

        const blockCenterX = blockX * TILE_WIDTH + TILE_WIDTH / 2;
        const blockCenterY = blockY * TILE_HEIGHT + TILE_HEIGHT / 2;
        const x = blockCenterX - texture.shape.body.left[0];
        const y = blockCenterY - texture.shape.body.top[0];

        const sprite = new PIXI.Sprite(pixiTexture);
        sprite.position.set(x, y);
        this.objectContainer.addChild(sprite);

        // animated objects (rso)
        if (!isBuilding && animationObjectTexIds[mapsetName]?.rso?.includes(objectInfo.textureId)) {
            const pixiTextures = [];
            for (let i = 1; i < texture.frameCount; i++) {
                pixiTextures.push(texture.getPixiTexture(i));
            }
            const x = blockCenterX - texture.shape.body.left[1];
            const y = blockCenterY - texture.shape.body.top[1];
            const sprite = new PIXI.AnimatedSprite(pixiTextures);
            sprite.position.set(x, y);
            sprite.animationSpeed = 0.1;
            sprite.play();
            this.objectContainer.addChild(sprite);
        }

        // shadow
        if ((objectInfo.isDrawShadow || isBuilding) && texture.isExistShadow) {
            const pixiTexture = texture.getPixiTexture(0, "shadow");

            const x = blockCenterX - texture.shape.shadow.left[0];
            const y = blockCenterY - texture.shape.shadow.top[0];

            const sprite = new PIXI.Sprite(pixiTexture);
            sprite.position.set(x, y);

            this.shadowContainer.addChild(sprite);
        }

        // render sub objects
        !isBuilding && objectInfo.subObjectInfos.forEach(subObjectInfo => {
            const { textureId, offsetX, offsetY, xAnchorFlag, yAnchorFlag } = subObjectInfo;
            const fileName = getTextureFileName(textureId, "rfo");
            const texture = this.objectTextures.getTexture(fileName);
            const pixiTexture = texture.getPixiTexture(0);

            const x = xAnchorFlag === 0xff ? blockCenterX - 0xff + offsetX - texture.shape.body.left[0] : blockCenterX + offsetX - texture.shape.body.left[0];
            const y = yAnchorFlag === 0xff ? blockCenterY - 0xff + offsetY - texture.shape.body.top[0] : blockCenterY + offsetY - texture.shape.body.top[0];

            const sprite = new PIXI.Sprite(pixiTexture);
            sprite.position.set(x, y);

            this.objectContainer.addChild(sprite);

            // animated objects (rfo)
            if (animationObjectTexIds[mapsetName]?.rfo?.includes(textureId)) {
                const pixiTextures = [];
                for (let i = 1; i < texture.frameCount; i++) {
                    pixiTextures.push(texture.getPixiTexture(i));
                }
                const x = blockCenterX - texture.shape.body.left[1];
                const y = blockCenterY - texture.shape.body.top[1];
                const sprite = new PIXI.AnimatedSprite(pixiTextures);
                sprite.position.set(x, y);
                sprite.animationSpeed = 0.1;
                sprite.play();
                this.objectContainer.addChild(sprite);
            }
        });

        // render building parts
        if (isBuilding && texture.frameCount > 1) {
            const r = new BufferReader(Buffer.from(objectInfo.unk0));
            while (true) {
                const id = r.readUInt16LE();
                if (id === 65535) break;

                const pixiTexture = texture.getPixiTexture(id);

                const x = blockCenterX - texture.shape.body.left[id];
                const y = blockCenterY - texture.shape.body.top[id];

                const sprite = new PIXI.Sprite(pixiTexture);
                sprite.position.set(x, y);

                this.objectContainer.addChild(sprite);

                if (texture.isExistShadow) {
                    const pixiTexture = texture.getPixiTexture(id, "shadow");

                    const x = blockCenterX - texture.shape.shadow.left[id];
                    const y = blockCenterY - texture.shape.shadow.top[id];

                    const sprite = new PIXI.Sprite(pixiTexture);
                    sprite.position.set(x, y);

                    this.shadowContainer.addChild(sprite);
                }
            }
        }
    }
}

export default GameMap;