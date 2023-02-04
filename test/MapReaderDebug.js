import BufferReader from "../utils/BufferReader";
import RedStoneMap, { Mapset, MapType, ObjectType, portalTextureInfo } from "../game/models/Map";
import { getKeyByValue, logger } from "../utils/RedStoneRandom";
import Texture from "../game/models/Texture";
import { ActorImage } from "../game/models/Actor";
import { fetchBinaryFile, loadTexture, loadZippedTextures } from "../utils";
import { DATA_DIR, INTERFACE_DIR, MAPSET_DIR, RMD_DIR, TILE_HEIGHT, TILE_WIDTH } from "../game/Config";

// const DATA_DIR = "/data/";

class MapReaderDebug {
  /**
   * @type {HTMLCanvasElement}
   */
  canvas = document.getElementById("canvas");
  /**
   * @type {CanvasRenderingContext2D}
   */
  ctx = document.getElementById("canvas").getContext('2d');

  async loadCommonResources() {
    console.log("[MapReaderDebug] Loading common resources...");
    this.portalImages = await loadTexture(`${INTERFACE_DIR}/gateAnm.sad`);
    console.log("[MapReaderDebug] common resources loaded");
  }

  /**
   * @param {RedStoneMap} map 
   */
  async loadNpcTextures(map) {
    this.npcTextures = {};

    for (const key in map.actorGroups) {
      const actorGroup = map.actorGroups[key];
      if (!ActorImage[actorGroup.job]) return;
      const textureFileName = ActorImage[actorGroup.job] + ".sad";
      if (this.npcTextures[textureFileName]) continue;
      const textureBuffer = await fetchBinaryFile(`${DATA_DIR}/${actorGroup.job < 250 ? "monsters" : "NPC"}/${textureFileName}`);
      this.npcTextures[textureFileName] = new Texture(textureFileName, textureBuffer);
    }
  }

  handleScroll = (e) => {
    clearTimeout(this._scrollEndCheckTimeout);
    this._scrollEndCheckTimeout = setTimeout(() => {
      localStorage.setItem("rs-mapdebug-lastscroll", JSON.stringify({ x: e.target.scrollLeft, y: e.target.scrollTop }));
    }, 500);
  }

  setLastScroll() {
    const lastScroll = JSON.parse(localStorage.getItem("rs-mapdebug-lastscroll"));
    if (lastScroll) {
      document.body.scrollTo(lastScroll.x, lastScroll.y);
    }
  }

