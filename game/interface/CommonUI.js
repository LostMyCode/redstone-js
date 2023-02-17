import * as PIXI from "pixi.js";

import { loadTexture } from "../../utils";
import { INTERFACE_DIR } from "../Config";
import { CType, MapActorSingle } from "../models/Actor";

const shopIconTextures = {};

class CommonUI {
    constructor() {
        this.interface = null;
        this.interface2 = null;
    }

    async load() {
        this.interface = await loadTexture(`${INTERFACE_DIR}/interface.sd`);
        this.shopIcon = await loadTexture(`${INTERFACE_DIR}/shopIcon.sad`);
        this.shopIconBrightTexture = this.shopIcon.getPixiTexture(0);
        // this.interface2 = await loadTexture(`${INTERFACE_DIR}/interface2.sd`);
        this.nameBar = await loadTexture(`${INTERFACE_DIR}/name_bar.sd`);
    }

    async init() {
        await this.load();

        this.myPlayerGuageParts = {
            leftEdge: this.nameBar.getCanvas(3),
            rightEdge: this.nameBar.getCanvas(4),
            body: this.nameBar.getCanvas(5)
        }
        this.enemyGuageParts = {
            leftEdge: this.nameBar.getCanvas(6),
            rightEdge: this.nameBar.getCanvas(7),
            body: this.nameBar.getCanvas(8)
        }
        this.npcGuageParts = {
            leftEdge: this.nameBar.getCanvas(12),
            rightEdge: this.nameBar.getCanvas(13),
            body: this.nameBar.getCanvas(14)
        }
    }

    /**
     * @param {"myPlayer" | "otherPlayer" | "npc" | "enemy"} type 
     */
    getGuage(type, text = "") {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        ctx.font = '10px sans-serif'
        ctx.fillStyle = "#fff";
        const { width: textWidth } = ctx.measureText(text);
        const width = textWidth + 20;

        canvas.width = width;
        canvas.height = 17;

        let parts;

        switch (type) {
            case "myPlayer":
                parts = this.myPlayerGuageParts;
                break;

            case "enemy":
                parts = this.enemyGuageParts;
                break;

            case "npc":
                parts = this.npcGuageParts;
                break;
        }

        ctx.drawImage(parts.leftEdge, 0, 0);
        ctx.drawImage(parts.body, 0, 0, width - 10, 17, 5, 0, width - 10, 17);
        ctx.drawImage(parts.rightEdge, width - 5, 0, 5, 17);

        ctx.font = '10px sans-serif'
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

            case CType.Banker:
                index = 7;
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

            case CType.Blacksmith:
                index = 27;
                break;

            case CType.Healers:
                index = 28;
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