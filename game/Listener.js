import Camera from "./Camera";

export default new class Listener {

    constructor() {
        this.pressingKeys = new Set();
        
        this.addListeners();
        this.observeKeyEvent();
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
        }, 40);
    }
}