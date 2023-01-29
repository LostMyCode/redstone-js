import * as PIXI from "pixi.js";

const camera = {
    x: 0,
    y: 0,
    scale: 0,
}

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
        this.tileContainer = new PIXI.Container;
        this.objectContainer = new PIXI.Container;

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
        const moveAmount = 20;
        
        setInterval(() => {
            if (!this.pressingKeys.size) return;
            
            this.pressingKeys.forEach(key => {
                switch (key) {
                    case "w":
                        this.currentPos.y += moveAmount;
                        break;

                    case "d":
                        this.currentPos.x -= moveAmount;
                        break;

                    case "s":
                        this.currentPos.y -= moveAmount;
                        break;

                    case "a":
                        this.currentPos.x += moveAmount;
                        break;
                }
            });
            this.currentPos.x = Math.min(0, this.currentPos.x);
            this.currentPos.y = Math.min(0, this.currentPos.y);
            this.mainContainer.position.set(this.currentPos.x, this.currentPos.y);

            // this.render();
            this.renderer.render(this.rootContainer);
        }, 50);
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

        camera.x = canvas.width / 2;
        camera.y = canvas.height / 2;
    }

    render() {
        this.rootContainer.addChild(this.mainContainer);
        // this.mainContainer.position.set(-3000, 0);
        // this.mainContainer.position.set(-500, -160);
        // this.rootContainer.scale.set(0.2);
        this.rootContainer.scale.set(1);
        this.renderer.render(this.rootContainer);
    }
}

export default MainCanvas;