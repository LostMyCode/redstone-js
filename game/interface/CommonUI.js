import * as PIXI from "pixi.js";

import { loadTexture } from "../../utils";
import { INTERFACE_DIR, MISC_DIR } from "../Config";
import { CType } from "../models/Actor";
import { AREA_HUNTING_AREA, AREA_PORTAL } from "../object/area/AreaDefine";
import Actor from "../actor/Actor";

const shopIconTextures = {};
const guageCache = {
    myPlayer: {},
    otherPlayer: {},
    npc: {},
    enemy: {},
};

class CommonUI {
    constructor() {
        this.interface = null;
        this.interface2 = null;

        this.guageSprites = [];
    }

    async load() {
        this.interface = await loadTexture(`${INTERFACE_DIR}/interface.sd`);
        this.shopIcon = await loadTexture(`${INTERFACE_DIR}/shopIcon.sad`);
        this.shopIconBrightTexture = this.shopIcon.getPixiTexture(0);
        // this.interface2 = await loadTexture(`${INTERFACE_DIR}/interface2.sd`);
        this.nameBar = await loadTexture(`${INTERFACE_DIR}/name_bar.sd`);
        this.hitText = await loadTexture(`${INTERFACE_DIR}/hitText.sd`);
        this.minimapAnim = await loadTexture(`${INTERFACE_DIR}/etc_anm.sad`);
        this.smiIconSkill = await loadTexture(`${MISC_DIR}/iconSkill.smi`);
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
    createGuage(type, text = "") {
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
     * @param {"myPlayer" | "otherPlayer" | "npc" | "enemy"} type 
     */
    getGuage(type, text = "") {
        if (guageCache[type][text]) return guageCache[type][text];

        const canvas = this.createGuage(type, text);
        const texture = PIXI.Texture.from(canvas);

        guageCache[type][text] = texture;

        return texture;
    }

    destroyGuageCache() {
        Object.keys(guageCache).forEach(type => {
            guageCache[type] = {};
        });

        this.guageSprites.forEach(s => {
            if (s && !s.destroyed) {
                s.destroy(true);
            }
        });

        this.guageSprites = [];
    }

    /**
     * @param {Actor} actor 
     */
    getActorHeadIcon(actor) {
        let index;

        switch (actor.actorKind) {
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

        if (shopIconTextures[index]) return shopIconTextures[index];

        shopIconTextures[index] = this.shopIcon.getPixiTexture(index);

        return shopIconTextures[index];
    }

    getMinimapIcon(areaInfo) {
        let index;
        let frames;
        let isAnim = true;
        let scale = 1;

        switch (areaInfo.kind) {
            case AREA_PORTAL:
                switch (areaInfo.gateShape) {
                    case 0:
                        index = 15;
                        frames = 10;
                        break;

                    case 1:
                        index = 35;
                        frames = 10;
                        break;

                    // 2 or 5 is highly invisible warp?

                    case 4: // warp to somewhere on the same map
                        index = 95;
                        frames = 1;
                        isAnim = false;
                        break;

                    case 8:
                        index = 116;
                        frames = 10;
                        scale = 0.7
                        break;

                    case 9:
                        index = 106;
                        frames = 10;
                        scale = 0.8;
                        break;

                    case 10:
                        index = 96;
                        frames = 10;
                        scale = 0.8;
                        break;
                }
                break;

            case AREA_HUNTING_AREA:
                index = 126;
                frames = 9;
                break;

            default:
                break;
        }

        if (typeof index !== "number") return null;

        if (isAnim) {
            const pixiTextures = [];
            for (let i = 0; i < frames; i++) {
                pixiTextures.push(this.minimapAnim.getPixiTexture(index + i));
            }
            pixiTextures.push(...([].concat(pixiTextures).reverse()));
            const sprite = new PIXI.AnimatedSprite(pixiTextures);
            sprite.scale.set(scale, scale);
            sprite.animationSpeed = 0.2;
            sprite.play();
            return sprite;
        }

        const sprite = new PIXI.Sprite(this.minimapAnim.getPixiTexture(index));
        return sprite;
    }
}

export default new CommonUI;