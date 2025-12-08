import * as PIXI from "pixi.js";

import RedStone from "../game/RedStone";
import { PUT_HALF_BLENDING } from "./DrawH";
import Pos from "./Pos";
import RS_Sprite from "./RS_Sprite";
import Rect from "./Rect";
import { GRAY, GREEN, LTGRAY, LTGREEN, WHITE } from "./Text";

export const MAX_MENUBAR = 100;

export const BAR_BUTTON = 0;
export const BAR_RADIO = 1;
export const BAR_CHECK = 2;

class Bar {
    rectCrash = new Rect();
    pos = new Pos();
    posCorrect = new Pos();
    posClickImageMargin = new Pos();
    posClickTextMargin = new Pos();
    posTextPos = new Pos();
    posCorrectText = new Pos();

    /**
     * @type {PIXI.Sprite}
     */
    pixiSprite = new PIXI.Sprite();

    setText = (str) => this.text = str;

    init(str, sprite, x, y, menu, normal, active, select, check, disable, callback) {
        let image = normal;

        // todo: select font?

        this.normal = normal;
        this.active = active;
        this.select = select;
        this.check = check;
        this.menu = menu;
        this.disable = disable;

        this.isChecked = false;
        this.isClicked = false;
        this.isFocused = false;
        this.isEnable = true;
        this.isShow = true;

        if (image === 0xffff) image = this.active;
        if (image === 0xffff) image = this.select;
        if (image === 0xffff) image = this.check;

        if (image !== 0xffff & sprite) {
            sprite.getRect(image, this.rectCrash);
        }

        this.rectCrash.add(x, y);
        this.pos.set(x, y);
        this.posCorrect.set(0, 0);
        this.posClickImageMargin.set(0, 0);
        this.posClickTextMargin.set(0, 0);
        this.posTextPos.set(0xffffffff, 0xffffffff);
        this.posCorrectText.set(0xffffffff, 0xffffffff);
        this.isPutShadow = true;
        this.key = 0xffff;
        this.textColor = WHITE;

        this.setText(str);

        this.pixiSprite.interactive = true;
        this.pixiSprite.position.set(x, y);
        this.pixiSprite
            .on("mouseenter", () => {
                this.isFocused = true;
            })
            .on("mouseleave", () => {
                this.isFocused = false;
                this.isClicked = false;
                RedStone.interactingWithBottomInterface = false;
            })
            .on("mousedown", () => {
                this.isClicked = true;
                RedStone.interactingWithBottomInterface = true;
            })
            .on("mouseup", () => {
                if (this.isClicked) {
                    this.isClicked = false;
                    RedStone.interactingWithBottomInterface = false;
                    callback("click", menu);
                }
            });
    }

    /**
     * @param {BarMenu} barMenu 
     * @param {boolean} isDisplayMenuNumber 
     * @param {number} textGab int
     */
    drawImageBar(barMenu, isDisplayMenuNumber = false, textGab = 0) {
        if (!this.isShow) return;

        let text = "";

        if (this.text) {
            if (isDisplayMenuNumber) {
                text = `${this.menu} ${this.text}`;
            } else {
                text = this.text;
            }
        }

        let textColor = 0;
        let isHalfBlending = barMenu.isHalfBlending;

        if (this.isEnable) {
            if (this.isChecked) {
                textColor = barMenu.checkText;
            }
            else if (this.isFocused) {
                textColor = barMenu.focusText;
            }
            else {
                textColor = barMenu.normalText;
            }
        } else {
            textColor = barMenu.disableText;
        }

        if (barMenu.sprite) {
            let image = 0xffff;
            const posImage = new Pos();
            const posText = new Pos();

            posImage.x = this.posCorrect.x + this.pos.x;
            posImage.y = this.posCorrect.y + this.pos.y;
            posText.x = this.posCorrect.x + this.rectCrash.x1 + this.rectCrash.getWidth() / 2;

            // temp
            posText.y = this.posCorrect.y + this.rectCrash.y1 + (this.rectCrash.getHeight()/* - text.getFontHeight() */) / 2 - this.isPutShadow;

            // todo: handle text

            if (this.isEnable) {
                image = this.normal;

                if (this.isFocused && this.active !== 0xffff) image = this.active;
                if (this.isClicked && this.select !== 0xffff) {
                    posImage.x += this.posClickImageMargin.x;
                    posImage.y += this.posClickImageMargin.y;
                    posText.x += this.posClickTextMargin.x;
                    posText.y += this.posClickTextMargin.y;
                    image = this.select;
                }
            }
            else if (this.disable !== 0xffff) {
                image = this.disable;
            }

            const cont = RedStone.mainCanvas.interfaceContainer;
            // console.log("check image", image, this.normal);

            if (isHalfBlending) {
                // if (image !== 0xffff) barMenu.sprite.put(cont, posImage.x, posImage.y, image, 100, 100, PUT_HALF_BLENDING);
                // if (this.isChecked && this.check !== 0xffff) barMenu.sprite.put(cont, posImage.x, posImage.y, this.check, 100, 100, PUT_HALF_BLENDING);
                if (image !== 0xffff) {
                    barMenu.sprite.updatePixiSprite(this.pixiSprite, posImage.x, posImage.y, image, 100, 100, PUT_HALF_BLENDING);
                    // RedStone.mainCanvas.interfaceContainer.addChild(this.pixiSprite);
                } else {
                    this.pixiSprite.texture = null;
                }
                if (this.isChecked && this.check !== 0xffff) barMenu.sprite.put(cont, posImage.x, posImage.y, this.check, 100, 100, PUT_HALF_BLENDING);
            } else {
                // if (image !== 0xffff) barMenu.sprite.put(cont, posImage.x, posImage.y, image, 100, 100);
                // if (this.isChecked && this.check !== 0xffff) barMenu.sprite.put(cont, posImage.x, posImage.y, this.check, 100, 100);
                if (image !== 0xffff) {
                    barMenu.sprite.updatePixiSprite(this.pixiSprite, posImage.x, posImage.y, image, 100, 100);
                    // RedStone.mainCanvas.interfaceContainer.addChild(this.pixiSprite);
                } else {
                    this.pixiSprite.texture = null;
                }
                if (this.isChecked && this.check !== 0xffff) barMenu.sprite.put(cont, posImage.x, posImage.y, this.check, 100, 100);
            }

            RedStone.mainCanvas.interfaceContainer.addChild(this.pixiSprite);

            if (text) {
                //
            }
        }
    }

