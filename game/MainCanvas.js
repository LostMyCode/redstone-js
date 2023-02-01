import * as PIXI from "pixi.js";
import Camera from "./Camera";
import RedStone from "./RedStone";

class MainCanvas {

    constructor() {
        this.canvas = document.getElementById("canvas");
        this.renderer = new PIXI.Renderer({
            view: this.canvas,
            width: window.innerWidth,
            height: window.innerHeight,
            // resolution: window.devicePixelRatio,
            resolution: 1,
        });

        this.rootContainer = new PIXI.Container;
        this.mainContainer = new PIXI.Container;

        this.init();
    }

    handleResize = () => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.renderer.resize(this.canvas.width, this.canvas.height);
    }

    init() {
        this.handleResize();

        window.addEventListener("resize", this.handleResize);

        const ticker = new PIXI.Ticker();
        ticker.add((delta) => {
            this.render();
        });
        ticker.start();

        this.rootContainer.addChild(this.mainContainer);
    }

    render() {
        this.mainContainer.position.set(window.innerWidth / 2 - Camera.x, window.innerHeight / 2 - Camera.y);
        // this.rootContainer.scale.set(1);
        RedStone.gameMap.render();
        RedStone.player.render();
        
        this.renderer.render(this.rootContainer);
    }
}

export default MainCanvas;