  async execute() {
    // this.ctx.scale(0.5, 0.5);
    await this.loadCommonResources();
    const fileName = (location.pathname.split("/").pop() || "[060]T01_A01") + ".rmd";
    this.rmdFileBuffer = await fetchBinaryFile(`${RMD_DIR}/${fileName}`);

    const br = new BufferReader(this.rmdFileBuffer);
    const map = new RedStoneMap(br);
    window.currentMap = map; // for debug

    document.body.style.overflow = "scroll";
    document.body.style.overflowX = "scroll";
    this.canvas.width = TILE_WIDTH * map.size.width;
    this.canvas.height = TILE_HEIGHT * map.size.height;
    this.setLastScroll();
    document.body.addEventListener("scroll", this.handleScroll);

    const mapset = getKeyByValue(Mapset, map.mapsetId);
    this.tileTextures = await fetchBinaryFile(`${MAPSET_DIR}/${mapset}/tile.mpr`);
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

    console.log(map.actorSingles, map.actorGroups);

    const drawActor = () => {
      const framesPerAnimation = 8;
      map.actorSingles.forEach(actorSingle => {
        const actorGroup = map.actorGroups[actorSingle.internalID];
        const textureFileName = ActorImage[actorGroup.job] + ".sad";
        const texture = this.npcTextures[textureFileName];
        if (!texture) return;
        console.log("check actor texture", texture, textureFileName);
        const targetFrame = actorSingle.direct * framesPerAnimation;
        const textureCanvas = texture.getCanvas(targetFrame);

        const x = actorSingle.point.x - textureCanvas.width / 2;
        const y = actorSingle.point.y - textureCanvas.height + 16;

        this.ctx.drawImage(textureCanvas, x, y);
      });
    }

    const drawActorRects = () => {
      const ctx = this.ctx;
      const actors = map.actorSingles;
      actors.forEach(actor => {
        const { x, y } = actor.point;

        ctx.strokeStyle = "#11b";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.rect(x - 10, y - 10, 20, 20);
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = "#fff";
        ctx.font = "14px Arial";
        ctx.fillText(actor.name + `(${map.actorGroups[actor.internalID].job})`, x, y);
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

    const addPortalClickEvent = () => {
      const canvas = this.ctx.canvas;
      canvas.addEventListener("click", e => {
        map.areaInfos.forEach(area => {
          if (!area.moveToFileName) return;
          if (area.objectInfo !== ObjectType.WarpPortal) return;
          const x = e.pageX;
          const y = e.pageY - 30;
          if (x > area.leftUpPos.x && y > area.leftUpPos.y && x < area.rightDownPos.x && y < area.rightDownPos.y) {
            console.log("portal clicked", area.moveToFileName);
            location.href = "/Map/" + area.moveToFileName.split(".")[0];
          }
        });
      });
    }
    setTimeout(() => {
      addPortalClickEvent();
    }, 1000);

    const zippedObjectTextures = await loadZippedTextures(`${MAPSET_DIR}/${mapset}/${mapset}_Objects.zip`);
    const zippedBuildingTextures = Object.keys(map.buildingInfos).length ?
      await loadZippedTextures(`${MAPSET_DIR}/${mapset}/${mapset}_Buildings.zip`)
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
          const code = objectMatrix[i * map.size.width + j];
          let index;
          let isBuilding = false;
          if (code === 0) continue;
          if (map.scenarioVersion === 5.3 && code < 16 << 8) continue;
          if (map.scenarioVersion === 6.1 && code < 16 << 10) continue;
          if (map.scenarioVersion === 5.3) {
            index = code % (16 << 8);
          }
          else if (map.scenarioVersion === 6.1) {
            isBuilding = code >= 16 << 11;
            index = isBuilding ? code % (16 << 11) : code % (16 << 10);
          }
          const objectInfo = isBuilding ? map.buildingInfos[index] : map.objectInfos[index];
          if (!objectInfo) {
            // console.log("invalid object index", index, bytes);
            continue;
          }
          if (i * map.size.width + j === 15073) {
            console.log(objectInfo, index, code);
          }

          const fileName = getTextureFileName(objectInfo.textureId, isBuilding ? "rbd" : undefined);
          const texture = isBuilding ? zippedBuildingTextures.getTexture(fileName) : zippedObjectTextures.getTexture(fileName);
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

          if (isBuilding) {
            objectInfo.parts.forEach(frameIndex => {
              const textureCanvas = texture.getCanvas(frameIndex);
              const x = blockCenterX - texture.shape.body.left[frameIndex];
              const y = blockCenterY - texture.shape.body.top[frameIndex];
              this.ctx.drawImage(textureCanvas, x, y);

              setTimeout(() => {
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
                this.ctx.fillText(`tex: ${id}, ${i * map.size.width + j}, ${fileName}`, x, y);
              }, 100);
            });
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
            this.ctx.fillText(`tex: ${objectInfo.textureId}, ${i * map.size.width + j}, idx: ${objectInfo.index}`, x, y);
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

    console.log("drawing tiles")
    drawTiles();
    drawAreaInfoRect();
    console.log("drawing pos specified objects");
    drawPositionSpecifiedObjects();
    console.log("drawing portals");
    drawPortals();
    drawActor();
    console.log("drawing objects");
    drawObjects_Test();
    console.log("drawing draw npc rects");
    drawActorRects();
  }
}

export default MapReaderDebug;