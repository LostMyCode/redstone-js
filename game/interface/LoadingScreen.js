import * as PIXI from "pixi.js";
import { loadTexture } from "../../utils";
import RedStone from "../RedStone";

const INTERFACE_DIR = "https://sigr.io/redstone/Interface";

class LoadingScreen {
    constructor() {
        this.loadingTexture = null;
        this.loadingTexture2 = null;

        this.container = new PIXI.Container();
    }

    async init() {
        await this.loadResources();
    }

    async loadResources() {
        this.loadingTexture = await loadTexture(`${INTERFACE_DIR}/loading.sd`);
        this.loadingTexture2 = await loadTexture(`${INTERFACE_DIR}/loading2.sd`);
        this.loadingBgTexture = await loadTexture(`${INTERFACE_DIR}/loading_bg.sd`);
    }

    render() {
        // black bg
        var bg = new PIXI.Sprite(PIXI.Texture.WHITE);
        bg.width = window.innerWidth;
        bg.height = window.innerHeight;
        bg.tint = 0x00;
        this.container.addChild(bg);

        const targetTexture = this.loadingTexture;
        const pixiTextures = [];
        for (let i = 0; i < targetTexture.frameCount; i++) {
            pixiTextures.push(targetTexture.getPixiTexture(i));
        }
        const animatedLoadingText = new PIXI.AnimatedSprite(pixiTextures);
        animatedLoadingText.animationSpeed = 0.2;
        animatedLoadingText.position.set(
            window.innerWidth / 2 - targetTexture.shape.body.width[0] / 2,
            window.innerHeight - targetTexture.shape.body.height[0] - 50
        );
        animatedLoadingText.play();
        this.container.addChild(animatedLoadingText);

        const loadingBg = new PIXI.Sprite(this.loadingBgTexture.getPixiTexture(0));
        loadingBg.position.set(
            window.innerWidth / 2 - this.loadingBgTexture.shape.body.width[0] / 2,
            window.innerHeight / 2 - this.loadingBgTexture.shape.body.height[0] / 2
        );
        this.container.addChild(loadingBg);

        // this.renderer.render(this.container);
        RedStone.mainCanvas.rootContainer.addChild(this.container);
    }

    destroy() {
        this.container.removeChildren();
        const index = RedStone.mainCanvas.rootContainer.getChildIndex(this.container);
        RedStone.mainCanvas.rootContainer.removeChildAt(index);
    }
}

export default new LoadingScreen;