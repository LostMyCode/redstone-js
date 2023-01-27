import BufferReader from "../utils/BufferReader";
import RedStoneMap, { ActorImage, Mapset, MapType, ObjectType } from "../utils/Map";
import { getKeyByValue, logger } from "../utils/RedStoneRandom";
import Texture, { ZippedTextures } from "../utils/Texture";

const portalTextureInfo = {
  door: {},
  doorGrow: {},
  topGate: {},
  topRightGate: {},
  rightGate: {},
  bottomRightGate: {},
  bottomGate: {},
  bottomLeftGate: {},
  leftGate: {},
  topLeftGate: {},
}

// const DATA_DIR = "/data/";
const DATA_DIR = "https://sigr.io/redstone/";
const MAPSET_DIR = "https://sigr.io/redstone/Mapset/";
const INTERFACE_DIR = "https://sigr.io/redstone/Interface/";
const RMD_DIR = "https://sigr.io/redstone/Scenario/";

class MapReaderDebug {
  /**
   * @type {CanvasRenderingContext2D}
   */
  ctx = document.getElementById("canvas").getContext('2d');

  async fetchBinaryFile(path) {
    console.log(`[Binary Fetch] Fetching: ${path}`);
    const f = await fetch(path);
    const ab = await f.arrayBuffer();
    console.log(`[Binary Fetch] Fetched: ${path}`);
    return Buffer.from(ab);
  }

