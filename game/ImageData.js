import * as PIXI from "pixi.js";

import WrappedAnim from "../engine/WrappedAnim";
import { fetchBinaryFile, loadAnimation } from "../utils";
import { DATA_DIR, INTERFACE_DIR } from "./Config";
import RedStone from "./RedStone";
import RS_Sprite from "../engine/RS_Sprite";
import EffectDataManager from "./EffectDataManager";

export const HeroBody = [
    "Knight01",
    "Knight02",
    "Knight03",
    "Warrior01",
    "Warrior02",
    "Warrior03",
    "Wizard01",
    "Wizard02",
    "Wizard03",
    "Werewolf01",
    "Werewolf02",
    "Werewolf03",
    "Priest01",
    "Priest02",
    "Priest03",
    "FallenAngel01",
    "FallenAngel02",
    "FallenAngel03",
    "Rogue01",
    "Rogue02",
    "Rogue03",
    "null",
    "null",
    "null",
    "Lancer01",
    "Lancer02",
    "Lancer03",
    "Archer01",
    "Archer02",
    "Archer03",
    "BeastTamer01",
    "null",
    "BeastTamer03",
    "null",
    "null",
    "null",
    "Princess01",
    "Princess02",
    "Princess03",
    "MagicalGirl01",
    "MagicalGirl02",
    "MagicalGirl03",
    "NecroMancer01",
    "NecroMancer02",
    "NecroMancer03",
    "Devil01",
    "Devil02",
    "Devil03",
    "SoulBringer01",
    "SoulBringer02",
    "SoulBringer03",
    "Champion01",
    "Champion02",
    "Champion03",
    "Opticalist01",
    "Opticalist02",
    "Opticalist03",
    "BeastMan01",
    "BeastMan02",
    "BeastMan03",
    "end",
];

export const ImageManager = new class ImageManager {
    /**
     * @type {WrappedAnim[]}
     */
    effects = [];
    /**
     * @type {RS_Sprite}
     */
    sprHitText = new WrappedAnim();

    async init() {
        this.effects[14] = loadAnimation(await fetchBinaryFile(`${DATA_DIR}/Effects/hit_basic.sad`));

        this.effects[88] = loadAnimation(await fetchBinaryFile(`${DATA_DIR}/Effects/${EffectDataManager.aInfo[88].m_strImageFileName}`));

        this.effects[98] = loadAnimation(await fetchBinaryFile(`${DATA_DIR}/Effects/${EffectDataManager.aInfo[98].m_strImageFileName}`));

        this.effects[137] = loadAnimation(await fetchBinaryFile(`${DATA_DIR}/Effects/${EffectDataManager.aInfo[137].m_strImageFileName}`));

        this.effects[146] = loadAnimation(await fetchBinaryFile(`${DATA_DIR}/Effects/${EffectDataManager.aInfo[146].m_strImageFileName}`));

        this.effects[279] = loadAnimation(await fetchBinaryFile(`${DATA_DIR}/Effects/shoot_dagger.sad`));

        // this.sprHitText.load(new BufferReader(await fetchBinaryFile(`${INTERFACE_DIR}/hitText.sd`)));
    }

    getEffect(index) {
        return this.effects[index];
    }

    putShadow(image, x, y, anm, direct, frame, horzScale, vertScale) {
        const effect = this.getEffect(image);

        if (!effect) return;

        // effect.putPixiSprite(RedStone.gameMap.foremostContainer,
        //     "shadow",
        //     x, y, anm, direct, frame, horzScale, vertScale
        // );
    }

    putWhichUsePalette(image, x, y, paletteIndex, anm, direct, frame, horzScale, vertScale, outputEffect) {
        // 
        let palette = null;

        const effect = this.getEffect(image);
        let backupPalette = null;

        if (!effect) return;

        if (palette) {
            backupPalette = effect.sprite.plt;
            effect.sprite.plt = palette;
        }

        if (outputEffect === 0xffff) {
            // effect.putReg();
            const sprite = effect.createPixiSprite(
                "body",
                x, y, anm, direct, frame, horzScale, vertScale);
            sprite.blendMode = PIXI.BLEND_MODES.ADD;

            const levelUpEffect = 137;
            const waterfallEffect = 98;
            
            if ([levelUpEffect, waterfallEffect].includes(image)) {   // temp
                
                sprite.blendMode = PIXI.BLEND_MODES.SCREEN;
            }
            RedStone.gameMap.foremostContainer.addChild(sprite);
            // effect.putPixiSprite(RedStone.gameMap.foremostContainer,
            //     "body",
            //     x, y, anm, direct, frame, horzScale, vertScale
            // )
        } else {
            effect.putPixiSprite(RedStone.gameMap.foremostContainer,
                "body",
                x, y, anm, direct, frame, horzScale, vertScale
            )
        }

        if (backupPalette) {
            effect.sprite.plt = backupPalette;
        }
    }
}