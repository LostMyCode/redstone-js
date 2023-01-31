import Camera from "./Camera";

export default new class Listener {

    constructor() {
        this.pressingKeys = new Set();
        
        this.addListeners();
    }

    addListeners() {
        window.addEventListener("keydown", this.handleKeyControl);
        window.addEventListener("keyup", this.handleKeyControl);
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
}