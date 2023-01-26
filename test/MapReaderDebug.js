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
          ctx.globalAlpha = 0.5;
          ctx.drawImage(tileImage, 0, 0, 64, 32, j * scaledWidth, i * scaledHeight, scaledWidth, scaledHeight);
          ctx.globalAlpha = 1;
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

    const getTextureFileName = (imageFileId, extension = "rso") => {
      const idStrLen = String(imageFileId).length;
      const numZero = 4 - idStrLen;
      return `sn__object_${(new Array(numZero)).fill(0).join("")}${imageFileId}.${extension}`;
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
          const fileInfoIndex = objectFileInfoStartIndex + 64 * index;
          const imageFileId = this.brunenstigRmd.readUInt16LE(fileInfoIndex);
          const useShadow = this.brunenstigRmd.readUInt8(fileInfoIndex + 50) === 1 || false;

          if (fileInfoIndex > 20970) console.log("file info index", fileInfoIndex, imageFileId);
          // console.log("useshadow?", useShadow);
          if (imageFileId === 50) {
            console.log("check image file id", imageFileId);
            console.log(bytes);
            console.log(Buffer.from(bytes).readUint16LE(0));
          }
          const offsetX = 0;
          const offsetY = -0;
          const fileName = getTextureFileName(imageFileId);
          const texture = zippedTextures.getTexture(fileName);
          texture.setUseShadow(useShadow);
          const textureCanvas = texture.getCanvas(0);

          // if (imageFileId !== 4 && imageFileId !== 5) continue;
          // if (imageFileId === 4) continue;
          const objectBodyTop = texture.maxSizeInfo.top - texture.shape.body.top[0];
          const objectBodyLeft = texture.maxSizeInfo.left - texture.shape.body.left[0];
          const objectBodyCenterX = objectBodyLeft + texture.shape.body.width[0] / 2;
          const objectBodyCenterY = objectBodyTop + texture.shape.body.height[0] / 2;

          const blockCenterX = j * 64 + 32;
          const blockCenterY = i * 32 + 16;

          const x = j * 64 + 32 - objectBodyLeft - texture.shape.body.width[0] / 2;
          const y = i * 32 + 16 - objectBodyTop - texture.shape.body.height[0] / 2;
          // const x = blockCenterX - (objectBodyCenterX);
          // const y = blockCenterY - (objectBodyCenterY) - texture.shape.body.height[0] / 2;
          // const x = j * 64 + 32 - textureCanvas.width / 2 + offsetX;
          // const y = i * 32 + 16 - textureCanvas.height / 2 + offsetY;
          // const x = j * 64 - (textureCanvas.width - 64) / 2;
          // const y = i * 32 - textureCanvas.height + 32;
          this.ctx.drawImage(textureCanvas, x, y);


          if (bytes[0] === 15 && bytes[1] === 16 || true) {
            const decorationObject = this.brunenstigRmd.readUInt16LE(fileInfoIndex + 2);

            if (decorationObject !== 65535) {
              const fileName = getTextureFileName(decorationObject, "rfo");
              const texture2 = zippedTextures.getTexture(fileName);
              const textureCanvas2 = texture2.getCanvas(0);
              const texPosX = this.brunenstigRmd.readUInt8(fileInfoIndex + 4);
              console.log("anchor info", this.brunenstigRmd.readUInt8(fileInfoIndex + 5), this.brunenstigRmd.readUInt8(fileInfoIndex + 7));
              const anchorX = this.brunenstigRmd.readUInt8(fileInfoIndex + 5) === 0xff ? map.boundingBox.left : j * 64;
              const texPosY = this.brunenstigRmd.readUInt8(fileInfoIndex + 6);
              const anchorY = this.brunenstigRmd.readUInt8(fileInfoIndex + 7) === 0xff ? map.boundingBox.top : i * 32;

              console.log("check tex pos", texPosX, texPosY);
              // const _x = j * 64 + 32 - texture2.shape.body.width[0] / 2 + texPosX / 10;
              // const _y = i * 32 + 16 - texture2.shape.body.height[0] / 2;
              const _x = anchorX + texPosX;
              const _y = anchorY + texPosY;
              // const _x = x;
              // const _y = y;

              setTimeout(() => {
                this.ctx.drawImage(textureCanvas2, _x, _y);
              }, 50);
            }
          }

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
            this.ctx.fillText(imageFileId, blockX, blockY);

            // object rect
            // this.ctx.lineWidth = 1;
            // this.ctx.strokeStyle = "#fcba03";
            // this.ctx.beginPath();
            // this.ctx.rect(x, y, textureCanvas.width, textureCanvas.height);
            // this.ctx.stroke();
            // this.ctx.closePath();
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
        const x = obj.point.x;
        const y = obj.point.y;
        this.ctx.drawImage(textureCanvas, x, y);
        console.log("pos specified obj", fileName, x, y, obj.unk_0);
      });
    }

    drawTiles();
    drawAreaInfoRect();
    drawNpcRect();
    drawPortals();
    drawObjects_Test();
    drawPositionSpecifiedObjects();
  }
}

export default MapReaderDebug;