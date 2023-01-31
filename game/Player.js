import * as PIXI from "pixi.js";

import { loadTexture } from "../utils";
import Camera from "./Camera";
import { DATA_DIR } from "./Config";
import Listener from "./Listener";
import RedStone from "./RedStone";

// Rogue03.sad
const directionFrameOrder = ["up", "up-right", "right", "down-right", "down", "down-left", "left", "up-left"];
const actionData = [
    {
        name: "walk",
        frameCount: 12,
    },
    {
        name: "run",
        frameCount: 8
    },
    {
        name: "stand",
        frameCount: 12
    }
]

class Player {
    constructor() {
        this.playerTexture = null;
        this.direction = "up";
        this.action = "stand";
        this.position = { x: 0, y: 0 };

        this.container = new PIXI.Container();
        this.initialized = false;

        this.init();
    }

    async load() {
        this.playerTexture = await loadTexture(`${DATA_DIR}/Heros/Rogue03.sad`);
        this.rebirthTexture = await loadTexture(`${DATA_DIR}/Effects/rebirth01.sad`);
    }

    async init() {
        await this.load();

        const moveAmount = 30;
        setInterval(() => {
            if (!Listener.pressingKeys.size) return;
            Listener.pressingKeys.forEach(key => {
                switch (key) {
                    case "w":
                        this.position.y -= moveAmount;
                        break;

                    case "d":
                        this.position.x += moveAmount;
                        break;

                    case "s":
                        this.position.y += moveAmount;
                        break;

                    case "a":
                        this.position.x -= moveAmount;
                        break;
                }
            });
            Camera.x = this.position.x;
            Camera.y = this.position.y;
        }, 40);

        this.initialized = true;
    }

    updateDirectionAndAction() {
        const has = value => Listener.pressingKeys.has(value);

        if (has("w") && has("s") || has("a") && has("d")) {
            this.action = "stand";
            return;
        }

        const direction = [];

        if (has("w")) direction.push("up");
        else if (has("s")) direction.push("down");
        if (has("a")) direction.push("left");
        else if (has("d")) direction.push("right");

        this.action = "run";

        if (!direction.length) return this.action = "stand";
        this.direction = direction.join("-");
    }

    render() {
        if (!this.initialized) return;

        const lastAction = this.action;
        const lastDirection = this.direction;
        const { x, y } = this.position;

        this.updateDirectionAndAction();

        if (lastAction === this.action && lastDirection === this.direction) {
            if (this.playerBodySprite) {
                const currentFrame = this.playerBodySprite.currentFrame;
                this.playerBodySprite.position.set(
                    x - this.playerTexture.shape.body.left[this.lastActionStartOffset + currentFrame],
                    y - this.playerTexture.shape.body.top[this.lastActionStartOffset + currentFrame]
                );
                this.playerShadowSprite.position.set(
                    x - this.playerTexture.shape.shadow.left[this.lastActionStartOffset + currentFrame],
                    y - this.playerTexture.shape.shadow.top[this.lastActionStartOffset + currentFrame]
                )
            }
            // this.renderEffects();
            return;
        }

        this.container.removeChildren();
        // this.rebirthSprite = null;
        // this.renderEffects();

        let offset = 0;
        let targetActionFrameCount;

        for (let i = 0; i < actionData.length; i++) {
            const frameCount = actionData[i].frameCount
            if (this.action === actionData[i].name) {
                offset += directionFrameOrder.indexOf(this.direction) * frameCount;
                targetActionFrameCount = frameCount;
                break;
            }
            offset += frameCount * directionFrameOrder.length;
        }

        const bodyTextures = [];
        const shadowTextures = [];
        for (let i = 0; i < targetActionFrameCount; i++) {
            const body = this.playerTexture.getPixiTexture(offset + i);
            bodyTextures.push(body);
            const shadow = this.playerTexture.getPixiTexture(offset + i, "shadow");
            shadowTextures.push(shadow);
        }

        const shadowSprite = new PIXI.AnimatedSprite(shadowTextures);
        shadowSprite.animationSpeed = 0.2;
        shadowSprite.position.set(
            x - this.playerTexture.shape.shadow.left[offset + shadowSprite.currentFrame],
            y - this.playerTexture.shape.shadow.top[offset + shadowSprite.currentFrame]
        )
        shadowSprite.play();
        this.playerShadowSprite = shadowSprite;
        this.container.addChild(shadowSprite);

        const bodySprite = new PIXI.AnimatedSprite(bodyTextures);
        bodySprite.animationSpeed = 0.2;
        bodySprite.position.set(
            x - this.playerTexture.shape.body.left[offset + bodySprite.currentFrame],
            y - this.playerTexture.shape.body.top[offset + bodySprite.currentFrame]
        );
        bodySprite.play();
        this.playerBodySprite = bodySprite;
        this.container.addChild(bodySprite);

        this.lastActionStartOffset = offset;

        if (!this.onceRendered) {
            RedStone.mainCanvas.mainContainer.addChild(this.container);
            this.onceRendered = true;
        }
    }

    renderEffects() {
        const { x, y } = this.position;

        if (this.rebirthSprite) {
            const currentFrame = this.rebirthSprite.currentFrame;
            this.rebirthSprite.position.set(
                x - this.rebirthTexture.shape.body.left[currentFrame],
                y - this.rebirthTexture.shape.body.top[currentFrame] + 25
            );
            return;
        }

        const rebirthTextures = [];
        for (let i = 0; i < this.rebirthTexture.frameCount; i++) {
            const texture = this.rebirthTexture.getPixiTexture(i);
            rebirthTextures.push(texture);
        }
        const rebirthSprite = new PIXI.AnimatedSprite(rebirthTextures);
        rebirthSprite.animationSpeed = 0.3;
        rebirthSprite.position.set(
            x - this.rebirthTexture.shape.body.left[0],
            y - this.rebirthTexture.shape.body.top[0] + 25
        );
        rebirthSprite.blendMode = PIXI.BLEND_MODES.ADD;
        rebirthSprite.play();
        this.rebirthSprite = rebirthSprite;
        this.container.addChild(rebirthSprite);
    }
}

export default Player;