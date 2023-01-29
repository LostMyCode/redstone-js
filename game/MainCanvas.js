import * as PIXI from "pixi.js";
import Camera from "./Camera";

class MainCanvas {

    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;

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

        this.currentPos = { x: 0, y: 0 };
        this.pressingKeys = new Set();

        this.init();
        this.observeKeyEvent();
    }

    handleResize = () => {
        console.log("resize canvas");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.renderer.resize(this.canvas.width, this.canvas.height);
    }

    /**
     * 
     * @param {KeyboardEvent} e 
     */
    handleKeyControl = (e) => {
        if (e.type === "keydown") {
            this.pressingKeys.add(e.key);
        }
        else if (e.type === "keyup") {
            this.pressingKeys.delete(e.key);
        }
    }

    observeKeyEvent() {
        const moveAmount = 30;

        setInterval(() => {
            if (!this.pressingKeys.size) return;

            this.pressingKeys.forEach(key => {
                switch (key) {
                    case "w":
                        Camera.y -= moveAmount;
                        break;

                    case "d":
                        Camera.x += moveAmount;
                        break;

                    case "s":
                        Camera.y += moveAmount;
                        break;

                    case "a":
                        Camera.x -= moveAmount;
                        break;
                }
            });
            // this.render();
            // this.renderer.render(this.rootContainer);
        }, 40);
    }

    init() {
        this.handleResize();

        window.addEventListener("resize", this.handleResize);
        window.addEventListener("keydown", this.handleKeyControl);
        window.addEventListener("keyup", this.handleKeyControl);

        canvas.addEventListener("mousemove", e => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        const ticker = new PIXI.Ticker();
        ticker.add((delta) => {
            this.render();
        });
        ticker.start();
    }

    render() {
        this.mainContainer.position.set(window.innerWidth / 2 - Camera.x, window.innerHeight / 2 - Camera.y);
        this.rootContainer.addChild(this.mainContainer);
        // this.rootContainer.scale.set(1);
        this.renderer.render(this.rootContainer);
    }
}

export default MainCanvas;