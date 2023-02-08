import Camera from "./Camera";
import RedStone from "./RedStone";

export default new class Listener {

    constructor() {
        this.pressingKeys = new Set();
        this.isMouseDown = false;

        this.mouseX = 0;
        this.mouseY = 0;

        this.addListeners();
    }

    addListeners() {
        window.addEventListener("keydown", this.handleKeyControl);
        window.addEventListener("keyup", this.handleKeyControl);
        window.addEventListener("mousemove", this.handleMouseMove);
        window.addEventListener("mousedown", this.handleMouseDown);
        window.addEventListener("mouseup", this.handleMouseUp);
    }

    /**
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

    handleMouseDown = (e) => {
        this.isMouseDown = true;
    }

    handleMouseUp = (e) => {
        this.isMouseDown = false;
    }

    handleMouseMove = (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }
}