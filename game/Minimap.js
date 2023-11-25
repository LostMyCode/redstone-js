import * as PIXI from "pixi.js";
import TgaLoader from "tga-js";
import RedStone from "./RedStone";
import { fetchBinaryFile } from "../utils";
import { MINIMAP_DIR, TILE_HEIGHT, TILE_WIDTH } from "./Config";
import SettingsManager from "./SettingsManager";

export default class Minimap {
    constructor() {
        this.container = new PIXI.Container();
        this.rootContainer = new PIXI.Container();
        this.tga = new TgaLoader();
        this.canvas = document.createElement("canvas");
        this.canvas.id = "minimap";
        this.graphics = new PIXI.Graphics();
        this.graphics.lineStyle(3, 0xf5b042);

        this.renderer = new PIXI.Renderer({
            view: this.canvas,
            width: 333,
            height: 180,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        document.body.appendChild(this.canvas);
        this.canvas.style.position = "fixed";
        this.canvas.style.zIndex = 100;
        this.canvas.style.top = "60px";
        this.canvas.style.right = "10px";
        this.canvas.style.display = "none";
        this.canvas.style.border = "1px solid #fff";

        window.addEventListener("settingsChange", (e) => {
            if (e.detail.key === "showMinimap") {
                e.detail.value ? this.init() : this.reset();
            }
        });
    }

    reset() {
        this.container.removeChildren();
        this.rootContainer.removeChildren();
        this.graphics.clear();
        this.canvas.style.display = "none";
        this.initialized = false;
    }

    async init() {
        if (!SettingsManager.get("showMinimap")) return;
        
        const buffer = await fetchBinaryFile(`${MINIMAP_DIR}/${RedStone.gameMap.currentRmdFileName}.tga`);
        this.tga.load(new Uint8Array(buffer));
        this.renderer.resize(
            Math.min(this.tga.header.width, 333),
            Math.min(this.tga.header.height, 180)
        );
        this.texture = await PIXI.Texture.fromURL(this.tga.getDataURL("image/png"));
        this.sprite = new PIXI.Sprite(this.texture);
        this.container.addChild(this.sprite);
        this.container.addChild(this.graphics);
        this.rootContainer.addChild(this.container);
        if (!RedStone.mapListExpanded) {
            this.canvas.style.display = "block";
        }
        this.initialized = true;
    }

    render() {
        if (!this.initialized) return;

        this.sprite.position.set()

        const xRatio = RedStone.player.x / (RedStone.gameMap.map.size.width * TILE_WIDTH);
        const yRatio = RedStone.player.y / (RedStone.gameMap.map.size.height * TILE_HEIGHT);
        const x = this.sprite.width * xRatio
        const y = this.sprite.height * yRatio

        const conX = - Math.min(Math.max(0, x - this.canvas.width / 2), this.sprite.width - this.canvas.width);
        const conY = - Math.min(Math.max(0, y - this.canvas.height / 2), this.sprite.height - this.canvas.height);

        this.container.position.set(conX, conY);

        this.graphics.clear();
        this.graphics.beginFill(0xffff1c);
        this.graphics.drawCircle(x, y, 2.5);
        this.graphics.endFill();

        this.renderer.render(this.rootContainer);
    }
}