    setSize(x, y, xs, ys) {
        this.rectCrash.x1 = x;
        this.rectCrash.y1 = y;
        this.rectCrash.x2 = this.rectCrash.x1 + xs;
        this.rectCrash.y2 = this.rectCrash.y1 + ys;

        this.pixiSprite.hitArea = new PIXI.Rectangle(x, y, xs, ys);
    }

    move(x, y) {
        if (x == 0xffff)
            x = m_rectCrash.x1;
        if (y == 0xffff)
            y = m_rectCrash.y1;

        this.pos.x = x;
        this.pos.y = y;

        this.rectCrash.x2 = (this.rectCrash.x2 - this.rectCrash.x1) + x;
        this.rectCrash.y2 = (this.rectCrash.y2 - this.rectCrash.y1) + y;
        this.rectCrash.x1 = x;
        this.rectCrash.y1 = y;

        this.pixiSprite.position.set(x, y);
    }

    setHitArea(hitArea) {
        this.pixiSprite.hitArea = hitArea;
    }
}

export default class BarMenu {
    count = 0;
    /**
     * @type {Bar[]}
     */
    menu = [];

    callback = () => { };

    /**
     * @param {RS_Sprite} image 
     * @param {number} maxbar int
     * @param {number} checkmode word
     * @param {number} textOutputMethod int
     * @param {boolean} isDisplayMenuNumber 
     */
    init(image, maxbar, checkmode, textOutputMethod, isDisplayMenuNumber) {
        this.menu = null;

        this.sprite = image;
        this.maxBar = maxbar;
        this.checkMode = checkmode;
        this.count = 0;
        this.isDisplayMenuNumber = isDisplayMenuNumber;

        this.menu = [];

        for (let i = 0; i < maxbar; i++) {
            this.menu.push(new Bar());
        }

        this.isFocusOwner = false;
        this.clickMenu = 0xffffffff;

        this.textOutputMethod = textOutputMethod;

        // temp
        const _GREEN = GREEN;
        const _LTGREEN = LTGREEN;
        const _DEEPGRAY = GRAY;
        this.initColor(LTGRAY, WHITE, WHITE, GRAY, 0, _GREEN, _LTGREEN, _DEEPGRAY);
    }

    initColor(normalText, focusText, checkText, disableText, normalColor, focusColor, checkColor, disableColor) {
        //
    }

    /**
     * @param {string} text 
     * @param {number} menu dword
     * @param {number} x int
     * @param {number} y int
     * @param {number} normal word
     * @param {number} active word
     * @param {number} select word
     * @param {number} check word
     * @param {number} disable word
     * @param {string} tooltip 
     */
    addImageBar(text, menu, x, y, normal = 0xffff, active = 0xffff, select = 0xffff, check = 0xffff, disable = 0xffff, tooltip = null, hitArea = null) {
        if (this.count >= this.maxBar) {
            return false;
        }

        this.menu[this.count].init(text, this.sprite, x, y, menu, normal, active, select, check, disable, this.callback);

        if (hitArea) {
            this.menu[this.count].setHitArea(hitArea);
        }

        if (tooltip) {
            //
        }

        this.count++;

        return true;
    }

    setSize(menu, x, y, xs, ys) {
        const index = this.getIndex(menu);

        if (index === 0xffff) return;

        this.menu[index].setSize(x, y, xs, ys);
    }

    getIndex(menu) {
        for (let i = 0; i < this.count; i++) {
            if (this.menu[i].menu === menu) return i;
        }
        return 0xffff;
    }

    draw() {
        if (this.sprite) {
            for (let i = 0; i < this.count; i++) {
                this.menu[i].drawImageBar(this, this.isDisplayMenuNumber, this.textLeftGab);
            }
        } else {
            for (let i = 0; i < this.count; i++) {
                this.menu[i].drawTextBar(this, this.isDisplayMenuNumber);
            }
        }
    }

    setCallback(callback) {
        this.callback = callback;
    }

    // fstyle
    setPosition(menu, x, y) {
        const targetMenu = this.menu.find(m => m.menu === menu);

        if (!targetMenu) return;

        targetMenu.move(x, y);
    }
}