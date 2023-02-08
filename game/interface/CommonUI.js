import * as PIXI from "pixi.js";

import { loadTexture } from "../../utils";
import { INTERFACE_DIR } from "../Config";
import { CType, MapActorSingle } from "../models/Actor";

const shopIconTextures = {};

class CommonUI {
    constructor() {
        this.interface = null;
        this.interface2 = null;

        this.myPlayerGuage = null;
    }

    async load() {
        this.interface = await loadTexture(`${INTERFACE_DIR}/interface.sd`);
        this.shopIcon = await loadTexture(`${INTERFACE_DIR}/shopIcon.sad`);
        this.shopIconBrightTexture = this.shopIcon.getPixiTexture(0);
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

    /**
     * @param {MapActorSingle} actor 
     */
    getActorHeadIcon(actor) {
        let index;

        switch (actor.charType) {
            case CType.Equipment_merchant:
                index = 3;
                break;

            case CType.ArmorMerchant:
                index = 4;
                break;

            case CType.MiscellaneousGoodsMerchant:
                index = 8;
                break;

            case CType.GeneralQuest:
                index = 9;
                break;

            case CType.MainQuest:
                index = 12;
                break;

            case CType.Teleporters:
                index = 15;
                break;

            case CType.Healers:
                index = 16;
                break;

            case CType.Blacksmith:
                index = 18;
                break;

            case CType.GuildHallTeleporters:
                index = 30;
                break;

            case CType.EventGuidepeople:
                index = 31;
                break;
        }

        if (typeof index !== "number") return null;

        shopIconTextures[index] = this.shopIcon.getPixiTexture(index);

        return shopIconTextures[index];
    }
}

export default new CommonUI;