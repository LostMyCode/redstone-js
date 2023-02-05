import * as PIXI from "pixi.js";

import { loadTexture } from "../utils";
import { angle, direction, getAngle, getDirection, getDirectionString } from "../utils/RedStoneRandom";
import Camera from "./Camera";
import { DATA_DIR, TILE_HEIGHT, TILE_WIDTH, X_BOUND_OFFSET, Y_BOUND_OFFSET } from "./Config";
import CommonUI from "./interface/CommonUI";
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

        /**
         * @private
         * @type {Number}
         */
        this._x = 6 * TILE_WIDTH;
        /**
         * @private
         * @type {Number}
         */
        this._y = 60 * TILE_HEIGHT;

        this.container = new PIXI.Container();
        this.initialized = false;

        this.init();
        Camera.setPosition(this.x, this.y);
    }

    async load() {
        this.playerTexture = await loadTexture(`${DATA_DIR}/Heros/Rogue03.sad`);
        this.rebirthTexture = await loadTexture(`${DATA_DIR}/Effects/rebirth01.sad`);

        // custom
        this.guildIconTexture = await PIXI.Texture.fromURL(`${DATA_DIR}/custom/rs_guild_icon.png`);
    }

    async init() {
        await this.load();

        const moveAmount = 30;
        setInterval(() => {
            if (!RedStone.gameMap.initialized) {
                window.dispatchEvent(new CustomEvent("displayLogUpdate", { detail: { key: "player-pos", value: null } }));
                return;
            }

            window.dispatchEvent(new CustomEvent("displayLogUpdate", { detail: { key: "player-pos", value: `Player Position: (${Math.round(this.x / TILE_WIDTH)}, ${Math.round(this.y / TILE_HEIGHT)})` } }));

            let positionUpdated = false;

            if (Listener.pressingKeys.size) {
                Listener.pressingKeys.forEach(key => {
                    switch (key) {
                        case "w":
                            this.y -= moveAmount;
                            positionUpdated = true;
                            break;

                        case "d":
                            this.x += moveAmount;
                            positionUpdated = true;
                            break;

                        case "s":
                            this.y += moveAmount;
                            positionUpdated = true;
                            break;

                        case "a":
                            this.x -= moveAmount;
                            positionUpdated = true;
                            break;
                    }
                });
            }

            if (positionUpdated) {
                Camera.x = this.x;
                Camera.y = this.y;
                return;
            }

            if (!Listener.isMouseDown) return;

            const targetX = Listener.mouseX - RedStone.mainCanvas.canvas.width / 2 + Camera.x;
            const targetY = Listener.mouseY - RedStone.mainCanvas.canvas.height / 2 + Camera.y;

            this.oldX = this.x;
            this.oldY = this.y;
            this.x += targetX - this.x > 0 ? Math.min(40, targetX - this.x) : Math.max(-40, targetX - this.x);
            this.y += targetY - this.y > 0 ? Math.min(40, targetY - this.y) : Math.max(-40, targetY - this.y);

            Camera.x = this.x;
            Camera.y = this.y;
        }, 40);

        this.initialized = true;
    }

    set x(X) {
        const mapSize = RedStone.gameMap.getRealSize();
        if (X < X_BOUND_OFFSET) {
            X = X_BOUND_OFFSET;
        }
        else if (mapSize.width && X > mapSize.width - X_BOUND_OFFSET) {
            X = mapSize.width - X_BOUND_OFFSET;
        }
        this._x = X;
    }

    get x() {
        return this._x;
    }

    set y(Y) {
        const mapSize = RedStone.gameMap.getRealSize();
        if (Y < Y_BOUND_OFFSET) {
            Y = Y_BOUND_OFFSET;
        }
        else if (mapSize.height && Y > mapSize.height - Y_BOUND_OFFSET) {
            Y = mapSize.height - Y_BOUND_OFFSET;
        }
        this._y = Y;
    }

    get y() {
        return this._y;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    reset() {
        this.onceRendered = false;
        this.playerBodySprite = null;
        this.playerShadowSprite = null;
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

        if (!direction.length) {
            if (Listener.isMouseDown) {
                const agl = getAngle({ x: this.oldX, y: this.oldY }, this);
                const dir = getDirection(agl);
                direction.push(...getDirectionString(dir).split("-"));
            }
        }

        if (!direction.length) return this.action = "stand";

        this.direction = direction.join("-");
    }

    render() {
        if (!this.initialized) return;
        if (!RedStone.gameMap.onceRendered) return;

        const lastAction = this.action;
        const lastDirection = this.direction;
        const { x, y } = this;

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
                this.renderGuage();
                this.renderGuildIcon_test();
                return;
            }
            // this.renderEffects();
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

        this.renderGuage();
        this.renderGuildIcon_test();

        if (!this.onceRendered) {
            RedStone.mainCanvas.mainContainer.addChild(this.container);
            this.onceRendered = true;
        }
    }

    renderEffects() {
        const { x, y } = this;

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

    renderGuage() {
        this.guageTexture = this.guageTexture || PIXI.Texture.from(CommonUI.getGuage("myPlayer", "MyPlayer (200)"));
        const texture = this.guageTexture;
        /**
         * @type {PIXI.Sprite}
         */
        const sprite = this.guageSprite || new PIXI.Sprite(texture);
        sprite.position.set(this.x - sprite.width / 2, this.y - 65);

        if (!this.guageSprite) {
            this.container.addChild(sprite);
            this.guageSprite = sprite;
        } else {
            this.container.removeChild(sprite);
            this.container.addChild(sprite);
        }
    }

    renderGuildIcon_test() {
        if (this.guildIconSprite) {
            const sprite = this.guildIconSprite;
            sprite.position.set(this.guageSprite.x - 32, this.guageSprite.y - (32 - this.guageSprite.height) / 2);
            this.container.removeChild(sprite);
            this.container.addChild(sprite);
        } else {
            this.guildIconSprite = new PIXI.Sprite(this.guildIconTexture);
            const sprite = this.guildIconSprite;
            sprite.width = 32;
            sprite.height = 32;
            sprite.position.set(this.guageSprite.x - 32, this.guageSprite.y - (32 - this.guageSprite.height) / 2);
            this.container.addChild(sprite);
        }
    }
}

export default Player;