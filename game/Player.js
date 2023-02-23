import * as PIXI from "pixi.js";
import { AnimatedSprite } from "pixi.js";

import { loadTexture } from "../utils";
import { getAngle, getDirection, getDirectionString, getDistance } from "../utils/RedStoneRandom";
import Camera from "./Camera";
import { DATA_DIR, TILE_HEIGHT, TILE_WIDTH, X_BOUND_OFFSET, Y_BOUND_OFFSET } from "./Config";
import HitEffect from "./HitEffect";
import CommonUI from "./interface/CommonUI";
import Listener from "./Listener";
import Skill2 from "./models/Skill2";
import RedStone from "./RedStone";

const directionFrameOrder = ["up", "up-right", "right", "down-right", "down", "down-left", "left", "up-left"];

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

        // skill hit effect (temp)
        this.hitEffect = await loadTexture(`${DATA_DIR}/Effects/hit_basic.sad`);
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
                this.battleTarget = null;
                this.usingSkill = null;
                return;
            }

            if (!Listener.isMouseDown) return;

            if (this.targetActor) {
                const distance = getDistance(this, {
                    x: this.targetActor.sprite.x + this.targetActor.sprite.width / 2,
                    y: this.targetActor.sprite.y + this.targetActor.sprite.height / 2,
                });
                if (distance <= 400 && this.targetActor.actor.isMonster && this.battleTarget !== this.targetActor.sprite) {
                    this.useSkillToTarget(null, this.targetActor.sprite);
                    return;
                }
            } else if (this.battleTarget || this.usingSkill) {
                this.battleTarget = null;
                this.usingSkill = null;
            }

            const targetX = Listener.mouseX - innerWidth / 2 + Camera.x;
            const targetY = Listener.mouseY - innerHeight / 2 + Camera.y;
            const angle = Math.atan2(targetY - this.y, targetX - this.x);

            const moveX = Math.min(40, 40 * Math.cos(angle));
            const moveY = Math.min(40, 40 * Math.sin(angle));

            this.oldX = this.x;
            this.oldY = this.y;
            this.x += moveX;
            this.y += moveY;

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

    update() {
        let newAction = this.action
        let newDirection = this.direction;

        const has = value => Listener.pressingKeys.has(value);

        if (has("w") && has("s") || has("a") && has("d")) { // invalid key combinations
            newAction = "stand";
            this.setAnimation(newAction, newDirection);
            return;
        }

        const direction = [];

        if (has("w")) direction.push("up");
        else if (has("s")) direction.push("down");
        if (has("a")) direction.push("left");
        else if (has("d")) direction.push("right");

        if (direction.length) {
            newAction = "run";
            newDirection = direction.join("-");
        }
        else if (Listener.isMouseDown) {
            const agl = getAngle({ x: this.oldX, y: this.oldY }, this);
            const dir = getDirection(agl);
            newDirection = getDirectionString(dir);
            newAction = "run";
        }
        else if (this.usingSkill) {
            const agl = getAngle(this, {
                x: this.battleTarget.x + this.battleTarget.width / 2,
                y: this.battleTarget.y + this.battleTarget.height / 2,
            });
            const dir = getDirection(agl);
            newDirection = getDirectionString(dir);
            newAction = "attack";
        }
        else {
            newAction = "stand";
        }

        this.setAnimation(newAction, newDirection);
    }

    setAnimation(action, direction) {
        const { x, y } = this;

        if (action === this.action && direction === this.direction && this.playerBodySprite) {
            const { currentFrame, actionStartFrameIndex } = this.playerBodySprite;
            const frameIndex = actionStartFrameIndex + currentFrame;
            this.playerBodySprite.position.set(
                x - this.playerTexture.shape.body.left[frameIndex],
                y - this.playerTexture.shape.body.top[frameIndex]
            );
            this.playerShadowSprite.position.set(
                x - this.playerTexture.shape.shadow.left[frameIndex],
                y - this.playerTexture.shape.shadow.top[frameIndex]
            );
            if (this.playerBodySprite.completed && this.usingSkill) {
                this.playerBodySprite.completed = false;
                this.playerBodySprite.gotoAndPlay(0);
                this.playerShadowSprite.gotoAndPlay(0);

                const castSound = new Audio();
                const actSound = new Audio();
                const hitSound = new Audio();
                castSound.src = `${DATA_DIR}/Sound/${this.usingSkill.castSound}`;
                actSound.src = `${DATA_DIR}/Sound/${this.usingSkill.actSound}`;
                hitSound.src = `${DATA_DIR}/Sound/${this.usingSkill.hitSound}`;

                this.playerBodySprite.onFrameChange = (currentFrame) => {
                    if (currentFrame === 0) {
                        castSound.play();
                    }
                    if (currentFrame === 4) {
                        actSound.play();
                    }
                    if (currentFrame === 6) {
                        this.addHitEffect(0);
                        this.addHitEffect(5);
                        this.addHitEffect(10);

                        for (let i = 0; i < 10; i++) {
                            const hitEffect = new HitEffect();
                            hitEffect.put(this.battleTarget.x, this.battleTarget.y);
                        }

                        hitSound.play();
                    }
                }
            }
            return;
        }

        let targetActionFrameCount, offset;

        switch (action) {
            case "run": {
                const actionInfo = this.playerTexture.actions.find(a => a.name.includes("run"));
                targetActionFrameCount = actionInfo.frameCount / 8;
                offset = actionInfo.startFrameIndex + targetActionFrameCount * directionFrameOrder.indexOf(direction);
                break;
            }

            case "attack": {
                const actionInfo = this.playerTexture.actions.find(a => a.name === "09_action01");
                targetActionFrameCount = actionInfo.frameCount / 8;
                offset = actionInfo.startFrameIndex + targetActionFrameCount * directionFrameOrder.indexOf(direction);
                break;
            }

            default: {
                const actionInfo = this.playerTexture.actions.find(a => a.name.includes("rest"));
                targetActionFrameCount = actionInfo.frameCount / 8;
                offset = actionInfo.startFrameIndex + targetActionFrameCount * directionFrameOrder.indexOf(direction);
                break;
            }
        }

        const bodyTextures = [];
        const shadowTextures = [];

        for (let i = 0; i < targetActionFrameCount; i++) {
            const body = this.playerTexture.getPixiTexture(offset + i);
            const shadow = this.playerTexture.getPixiTexture(offset + i, "shadow");
            bodyTextures.push(body);
            shadowTextures.push(shadow);
        }

        const shadowSprite = new PIXI.AnimatedSprite(shadowTextures);
        shadowSprite.animationSpeed = 0.2;
        shadowSprite.position.set(
            x - this.playerTexture.shape.shadow.left[offset + shadowSprite.currentFrame],
            y - this.playerTexture.shape.shadow.top[offset + shadowSprite.currentFrame]
        )

        const bodySprite = new PIXI.AnimatedSprite(bodyTextures);
        bodySprite.animationSpeed = 0.2;
        bodySprite.position.set(
            x - this.playerTexture.shape.body.left[offset + bodySprite.currentFrame],
            y - this.playerTexture.shape.body.top[offset + bodySprite.currentFrame]
        );
        if (action === "attack") {
            bodySprite.loop = false;
            shadowSprite.loop = false;
            bodySprite.onComplete = () => {
                this.usingSkill = null;
                bodySprite.completed = true;

                this.useSkillToTarget(null, this.battleTarget);
            }
        }

        bodySprite.play();
        shadowSprite.play();

        bodySprite.actionStartFrameIndex = offset;
        bodySprite.actionName = action;

        this.playerBodySprite && this.playerBodySprite.destroy();
        this.playerShadowSprite && this.playerShadowSprite.destroy();
        this.playerBodySprite = bodySprite;
        this.playerShadowSprite = shadowSprite;

        this.action = action;
        this.direction = direction;
    }

    render() {
        if (!this.initialized) return;
        if (!RedStone.gameMap.onceRendered) return;

        this.update();

        this.container.removeChildren();

        this.playerShadowSprite && this.container.addChild(this.playerShadowSprite);
        this.playerBodySprite && this.container.addChild(this.playerBodySprite);
        this.effectSprites && this.effectSprites.length && this.container.addChild(...this.effectSprites);

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

    addHitEffect(frameOffset = 0) {
        const textures = (new Array(5)).fill(null).map((v, i) => this.hitEffect.getPixiTexture(i + frameOffset));
        const hitEffectSprite = new AnimatedSprite(textures);
        hitEffectSprite.animationSpeed = 0.4;
        hitEffectSprite.loop = false;
        hitEffectSprite.blendMode = PIXI.BLEND_MODES.ADD;
        hitEffectSprite.position.set(
            this.battleTarget.x + this.battleTarget.width / 2 - this.hitEffect.shape.body.left[frameOffset],
            this.battleTarget.y - 32 - this.hitEffect.shape.body.top[frameOffset]
        );
        hitEffectSprite.onFrameChange = (currentFrame) => {
            if (!this.battleTarget) return;
            hitEffectSprite.position.set(
                this.battleTarget.x + this.battleTarget.width / 2 - this.hitEffect.shape.body.left[frameOffset + currentFrame],
                this.battleTarget.y - 32 - this.hitEffect.shape.body.top[frameOffset + currentFrame]
            );
        }
        hitEffectSprite.onComplete = () => {
            const idx = this.effectSprites.indexOf(hitEffectSprite);
            this.effectSprites.splice(idx, 1);
            hitEffectSprite.destroy();
        }
        hitEffectSprite.play();
        this.effectSprites = this.effectSprites || [];
        this.effectSprites.push(hitEffectSprite);
    }

    /**
     * @param {Skill2} skill
     */
    useSkillToTarget(skill, target) {
        if (!skill) {
            skill = Skill2.allSkills.find(s => s.skillName === "ダブルスローイング") // skill 152
        }

        this.battleTarget = target;
        this.usingSkill = skill;

        console.log("check skill", skill);
    }
}

export default Player;