import * as PIXI from "pixi.js";

import RedStoneMap, { Mapset, ObjectType, portalTextureInfo } from "./models/Map";
import { fetchBinaryFile, loadTexture, loadZippedTextures } from "../utils";
import BufferReader from "../utils/BufferReader";
import Map from "./models/Map";
import Camera from "./Camera";
import LoadingScreen from "./interface/LoadingScreen";
import { INTERFACE_DIR, MAPSET_DIR, RMD_DIR, TILE_HEIGHT, TILE_WIDTH } from "./Config";
import RedStone from "./RedStone";

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
        rfo: [4, 7, 10, 13, 15, 25, 26, 28, 29]
    }
}

class GameMap {
    constructor() {
        /**
         * @type {Map}
         */
        this.map = null;

        this.tileContainer = new PIXI.Container();
        this.objectContainer = new PIXI.Container();
        this.positionSpecifiedObjectContainer = new PIXI.Container();
        this.shadowContainer = new PIXI.Container();
        this.portalContainer = new PIXI.Container();
    }

    reset() {
        this.tileContainer.removeChildren();
        this.objectContainer.removeChildren();
        this.positionSpecifiedObjectContainer.removeChildren();
        this.shadowContainer.removeChildren();
        this.portalContainer.removeChildren();

        this.tileContainer.destroy()
        this.shadowContainer.destroy();
        this.tileContainer = new PIXI.Container();
        this.shadowContainer = new PIXI.Container();

        this.map = null;
    }

    async loadCommon() {
        this.portalTexture = await loadTexture(`${INTERFACE_DIR}/gateAnm.sad`);
    }

    async loadMap(rmdFileName = "[000]T01.rmd") {
        console.log("[Game]", "Loading scenario file...");
        // const rmd = await fetchBinaryFile(`${RMD_DIR}/[060]T01_A01.rmd`);
        const rmd = await fetchBinaryFile(`${RMD_DIR}/${rmdFileName}`);
        this.map = new RedStoneMap(new BufferReader(rmd));
        this.currentRmdFileName = rmdFileName;
        console.log("[Game]", "Scenario loaded");

        Camera.setMapSize(this.map.size.width * TILE_WIDTH, this.map.size.width * TILE_HEIGHT);
        this.initPosition();

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
                // setTimeout(() => {
                //     this.renderTile(tileCode, j, i);
                //     this.renderObject(objectCode, j, i);
                // }, 1 * (i * map.size.width + j));
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

            if (texture.isExistShadow) {
                const pixiTexture = texture.getPixiTexture(0, "shadow");

                const x = obj.point.x - texture.shape.shadow.left[0];
                const y = obj.point.y - texture.shape.shadow.top[0];

                const sprite = new PIXI.Sprite(pixiTexture);
                sprite.position.set(x, y);

                this.shadowContainer.addChild(sprite);
            }
        });

        this.renderPortals();

        this.tileContainer.cacheAsBitmap = true;
        this.shadowContainer.cacheAsBitmap = true;

        RedStone.mainCanvas.mainContainer.addChild(this.tileContainer);
        RedStone.mainCanvas.mainContainer.addChild(this.portalContainer);
        RedStone.mainCanvas.mainContainer.addChild(this.shadowContainer);
        RedStone.mainCanvas.mainContainer.addChild(this.positionSpecifiedObjectContainer);
        RedStone.mainCanvas.mainContainer.addChild(this.objectContainer);
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

    renderPortals() {
        const defaultTexture = this.portalTexture.getPixiTexture(12);

        this.map.areaInfos.forEach(area => {
            if (!area.moveToFileName) return;
            if (area.objectInfo !== ObjectType.WarpPortal) return;

            const centerPos = area.centerPos;
            let pixiTexture = defaultTexture;
            // it is better way to load all rmd and check MapType of map beyond the gate
            // check the filename instead as its easier
            const isGateOrDungeon = area.moveToFileName.match(/G\d+|_D\d+|T\d+/);
            if (
                // mapBeyondTheGate.typeAndFlags !== MapType.Shop
                // area.subObjectInfo === 13 || area.subObjectInfo === 21
                isGateOrDungeon
            ) {
                const isNearLeftBorder = centerPos.x < 500;
                const isNearTopBorder = centerPos.y < 500;
                const isNearRightBorder = 64 * this.map.size.width - centerPos.x < 500;
                const isNearBottomBorder = 32 * this.map.size.height - centerPos.y < 500;

                let portalLocationStr = "";
                if (isNearTopBorder) {
                    portalLocationStr += "top";
                }
                else if (isNearBottomBorder) {
                    portalLocationStr += "bottom";
                }
                if (isNearLeftBorder) {
                    portalLocationStr += portalLocationStr.length ? "Left" : "left";
                }
                else if (isNearRightBorder) {
                    portalLocationStr += portalLocationStr.length ? "Right" : "right";
                }
                else {
                    // idk how to relate portal to its texture...
                    portalLocationStr = "top";
                }
                const key = portalLocationStr + "Gate";
                const index = Object.values(portalTextureInfo).indexOf(portalTextureInfo[key]);
                const offset = index * 6;
                pixiTexture = this.portalTexture.getPixiTexture(offset);
            }
            else {
                const index = Object.values(portalTextureInfo).indexOf(portalTextureInfo.door);
                const offset = index * 6;
                pixiTexture = this.portalTexture.getPixiTexture(offset);
            }
            const x = centerPos.x - pixiTexture.width / 2;
            const y = centerPos.y - pixiTexture.height / 2;

            const sprite = new PIXI.Sprite(pixiTexture);
            sprite.position.set(x, y);
            sprite.interactive = true;
            sprite.on("click", async () => {
                console.log("portal gate clicked", area.moveToFileName);
                this.prevRmdName = this.currentRmdFileName;
                LoadingScreen.render();
                this.reset();
                await this.loadMap(area.moveToFileName);
                this.render();
                LoadingScreen.destroy();
            });

            this.portalContainer.addChild(sprite);
        });
    }

    initPosition() {
        if (this.prevRmdName) {
            const portalToPrevMap = this.map.areaInfos.find(area => area.moveToFileName === this.prevRmdName);
            console.log(this.map.areaInfos.filter(area => area.moveToFileName));
            if (!portalToPrevMap) console.log("prev map portal not found :(");
            Camera.setPosition(portalToPrevMap.centerPos.x, portalToPrevMap.centerPos.y);
        }
    }

    getRealSize() {
        if (!this.map) return null;
        return {
            width: this.map.size.width * TILE_WIDTH,
            height: this.map.size.height * TILE_HEIGHT
        }
    }
}

export default GameMap;