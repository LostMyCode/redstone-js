import * as PIXI from "pixi.js";

import RedStoneMap, { Mapset, ObjectType } from "./models/Map";
import { fetchBinaryFile, loadTexture, loadZippedTextures } from "../utils";
import BufferReader from "../utils/BufferReader";
import Map from "./models/Map";
import Camera from "./Camera";
import LoadingScreen from "./interface/LoadingScreen";
import { DATA_DIR, ENABLE_DRAW_MAP_DEBUG, INTERFACE_DIR, MAPSET_DIR, RMD_DIR, TILE_HEIGHT, TILE_WIDTH } from "./Config";
import RedStone from "./RedStone";
import { ActorImage, CType, MonsterType } from "./models/Actor";
import CommonUI from "./interface/CommonUI";
import Listener from "./Listener";
import { getDistance } from "../utils/RedStoneRandom";
import MonsterSource from "./models/MonsterSource";
import SoundManager from "./SoundManager";

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
    },
    Mountains_Village: {
        rso: [0, 52]
    }
}

const CONTAINER_SPLIT_BLOCK_SIZE = 10;

ENABLE_DRAW_MAP_DEBUG && PIXI.BitmapFont.from("TitleFont", {
    fill: "#f5b042",
    fontSize: 12
}, {
    chars: '(0123456789),',
    resolution: devicePixelRatio
});

