import * as PIXI from "pixi.js";
import { AnimatedSprite } from "pixi.js";

import { fetchBinaryFile, loadAnimation, loadTexture } from "../utils";
import { getAngle, getDirection, getDirectionString, getDistance } from "../utils/RedStoneRandom";
import Camera from "./Camera";
import { DATA_DIR, SAVE_PLAYER_LOCATION, TILE_HEIGHT, TILE_WIDTH, X_BOUND_OFFSET, Y_BOUND_OFFSET } from "./Config";
import CommonUI from "./interface/CommonUI";
import Listener from "./Listener";
import Skill2 from "./models/Skill2";
import RedStone from "./RedStone";
import SettingsManager from "./SettingsManager";
import Actor from "./actor/Actor";
import { ACT_READY, ACT_RUN } from "./ActionH";
import ActorManager from "./actor/ActorManager";
import { ImageManager } from "./ImageData";
import Ability from "./skill/Ability";
import HitInfo from "./skill/HitInfo";
import Pos from "../engine/Pos";
import SaveData from "./SaveData";

const directionFrameOrder = ["up", "up-right", "right", "down-right", "down", "down-left", "left", "up-left"];

const dJOB_ROGUE = 6;

class Player {
    constructor() {
        this.direction = "up";
        this.action = "stand";

        /**
         * @private
         * @type {Number}
         */
        this._x = 4745;
        /**
         * @private
         * @type {Number}
         */
        this._y = 2640;

        this.initialized = false;
        this.lastUpdate = performance.now();

        window.addEventListener("jobChange", (e) => {
            const job = e.detail;
            this.actor.job = job;
            RedStone.hero.job = job;
            RedStone.hero.init();
            
            SaveData.save();
        })
    }

    async load() {
        const heroAnimBuf = await fetchBinaryFile(`${DATA_DIR}/Heros/Rogue01.sad`);
        RedStone.anims.Rogue01 = loadAnimation(heroAnimBuf);
        RedStone.anims.Archer01 = loadAnimation(await fetchBinaryFile(`${DATA_DIR}/Heros/Archer01.sad`));
        RedStone.anims.Wizard01 = loadAnimation(await fetchBinaryFile(`${DATA_DIR}/Heros/Wizard01.sad`));

        // custom
        this.guildIconTexture = await PIXI.Texture.fromURL(`${DATA_DIR}/custom/rs_guild_icon.png`);
    }

    async init() {
        if (SAVE_PLAYER_LOCATION) {
            // set player position
            if (RedStone.lastLocation?.position) {
                const { x, y } = RedStone.lastLocation?.position;
                this.setPosition(x, y);
            }
        }
        Camera.setPosition(this.x, this.y);

        await this.load();
        this.reset();

        const moveAmount = 15;
        setInterval(() => {
            if (!RedStone.gameMap.initialized) {
                window.dispatchEvent(new CustomEvent("displayLogUpdate", { detail: { key: "player-pos", value: null } }));
                return;
            }

            window.dispatchEvent(new CustomEvent("displayLogUpdate", { detail: { key: "player-pos", value: `Player Position: (${Math.round(this.x / TILE_WIDTH)}, ${Math.round(this.y / TILE_HEIGHT)})` } }));

            if (Listener.isMouseDown || Listener.pressingKeys.size === 0) return;

            let positionUpdated = false;
            let moveX = 0;
            let moveY = 0;

            Listener.pressingKeys.forEach(key => {
                switch (key) {
                    case "ArrowUp":
                        moveY -= moveAmount;
                        positionUpdated = true;
                        break;

                    case "ArrowRight":
                        moveX += moveAmount;
                        positionUpdated = true;
                        break;

                    case "ArrowDown":
                        moveY += moveAmount;
                        positionUpdated = true;
                        break;

                    case "ArrowLeft":
                        moveX -= moveAmount;
                        positionUpdated = true;
                        break;
                }
            });

            if (positionUpdated) {
                if (SettingsManager.get("collisionDetection")) {
                    const block1 = RedStone.gameMap.getBlock(Math.floor(Math.round(this.x + moveX) / TILE_WIDTH), Math.floor(Math.round(this.y) / TILE_HEIGHT));
                    const block2 = RedStone.gameMap.getBlock(Math.floor(Math.round(this.x) / TILE_WIDTH), Math.floor(Math.round(this.y + moveY) / TILE_HEIGHT));
                    if (block1 !== 0) {
                        moveX = 0;
                    }
                    if (block2 !== 0) {
                        moveY = 0;
                    }
                }
                this.oldX = this.x;
                this.oldY = this.y;
                this.x += moveX;
                this.y += moveY;
                Camera.x = this.x;
                Camera.y = this.y;
                this.battleTarget = null;
                this.usingSkill = null;
                return;
            }
        }, 20);

        this.initialized = true;
    }

