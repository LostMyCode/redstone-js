import { loadTexture } from "../../utils";
import { INTERFACE_DIR } from "../Config";

class CommonUI {
    constructor() {
        this.interface = null;
        this.interface2 = null;

        this.myPlayerGuage = null;
    }

    async load() {
        this.interface = await loadTexture(`${INTERFACE_DIR}/interface.sd`);
        // this.interface2 = await loadTexture(`${INTERFACE_DIR}/interface2.sd`);
    }

    async init() {
        await this.load();
        this.myPlayerGuage = this.interface.getCanvas(319);
        this.enemyGuage = this.interface.getCanvas(322);
        this.npcGuage = this.interface.getCanvas(324);
    }

    /**
     * @param {"myPlayer" | "otherPlayer" | "npc" | "enemy"} type 
     */
    getGuage(type, text = "") {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        ctx.beginPath();
        ctx.font = '12px Arial'
        const { width: textWidth } = ctx.measureText(text);
        const width = textWidth + 15;

        canvas.width = width;
        canvas.height = 17;

        let base;

        switch (type) {
            case "myPlayer":
                base = this.myPlayerGuage;
                break;

            case "enemy":
                base = this.enemyGuage;
                break;

            case "npc":
                base = this.npcGuage;
                break;
        }

        ctx.drawImage(base, 0, 0, width - 20, 17, 0, 0, width - 20, 17);
        ctx.drawImage(base, 228 - 20, 0, 20, 17, width - 20, 0, 20, 17);

        ctx.fillStyle = "#fff";
        ctx.fillText(text, 10, 12);

        return canvas;
    }
}

export default new CommonUI;