  async loadImageSync(src) {
    return await new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.src = src;
    });
  }

  async loadZippedImages(path) {
    const buf = await this.fetchBinaryFile(path);
    const unzip = new Zlib.Unzip(buf);
    const fileNames = unzip.getFilenames();
    const images = {};
    let loadedCount = 0;

    return await new Promise((resolve) => {
      fileNames.forEach(fileName => {
        const data = unzip.decompress(fileName);
        const blob = new Blob([data], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        const img = new Image;
        img.onload = function () {
          loadedCount++;
          if (loadedCount === fileNames.length) {
            resolve(images);
          }
        }
        img.src = url;
        const imageNum = parseInt(fileName.match(/_(\d+)/)[1]);
        images[imageNum] = img;
      });
    });
  }

  async loadTexture(path) {
    const buf = await this.fetchBinaryFile(path);
    console.log("[Texture] Loading texture...", path);
    const texture = new Texture(path.split("/").pop(), buf);
    console.log("[Texture] Ready!!", path);
    return texture;
  }

  async loadZippedTextures(path) {
    const buf = await this.fetchBinaryFile(path);
    console.log("[Texture] Loading zipped textures...", path);
    const zippedTextures = new ZippedTextures(buf);
    console.log("[Texture] Ready!!", path);
    return zippedTextures;
  }

  async loadCommonResources() {
    console.log("[MapReaderDebug] Loading common resources...");
    // this.portalImages = await this.loadZippedImages(DATA_DIR + "gateAnm.zip");
    this.portalImages = await this.loadTexture(`${INTERFACE_DIR}gateAnm.sad`);
    console.log("[MapReaderDebug] common resources loaded");
  }

  /**
   * @param {RedStoneMap} map 
   */
  async loadNpcTextures(map) {
    this.npcTextures = {};

    for (let i = 0; i < map.npcGroups.length; i++) {
      const npcGroup = map.npcGroups[i];
      if (!ActorImage[npcGroup.job]) return;
      const textureFileName = ActorImage[npcGroup.job] + ".sad";
      if (this.npcTextures[textureFileName]) continue;
      const textureBuffer = await this.fetchBinaryFile(DATA_DIR + "NPC/" + textureFileName);
      this.npcTextures[textureFileName] = new Texture(textureFileName, textureBuffer);
    }
  }

  async execute() {
    // this.ctx.scale(0.5, 0.5);
    await this.loadCommonResources();
    const fileName = (location.pathname.split("Map/").pop() || "[060]T01_A01") + ".rmd";
    this.rmdFileBuffer = await this.fetchBinaryFile(RMD_DIR + fileName);

    const br = new BufferReader(this.rmdFileBuffer);
    const map = new RedStoneMap(br);
    window.currentMap = map; // for debug
    const mapset = getKeyByValue(Mapset, map.textureDirectoryId);
    this.tileTextures = await this.fetchBinaryFile(MAPSET_DIR + `${mapset}/tile.mpr`);
    this.tileTextures = new Texture("tile.mpr", Buffer.from(this.tileTextures));

    await this.loadNpcTextures(map);

    const drawTiles = () => {
      const ctx = this.ctx;
      const scale = 1;
      for (let i = 0; i < map.size.height; i++) {
        for (let j = 0; j < map.size.width; j++) {
          const tileCode = map.tileData1[i * map.size.width + j] % (16 << 10); // 16 << 10 = 256 * 64 no idea...
          const tileImage = this.tileTextures.getCanvas(tileCode);
          const scaledWidth = 64 * scale;
          const scaledHeight = 32 * scale;
          // ctx.globalAlpha = 0.5;
          ctx.drawImage(tileImage, 0, 0, 64, 32, j * scaledWidth, i * scaledHeight, scaledWidth, scaledHeight);
          // ctx.globalAlpha = 1;
        }
      }
    }

    const drawAreaInfoRect = () => {
      const ctx = this.ctx;
      const areaInfos = map.areaInfos;
      areaInfos.forEach(area => {
        const x = area.leftUpPos.x;
        const y = area.leftUpPos.y;
        const w = area.rightDownPos.x - x;
        const h = area.rightDownPos.y - y;

        ctx.strokeStyle = "#a22";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.stroke();
        ctx.closePath();

        const objType = Object.keys(ObjectType).find(key => {
          return ObjectType[key] === area.objectInfo
        });
        ctx.font = "20px Arial";
        ctx.fillText(objType + ` ${area.moveToFileName || ""}`, x, y);
      });
    }

    console.log(map.npcSingles, map.npcGroups);

    const drawNpc = () => {
      const framesPerAnimation = 8;
      map.npcSingles.forEach(async npcSingle => {
        const npcGroup = map.npcGroups.find(g => g.internalID === npcSingle.internalID);
        const textureFileName = ActorImage[npcGroup.job] + ".sad";
        // console.log(textureFileName);
        const texture = this.npcTextures[textureFileName];
        if (!texture) return;
        console.log("check npc texture", texture, textureFileName);
        const targetFrame = npcSingle.direct * framesPerAnimation;
        const textureCanvas = texture.getCanvas(targetFrame);

        const x = npcSingle.point.x - textureCanvas.width / 2;
        const y = npcSingle.point.y - textureCanvas.height + 16;

        this.ctx.drawImage(textureCanvas, x, y);
      });
    }

    const drawNpcRect = () => {
      const ctx = this.ctx;
      const npcs = map.npcSingles
      npcs.forEach(npc => {
        const { x, y } = npc.point;

        ctx.strokeStyle = "#11b";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.rect(x - 10, y - 10, 20, 20);
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = "#fff";
        ctx.font = "14px Arial";
        ctx.fillText(npc.name, x, y);
      });
    }

    const drawPortals = () => {
      const ctx = this.ctx;
      const portalImages = this.portalImages;
      map.areaInfos.forEach(area => {
        if (!area.moveToFileName) return;
        if (area.objectInfo === ObjectType.WarpPortal) {
          const centerPos = area.centerPos;
          let image = portalImages.getCanvas(12);
          // it is better way to load all rmd and check MapType of map beyond the gate
          // check the filename instead as its easier
          const isGateOrDungeon = area.moveToFileName.match(/G\d+|_D\d+/);
          if (
            // mapBeyondTheGate.typeAndFlags !== MapType.Shop
            // area.subObjectInfo === 13 || area.subObjectInfo === 21
            isGateOrDungeon
          ) {
            const isNearLeftBorder = centerPos.x < 500;
            const isNearTopBorder = centerPos.y < 500;
            const isNearRightBorder = 64 * map.size.width - centerPos.x < 500;
            const isNearBottomBorder = 32 * map.size.height - centerPos.y < 500;

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
            image = portalImages.getCanvas(offset);
          }
          else {
            const index = Object.values(portalTextureInfo).indexOf(portalTextureInfo.door);
            const offset = index * 6;
            image = portalImages.getCanvas(offset);
          }
          const x = centerPos.x - image.width / 2;
          const y = centerPos.y - image.height / 2;
          ctx.drawImage(image, x, y);
        }
      })
    }

    const zippedObjectTextures = await this.loadZippedTextures(MAPSET_DIR + `${mapset}/${mapset}_Objects.zip`);
    const zippedBuildingTextures = Object.keys(map.buildingInfos).length ?
      await this.loadZippedTextures(MAPSET_DIR + `${mapset}_Buildings.zip`)
      : null;

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

    const drawObjects_Test = async () => {
      const objectMatrix = map.tileData3;
      for (let i = 0; i < map.size.height; i++) {
        for (let j = 0; j < map.size.width; j++) {
          const bytes = objectMatrix[i * map.size.width + j];
          let index;
          let isBuilding = false;
          if (bytes === 0) continue;
          if (map.scenarioVersion === 5.3 && bytes < 16 << 8) continue;
          if (map.scenarioVersion === 6.1 && bytes < 16 << 10) continue;
          if (map.scenarioVersion === 5.3) {
            index = bytes % (16 << 8);
          }
          else if (map.scenarioVersion === 6.1) {
            isBuilding = bytes >= 16 << 11;
            index = isBuilding ? bytes % (16 << 11) : bytes % (16 << 10);
          }
          const objectInfo = isBuilding ? map.buildingInfos[index + 1] : map.objectInfos[index + 1];
          if (!objectInfo) {
            console.log("invalid object index", index, bytes);
            continue;
          }
          if (i * map.size.width + j === 5194) {
            console.log(objectInfo, index, bytes);
          }

          const fileName = getTextureFileName(objectInfo.textureId, isBuilding ? "rbd" : undefined);
          const texture = isBuilding ? zippedBuildingTextures.getTexture(fileName) : zippedObjectTextures.getTexture(fileName);
          // texture.setUseShadow(objectInfo.enableShadow);
          const textureCanvas = texture.getCanvas(0);

          const objectBodyTop = texture.maxSizeInfo.top - texture.shape.body.top[0];
          const objectBodyLeft = texture.maxSizeInfo.left - texture.shape.body.left[0];
          const objectBodyCenterX = objectBodyLeft + texture.shape.body.width[0] / 2;
          const objectBodyCenterY = objectBodyTop + texture.shape.body.height[0] / 2;

          const blockCenterX = j * 64 + 32;
          const blockCenterY = i * 32 + 16;

          const x = blockCenterX - texture.shape.body.left[0];
          const y = blockCenterY - texture.shape.body.top[0];

          this.ctx.drawImage(textureCanvas, x, y);

          if (isBuilding && texture.frameCount > 1) {
            const r = new BufferReader(Buffer.from(objectInfo.unk0));
            while (true) {
              const id = r.readUInt16LE();
              if (id === 65535) break;
              // console.log("check id", id);
              const textureCanvas = texture.getCanvas(id);
              const x = blockCenterX - texture.shape.body.left[id];
              const y = blockCenterY - texture.shape.body.top[id];
              this.ctx.drawImage(textureCanvas, x, y);
            }
          }

          !isBuilding && objectInfo.subObjectInfos.forEach(subObjectInfo => {
            const { textureId, offsetX, offsetY, xAnchorFlag, yAnchorFlag } = subObjectInfo;
            const fileName = getTextureFileName(textureId, "rfo");
            const texture = zippedObjectTextures.getTexture(fileName);
            const textureCanvas = texture.getCanvas(0);
            const posX = xAnchorFlag === 0xff ? blockCenterX - 0xff + offsetX - texture.shape.body.left[0] : blockCenterX + offsetX - texture.shape.body.left[0];
            const posY = yAnchorFlag === 0xff ? blockCenterY - 0xff + offsetY - texture.shape.body.top[0] : blockCenterY + offsetY - texture.shape.body.top[0];
            this.ctx.drawImage(textureCanvas, posX, posY);
            setTimeout(() => {
              // object rect
              // this.ctx.lineWidth = 1;
              // this.ctx.strokeStyle = "#fcba03";
              // this.ctx.beginPath();
              // this.ctx.rect(posX, posY, textureCanvas.width, textureCanvas.height);
              // this.ctx.stroke();
              // this.ctx.closePath();
              // this.ctx.lineWidth = 2;

              // this.ctx.fillText(`pid: ${objectInfo.index}`, posX, posY);
            }, 50);
          });

          setTimeout(() => {
            // return;

            const rectWidth = 64;
            const rectHeight = 32;
            const blockX = j * 64;
            const blockY = i * 32;
            this.ctx.strokeStyle = "#11b";
            this.ctx.beginPath();
            this.ctx.rect(blockX, blockY, rectWidth, rectHeight);
            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.fillText(objectInfo.textureId + `(id: ${objectInfo.index})`, blockX, blockY);

            if ([4, 5].includes(objectInfo.textureId)) return;

            // object rect
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "#fcba03";
            this.ctx.beginPath();
            this.ctx.rect(x, y, textureCanvas.width, textureCanvas.height);
            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.lineWidth = 2;

            // info text
            this.ctx.fillText(`tex: ${objectInfo.textureId}, ${i * map.size.width + j}`, x, y);
          }, 100);
        }
      }
    }

    const drawPositionSpecifiedObjects = () => {
      const objects = map.positionSpecifiedObjects;
      objects.forEach(obj => {
        const fileName = getTextureFileName(obj.textureId, "rfo");
        const texture = zippedObjectTextures.getTexture(fileName);
        const textureCanvas = texture.getCanvas(0);
        const x = obj.point.x - texture.shape.body.left[0];
        const y = obj.point.y - texture.shape.body.top[0];
        this.ctx.drawImage(textureCanvas, x, y);
        // console.log("pos specified obj", fileName, x, y, obj.unk_0);
      });
    }

    drawTiles();
    drawAreaInfoRect();
    drawPositionSpecifiedObjects();
    drawPortals();
    drawNpc();
    drawObjects_Test();
    drawNpcRect();
  }
}

export default MapReaderDebug;