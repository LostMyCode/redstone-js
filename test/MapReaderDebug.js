import BufferReader from "../utils/BufferReader";
import RedStoneMap, { MapType, ObjectType } from "../utils/Map";
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

const DATA_DIR = "data/";

class MapReaderDebug {
  /**
   * @type {CanvasRenderingContext2D}
   */
  ctx = document.getElementById("canvas").getContext('2d');

  async fetchBinaryFile(path) {
    const f = await fetch(path);
    const ab = await f.arrayBuffer();
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

  async loadZippedTextures(path) {
    const buf = await this.fetchBinaryFile(path);
    const zippedTextures = new ZippedTextures(buf);
    return zippedTextures;
  }

  async loadCommonResources() {
    this.portalImages = await this.loadZippedImages(DATA_DIR + "gateAnm.zip");
    console.log("[MapReaderDebug] common resources loaded");
  }

  async execute() {
    // this.ctx.scale(0.5, 0.5);
    await this.loadCommonResources();
    // this.brunenstigRmd = await this.fetchBinaryFile(DATA_DIR + "[000]T01.rmd");
    this.brunenstigRmd = await this.fetchBinaryFile(DATA_DIR + "[060]T01_A01.rmd");
    this.brunenstigRmd = Buffer.from(this.brunenstigRmd);

    const br = new BufferReader(this.brunenstigRmd);
    const map = new RedStoneMap(br);
    const tileImages = await this.loadZippedImages(DATA_DIR + "Room_tiles.zip");
    // const tileImages = await this.loadZippedImages(DATA_DIR + "Brunenstig_tiles.zip");

    const drawTiles = () => {
      const ctx = this.ctx;
      const scale = 1;
      for (let i = 0; i < map.size.height; i++) {
        for (let j = 0; j < map.size.width; j++) {
          const tileCode = map.tileData1[i * map.size.width + j] % (16 << 10); // 16 << 10 = 256 * 64 no idea...
          const tileImage = tileImages[tileCode];
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
          let image = portalImages[12];
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
            image = portalImages[offset];
          }
          else {
            const index = Object.values(portalTextureInfo).indexOf(portalTextureInfo.door);
            const offset = index * 6;
            image = portalImages[offset];
          }
          const x = centerPos.x - image.width / 2;
          const y = centerPos.y - image.height / 2;
          ctx.drawImage(image, x, y);
        }
      })
    }

    const zippedTextures = await this.loadZippedTextures(DATA_DIR + "Objects/Room_Objects.zip");

    const getTextureFileName = (textureId, extension = "rso") => {
      const idStrLen = String(textureId).length;
      const numZero = 4 - idStrLen;
      return `sn__object_${(new Array(numZero)).fill(0).join("")}${textureId}.${extension}`;
    }

    const drawObjects_Test = async () => {
      const objectMatrix = map.tileData3;
      const objectFileInfoStartIndex = 17709;
      for (let i = 0; i < map.size.height; i++) {
        for (let j = 0; j < map.size.width; j++) {
          const bytes = objectMatrix[i * map.size.width + j];
          if (bytes[1] === 0) continue;
          if (map.scenarioVersion === 5.3 && (bytes[1] === 0x08)) continue;
          if (map.scenarioVersion === 6.1 && (bytes[1] === 0x20)) continue;
          // if (bytes[0] === 47 && bytes[1] === 16) continue; box beside of table
          const index = bytes[0];
          const objectInfo = map.objectInfos[index];
          const fileInfoIndex = objectFileInfoStartIndex + 64 * index;
          const useShadow = this.brunenstigRmd.readUInt8(fileInfoIndex + 50) === 1 || false;

          // console.log("useshadow?", useShadow);
          const fileName = getTextureFileName(objectInfo.textureId);
          const texture = zippedTextures.getTexture(fileName);
          texture.setUseShadow(useShadow);
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

          objectInfo.subObjectInfos.forEach(subObjectInfo => {
            const { textureId, offsetX, offsetY, xAnchorFlag, yAnchorFlag } = subObjectInfo;
            const fileName = getTextureFileName(textureId, "rfo");
            const texture = zippedTextures.getTexture(fileName);
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

          // if (bytes[0] === 15 && bytes[1] === 16 || true) {
          // }

          setTimeout(() => {
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
            return;

            // object rect
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "#fcba03";
            this.ctx.beginPath();
            this.ctx.rect(x, y, textureCanvas.width, textureCanvas.height);
            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.lineWidth = 2;

            // info text
            this.ctx.fillText(`id: ${objectInfo.index}`, x, y);
          }, 100);
        }
      }
    }

    const drawPositionSpecifiedObjects = () => {
      const objects = map.positionSpecifiedObjects;
      objects.forEach(obj => {
        const fileName = getTextureFileName(obj.textureId, "rfo");
        const texture = zippedTextures.getTexture(fileName);
        const textureCanvas = texture.getCanvas(0);
        const x = obj.point.x - textureCanvas.width / 2;
        const y = obj.point.y - textureCanvas.height + 16;
        this.ctx.drawImage(textureCanvas, x, y);
        // console.log("pos specified obj", fileName, x, y, obj.unk_0);
      });
    }

    drawTiles();
    drawAreaInfoRect();
    drawNpcRect();
    drawPortals();
    drawPositionSpecifiedObjects();
    drawObjects_Test();
  }
}

export default MapReaderDebug;