    set x(X) {
        const mapSize = RedStone.gameMap.getRealSize();
        if (X < X_BOUND_OFFSET) {
            X = X_BOUND_OFFSET;
        }
        else if (mapSize && mapSize.width && X > mapSize.width - X_BOUND_OFFSET) {
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
        else if (mapSize && mapSize.height && Y > mapSize.height - Y_BOUND_OFFSET) {
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

        this.actor = new Actor();
        this.actor.pos.set(this.x, this.y);
        this.actor.job = RedStone.hero.job;
        this.actor.anm = 2;
        this.actor.direct = directionFrameOrder.indexOf(this.direction);
        this.actor.name = "MyPlayer (200)";
        this.actor.serial = 123123;
        this.actor._isMonster_tmp = false;
        this.actor.pixiSprite = this.actor.getBody().createPixiSprite("body", this.actor.x, this.actor.y, this.actor.anm, this.actor.direct, this.actor.frame);
        this.actor.pixiSprite.shadowSprite = this.actor.getBody().createPixiSprite("shadow", this.actor.x, this.actor.y, this.actor.anm, this.actor.direct, this.actor.frame);

        RedStone.actors.push(this.actor);
    }

    update() {
        if (!this.initialized) return;
        if (this.locked) return;
        if (Listener?.target?.id !== "canvas") return;

        let newAction = this.action
        let newDirection = this.direction;

        const has = value => Listener.pressingKeys.has(value);

        if (has("ArrowUp") && has("ArrowDown") || has("ArrowLeft") && has("ArrowRight")) { // invalid key combinations
            return;
        }

        const direction = [];

        if (has("ArrowUp")) direction.push("up");
        else if (has("ArrowDown")) direction.push("down");
        if (has("ArrowLeft")) direction.push("left");
        else if (has("ArrowRight")) direction.push("right");

        if (direction.length) {
            newAction = "run";
            newDirection = direction.join("-");

            this.actor.setAnm(ACT_RUN);
        }
        else if (Listener.isMouseDown && !this.usingSkill) {
            const agl = getAngle({ x: this.oldX, y: this.oldY }, this);
            const dir = getDirection(agl);
            newDirection = getDirectionString(dir);
            newAction = "run";

            this.actor.setAnm(ACT_RUN);
        }
        else if (this.usingSkill && this.battleTarget) {
            const targetSprite = this.battleTarget.pixiSprite;
            const agl = getAngle(this, {
                x: targetSprite.x + targetSprite.width / 2,
                y: targetSprite.y + targetSprite.height / 2,
            });
            const dir = getDirection(agl);
            newDirection = getDirectionString(dir);
            newAction = "attack";

            if (this.battleTarget.isDeath()) {
                this.actor.setAnm(ACT_READY);
            }
        }
        else if (!this.usingSkill) {
            newAction = "stand";

            if (this.actor.anm !== ACT_READY) this.actor.setAnm(ACT_READY);
        }

        this.actor.direct = directionFrameOrder.indexOf(newDirection);
        this.actor.pos.set(this.x, this.y);

        this.direction = newDirection;
    }

    updateMovement() {
        if (!RedStone.gameMap.onceRendered) return;
        if (this.locked) return;
        const now = performance.now();
        const delta = now - this.lastUpdate;
        this.lastUpdate = now;
        if (delta > 500) return;

        if (!Listener.isMouseDown) {
            this.targetActor = null;
            return;
        }
        if (Listener?.target?.id !== "canvas") return;
        if (ActorManager.focusActor_tmp && !this.targetActor) {
            this.targetActor = ActorManager.focusActor_tmp;
        }
        if (this.battleTarget && this.battleTarget.isDeath()) {
            this.battleTarget = null
        }

        if (this.targetActor && this.targetActor._isMonster_tmp) {
            const sprite = this.targetActor.pixiSprite;
            const distance = getDistance(this, {
                x: sprite.x + sprite.width / 2,
                y: sprite.y + sprite.height / 2,
            });
            if (distance <= 400 && this.battleTarget !== this.targetActor) {
                this.useSkillToTarget(null, this.targetActor);
                return;
            }
            if (this.battleTarget) return;
        } else if (this.battleTarget || this.usingSkill) {
            this.battleTarget = null;
            this.usingSkill = null;
        }

        let moveX = 0;
        let moveY = 0;

        const targetX = Listener.mouseX - innerWidth / 2 + Camera.x;
        const targetY = Listener.mouseY - innerHeight / 2 + Camera.y;
        const angle = Math.atan2(targetY - this.y, targetX - this.x);

        moveX = Math.min(delta, delta * Math.cos(angle));
        moveY = Math.min(delta, delta * Math.sin(angle));

        if (SettingsManager.get("collisionDetection")) {
            const block1 = RedStone.gameMap.getBlock(Math.floor(Math.round(this.x + moveX) / TILE_WIDTH), Math.floor(Math.round(this.y) / TILE_HEIGHT));
            const block2 = RedStone.gameMap.getBlock(Math.floor(Math.round(this.x) / TILE_WIDTH), Math.floor(Math.round(this.y + moveY) / TILE_HEIGHT));

            if (block1 !== 0) {
                moveX = 0;
            }
            if (block2 !== 0) {
                moveY = 0;
            }
        }

        if (!moveX && !moveY) return;

        this.oldX = this.x;
        this.oldY = this.y;
        this.x += moveX;
        this.y += moveY;

        Camera.x = this.x;
        Camera.y = this.y;

        this.actor.pos.set(this.x, this.y);
    }

    render() {
        if (!this.initialized) return;
        if (!RedStone.gameMap.onceRendered) return;

        this.update();
    }

    /**
     * @param {Skill2} skill
     */
    useSkillToTarget(skill, target) {
        if (!skill) {
            skill = Skill2.allSkills.find(s => s.name === "ダブルスローイング") // skill 152
        }

        if (target?.isDeath()) return;

        this.battleTarget = target;
        this.usingSkill = skill;

        const targetPos = target ? target.pos : (() => {
            const targetX = Listener.mouseX - innerWidth / 2 + Camera.x;
            const targetY = Listener.mouseY - innerHeight / 2 + Camera.y;

            return new Pos(~~targetX, ~~targetY);
        })();

        if (skill.serial === 152) {
            this.actor.attackToActorByContinuousAttack({
                skill: this.usingSkill.serial,
                level: 0,
                target: this.battleTarget,
                attackCount: 7,
                fps: 10,
            });
        }
        else if ([54, 222].includes(skill.serial)) {
            const ability = new Ability();
            // ability.set(54, 124); // meteor
            // ability.set(222, 124); // water fall
            ability.set(skill.serial, 100);

            this.actor.actionToGround(targetPos.x, targetPos.y, ability, 500);

            setTimeout(() => {
                RedStone.actors.forEach(actor => {
                    if (actor.isHero() || actor.isDeath()) return;
                    const sprite = actor.pixiSprite;
                    const bounds = sprite.getBounds();

                    if (Math.hypot(targetPos.x - actor.pos.x, targetPos.y - actor.pos.y) < 500) {
                        const hitInfo = new HitInfo();
                        hitInfo.physicalDamage = 100000 + Math.floor(Math.random() * 1000000);
                        this.actor.strike(actor, ability, hitInfo, actor.direct, false);
                    }
                })

                this.usingSkill = null;
            }, 1100);
        }

        console.log("check skill", skill);
    }
}

export default Player;