ENABLE_DRAW_MAP_DEBUG && PIXI.BitmapFont.from("ActorPosFont", {
    fill: "#eb4034",
    fontSize: 12
}, {
    chars: '(0123456789),',
    resolution: devicePixelRatio
});

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
        this.foremostContainer = new PIXI.Container();

        this.graphics = new PIXI.Graphics();

        /**
         * @type {{[key: String]: PIXI.Container}}
         */
        this.tileSubContainers = {};

        /**
         * @type {PIXI.Sprite[]}
         */
        this.objectSprites = [];

        /**
         * @type {PIXI.Sprite[]}
         */
        this.shadowSprites = [];

        /**
         * @type {PIXI.Sprite[]}
         */
        this.positionSpecifiedObjectSprites = [];

        /**
         * @type {PIXI.Sprite[] | PIXI.AnimatedSprite[]}
         */
        this.actorSprites = [];

        this.actorTextures = {};

        window.addEventListener("mouseup", () => {
            if (this.selectedPortal) {
                this.selectedPortal = null;
            }
        });
    }

    reset() {
        window.dispatchEvent(new CustomEvent("displayLogUpdate", { detail: { key: "map-name", value: null } }));

        this.tileContainer.removeChildren();
        this.objectContainer.removeChildren();
        this.positionSpecifiedObjectContainer.removeChildren();
        this.shadowContainer.removeChildren();
        this.portalContainer.removeChildren();
        this.foremostContainer.removeChildren();
        this.graphics.clear();

        RedStone.mainCanvas.mainContainer.removeChild(
            this.objectContainer,
            this.positionSpecifiedObjectContainer,
            this.shadowContainer,
            this.portalContainer,
            this.foremostContainer,
            this.graphics
        );

        this.tileSubContainers = {};
        this.objectSprites = [];
        this.shadowSprites = [];
        this.positionSpecifiedObjectSprites = [];
        this.actorSprites = [];

        this.map = null;
        this.onceRendered = false;
        this.initialized = false;
    }

    async loadCommon() {
        this.portalTexture = await loadTexture(`${INTERFACE_DIR}/gateAnm.sad`);
    }

    async loadMap(rmdFileName = "[000]T01.rmd") {
        // async loadMap(rmdFileName = "[373]T02.rmd") {
        // async loadMap(rmdFileName = "[130]G09.rmd") {
        // async loadMap(rmdFileName = "[010]G13.rmd") {
        console.log("[Game]", "Loading scenario file...");
        // const rmd = await fetchBinaryFile(`${RMD_DIR}/[060]T01_A01.rmd`);
        const rmd = await fetchBinaryFile(`${RMD_DIR}/${rmdFileName}`);
        this.map = new RedStoneMap(new BufferReader(rmd));
        this.currentRmdFileName = rmdFileName;
        console.log("[Game]", "Scenario loaded", this.map);

        Camera.setMapSize(this.map.size.width * TILE_WIDTH, this.map.size.height * TILE_HEIGHT);
        this.initPosition();

        const mapsetName = this.map.getMapsetName();
        this.tileTexture = await loadTexture(`${MAPSET_DIR}/${mapsetName}/tile.mpr`);
        this.objectTextures = await loadZippedTextures(`${MAPSET_DIR}/${mapsetName}/${mapsetName}_Objects.zip`);
        this.buildingTextures = Object.keys(this.map.buildingInfos).length ? await loadZippedTextures(`${MAPSET_DIR}/${mapsetName}/${mapsetName}_Buildings.zip`) : null;

        // load actor textures
        for (let actor of this.map.actorSingles) {
            const group = this.map.actorGroups[actor.internalID];
            if (this.actorTextures[group.job]) continue;

            const isMonster = [CType.Monster, CType.QuestMonster].includes(actor.charType);
            let actorTextureName;

            if (isMonster) {
                const monsterSource = MonsterSource.allMonsters[group.job];
                actorTextureName = MonsterType[monsterSource.textureId];
                if (actorTextureName === "SkeletonSanta") continue;
            } else {
                actorTextureName = ActorImage[group.job];
            }

            if (!actorTextureName) continue;

            const dir = isMonster ? "monsters" : "NPC";
            const fileName = actorTextureName + ".sad";
            const texture = await loadTexture(`${DATA_DIR}/${dir}/${fileName}`);
            this.actorTextures[group.job] = texture;
        }
    }

    async init() {
        if (!this.map) await this.loadMap(RedStone.lastLocation?.map);
        const map = this.map;
        const mapsetName = this.map.getMapsetName();

        for (let i = 0; i < map.size.height; i++) {
            for (let j = 0; j < map.size.width; j++) {
                const tileCode = map.tileData1[i * map.size.width + j];
                const objectCode = map.tileData3[i * map.size.width + j];

                this.renderTile(tileCode, j, i);
                this.renderObject(objectCode, j, i);
            }
        }

        for (const key in this.tileSubContainers) {
            const sc = this.tileSubContainers[key];
            const [blockX, blockY] = key.split("-").map(Number);
            const x = blockX * TILE_WIDTH * CONTAINER_SPLIT_BLOCK_SIZE;
            const y = blockY * TILE_HEIGHT * CONTAINER_SPLIT_BLOCK_SIZE;
            sc.position.set(x, y);
            sc.cacheAsBitmap = true;
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
            sprite.blockX = Math.floor(obj.point.x / TILE_WIDTH);
            sprite.blockY = Math.floor(obj.point.y / TILE_HEIGHT);

            // this.positionSpecifiedObjectContainer.addChild(sprite);
            this.positionSpecifiedObjectSprites.push(sprite);

            // animated objects (rfo)
            if (animationObjectTexIds[mapsetName]?.rfo?.includes(obj.textureId)) {
                const pixiTextures = [];
                for (let i = 1; i < texture.frameCount; i++) {
                    pixiTextures.push(texture.getPixiTexture(i));
                }
                const x = obj.point.x - texture.shape.body.left[1];
                const y = obj.point.y - texture.shape.body.top[1];
                const sprite = new PIXI.AnimatedSprite(pixiTextures);
                sprite.position.set(x, y);
                sprite.animationSpeed = 0.1;
                sprite.blockX = Math.floor(obj.point.x / TILE_WIDTH);
                sprite.blockY = Math.floor(obj.point.y / TILE_HEIGHT);
                sprite.play();
                // this.objectSprites.push(sprite);
                this.positionSpecifiedObjectSprites.push(sprite);
            }

            if (texture.isExistShadow) {
                const pixiTexture = texture.getPixiTexture(0, "shadow");

                const x = obj.point.x - texture.shape.shadow.left[0];
                const y = obj.point.y - texture.shape.shadow.top[0];

                const sprite = new PIXI.Sprite(pixiTexture);
                sprite.position.set(x, y);

                // this.shadowContainer.addChild(sprite);
                this.shadowSprites.push(sprite);
            }

            if (ENABLE_DRAW_MAP_DEBUG) {
                this.graphics.lineStyle(1, 0x42f575);
                this.graphics.drawCircle(
                    obj.point.x,
                    obj.point.y,
                    10
                );
            }
        });

        this.renderPortals();
        this.renderActors();

        RedStone.mainCanvas.mainContainer.addChild(this.tileContainer);
        RedStone.mainCanvas.mainContainer.addChild(this.portalContainer);
        RedStone.mainCanvas.mainContainer.addChild(this.positionSpecifiedObjectContainer);
        RedStone.mainCanvas.mainContainer.addChild(this.shadowContainer);
        RedStone.mainCanvas.mainContainer.addChild(this.objectContainer);
        RedStone.mainCanvas.mainContainer.addChild(this.foremostContainer);
        RedStone.mainCanvas.mainContainer.addChild(this.graphics);

        if (!this.onceRendered) {
            this.onceRendered = true;
        }

        this.initialized = true;
        window.dispatchEvent(new CustomEvent("displayLogUpdate", { detail: { key: "map-name", value: this.map.name } }));

        try {
            const mapIndex = parseInt(this.currentRmdFileName.match(/\[(\d+)\]/)[1]);
            const bgmIndex = SoundManager.bgmMap[mapIndex];
            RedStone.bgmPlayer.play(bgmIndex);
        } catch (e) { };
    }

    render() {
        if (!this.initialized) return;

        const startTime = performance.now();

        if (this.selectedPortal) {
            const portalSprite = this.selectedPortal.sprite
            const portalPoint = {
                x: portalSprite.x + portalSprite.width / 2,
                y: portalSprite.y + portalSprite.height / 2
            };
            if (getDistance(RedStone.player, portalPoint) < 70) {
                console.log("portal gate", this.selectedPortal.area.moveToFileName);
                this.moveField(this.selectedPortal.area.moveToFileName);
                this.selectedPortal = null;
                return;
            }
        }

        this.tileContainer.removeChildren();
        this.objectContainer.removeChildren();
        this.shadowContainer.removeChildren();
        this.positionSpecifiedObjectContainer.removeChildren();
        this.foremostContainer.removeChildren();

        Object.keys(this.tileSubContainers).forEach((key, idx) => {
            const [blockX, blockY] = key.split("-").map(Number);
            const x = blockX * TILE_WIDTH * CONTAINER_SPLIT_BLOCK_SIZE;
            const y = blockY * TILE_HEIGHT * CONTAINER_SPLIT_BLOCK_SIZE;
            const tc = this.tileSubContainers[key];

            if (!Camera.isRectInView({
                top: y, left: x,
                width: TILE_WIDTH * CONTAINER_SPLIT_BLOCK_SIZE,
                height: TILE_HEIGHT * CONTAINER_SPLIT_BLOCK_SIZE
            })) {
                return;
            }

            this.tileContainer.addChild(tc);
        });

        let playerAdded = false;
        const playerTileY = Math.floor(RedStone.player.y / TILE_HEIGHT);
        const _sprites = [...this.objectSprites, ...this.actorSprites].sort((a, b) => {
            return a.blockY - b.blockY;
        });
        const actorSpritesInView = [];
        _sprites.forEach(sprite => {
            const bounds = sprite.getBounds();

            if (!Camera.isRectInView({
                top: bounds.top,
                left: bounds.left,
                width: bounds.width,
                height: bounds.height
            })) {
                return;
            }

            if (!playerAdded && sprite.blockY > playerTileY) {
                RedStone.player.render();
                this.objectContainer.addChild(RedStone.player.container);
                playerAdded = true;
            }

            if (sprite.isActorSprite) {
                actorSpritesInView.push(sprite);
            }

            if (ENABLE_DRAW_MAP_DEBUG) {
                const text = new PIXI.BitmapText(`(${sprite.blockX}, ${sprite.blockY})`, {
                    fontName: sprite.isActorSprite ? "ActorPosFont" : "TitleFont"
                });
                text.x = sprite.blockX * TILE_WIDTH;
                text.y = sprite.blockY * TILE_HEIGHT;
                this.foremostContainer.addChild(text);
            }

            this.objectContainer.addChild(sprite);
        });

        if (!playerAdded) {
            RedStone.player.render();
            this.objectContainer.addChild(RedStone.player.container);
            playerAdded = true;
        }

        this.shadowSprites.forEach(sprite => {
            const { x, y, width, height } = sprite;

            if (!Camera.isRectInView({
                top: y, left: x, width, height
            })) {
                return;
            }

            this.shadowContainer.addChild(sprite);
        });

        this.positionSpecifiedObjectSprites.forEach(sprite => {
            const { x, y, width, height } = sprite;

            if (!Camera.isRectInView({
                top: y, left: x, width, height
            })) {
                return;
            }

            this.positionSpecifiedObjectContainer.addChild(sprite);
        });

        actorSpritesInView.forEach(sprite => {
            if (typeof sprite.currentFrame === "number") {
                sprite.position.set(
                    sprite.baseX - sprite.shape.left[sprite.startFrameIndex + sprite.currentFrame] * sprite.scale.x,
                    sprite.baseY - sprite.shape.height[sprite.startFrameIndex + sprite.currentFrame] * sprite.scale.y
                );
            }

            if (sprite.guageSprite) {
                this.foremostContainer.addChild(sprite.guageSprite);
            }
            if (sprite.headIconSpriteSet) {
                this.foremostContainer.addChild(...sprite.headIconSpriteSet);
            }

            if (sprite.isHovering) {
                const texture = typeof sprite.currentFrame === "number" ? sprite.textures[sprite.currentFrame] : sprite.texture;
                const hoverSprite = new PIXI.Sprite(texture);
                hoverSprite.position.set(sprite.position._x, sprite.position._y);
                hoverSprite.scale.set(sprite.scale._x, sprite.scale._y);
                hoverSprite.animationSpeed = sprite.animationSpeed;
                hoverSprite.blendMode = PIXI.BLEND_MODES.ADD;
                hoverSprite.alpha = 0.5;
                this.foremostContainer.addChild(hoverSprite);
            }
        });

        const endTime = performance.now();
        // window.redgemDebugLog.push({ type: "GameMap Render Time", time: endTime - startTime });
    }

    renderTile(code, blockX, blockY) {
        const tileTextureId = code % (16 << 10);
        const texture = this.tileTexture.getPixiTexture(tileTextureId);
        const sprite = new PIXI.Sprite(texture);
        sprite.width = TILE_WIDTH;
        sprite.height = TILE_HEIGHT;

        const chunkX = ~~(blockX / CONTAINER_SPLIT_BLOCK_SIZE);
        const chunkY = ~~(blockY / CONTAINER_SPLIT_BLOCK_SIZE);
        const chunkName = `${chunkX}-${chunkY}`;

        sprite.position.set((blockX - chunkX * CONTAINER_SPLIT_BLOCK_SIZE) * TILE_WIDTH, (blockY - chunkY * CONTAINER_SPLIT_BLOCK_SIZE) * TILE_HEIGHT);

        this.tileSubContainers[chunkName] = this.tileSubContainers[chunkName] || new PIXI.Container();
        this.tileSubContainers[chunkName].addChild(sprite);
    }

    renderObject(code, blockX, blockY) {
        // TODO: sort objects and shadows

        const map = this.map;
        const mapsetName = this.map.getMapsetName();

        if (code === 0 || code === 8193) return;
        if (code < 16 << 8) return;

        let index;
        let isBuilding = false;

        isBuilding = code >= 16 << 11;
        index = isBuilding ? code % (16 << 11) : code >= (16 << 10) ? code % (16 << 10) : code % (16 << 8);

        const objectInfo = isBuilding ? map.buildingInfos[index] : map.objectInfos[index];
        if (!objectInfo) {
            return;
        }

        const fileName = getTextureFileName(objectInfo.textureId, isBuilding ? "rbd" : undefined);
        const texture = isBuilding ? this.buildingTextures.getTexture(fileName) : this.objectTextures.getTexture(fileName);

        const blockCenterX = blockX * TILE_WIDTH + TILE_WIDTH / 2;
        const blockCenterY = blockY * TILE_HEIGHT + TILE_HEIGHT / 2;
        const x = blockCenterX - texture.shape.body.left[0];
        const y = blockCenterY - texture.shape.body.top[0];

        const pixiTexture = texture.getPixiTexture(0);
        const sprite = new PIXI.Sprite(pixiTexture);
        sprite.position.set(x, y);
        sprite.blockX = blockX;
        sprite.blockY = blockY;
        this.objectSprites.push(sprite);

        if (ENABLE_DRAW_MAP_DEBUG) {
            this.graphics.lineStyle(1, 0xf5b042);
            this.graphics.drawRect(
                blockX * TILE_WIDTH,
                blockY * TILE_HEIGHT,
                TILE_WIDTH,
                TILE_HEIGHT
            );
        }

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
            sprite.blockX = blockX;
            sprite.blockY = blockY;
            sprite.play();
            this.objectSprites.push(sprite);
        }

        // shadow
        if ((objectInfo.isDrawShadow || isBuilding) && texture.isExistShadow) {
            const pixiTexture = texture.getPixiTexture(0, "shadow");

            const x = blockCenterX - texture.shape.shadow.left[0];
            const y = blockCenterY - texture.shape.shadow.top[0];

            const sprite = new PIXI.Sprite(pixiTexture);
            sprite.position.set(x, y);

            this.shadowSprites.push(sprite);
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
            sprite.blockX = blockX;
            sprite.blockY = blockY;
            this.objectSprites.push(sprite);

            // animated objects (rfo)
            if (animationObjectTexIds[mapsetName]?.rfo?.includes(textureId)) {
                const pixiTextures = [];
                for (let i = 1; i < texture.frameCount; i++) {
                    pixiTextures.push(texture.getPixiTexture(i));
                }
                const x = blockCenterX - texture.shape.body.left[1];
                const y = blockCenterY - texture.shape.body.top[1];
                const sprite = new PIXI.AnimatedSprite(pixiTextures);
                sprite.blockX = blockX;
                sprite.blockY = blockY;
                sprite.position.set(x, y);
                sprite.animationSpeed = 0.1;
                sprite.play();
                this.objectSprites.push(sprite);
            }
        });

        // render building parts
        if (isBuilding) {
            objectInfo.parts.forEach(frameIndex => {
                const pixiTexture = texture.getPixiTexture(frameIndex);

                const x = blockCenterX - texture.shape.body.left[frameIndex];
                const y = blockCenterY - texture.shape.body.top[frameIndex];

                const sprite = new PIXI.Sprite(pixiTexture);
                sprite.position.set(x, y);
                sprite.blockX = blockX;
                sprite.blockY = blockY;

                this.objectSprites.push(sprite);

                if (texture.isExistShadow) {
                    const pixiTexture = texture.getPixiTexture(frameIndex, "shadow");

                    const x = blockCenterX - texture.shape.shadow.left[frameIndex];
                    const y = blockCenterY - texture.shape.shadow.top[frameIndex];

                    const sprite = new PIXI.Sprite(pixiTexture);
                    sprite.position.set(x, y);

                    this.shadowSprites.push(sprite);
                }
            });
        }
    }

    renderPortals() {
        this.map.areaInfos.forEach(area => {
            if (!area.moveToFileName) return;
            if (area.objectInfo !== ObjectType.WarpPortal) return;

            const centerPos = area.centerPos;
            let sprite;

            if (area.gateShape === 1) { // door
                const textures = Array(6).fill(null).map((v, i) => this.portalTexture.getPixiTexture(i));
                sprite = new PIXI.AnimatedSprite(textures);
            }
            else if (area.gateShape === 4) {
                const index = 109;
                const textures = Array(6).fill(null).map((v, i) => this.portalTexture.getPixiTexture(index + i));
                sprite = new PIXI.AnimatedSprite(textures);
            }
            else {
                const index = area.gateDirect + 2;
                const offset = index * 6;
                const textures = Array(6).fill(null).map((v, i) => this.portalTexture.getPixiTexture(offset + i));
                sprite = new PIXI.AnimatedSprite(textures);
            }

            const x = centerPos.x - sprite.width / 2;
            const y = centerPos.y - sprite.height / 2;

            sprite.position.set(x, y);
            sprite.interactive = true;
            sprite.animationSpeed = 0.3;
            sprite.play();
            sprite.on("mouseenter", () => {
                sprite.isHovering = true;

                // TOOD: implement portal grow animations
            });
            sprite.on("mouseleave", () => {
                sprite.isHovering = false;
            });
            sprite.on("mousedown", () => {
                this.selectedPortal = { area, sprite };
            });

            this.portalContainer.addChild(sprite);
        });
    }

    renderActors() {
        this.map.actorSingles.forEach(async actor => {
            const group = this.map.actorGroups[actor.internalID];
            const texture = this.actorTextures[group.job];

            if (!texture) return;
            if (!texture.actions || !texture.actions.length) return; // not supported yet (e.g. ギルディル川　沼地洞窟　Ｂ１ "TongueEye.sad")

            let dir;
            switch (actor.charType) {
                case CType.Monster:
                case CType.QuestMonster:
                    dir = "monsters";
                    ActorImage[group.job] + ".sad";
                    break;

                default:
                    dir = "NPC";
                    ActorImage[group.job] + ".sad";
                    break;
            }

            const action = texture.actions.find(a => a.name.match(/^02/));
            const startFrameIndex = action.startFrameIndex;
            let frameCount;
            let nextFrameIndex;

            if (action.index === texture.actions.length - 1) {
                // theres no next action
                nextFrameIndex = texture.frameCount;
            } else {
                const nextAction = texture.actions[texture.actions.indexOf(action) + 1];
                nextFrameIndex = nextAction.startFrameIndex;
            }

            frameCount = (nextFrameIndex - startFrameIndex) / 8;
            if (frameCount === 0) return;

            const actorDirect = actor.direct === 8 ? ~~(Math.random() * 8) : actor.direct;
            const targetFrame = startFrameIndex + actorDirect * frameCount;

            const pixiTextures = [];
            const pixiShadowTextures = [];

            for (let i = 0; i < frameCount; i++) {
                const tex = texture.getPixiTexture(targetFrame + i);
                pixiTextures.push(tex);
                const shadowTex = texture.getPixiTexture(targetFrame + i, "shadow");
                pixiShadowTextures.push(shadowTex);
            }

            const scaleX = group.scale.width / 100;
            const scaleY = group.scale.height / 100;
            const x = actor.point.x - texture.shape.body.left[targetFrame] * scaleX;
            const y = actor.point.y - texture.shape.body.height[targetFrame] * scaleY;

            // const sprite = new PIXI.Sprite(pixiTexture);
            const sprite = new PIXI.AnimatedSprite(pixiTextures);
            sprite.position.set(x, y);
            sprite.scale.set(scaleX, scaleY);
            sprite.animationSpeed = 0.1;
            sprite.startFrameIndex = targetFrame;
            sprite.shape = texture.shape.body;
            sprite.baseX = actor.point.x;
            sprite.baseY = actor.point.y;
            sprite.blockX = Math.floor(actor.point.x / TILE_WIDTH);
            sprite.blockY = Math.floor(actor.point.y / TILE_HEIGHT);
            sprite.isActorSprite = true;
            sprite.play();

            const shadowX = actor.point.x - texture.shape.shadow.left[targetFrame] * scaleX;
            const shadowY = actor.point.y - texture.shape.shadow.height[targetFrame] * scaleY;

            const shadowSprite = new PIXI.AnimatedSprite(pixiShadowTextures);
            shadowSprite.position.set(shadowX, shadowY);
            shadowSprite.scale.set(scaleX, scaleY);
            shadowSprite.animationSpeed = 0.1;
            shadowSprite.startFrameIndex = targetFrame;
            shadowSprite.shape = texture.shape.shadow;
            shadowSprite.baseX = actor.point.x;
            shadowSprite.baseY = actor.point.y;
            shadowSprite.blockX = Math.floor(actor.point.x / TILE_WIDTH);
            shadowSprite.blockY = Math.floor(actor.point.y / TILE_HEIGHT);
            shadowSprite.play();

            const guageTexture = PIXI.Texture.from(CommonUI.getGuage(dir === "NPC" ? "npc" : "enemy", actor.name));
            const guageSprite = new PIXI.Sprite(guageTexture);
            guageSprite.position.set(actor.point.x - guageSprite.width / 2, y - 20);

            if (dir === "NPC") { // set cool time if target is NPC (to be natural)
                sprite.loop = false;
                shadowSprite.loop = false;
                const onComplete = () => {
                    setTimeout(() => {
                        sprite.gotoAndPlay(0);
                        shadowSprite.gotoAndPlay(0);
                    }, 5000 * ~~(Math.random() * 3));
                };
                sprite.onComplete = onComplete;
                sprite.guageSprite = guageSprite;
                this.renderHeadIcon(actor, sprite);
            }

            sprite.interactive = true;
            sprite.on("mouseover", () => {
                sprite.isHovering = true;
                if (dir !== "NPC") sprite.guageSprite = guageSprite;
            });
            sprite.on("mouseout", () => {
                sprite.isHovering = false;
                if (dir !== "NPC") sprite.guageSprite = null;
            });

            if (ENABLE_DRAW_MAP_DEBUG) {
                this.graphics.lineStyle(3, 0xeb4034);
                this.graphics.drawCircle(actor.point.x, actor.point.y, 10);
            }

            // this.shadowSprites.push(shadowSprite);
            this.actorSprites.push(shadowSprite); // temp
            this.actorSprites.push(sprite);
        });
    }

    renderHeadIcon(actor, actorSprite) {
        const iconTexture = CommonUI.getActorHeadIcon(actor);

        if (!iconTexture) return;

        const brightSprite = new PIXI.Sprite(CommonUI.shopIconBrightTexture);
        const sprite = new PIXI.Sprite(iconTexture);
        sprite.anchor.set(0.5, 0.5);
        sprite.position.set(actor.point.x, actor.point.y - actorSprite.height - 60);
        brightSprite.anchor.set(0.5, 0.5);
        brightSprite.blendMode = PIXI.BLEND_MODES.ADD;
        brightSprite.position.set(actor.point.x, actor.point.y - actorSprite.height - 60);
        // this.actorSprites.push(brightSprite);
        // this.actorSprites.push(sprite);
        actorSprite.headIconSpriteSet = [brightSprite, sprite];
    }

    initPosition() {
        if (this.prevRmdName) {
            const portalToPrevMap = this.map.areaInfos.find(area => area.moveToFileName === this.prevRmdName);

            if (portalToPrevMap) {
                Camera.setPosition(portalToPrevMap.centerPos.x, portalToPrevMap.centerPos.y);
                RedStone.player.setPosition(portalToPrevMap.centerPos.x, portalToPrevMap.centerPos.y);
            } else {
                console.log("prev map portal not found :(");
                const portals = this.map.areaInfos.filter(area => [ObjectType.WarpPortal, ObjectType.SystemMovePosition].includes(area.objectInfo));
                const randomPortal = portals[Math.floor(Math.random() * portals.length)];
                Camera.setPosition(randomPortal.centerPos.x, randomPortal.centerPos.y);
                RedStone.player.setPosition(randomPortal.centerPos.x, randomPortal.centerPos.y);
            }
        }
    }

    getRealSize() {
        if (!this.map) return null;
        return {
            width: this.map.size.width * TILE_WIDTH,
            height: this.map.size.height * TILE_HEIGHT
        }
    }

    async moveField(rmdFileName) {
        if (rmdFileName === this.currentRmdFileName) return;
        this.prevRmdName = this.currentRmdFileName;
        LoadingScreen.render();
        RedStone.miniMap.reset();
        this.reset();
        await this.loadMap(rmdFileName);
        await this.init();
        RedStone.mainCanvas.mainContainer.removeChild(RedStone.player.container);
        RedStone.player.reset();
        RedStone.player.render();
        RedStone.miniMap.init();
        LoadingScreen.destroy();
    }

    getBlock(x, y) {
        const blocks = this.map.tileData3;
        if (blocks.length <= y * this.map.size.width + x) {
            return 1;
        }
        return blocks[y * this.map.size.width + x];
    }

    isBlockedWay(ax, ay, bx, by) {
        const x0 = Math.min(ax, bx);
        const x1 = Math.max(ax, bx);
        const y0 = Math.min(ay, by);
        const y1 = Math.max(ay, by);

        if (bx - ax > by - ay) {
            for (let x = x0; x < x1; x++) {
                const block = this.getBlock(
                    Math.round(x / 64),
                    Math.round(lerp(x0, y0, x1, y1, x) / 32)
                );
                if (block !== 0) {
                    console.log("code1", block)
                    return true;
                }
            }
        } else {
            for (let y = y0; y < y1; y++) {
                const block = this.getBlock(
                    Math.round(lerp(y0, x0, y1, x1, y) / 64),
                    Math.round(y / 32)
                );
                if (block !== 0) {
                    console.log("code2", block)
                    return true;
                }
            }
        }

        return false;
    }
}

const lerp = (x00, y00, x11, y11, x) => {
    return y00 + (y11 - y00) * (x - x00) / (x11 - x00);
}

export default GameMap;