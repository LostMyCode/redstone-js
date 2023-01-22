import BufferReader from "../utils/BufferReader";
import RedStoneMap, { MapType, ObjectType } from "../utils/Map";

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

  async loadCommonResources() {
    this.portalImages = await this.loadZippedImages("static/gateAnm.zip");
    console.log("[MapReaderDebug] common resources loaded");
  }

  async execute() {
    await this.loadCommonResources();
    this.brunenstigRmd = await this.fetchBinaryFile("static/[000]T01.rmd");
    this.brunenstigRmd = Buffer.from(this.brunenstigRmd);

    const br = new BufferReader(this.brunenstigRmd);
    const map = new RedStoneMap(br);
    const tileImages = await this.loadZippedImages("static/Brunenstig_tiles.zip");

    const drawTiles = () => {
      const ctx = this.ctx;
      const scale = 1;
      for (let i = 0; i < map.headerSize.height; i++) {
        for (let j = 0; j < map.headerSize.width; j++) {
          const tileCode = map.tileData1[i * map.headerSize.width + j] % (16 << 10); // 16 << 10 = 256 * 64 no idea...
          const tileImage = tileImages[tileCode];
          ctx.drawImage(tileImage, 0, 0, 64, 32, j * (64 * scale), i * (32 * scale), (64 * scale), (32 * scale));
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
            const isNearRightBorder = 64 * map.headerSize.width - centerPos.x < 500;
            const isNearBottomBorder = 32 * map.headerSize.height - centerPos.y < 500;

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

    drawTiles();
    drawAreaInfoRect();
    drawPortals();
  }
}

export default MapReaderDebug;